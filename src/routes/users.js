const { Router } = require('express');
const usersCtrl = require('../controllers/usersController');
const auth = require('../middleware/auth');

const router = Router();

router.get('/me', auth, usersCtrl.me);
router.post('/change-password', auth, usersCtrl.changePassword);

module.exports = router;
