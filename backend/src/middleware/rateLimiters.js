const rateLimit = require('express-rate-limit');

const mfaLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,                    // 5 intentos por IP en esa ventana
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,     // devuelve info del límite en headers RateLimit-*
  legacyHeaders: false,
});

module.exports = { mfaLoginLimiter };