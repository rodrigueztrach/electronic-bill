const { Op } = require('sequelize');
const { CabysCodigo } = require('../models');

/**
 * Busca en el catálogo CABYS local por descripción o por código.
 * GET /api/cabys/buscar?q=laptop
 */
async function buscar(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ error: 'Escribe al menos 3 caracteres para buscar' });
    }

    const termino = q.trim();
    const esNumerico = /^\d+$/.test(termino);

    const resultados = await CabysCodigo.findAll({
      where: esNumerico
        ? { codigo: { [Op.startsWith]: termino } }
        : { descripcion: { [Op.iLike]: `%${termino}%` } },
      limit: 20,
      order: [['descripcion', 'ASC']],
    });

    res.json(resultados);
  } catch (err) { next(err); }
}

/** Obtiene un código CABYS exacto (13 dígitos). */
async function obtener(req, res, next) {
  try {
    const item = await CabysCodigo.findByPk(req.params.codigo);
    if (!item) return res.status(404).json({ error: 'Código CABYS no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
}

module.exports = { buscar, obtener };