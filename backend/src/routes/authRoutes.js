const router = require('express').Router();
const { registrar, login } = require('../controllers/authController');
const { setupMfa, verifyMfaSetup, loginMfa } = require('../controllers/mfaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { mfaLoginLimiter } = require('../middlewares/rateLimiters'); 

router.post('/registro', registrar);
router.post('/login', login);

router.post('/mfa/setup', verificarToken, setupMfa);
router.post('/mfa/verify-setup', verificarToken, verifyMfaSetup);
router.post('/mfa/login', mfaLoginLimiter, loginMfa); 

module.exports = router;