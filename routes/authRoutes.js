const express = require('express');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const {register, login } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', registerValidator, authLimiter, register);
router.post('/login', loginValidator, authLimiter, login);

module.exports = router;