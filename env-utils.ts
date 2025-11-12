import fs from 'fs';
import path from 'path';
import { networkInterfaces } from 'os';
import type { VariableGroup, VariableMapping } from './config-types';
import { parseVariableMapping } from './config-types';

export interface EnvFileConfig {
  path: string;
}

export interface EnvUpdates {
  [key: string]: string;
}

/**
 * Get the local IP address
 */
export function getLocalIP(): string | null {
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    const netItems = nets[name];
    if (!netItems) continue;

    for (const net of netItems) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return null;
}

/**
 * Update specific variables in .env content
 */
export function updateEnvVariables(content: string, updates: EnvUpdates): string {
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }

    const match = trimmed.match(/^([^=]+)=/);
    if (match) {
      const key = match[1].trim();
      if (updates[key] !== undefined) {
        const newValue = updates[key];
        return `${key}=${newValue}`;
      }
    }

    return line;
  });

  return updatedLines.join('\n');
}

/**
 * Build updates for all variables based on selected values and variable groups
 */
export function buildUpdates(
  selectedValues: Record<string, string | undefined>,
  variableGroups: VariableGroup[],
  fileContent: string
): EnvUpdates {
  const updates: EnvUpdates = {};

  for (const group of variableGroups) {
    const value = selectedValues[group.name];
    if (!value) continue;

    for (const variable of group.variables) {
      // Parse variable mapping to get name and formatter
      const parsed = parseVariableMapping(variable);

      // Check if this variable exists in the file
      const regex = new RegExp(`^${parsed.name}=`, 'm');
      if (!regex.test(fileContent)) {
        continue; // Skip if variable doesn't exist in this file
      }

      // Apply formatter if specified for this variable
      const formatted = parsed.formatter ? parsed.formatter(value) : value;
      updates[parsed.name] = formatted;
    }
  }

  return updates;
}

/**
 * Update all .env files with new configuration
 */
export function updateEnvFiles(
  envFiles: EnvFileConfig[],
  variableGroups: VariableGroup[],
  selectedValues: Record<string, string | undefined>
): void {
  // If nothing to update, exit
  const hasUpdates = Object.values(selectedValues).some(v => v !== undefined && v !== 'SKIP');
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
    const updates = buildUpdates(selectedValues, variableGroups, content);

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
