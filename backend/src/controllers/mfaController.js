const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { Usuario, Empresa } = require('../models');

/**
 * PASO 1: el usuario (ya logueado, con su token normal) pide activar MFA.
 * Requiere middleware de autenticación previo que ponga req.usuario.id
 * (el mismo que ya usas para proteger rutas de admin).
 */
async function setupMfa(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id); // req.usuario viene de tu middleware auth
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const secret = speakeasy.generateSecret({
      name: `TuFacturación (${usuario.email})`,
      length: 20,
    });

    // Se guarda temporalmente, aún no confirmado (mfa_enabled sigue en false)
    usuario.mfa_secret = secret.base32;
    await usuario.save();

    const qrImageUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({ qrImageUrl, manualEntryKey: secret.base32 });
  } catch (err) {
    next(err);
  }
}

/**
 * PASO 2: el usuario ingresa el primer código para confirmar la activación.
 */
async function verifyMfaSetup(req, res, next) {
  try {
    const { token } = req.body;
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario || !usuario.mfa_secret) {
      return res.status(400).json({ error: 'MFA no inicializado' });
    }

    const verificado = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verificado) return res.status(400).json({ error: 'Código incorrecto' });

    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).slice(2, 10)
    );

    usuario.mfa_enabled = true;
    usuario.mfa_backup_codes = backupCodes; // en producción: hashea cada código con bcrypt
    await usuario.save();

    return res.json({ message: 'MFA activado', backupCodes }); // mostrar una sola vez
  } catch (err) {
    next(err);
  }
}

/**
 * PASO 3: segundo factor del login. Recibe el userId que devolvió /login
 * cuando mfaRequired era true, más el código de 6 dígitos.
 */
async function loginMfa(req, res, next) {
  try {
    const { userId, token } = req.body;
    const usuario = await Usuario.findByPk(userId);
    if (!usuario || !usuario.mfa_enabled) {
      return res.status(400).json({ error: 'MFA no habilitado para este usuario' });
    }

    const verificado = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verificado) return res.status(401).json({ error: 'Código MFA inválido' });

    const empresa = await Empresa.findOne({ where: { usuario_id: usuario.id } });

    // Solo aquí, tras validar ambos factores, se emite el token real
    const jwtToken = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, empresa_id: empresa?.id || null },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token: jwtToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, empresa_id: empresa?.id || null },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { setupMfa, verifyMfaSetup, loginMfa };