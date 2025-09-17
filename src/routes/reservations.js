const { Router } = require('express');
const ctrl = require('../controllers/reservationsController');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', ctrl.listReservations);
router.get('/:id', ctrl.getReservationById);
router.post('/', auth, ctrl.createReservation); // Reserved seats

module.exports = router;
