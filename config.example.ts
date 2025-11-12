import type { EnvConfig } from './config-types';

/**
 * Example configuration file for envtui
 *
 * This file demonstrates how to configure envtui using TypeScript
 * with full type safety and autocomplete support.
 */
const config: EnvConfig = {
  // List of .env files to manage
  envFiles: [
    '/path/to/your/project/.env',
    '/path/to/your/project/apps/mobile/.env',
    '/path/to/your/project/apps/backend/.env',
  ],

  // Variable groups - each group represents a set of related environment variables
  groups: [
    {
      // Internal identifier for this group
      name: 'api_domain',

      // Display label shown to users
      label: 'API Domain',

      // Optional description
      description: 'Select the backend API domain',

      // Environment variables that belong to this group
      // These will all be updated together when a user selects an option
      variables: [
        'API_URL',
        'API_DOMAIN',
        'BACKEND_URL',
        // You can also specify variables with formatters:
        // { name: 'FULL_API_URL', formatter: 'https://{value}/api/v1' }
      ],

      // Available options for selection
      options: [
        {
          name: 'Skip (no change)',
          description: 'Keep current API domain',
          value: 'SKIP', // Special value to skip updating this group
        },
        {
          name: 'Development',
          description: 'dev.example.com',
          value: 'dev.example.com',
        },
        {
          name: 'Staging',
          description: 'staging.example.com',
          value: 'staging.example.com',
        },
        {
          name: 'Production',
          description: 'api.example.com',
          value: 'api.example.com',
        },
      ],

      // Allow custom input in addition to predefined options
      allowCustom: true,
    },
    {
      name: 'local_host',
      label: 'Local Development Host',
      description: 'Select the local development host',

      // Example of using formatters to transform values
      variables: [
        'HOST',
        // This will transform "localhost" → "http://localhost:3000"
        { name: 'API_URL', formatter: 'http://{value}:3000' },
        { name: 'WS_URL', formatter: 'ws://{value}:3001' },
      ],

      options: [
        { name: 'Skip (no change)', description: 'Keep current host', value: 'SKIP' },

        // Special token {LOCAL_IP} will be replaced with auto-detected local IP
        { name: 'Local IP', description: 'Use your local network IP', value: '{LOCAL_IP}' },

        { name: 'Localhost', description: 'localhost', value: 'localhost' },
        { name: 'Proxy', description: 'Use debugging proxy', value: 'proxy.local' },
      ],

      allowCustom: true,
    },
  ],
};

export default config;

// Alternative: you can also export as a named export
// export { config };
