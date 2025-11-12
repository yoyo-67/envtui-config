# @yoyo-org/envtui-config

[![npm version](https://badge.fury.io/js/@envtui%2Fconfig.svg)](https://www.npmjs.com/package/@yoyo-org/envtui-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Interactive TUI for managing environment variables across multiple .env files**

⚡ **Quick Start:** `npx @yoyo-org/envtui-config ./env-config.ts`

---

## What It Does

**Before:** You have multiple .env files that need manual updates

```bash
# ./apps/web/.env
API_URL=http://localhost:3000
DATABASE_URL=localhost:5432

# ./apps/mobile/.env
API_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# ./apps/api/.env
API_URL=http://localhost:3000
```

**After:** Run the tool, select "Production", and all files update automatically

```bash
# ./apps/web/.env
API_URL=https://api.example.com
DATABASE_URL=localhost:5432

# ./apps/mobile/.env
API_URL=https://api.example.com
BACKEND_URL=https://api.example.com

# ./apps/api/.env
API_URL=https://api.example.com
```

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

## Quick Start

**1. Create a config file** `env-config.ts`:
```typescript
import type { EnvConfig } from '@yoyo-org/envtui-config/types';

export default {
  envFiles: ['./apps/web/.env', './apps/mobile/.env'],
  groups: [{
    name: 'api_url',
    label: 'API URL',
    variables: ['API_URL', 'BACKEND_URL'],
    options: [
      { name: 'Local', value: 'http://localhost:3000' },
      { name: 'Production', value: 'https://api.example.com' },
    ],
  }],
} as EnvConfig;
```

**2. Run it:**
```bash
npx @yoyo-org/envtui-config ./env-config.ts
```

**3. Select an option** and all your .env files update automatically!

---

## Features

- 🔄 Update multiple .env files at once
- 🎯 Group related variables together
- ⚡ Quick presets for dev/staging/prod
- 🔧 Value formatters (`http://{value}:3000`)
- 🌐 Auto-detect local IP with `{LOCAL_IP}` token
- 📝 TypeScript support with autocomplete
- ✅ Config validation

## Installation

**No installation needed!** Use npx:
```bash
npx @yoyo-org/envtui-config ./env-config.ts
```

Or install in your project:
```bash
npm install -D @yoyo-org/envtui-config
# or
bun add -d @yoyo-org/envtui-config
```

Add to package.json scripts:
```json
{
  "scripts": {
    "env": "envtui ./env-config.ts"
  }
}
```

## Configuration Examples

### Value Formatters

Add prefixes/suffixes automatically:

```typescript
{
  variables: [
    'HOST',
    { name: 'API_URL', formatter: 'http://{value}:3000' },
    { name: 'WS_URL', formatter: 'ws://{value}:3001' },
  ],
  options: [
    { name: 'Localhost', value: 'localhost' },
  ],
}
// Selecting "localhost" sets:
// HOST=localhost
// API_URL=http://localhost:3000
// WS_URL=ws://localhost:3001
```

### Local IP Token

Use `{LOCAL_IP}` for mobile development:

```typescript
{
  options: [
    { name: 'Local IP', value: '{LOCAL_IP}' },  // Auto-detects your machine's IP
    { name: 'Localhost', value: 'localhost' },
  ],
}
```

### Multiple Environments

```typescript
{
  options: [
    { name: 'Development', value: 'http://localhost:3000' },
    { name: 'Staging', value: 'https://staging-api.example.com' },
    { name: 'Production', value: 'https://api.example.com' },
  ],
}
```

### Supported Config Formats

- TypeScript: `.ts` (recommended for autocomplete)
- JavaScript: `.js`, `.mjs`
- JSON: `.json`

## Keyboard Controls

- **↑/↓** Navigate | **Enter** Confirm | **Esc** Exit

## Requirements

- Node.js >= 18.0.0

## License

MIT © yoyo67

---

**Made with ❤️ by yoyo67**
