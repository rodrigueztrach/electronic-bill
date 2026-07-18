const router = require('express').Router();
const { registrar, login } = require('../controllers/authController');
const { setupMfa, verifyMfaSetup, loginMfa } = require('../controllers/mfaController');
const { verificarToken } = require('../middlewares/authMiddleware'); // ajusta la ruta a donde tengas este archivo

router.post('/registro', registrar);
router.post('/login', login);

// --- Nuevas rutas MFA ---
router.post('/mfa/setup', verificarToken, setupMfa);
router.post('/mfa/verify-setup', verificarToken, verifyMfaSetup);
router.post('/mfa/login', loginMfa); // sin middleware: el usuario aún no tiene JWT completo en este paso

module.exports = router;