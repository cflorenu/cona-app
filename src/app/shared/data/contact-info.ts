/** Número principal de WhatsApp de la academia (formato internacional, sin "+"). */
export const WHATSAPP_NUMBER = '51946893354';

export const whatsappUrl = (message: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const FREE_CLASS_WHATSAPP_URL = whatsappUrl(
  'Hola, vengo desde la página web y quisiera tener una clase gratis en el club Cona.'
);

export const STUDENT_HELP_WHATSAPP_URL = whatsappUrl(
  'Hola, soy alumno de la academia Cona y tengo una consulta.'
);
