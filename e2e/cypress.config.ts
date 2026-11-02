import { defineConfig } from 'cypress';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);
const REPO_ROOT = path.resolve(__dirname, '..');

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3333/api',
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on('task', {
        async resetDatabase() {
          const { stdout, stderr } = await execAsync('npm run prisma:reset-test', {
            cwd: REPO_ROOT,
            windowsHide: true,
          });
          if (stderr) {
            // eslint-disable-next-line no-console
            console.log('[resetDatabase stderr]', stderr.slice(0, 400));
          }
          return stdout.slice(-200) || null;
        },
      });

      return config;
    },
  },
});
