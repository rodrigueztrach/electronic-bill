const { Cliente } = require('../models');

async function listar(req, res, next) {
  try {
    const clientes = await Cliente.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['nombre', 'ASC']],
    });
    res.json(clientes);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    // empresa_id SIEMPRE sale del token, nunca del body, para que nadie
    // pueda crear un cliente en otra empresa manipulando el request.
    const cliente = await Cliente.create({ ...req.body, empresa_id: req.usuario.empresa_id });
    res.status(201).json(cliente);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json(cliente);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };