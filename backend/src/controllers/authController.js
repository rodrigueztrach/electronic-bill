const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); 
const { Usuario } = require('../models');

/**
 * Registro público, pero SOLO funciona si todavía no existe ningún usuario
 * en el sistema (bootstrap del primer administrador). Una vez que exista al
 * menos un usuario, este endpoint queda bloqueado y la creación de nuevos
 * usuarios (vendedores u otros admins) debe hacerse desde /api/usuarios,
 * que exige estar autenticado como admin.
 */
async function registrar(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }

    const totalUsuarios = await Usuario.count();
    if (totalUsuarios > 0) {
      return res.status(403).json({
        error: 'Ya existe un administrador configurado. Pide a un admin que te cree una cuenta desde el módulo de Usuarios.',
      });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(409).json({ error: 'El correo ya está registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    // El primer usuario del sistema siempre se crea como admin.
    const usuario = await Usuario.create({ nombre, email, password_hash, rol: 'admin' });

    return res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (err) {
    next(err);
  }
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); // 👈 NUEVO
const { Usuario } = require('../models');

// ... función registrar() sin cambios ...

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });

    // 👇 NUEVO: si tiene MFA activo, no emitas el token todavía
    if (usuario.mfa_enabled) {
      return res.json({ mfaRequired: true, userId: usuario.id });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login }; 