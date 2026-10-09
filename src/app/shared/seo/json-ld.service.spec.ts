import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JsonLdService } from './json-ld.service';

describe('JsonLdService', () => {
  let service: JsonLdService;
  let doc: Document;

  const scripts = (): HTMLScriptElement[] =>
    Array.from(doc.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][id^="jsonld-test"]'));

  beforeEach(() => {
    service = TestBed.inject(JsonLdService);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    service.remove('test');
    service.remove('test-2');
  });

  it('debe insertar un <script type="application/ld+json"> en el <head>', () => {
    service.set('test', { '@type': 'Thing', name: 'A' });

    const [script] = scripts();
    expect(script.id).toBe('jsonld-test');
    expect(JSON.parse(script.textContent!)).toEqual({ '@type': 'Thing', name: 'A' });
  });

  it('debe actualizar el mismo bloque en lugar de duplicarlo (navegación/hidratación)', () => {
    service.set('test', { name: 'A' });
    service.set('test', { name: 'B' });

    expect(scripts()).toHaveSize(1);
    expect(JSON.parse(scripts()[0].textContent!).name).toBe('B');
  });

  it('debe admitir arrays y mantener bloques independientes por id', () => {
    service.set('test', [{ name: 'A' }, { name: 'B' }]);
    service.set('test-2', { name: 'C' });

    expect(scripts()).toHaveSize(2);
    expect(JSON.parse(scripts()[0].textContent!)).toHaveSize(2);
  });

  it('debe escapar contenido peligroso', () => {
    service.set('test', { name: '</script><img src=x onerror=alert(1)>' });

    expect(scripts()[0].textContent).not.toContain('</script>');
    expect(doc.head.querySelector('img')).toBeNull();
  });

  it('remove debe eliminar el bloque y tolerar ids inexistentes', () => {
    service.set('test', { name: 'A' });
    service.remove('test');

    expect(scripts()).toHaveSize(0);
    expect(() => service.remove('no-existe')).not.toThrow();
  });
});
