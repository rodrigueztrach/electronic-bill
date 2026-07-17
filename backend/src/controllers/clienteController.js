const { Cliente } = require('../models');

async function listar(req, res, next) {
  try {
    const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
    res.json(clientes);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json(cliente);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
