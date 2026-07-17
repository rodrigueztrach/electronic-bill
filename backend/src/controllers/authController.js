const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function registrar(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(409).json({ error: 'El correo ya está registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password_hash });

    return res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
  } catch (err) {
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

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login };
