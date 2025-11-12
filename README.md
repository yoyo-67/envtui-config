# @yoyo-org/envtui-config

[![npm version](https://badge.fury.io/js/@envtui%2Fconfig.svg)](https://www.npmjs.com/package/@yoyo-org/envtui-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Interactive TUI for managing environment variables across multiple .env files with config-driven dynamic forms**

⚡ **Quick Start:** `npx @yoyo-org/envtui-config ./env-config.ts`

## Why This Package?

Managing environment variables across multiple .env files in monorepos and microservice architectures is tedious and error-prone:

### Common Problems:
- **Manual Updates**: Switching between dev/staging/prod requires editing multiple .env files
- **Synchronization**: Variables need to stay in sync across apps (mobile, web, backend)
- **Context Switching**: Developers forget which variables need updating together
- **Onboarding**: New team members don't know which env vars to configure
- **Human Error**: Typos in URLs, forgotten variables, mismatched values

### The Solution:
`@yoyo-org/envtui-config` provides an interactive terminal UI that:
- ✅ Updates multiple .env files simultaneously
- ✅ Groups related variables (e.g., all API domain variables)
- ✅ Provides preset options for common configurations
- ✅ Supports value formatters (e.g., `http://{value}:3000`)
- ✅ Auto-detects local IP for mobile development
- ✅ Config-driven with full TypeScript support
- ✅ Works with any project structure

## Demo

```
┌─API Domain (Enter: confirm | Esc: exit)─────────────────┐
│ ▶ Skip (no change)                                       │
│   Development                dev.api.example.com         │
│   Staging                    staging.api.example.com     │
│   Production                 api.example.com             │
│                                                           │
└───────────────────────────────────────────────────────────┘

🔄 Updating environment files...

✅ Updated ./apps/web/.env
   API_URL=dev.api.example.com

✅ Updated ./apps/mobile/.env
   API_URL=dev.api.example.com
   BACKEND_URL=dev.api.example.com

✨ Environment configuration complete!
```

## 🚀 Quick Use (30 seconds)

1. **Create a config file** `env-config.ts`:
   ```typescript
   import type { EnvConfig } from '@yoyo-org/envtui-config/types';

   export default {
     envFiles: ['./app/.env', './api/.env'],  // Your .env files
     groups: [{
       name: 'api_url',
       label: 'API URL',
       variables: ['API_URL'],                  // Env var names
       options: [
         { name: 'Local', value: 'http://localhost:3000' },
         { name: 'Prod', value: 'https://api.com' },
       ],
     }],
   } as EnvConfig;
   ```

2. **Run it:**
   ```bash
   npx @yoyo-org/envtui-config ./env-config.ts
   ```

3. **Done!** Select an option and your .env files are updated.

---

## Features

- 🎨 **Beautiful TUI** - Interactive terminal UI powered by [OpenTUI](https://github.com/sst/opentui)
- 🔄 **Multi-file Sync** - Update multiple .env files simultaneously
- 🎯 **Variable Grouping** - Group related environment variables together
- ⚡ **Quick Presets** - Define common configurations for quick selection
- 🔧 **Value Formatters** - Transform values (e.g., add http:// prefix, ports)
- 🌐 **Smart Tokens** - Auto-resolve `{LOCAL_IP}` and custom tokens
- 📝 **TypeScript Config** - Full type safety and autocomplete
- ✅ **Validation** - Built-in config validation
- 🧪 **Well Tested** - Comprehensive test coverage

## Installation

```bash
# Using npm
npm install -D @yoyo-org/envtui-config

# Using bun
bun add -d @yoyo-org/envtui-config

# Using yarn
yarn add -D @yoyo-org/envtui-config

# Using pnpm
pnpm add -D @yoyo-org/envtui-config
```

## Detailed Setup

### Create Config File

Choose TypeScript (recommended) or JSON:

<details>
<summary><b>TypeScript Config (Click to expand)</b></summary>

```typescript
// env-config.ts
import type { EnvConfig } from '@yoyo-org/envtui-config/types';

const config: EnvConfig = {
  envFiles: [
    './apps/web/.env',
    './apps/mobile/.env',
    './apps/api/.env',
  ],
  groups: [
    {
      name: 'api_domain',
      label: 'API Domain',
      variables: ['API_URL', 'BACKEND_URL'],
      options: [
        { name: 'Development', value: 'dev.api.example.com' },
        { name: 'Staging', value: 'staging.api.example.com' },
        { name: 'Production', value: 'api.example.com' },
      ],
    },
  ],
};

export default config;
```
</details>

<details>
<summary><b>JSON Config (Click to expand)</b></summary>

```json
{
  "envFiles": ["./apps/web/.env", "./apps/mobile/.env"],
  "groups": [
    {
      "name": "api_domain",
      "label": "API Domain",
      "variables": ["API_URL"],
      "options": [
        { "name": "Development", "value": "dev.api.example.com" },
        { "name": "Production", "value": "api.example.com" }
      ]
    }
  ]
}
```
</details>

### Run It

**Option 1: npx (no install needed):**
```bash
npx @yoyo-org/envtui-config ./env-config.ts
```

**Option 2: Install globally:**
```bash
npm install -g @yoyo-org/envtui-config
envtui ./env-config.ts
```

**Option 3: Add to project scripts:**
```json
{
  "scripts": {
    "env": "envtui ./env-config.ts"
  }
}
```
```bash
npm run env
```

## Configuration

### EnvConfig Structure

```typescript
interface EnvConfig {
  envFiles: string[];          // Paths to .env files
  groups: VariableGroup[];     // Variable groups
}

interface VariableGroup {
  name: string;                // Internal identifier
  label: string;               // Display label
  description?: string;        // Optional description
  variables: (string | VariableMapping)[];  // Env var names
  options: SelectOption[];     // Available options
  allowCustom?: boolean;       // Allow custom input
}

interface VariableMapping {
  name: string;                // Variable name
  formatter?: string;          // Value template with {value}
}

interface SelectOption {
  name: string;                // Display name
  description?: string;        // Optional description
  value: string;               // Actual value or token
}
```

### Advanced Examples

#### Value Formatters

Transform values automatically:

```typescript
{
  name: 'local_host',
  label: 'Local Host',
  variables: [
    'HOST',
    { name: 'API_URL', formatter: 'http://{value}:3000' },
    { name: 'WS_URL', formatter: 'ws://{value}:3001' },
  ],
  options: [
    { name: 'Localhost', value: 'localhost' },
    // Selecting "localhost" sets:
    // HOST=localhost
    // API_URL=http://localhost:3000
    // WS_URL=ws://localhost:3001
  ],
}
```

#### Special Tokens

Use built-in tokens:

```typescript
{
  options: [
    // {LOCAL_IP} resolves to your machine's local IP
    { name: 'Local IP', value: '{LOCAL_IP}' },
  ],
}
```

#### Conditional Variables

Only update variables that exist in each file:

```typescript
{
  // If mobile/.env doesn't have API_KEY, it won't be touched
  variables: ['API_URL', 'API_KEY', 'API_TIMEOUT'],
}
```

## Project Structure

```
@yoyo-org/envtui-config/
├── index.tsx           # Main CLI entry point
├── types.ts            # Public API exports
├── config-types.ts     # Type definitions
├── config-loader.ts    # Config file loader (JSON/TS)
├── env-utils.ts        # Env file manipulation
├── config.example.ts   # TypeScript example
├── config.example.json # JSON example
└── README.md
```

## TypeScript Support

Full TypeScript support with autocomplete:

```typescript
import type { EnvConfig, VariableGroup, SelectOption } from '@yoyo-org/envtui-config/types';

// Get full autocomplete and type checking
const config: EnvConfig = {
  // TypeScript will validate your config structure
  envFiles: [/* ... */],
  groups: [/* ... */],
};

export default config;
```

## Use Cases

### Monorepo Environment Management
```typescript
// Sync env vars across web, mobile, and backend
envFiles: [
  './apps/web/.env',
  './apps/mobile/.env',
  './apps/api/.env',
]
```

### Multi-Environment Switching
```typescript
// Quick switching between dev/staging/prod
options: [
  { name: 'Development', value: 'dev.api.com' },
  { name: 'Staging', value: 'staging.api.com' },
  { name: 'Production', value: 'api.com' },
]
```

### Mobile Development
```typescript
// Auto-detect local IP for mobile apps
options: [
  { name: 'Local IP', value: '{LOCAL_IP}' },
  { name: 'Localhost', value: 'localhost' },
]
```

### Team Onboarding
```typescript
// New devs select from predefined configs
description: 'Select your backend API domain',
options: [...presetEnvironments]
```

## API

### CLI

**Using npx (recommended):**

```bash
# Run directly without installation
npx @yoyo-org/envtui-config <config-file-path>

# Examples
npx @yoyo-org/envtui-config ./env-config.ts
npx @yoyo-org/envtui-config ./env-config.json
```

**Using installed bin:**

```bash
# After npm install
envtui <config-file-path>
npx envtui ./env-config.ts
```

**Using bun:**

```bash
bun run @yoyo-org/envtui-config <config-file-path>
```

**Supported config formats:** `.ts`, `.js`, `.mjs`, `.json`

### Programmatic Usage

```typescript
import { loadConfig, validateConfig } from '@yoyo-org/envtui-config/types';

const config = await loadConfig('./config.ts');
validateConfig(config);
```

## Keyboard Controls

- **↑/↓** - Navigate options
- **Enter** - Confirm selection
- **Esc** - Go back / Exit
- **Ctrl+C** - Force exit

## Requirements

- Node.js >= 18.0.0
- Bun >= 1.0.0 (recommended)

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build for distribution
bun run build

# Run locally
bun run index.tsx ./config.example.ts
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs.

## License

MIT © yoyo67

## Related

- [OpenTUI](https://github.com/sst/opentui) - Terminal UI framework
- [dotenv](https://github.com/motdotla/dotenv) - Load .env files

---

**Made with ❤️ by yoyo67**
