import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// Instrumentação de cobertura exigida pelos 3 cenários do experimento (TCC).
// Em build de produção o vite-plugin-istanbul não instrumenta por padrão;
// setar VITE_COVERAGE=true no ambiente de build (ex.: Render do site buggy)
// força a instrumentação e expõe window.__coverage__ para os QAs.
const forceBuildInstrument = process.env.VITE_COVERAGE === 'true';

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'cypress/**'],
      extension: ['.ts', '.tsx'],
      cypress: true,
      requireEnv: false,
      forceBuildInstrument,
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
