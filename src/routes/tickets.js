const { Router } = require('express');
const ctrl = require('../controllers/ticketsController');
const auth = require('../middleware/auth');

const router = Router();
router.get('/', auth, ctrl.myTickets);

module.exports = router;
