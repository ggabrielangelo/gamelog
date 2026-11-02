import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// Instrumentação de cobertura exigida pelos 3 cenários do experimento (TCC).
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',           
      exclude: ['node_modules', 'cypress/**'],
      extension: ['.ts', '.tsx'],
      cypress: true,                 
      requireEnv: false,
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
  },
});