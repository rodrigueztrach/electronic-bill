const { Producto } = require('../models');

async function listar(req, res, next) {
  try {
    const productos = await Producto.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['descripcion', 'ASC']],
    });
    res.json(productos);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const producto = await Producto.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const producto = await Producto.create({ ...req.body, empresa_id: req.usuario.empresa_id });
    res.status(201).json(producto);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const producto = await Producto.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update(req.body);
    res.json(producto);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const producto = await Producto.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };