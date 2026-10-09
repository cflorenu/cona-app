import { expect, openMenuIfMobile, openPage, test } from './fixtures';

test.describe('Inicio', () => {
  test('muestra la portada con disciplinas, SEO y datos estructurados', async ({ page }) => {
    await openPage(page, '/');

    await expect(page).toHaveTitle('Con Atletas Sur | Artes marciales en Villa El Salvador');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Atletas');
    await expect(page.locator('.discipline')).toHaveCount(4);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Agenda tu clase gratis/);
    const jsonLd = JSON.parse((await page.locator('#jsonld-organization').textContent()) ?? '{}');
    expect(jsonLd['@type']).toBe('SportsActivityLocation');
  });

  test('el modal de horario muestra el horario propio y se cierra con Escape', async ({ page }) => {
    await openPage(page, '/');

    await page.getByRole('button', { name: 'Horario de clases' }).click();
    const dialog = page.getByRole('dialog', { name: 'Horario de Clases' });
    await expect(dialog).toContainText('Lunes a sábado');
    await expect(dialog).toContainText('6:30 p. m. – 7:30 p. m.');
    await expect(dialog).toContainText('7:30 p. m. – 9:00 p. m.');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('Navegación', () => {
  test('el menú lleva a cada página y marca la activa', async ({ page, isMobile }) => {
    await openPage(page, '/');

    await openMenuIfMobile(page, isMobile);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Blog' }).click();

    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Novedades y noticias');
    await openMenuIfMobile(page, isMobile);
    await expect(page.getByRole('link', { name: 'Blog', exact: true }).first()).toHaveAttribute('aria-current', 'page');
  });

  test('en móvil el menú se abre, navega y se cierra', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'solo móvil');
    await openPage(page, '/');
    const toggle = page.getByRole('button', { name: 'Abrir o cerrar el menú' });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('link', { name: 'Alumnos' }).click();

    await expect(page).toHaveURL('/student-portal');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#horario')).toContainText('6:30 p. m.');
  });

  test('los enlaces del footer a disciplinas llevan a su sección sin quedar tapadas por el header', async ({ page }) => {
    await openPage(page, '/blog');

    await page.getByRole('navigation', { name: 'Mapa del sitio' }).getByRole('link', { name: 'Muay Thai' }).click();

    await expect(page).toHaveURL('/#muay-thai');
    const section = page.locator('#muay-thai');
    await expect(section).toBeInViewport();
    const headerHeight = (await page.locator('.site-header').boundingBox())!.height;
    await expect.poll(async () => (await section.boundingBox())!.y).toBeGreaterThanOrEqual(headerHeight - 1);
  });

  test('"Saltar al contenido" lleva el foco al contenido principal', async ({ page, isMobile }) => {
    test.skip(isMobile, 'navegación con teclado');
    await openPage(page, '/');

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');

    await expect(page.locator('main#contenido')).toBeFocused();
  });

  test.describe('página 404', () => {
    // Chrome registra en consola el 404 del propio documento: es justo lo que se comprueba.
    test.use({ allowedConsoleErrors: [/status of 404/] });

    test('una URL inexistente devuelve un 404 real con su página', async ({ page }) => {
      const response = await page.goto('/esta-pagina-no-existe');

      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Página no encontrada');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    });
  });
});

test.describe('Formularios', () => {
  test('clase gratis: valida, envía con +51 y confirma', async ({ page, formspree, isMobile }) => {
    await openPage(page, '/');

    await openMenuIfMobile(page, isMobile);
    await page.getByRole('button', { name: 'Clase gratis' }).first().click();
    const dialog = page.getByRole('dialog', { name: /clase gratis/i });
    await expect(dialog.getByLabel('Nombre completo')).toBeFocused();

    await dialog.getByRole('button', { name: 'Quiero mi clase gratis' }).click();
    await expect(dialog.locator('.invalid-feedback')).toHaveCount(4);

    await dialog.getByLabel('Nombre completo').fill('Ana Pérez');
    await dialog.getByLabel('Celular').fill('987654321');
    await dialog.getByLabel('Correo').fill('ana@example.com');
    await dialog.getByLabel('Disciplina de interés').selectOption('Sambo');
    await dialog.getByRole('button', { name: 'Quiero mi clase gratis' }).click();

    await expect(dialog).toContainText('¡Solicitud enviada!');
    expect(formspree.requests).toEqual([
      expect.objectContaining({ nombre: 'Ana Pérez', telefono: '+51987654321', disciplina: 'Sambo', _subject: 'Solicitud de clase gratis' })
    ]);
  });

  test('contacto: envía el mensaje y confirma', async ({ page, formspree }) => {
    await openPage(page, '/');
    const form = page.locator('app-contact-form');

    await form.getByLabel('Nombre completo').fill('Luis Gómez');
    await form.getByLabel('Email').fill('luis@example.com');
    await form.getByLabel('Mensaje').fill('¿Hay clases para adultos?');
    await form.getByRole('button', { name: 'Enviar', exact: true }).click();

    await expect(form.locator('.alert-success')).toBeVisible();
    expect(formspree.requests[0]).toEqual(expect.objectContaining({ _replyto: 'luis@example.com', codigo_pais: '+51' }));
  });

  test('newsletter: rechaza correos inválidos y suscribe los válidos', async ({ page, formspree }) => {
    await openPage(page, '/');
    const email = page.getByLabel('Correo electrónico');
    const submit = page.getByRole('button', { name: 'Suscribirme al newsletter' });

    await email.fill('no-es-correo');
    await submit.click();
    await expect(page.locator('#newsletter-status')).toContainText('correo electrónico válido');
    expect(formspree.requests).toHaveLength(0);

    await email.fill('ana@example.com');
    await submit.click();
    await expect(page.locator('#newsletter-status')).toContainText('¡Listo!');
    expect(formspree.requests[0]).toEqual(expect.objectContaining({ email: 'ana@example.com', _subject: 'Suscripción al newsletter' }));
  });
});

test('la política de privacidad es accesible desde el footer', async ({ page }) => {
  await openPage(page, '/');

  await page.locator('.footer-bottom').getByRole('link', { name: 'Política de privacidad' }).click();

  await expect(page).toHaveURL('/privacidad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidad');
  await expect(page.getByText('Ley N.º 29733').first()).toBeVisible();
});
