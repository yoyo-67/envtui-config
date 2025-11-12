#!/usr/bin/env bun

import { createRoot, useKeyboard } from '@opentui/react';
import { createCliRenderer } from '@opentui/core';
import type { SelectOption } from '@opentui/core';
import fs from 'fs';
import { useState, useCallback } from 'react';
import { getLocalIP, updateEnvFiles, updateEnvVariables } from './env-utils';
import type { EnvConfig, VariableGroup } from './config-types';
import { parseVariableMapping, resolveOptionValue } from './config-types';
import { loadConfig, validateConfig } from './config-loader';

// Get config file path from CLI argument (required)
const configPath = process.argv[2];

if (!configPath) {
  console.error('\n❌ Error: Config file path is required\n');
  console.error('Usage: bun run index.tsx <config-file-path>\n');
  console.error('Supported formats: .json, .ts, .js, .mjs\n');
  process.exit(1);
}

// Load and validate config file
let config: EnvConfig;
try {
  config = await loadConfig(configPath);
  validateConfig(config);
} catch (error) {
  console.error('\n❌ Error loading config file:\n');
  console.error(error instanceof Error ? error.message : String(error));
  console.error('\n');
  process.exit(1);
}

// Get local IP for token resolution
const localIP = getLocalIP();

// Prepare options for each group with resolved tokens
const groupsWithOptions: Array<VariableGroup & { selectOptions: SelectOption[] }> = config.groups.map(group => {
  const selectOptions = group.options.map(option => ({
    ...option,
    // Resolve {LOCAL_IP} and other tokens in display
    description: option.value === '{LOCAL_IP}'
      ? localIP || 'localhost'
      : option.description,
  }));

  // Add custom option if allowed
  if (group.allowCustom) {
    selectOptions.push({
      name: 'Custom',
      description: 'Enter custom value',
      value: 'custom',
    });
  }

  return {
    ...group,
    selectOptions,
  };
});

