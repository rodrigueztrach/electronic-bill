const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { Usuario, Empresa, sequelize } = require('../models');

/**
 * Registro público, pero SOLO funciona si todavía no existe ningún usuario
 * en el sistema (bootstrap del primer administrador). Una vez que exista al
 * menos un usuario, este endpoint queda bloqueado y la creación de nuevos
 * usuarios (vendedores u otros admins) debe hacerse desde /api/usuarios,
 * que exige estar autenticado como admin.
 *
 * Además del usuario, crea el registro de la EMPRESA (datos fiscales del
 * emisor) que se usarán en cada factura electrónica.
 */
async function registrar(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      nombre, email, password,
      nombre_comercial, tipo_identificacion, identificacion,
      provincia, provincia_nombre,
      canton, canton_nombre,
      distrito, distrito_nombre,
      barrio, barrio_nombre,
      senas_extra, email_copia, telefono, referencia,
    } = req.body;

    if (!nombre || !email || !password || !identificacion) {
      await t.rollback();
      return res.status(400).json({ error: 'nombre, email, password e identificación son requeridos' });
    }

    const totalUsuarios = await Usuario.count();
    if (totalUsuarios > 0) {
      await t.rollback();
      return res.status(403).json({
        error: 'Ya existe un administrador configurado. Pide a un admin que te cree una cuenta desde el módulo de Usuarios.',
      });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      await t.rollback();
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    // El primer usuario del sistema siempre se crea como admin.
    const usuario = await Usuario.create(
      { nombre, email, password_hash, rol: 'admin' },
      { transaction: t }
    );

    await Empresa.create({
      nombre,
      nombre_comercial,
      tipo_identificacion,
      identificacion,
      provincia, provincia_nombre,
      canton, canton_nombre,
      distrito, distrito_nombre,
      barrio, barrio_nombre,
      senas_extra,
      email,
      email_copia,
      telefono,
      referencia,
      usuario_id: usuario.id,
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Si tiene MFA activo, no emitas el token todavía
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