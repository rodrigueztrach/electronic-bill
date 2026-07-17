const router = require('express').Router();
const { verificarToken } = require('../middleware/auth');
const ctrl = require('../controllers/productoController');

router.use(verificarToken);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
