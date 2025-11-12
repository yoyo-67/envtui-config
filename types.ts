/**
 * Public API exports for @envtui/config
 *
 * Import these types in your config file for full TypeScript support:
 *
 * @example
 * ```typescript
 * import type { EnvConfig } from '@envtui/config/types';
 *
 * const config: EnvConfig = {
 *   envFiles: ['/path/to/.env'],
 *   groups: [...]
 * };
 *
 * export default config;
 * ```
 */

export type {
  EnvConfig,
  VariableGroup,
  SelectOption,
  VariableMapping,
} from './config-types';

export { parseVariableMapping, resolveOptionValue } from './config-types';
export { loadConfig, validateConfig } from './config-loader';
