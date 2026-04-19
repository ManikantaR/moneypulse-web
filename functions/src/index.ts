import { onRequest } from 'firebase-functions/v2/https';

export const health = onRequest((req, res) => {
  res.status(200).json({ ok: true, service: 'moneypulse-web-functions' });
});