interface AppState {
  currentGroupIndex: number;
  selectedValues: Record<string, string>;
  selectedIndices: Record<number, number>;
  customInput: boolean;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentGroupIndex: 0,
    selectedValues: {},
    selectedIndices: {},
    customInput: false,
  });

  const currentGroup = groupsWithOptions[state.currentGroupIndex];
  const isLastGroup = state.currentGroupIndex === groupsWithOptions.length - 1;

  useKeyboard((key) => {
    if (key.ctrl && key.name === 'c') {
      console.log('\n❌ Configuration cancelled\n');
      process.exit(0);
    } else if (key.name === 'return') {
      if (state.customInput) {
        // Custom input is handled by the input component's onSubmit
        return;
      }

      const selectedIndex = state.selectedIndices[state.currentGroupIndex] || 0;
      const selectedOption = currentGroup.selectOptions[selectedIndex];

      if (selectedOption) {
        let value = selectedOption.value;

        // Resolve special tokens
        if (value !== 'SKIP') {
          value = resolveOptionValue(value, { localIP });
        }

        // Check if custom input is needed
        if (value === 'custom') {
          setState(prev => ({ ...prev, customInput: true }));
          return;
        }

        // Store selected value
        const newSelectedValues = {
          ...state.selectedValues,
          [currentGroup.name]: value === 'SKIP' ? undefined : value,
        };

        // Move to next group or finish
        if (isLastGroup) {
          finishConfiguration(newSelectedValues);
        } else {
          setState(prev => ({
            ...prev,
            currentGroupIndex: prev.currentGroupIndex + 1,
            selectedValues: newSelectedValues,
          }));
        }
      }
    } else if (key.name === 'escape') {
      if (state.customInput) {
        setState(prev => ({ ...prev, customInput: false }));
      } else if (state.currentGroupIndex > 0) {
        setState(prev => ({
          ...prev,
          currentGroupIndex: prev.currentGroupIndex - 1,
        }));
      } else {
        console.log('\n❌ Configuration cancelled\n');
        process.exit(0);
      }
    }
  });

  const handleSelectionChange = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      selectedIndices: {
        ...prev.selectedIndices,
        [prev.currentGroupIndex]: index,
      },
    }));
  }, []);

  const handleCustomSubmit = useCallback((value: string) => {
    if (value.trim()) {
      const newSelectedValues = {
        ...state.selectedValues,
        [currentGroup.name]: value.trim(),
      };

      // Move to next group or finish
      if (isLastGroup) {
        finishConfiguration(newSelectedValues);
      } else {
        setState(prev => ({
          ...prev,
          currentGroupIndex: prev.currentGroupIndex + 1,
          selectedValues: newSelectedValues,
          customInput: false,
        }));
      }
    }
  }, [state.selectedValues, state.currentGroupIndex, isLastGroup, currentGroup]);

  function finishConfiguration(selectedValues: Record<string, string | undefined>) {
    // Convert config format to env-utils format
    const envFiles = config.envFiles.map(path => ({ path }));

    const variableGroups = config.groups.map(group => ({
      name: group.name,
      variables: group.variables.map(v => {
        const parsed = parseVariableMapping(v);
        return parsed.name;
      }),
      formatter: (value: string) => {
        // Apply formatters for each variable
        return value;
      },
    }));

    // Build updates with proper formatters
    const updates: Record<string, string | undefined> = {};
    for (const group of config.groups) {
      const value = selectedValues[group.name];
      if (!value) continue;

      updates[group.name] = value;
    }

    // Update all env files
    const envFilesWithFormatters = config.envFiles.map(path => ({ path }));

    // Call update function with proper structure
    updateEnvFilesWithConfig(envFilesWithFormatters, config.groups, selectedValues);
  }

  // Calculate dynamic height for select box
  const optionsCount = currentGroup.selectOptions.length;
  const MAX_VISIBLE_OPTIONS = 15;
  const MIN_HEIGHT = 12;
  // Calculate height: need extra space for borders and padding
  // Each option needs ~2 lines (name + description)
  const calculatedHeight = (optionsCount * 2) + 4;
  const selectHeight = Math.min(Math.max(calculatedHeight, MIN_HEIGHT), (MAX_VISIBLE_OPTIONS * 2) + 4);
  const isScrollable = optionsCount > MAX_VISIBLE_OPTIONS;

  // Build title with scroll indicator
  const selectTitle = `${currentGroup.label}${isScrollable ? ' (↕ scroll)' : ''} (Enter: confirm | Esc: ${state.currentGroupIndex > 0 ? 'back' : 'exit'})`;

  return (
    <box style={{ padding: 1, flexDirection: 'column' }}>
      <text fg="#FFFF00" style={{ marginBottom: 1 }}>
        🔧 Environment Configuration ({state.currentGroupIndex + 1}/{groupsWithOptions.length})
      </text>

      {!state.customInput && (
        <box
          title={selectTitle}
          style={{ border: true, height: selectHeight }}
        >
          <select
            options={currentGroup.selectOptions}
            focused={true}
            onChange={handleSelectionChange}
            style={{ flexGrow: 1 }}
          />
        </box>
      )}

      {state.customInput && (
        <box
          title={`Enter Custom ${currentGroup.label} (Enter: confirm | Esc: back)`}
          style={{ border: true, height: 3 }}
        >
          <input
            placeholder={`e.g., ${currentGroup.options[0]?.value || 'value'}`}
            focused={true}
            onSubmit={handleCustomSubmit}
          />
        </box>
      )}
    </box>
  );
}

function updateEnvFilesWithConfig(
  envFiles: Array<{ path: string }>,
  groups: VariableGroup[],
  selectedValues: Record<string, string | undefined>
) {
  // If nothing to update, exit
  const hasUpdates = Object.values(selectedValues).some(v => v !== undefined);
  if (!hasUpdates) {
    console.log('\n⚠️  No changes selected. Exiting.\n');
    process.exit(0);
  }

  console.log('\n🔄 Updating environment files...\n');

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile.path)) {
      console.log(`⚠️  Skipping ${envFile.path} (file not found)`);
      continue;
    }

    const content = fs.readFileSync(envFile.path, 'utf8');
    const updates: Record<string, string> = {};

    // Build updates for this file
    for (const group of groups) {
      const value = selectedValues[group.name];
      if (!value) continue;

      for (const variable of group.variables) {
        const parsed = parseVariableMapping(variable);

        // Check if this variable exists in the file
        const regex = new RegExp(`^${parsed.name}=`, 'm');
        if (!regex.test(content)) {
          continue;
        }

        // Apply formatter if specified
        const formatted = parsed.formatter ? parsed.formatter(value) : value;
        updates[parsed.name] = formatted;
      }
    }

    // Skip if no updates for this file
    if (Object.keys(updates).length === 0) {
      continue;
    }

    const updated = updateEnvVariables(content, updates);
    fs.writeFileSync(envFile.path, updated);

    console.log(`✅ Updated ${envFile.path}`);
    for (const [key, value] of Object.entries(updates)) {
      console.log(`   ${key}=${value}`);
    }
  }

  console.log('\n✨ Environment configuration complete!\n');
  process.exit(0);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

// Run the application
main();
