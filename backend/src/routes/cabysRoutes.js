const router = require('express').Router();
const { verificarToken } = require('../middleware/auth');
const ctrl = require('../controllers/cabysController');

router.use(verificarToken);
router.get('/buscar', ctrl.buscar);
router.get('/:codigo', ctrl.obtener);

module.exports = router;