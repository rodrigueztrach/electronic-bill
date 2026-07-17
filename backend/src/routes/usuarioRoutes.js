const router = require('express').Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/usuarioController');

// Todas las rutas requieren estar autenticado Y tener rol admin.
router.use(verificarToken, verificarAdmin);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;