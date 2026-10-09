import { Page, expect, test as base } from '@playwright/test';

export interface FormspreeMock {
  /** Cuerpos JSON enviados a Formspree durante el test. */
  readonly requests: Record<string, string>[];
}

interface Fixtures {
  formspree: FormspreeMock;
  /** Errores de consola esperados en un test concreto (p. ej. el 404 del propio documento). */
  allowedConsoleErrors: RegExp[];
}

export const test = base.extend<Fixtures & { failOnConsoleErrors: void }>({
  allowedConsoleErrors: [[], { option: true }],

  // Cada test falla si la página registra errores en consola (incluidas violaciones de CSP).
  failOnConsoleErrors: [
    async ({ page, allowedConsoleErrors }, use) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error' && !allowedConsoleErrors.some((pattern) => pattern.test(message.text()))) {
          errors.push(message.text());
        }
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await use();
      expect(errors, 'errores en consola').toEqual([]);
    },
    { auto: true }
  ],

  // Formspree simulado: nunca se envían datos reales desde los tests.
  formspree: async ({ page }, use) => {
    const requests: Record<string, string>[] = [];
    await page.route('https://formspree.io/**', async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await use({ requests });
  }
});

export { expect };

/** Navega y espera a que la app esté hidratada (el formulario diferido se carga en idle tras arrancar). */
export const openPage = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await expect(page.locator('app-contact-form form')).toBeAttached();
};

/** En móvil la navegación está detrás del botón hamburguesa. */
export const openMenuIfMobile = async (page: Page, isMobile: boolean): Promise<void> => {
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir o cerrar el menú' }).click();
  }
};
