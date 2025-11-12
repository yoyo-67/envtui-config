import fs from 'fs';
import path from 'path';
import type { EnvConfig } from './config-types';

/**
 * Load configuration from either JSON or TypeScript file
 */
export async function loadConfig(configPath: string): Promise<EnvConfig> {
  const ext = path.extname(configPath);
  const absolutePath = path.resolve(configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  if (ext === '.json') {
    // Load JSON config
    const content = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(content);
  } else if (ext === '.ts' || ext === '.js' || ext === '.mjs') {
    // Load TypeScript/JavaScript config
    try {
      const module = await import(absolutePath);
      const config = module.default || module.config;

      if (!config) {
        throw new Error(
          `Config file must export a default export or named 'config' export: ${absolutePath}`
        );
      }

      return config;
    } catch (error) {
      throw new Error(
        `Failed to load config file ${absolutePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    throw new Error(
      `Unsupported config file format: ${ext}. Supported formats: .json, .ts, .js, .mjs`
    );
  }
}

/**
 * Validate config structure
 */
export function validateConfig(config: EnvConfig): void {
  if (!config.envFiles || !Array.isArray(config.envFiles) || config.envFiles.length === 0) {
    throw new Error('Config must have at least one env file in "envFiles" array');
  }

  if (!config.groups || !Array.isArray(config.groups) || config.groups.length === 0) {
    throw new Error('Config must have at least one group in "groups" array');
  }

  for (const group of config.groups) {
    if (!group.name || !group.label) {
      throw new Error(`Group missing required fields: ${JSON.stringify(group)}`);
    }

    if (!group.variables || group.variables.length === 0) {
      throw new Error(`Group "${group.name}" must have at least one variable`);
    }

    if (!group.options || group.options.length === 0) {
      throw new Error(`Group "${group.name}" must have at least one option`);
    }

    for (const option of group.options) {
      if (!option.name || option.value === undefined) {
        throw new Error(
          `Invalid option in group "${group.name}": ${JSON.stringify(option)}`
        );
      }
    }
  }
}
