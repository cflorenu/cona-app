export const environment = {
  production: true,
  contactFormEndpoint: 'https://formspree.io/f/xrblljgn',
  /** Dominio público (p. ej. https://www.midominio.pe). Necesario para URLs absolutas en JSON-LD; vacío = se omiten. */
  siteUrl: '',
  /** Endpoint SSE de resultados en vivo (vacío = desactivado). Dev: npm run mock:live */
  liveFeedUrl: '',
  features: {
    /** Página /eventos con datos de demostración: solo en desarrollo hasta tener datos reales. */
    eventsPreview: false
  }
};
