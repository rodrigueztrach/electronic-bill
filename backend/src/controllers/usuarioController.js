const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

const ROLES_VALIDOS = ['admin', 'vendedor'];

async function listar(req, res, next) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'createdAt'],
      order: [['nombre', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'createdAt'],
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { nombre, email, password, rol = 'vendedor' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `rol inválido, use uno de: ${ROLES_VALIDOS.join(', ')}` });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(409).json({ error: 'El correo ya está registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password_hash, rol });

    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, rol, password } = req.body;

    if (rol && !ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `rol inválido, use uno de: ${ROLES_VALIDOS.join(', ')}` });
    }

    // Evita que un admin se quite a sí mismo el rol de admin y se bloquee.
    if (usuario.id === req.usuario.id && rol && rol !== 'admin') {
      return res.status(400).json({ error: 'No puedes quitarte a ti mismo el rol de administrador' });
    }

    const datos = {};
    if (nombre) datos.nombre = nombre;
    if (rol) datos.rol = rol;
    if (password) datos.password_hash = await bcrypt.hash(password, 10);

    await usuario.update(datos);
    res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (usuario.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    await usuario.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };