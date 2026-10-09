import { defineConfig, devices } from '@playwright/test';

/**
 * Tests end-to-end sobre el build de producción (`npm run build` antes).
 * Usa el Chrome instalado (channel: 'chrome'): no hace falta descargar navegadores.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    locale: 'es-PE',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel: 'chrome' } }
  ],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI']
  }
});
