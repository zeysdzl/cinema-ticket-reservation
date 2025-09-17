const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/holdsController');

const router = Router();
router.post('/', auth, ctrl.create);     
router.delete('/', auth, ctrl.release);  

module.exports = router;
