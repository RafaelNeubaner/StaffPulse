import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'src/js/validators.js',
        'src/js/employee-service.js',
        'src/js/employee-store.js',
        'src/js/employee-repository.js',
        'src/js/dashboard.js',
        'src/js/employee-form.js',
      ],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
