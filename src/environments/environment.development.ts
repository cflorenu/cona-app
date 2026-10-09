export const environment = {
  production: false,
  contactFormEndpoint: 'https://formspree.io/f/xrblljgn',
  siteUrl: '',
  /** Endpoint SSE de resultados en vivo (vacío = desactivado). Dev: npm run mock:live */
  liveFeedUrl: 'http://localhost:3001/live',
  features: {
    eventsPreview: true
  }
};
