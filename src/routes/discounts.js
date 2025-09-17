const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/discountsController');

const router = Router();
// simple validate endpoint
router.post('/validate', auth, ctrl.validate);

module.exports = router;
