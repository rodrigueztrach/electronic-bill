const router = require('express').Router();
const { verificarToken } = require('../middleware/auth');
const ctrl = require('../controllers/facturaController');

router.use(verificarToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.get('/:id/estado', ctrl.consultarEstado);

module.exports = router;
