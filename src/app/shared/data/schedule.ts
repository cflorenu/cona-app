export interface ClassSession {
  group: string;
  /** Hora en formato 24 h "HH:mm" (hora de Lima). */
  start: string;
  end: string;
}

/** Días de entrenamiento (lunes a sábado). */
export const TRAINING_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
export const TRAINING_DAYS_LABEL = 'Lunes a sábado';

/** Días en formato Schema.org (para el JSON-LD de horarios). */
export const SCHEMA_TRAINING_DAYS = TRAINING_DAYS.map(
  (_, i) => `https://schema.org/${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]}`
);

export const CLASS_SESSIONS: readonly ClassSession[] = [
  { group: 'Niños', start: '18:30', end: '19:30' },
  { group: 'Jóvenes', start: '19:30', end: '21:00' }
];

/** "18:30" -> "6:30 p. m." (formato 12 h usado en Perú). */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

/** Duración legible: "18:30"–"19:30" -> "1 h"; "19:30"–"21:00" -> "1 h 30 min". */
export const formatDuration = ({ start, end }: Pick<ClassSession, 'start' | 'end'>): string => {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const total = toMinutes(end) - toMinutes(start);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return [hours && `${hours} h`, minutes && `${minutes} min`].filter(Boolean).join(' ');
};
