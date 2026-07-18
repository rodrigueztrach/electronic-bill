const router = require('express').Router();
const { registrar, login } = require('../controllers/authController');
const { setupMfa, verifyMfaSetup, loginMfa } = require('../controllers/mfaController');
const { verificarToken } = require('../middleware/auth');
const { mfaLoginLimiter } = require('../middleware/rateLimiters');

router.post('/registro', registrar);
router.post('/login', login);

// --- Rutas MFA ---
router.post('/mfa/setup', verificarToken, setupMfa);
router.post('/mfa/verify-setup', verificarToken, verifyMfaSetup);
router.post('/mfa/login', mfaLoginLimiter, loginMfa);

module.exports = router;