/**
 * Configuration file types for env-config tool
 * This defines the structure of the config file that specifies which env files to track,
 * which variables are grouped together, and what options are available for selection
 */

export interface SelectOption {
  name: string; // Display name (e.g., "Yohai")
  description?: string; // Optional description
  value: string; // Actual value or special token like {LOCAL_IP}
}

export interface VariableMapping {
  name: string; // Variable name (e.g., "BASE_HOST")
  formatter?: string; // Optional template like "http://{value}:4000"
}

export interface VariableGroup {
  name: string; // Internal name (e.g., "backend_domain")
  label: string; // Display label (e.g., "Backend Domain")
  description?: string; // Optional description for the group
  variables: (string | VariableMapping)[]; // List of env var names or mappings
  options: SelectOption[]; // Available options for selection
  allowCustom?: boolean; // Whether to allow custom input (default: false)
}

export interface EnvConfig {
  envFiles: string[]; // List of .env file paths to track
  groups: VariableGroup[]; // Variable groups with their options
}

/**
 * Parse variable mapping - returns variable name and optional formatter
 */
export function parseVariableMapping(variable: string | VariableMapping): {
  name: string;
  formatter?: (value: string) => string;
} {
  if (typeof variable === 'string') {
    return { name: variable };
  }

  return {
    name: variable.name,
    formatter: variable.formatter
      ? (value: string) => variable.formatter!.replace('{value}', value)
      : undefined,
  };
}

/**
 * Resolve special tokens in option values
 */
export function resolveOptionValue(value: string, context: { localIP: string | null }): string {
  if (value === '{LOCAL_IP}') {
    return context.localIP || 'localhost';
  }
  return value;
}
