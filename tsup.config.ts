import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    types: 'types.ts',
    'config-types': 'config-types.ts',
    'config-loader': 'config-loader.ts',
    'env-utils': 'env-utils.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
