const { Router } = require('express');
const ctrl = require('../controllers/checkoutController');
const auth = require('../middleware/auth');

const router = Router();

// Batch purchase: [{ sessionId, seats: [] }, ...]
router.post('/', auth, ctrl.checkout);

module.exports = router;
