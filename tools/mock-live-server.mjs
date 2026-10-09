// Servidor SSE de desarrollo: emite un play-by-play de demostración para el ticker de /eventos.
// Uso: npm run mock:live   (http://localhost:3001/live)
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:4200';
const INTERVAL_MS = 3000;

const SCRIPT = [
  { kind: 'info', round: 1, time: '4:50', text: 'Arranca el combate: Muestra presiona con jab al cuerpo.' },
  { kind: 'info', round: 1, time: '3:12', text: 'Prueba responde con gancho al hígado; buen intercambio.' },
  { kind: 'score', round: 1, time: '1:05', text: 'Derribo de Muestra: rodilla en el clinch y control contra la reja.' },
  { kind: 'info', round: 2, time: '4:30', text: 'Segundo round: Prueba cambia de guardia y conecta un recto.' },
  { kind: 'score', round: 2, time: '2:18', text: 'Codazo giratorio de Muestra, Prueba tambalea.' },
  { kind: 'result', round: 2, time: '1:47', text: 'Final: Luis Muestra gana por KO técnico (R2 · 1:47).' }
];

createServer((req, res) => {
  if (req.url !== '/live') {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN
  });
  res.write('retry: 3000\n\n');

  let step = 0;
  const send = () => {
    const update = { id: `m2-${step}`, matchId: 'm2', ...SCRIPT[step % SCRIPT.length] };
    res.write(`event: update\ndata: ${JSON.stringify(update)}\n\n`);
    step++;
  };
  send();
  const timer = setInterval(send, INTERVAL_MS);
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);
  req.on('close', () => {
    clearInterval(timer);
    clearInterval(heartbeat);
  });
}).listen(PORT, () => console.log(`SSE de demostración en http://localhost:${PORT}/live`));
