import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'e2e',
    dir: 'src/http/controllers',
    environment:
      './prisma/vitest-environment-prisma/prisma-test-environment.ts',
    isolate: true,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
