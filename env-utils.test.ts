import { describe, it, expect } from 'vitest';
import { updateEnvVariables, buildUpdates } from './env-utils';
import type { VariableGroup } from './config-types';

describe('updateEnvVariables', () => {
  it('should update existing variables', () => {
    const content = `# Comment
HOST_DOMAIN=old.domain.com
BASE_HOST=localhost
`;

    const updates = {
      HOST_DOMAIN: 'new.domain.com',
      BASE_HOST: '192.168.1.100',
    };

    const result = updateEnvVariables(content, updates);

    expect(result).toContain('HOST_DOMAIN=new.domain.com');
    expect(result).toContain('BASE_HOST=192.168.1.100');
    expect(result).toContain('# Comment');
  });

  it('should preserve comments and empty lines', () => {
    const content = `# This is a comment
HOST_DOMAIN=old.domain.com

# Another comment
BASE_HOST=localhost
`;

    const updates = {
      HOST_DOMAIN: 'new.domain.com',
    };

    const result = updateEnvVariables(content, updates);

    expect(result).toContain('# This is a comment');
    expect(result).toContain('# Another comment');
    expect(result.split('\n')).toHaveLength(content.split('\n').length);
  });

  it('should not update variables that are not in the updates object', () => {
    const content = `HOST_DOMAIN=old.domain.com
SOME_OTHER_VAR=keep_this
`;

    const updates = {
      HOST_DOMAIN: 'new.domain.com',
    };

    const result = updateEnvVariables(content, updates);

    expect(result).toContain('HOST_DOMAIN=new.domain.com');
    expect(result).toContain('SOME_OTHER_VAR=keep_this');
  });

  it('should handle variables with special characters in values', () => {
    const content = `API_URL=http://localhost:3000
`;

    const updates = {
      API_URL: 'http://example.com:8080/api/v1',
    };

    const result = updateEnvVariables(content, updates);

    expect(result).toContain('API_URL=http://example.com:8080/api/v1');
  });
});

describe('buildUpdates', () => {
  it('should build updates for variables that exist in file', () => {
    const selectedValues = {
      backend_domain: 'yohai.nxenv.com',
    };

    const variableGroups: VariableGroup[] = [
      {
        name: 'backend_domain',
        label: 'Backend Domain',
        variables: ['HOST_DOMAIN', 'HOST_BACKEND', 'EXPO_PUBLIC_HOST_BACKEND'],
        options: [],
      },
    ];

    const fileContent = `HOST_DOMAIN=old.com
HOST_BACKEND=old.com
SOME_OTHER=value
`;

    const result = buildUpdates(selectedValues, variableGroups, fileContent);

    expect(result).toEqual({
      HOST_DOMAIN: 'yohai.nxenv.com',
      HOST_BACKEND: 'yohai.nxenv.com',
    });
    // EXPO_PUBLIC_HOST_BACKEND should not be in result because it doesn't exist in file
    expect(result.EXPO_PUBLIC_HOST_BACKEND).toBeUndefined();
  });

  it('should apply formatter when specified', () => {
    const selectedValues = {
      base_host: 'localhost',
    };

    const variableGroups: VariableGroup[] = [
      {
        name: 'base_host',
        label: 'Base Host',
        variables: [
          'BASE_HOST',
          {
            name: 'TRPC_BACKEND',
            formatter: 'http://{value}:4000',
          },
        ],
        options: [],
      },
    ];

    const fileContent = `BASE_HOST=oldhost
TRPC_BACKEND=http://oldhost:4000
`;

    const result = buildUpdates(selectedValues, variableGroups, fileContent);

    expect(result).toEqual({
      BASE_HOST: 'localhost',
      TRPC_BACKEND: 'http://localhost:4000',
    });
  });

  it('should skip variables from groups with no selected value', () => {
    const selectedValues = {
      backend_domain: 'yohai.nxenv.com',
      // base_host is not set
    };

    const variableGroups: VariableGroup[] = [
      {
        name: 'backend_domain',
        label: 'Backend Domain',
        variables: ['HOST_DOMAIN'],
        options: [],
      },
      {
        name: 'base_host',
        label: 'Base Host',
        variables: ['BASE_HOST'],
        options: [],
      },
    ];

    const fileContent = `HOST_DOMAIN=old.com
BASE_HOST=localhost
`;

    const result = buildUpdates(selectedValues, variableGroups, fileContent);

    expect(result).toEqual({
      HOST_DOMAIN: 'yohai.nxenv.com',
    });
    expect(result.BASE_HOST).toBeUndefined();
  });

  it('should handle multiple variable groups', () => {
    const selectedValues = {
      backend_domain: 'yohai.nxenv.com',
      base_host: '192.168.1.100',
    };

    const variableGroups: VariableGroup[] = [
      {
        name: 'backend_domain',
        label: 'Backend Domain',
        variables: ['HOST_DOMAIN', 'HOST_BACKEND'],
        options: [],
      },
      {
        name: 'base_host',
        label: 'Base Host',
        variables: ['BASE_HOST'],
        options: [],
      },
    ];

    const fileContent = `HOST_DOMAIN=old.com
HOST_BACKEND=old.com
BASE_HOST=localhost
`;

    const result = buildUpdates(selectedValues, variableGroups, fileContent);

    expect(result).toEqual({
      HOST_DOMAIN: 'yohai.nxenv.com',
      HOST_BACKEND: 'yohai.nxenv.com',
      BASE_HOST: '192.168.1.100',
    });
  });
});
