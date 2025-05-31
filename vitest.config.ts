import * as path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

const vitestConfig = defineConfig({
  root: import.meta.dirname,
  test: {
    coverage: {
      include: ['packages/*/src'],
    },
    dir: path.join(import.meta.dirname, 'packages'),
    name: 'root',
    root: import.meta.dirname,
    workspace: ['packages/*/vitest.config.mts'],
  },
});
