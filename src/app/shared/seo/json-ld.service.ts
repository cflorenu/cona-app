
import { Injectable, inject, DOCUMENT } from '@angular/core';
import { JsonLd, serializeJsonLd } from './structured-data';

/** Gestiona bloques JSON-LD en <head>. Funciona en prerender, así el marcado queda en el HTML estático. */
@Injectable({
  providedIn: 'root'
})
export class JsonLdService {
  private readonly document = inject(DOCUMENT);

  set(id: string, data: JsonLd | JsonLd[]): void {
    const elementId = this.elementId(id);
    let script = this.document.getElementById(elementId);
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.id = elementId;
      this.document.head.appendChild(script);
    }
    script.textContent = serializeJsonLd(data);
  }

  remove(id: string): void {
    this.document.getElementById(this.elementId(id))?.remove();
  }

  private elementId(id: string): string {
    return `jsonld-${id}`;
  }
}
