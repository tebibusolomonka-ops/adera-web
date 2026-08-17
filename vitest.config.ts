import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
