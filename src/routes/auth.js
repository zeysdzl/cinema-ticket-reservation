const { Router } = require('express');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

module.exports = router;
