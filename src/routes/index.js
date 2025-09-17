const { Router } = require('express');
const movies = require('./movies');
const sessions = require('./sessions');
const reservations = require('./reservations');
const auth = require('./auth');
const users = require('./users');
const checkout = require('./checkout');
const tickets = require('./tickets');
const holds = require('./holds');
const discounts = require('./discounts'); 

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/movies', movies);
router.use('/sessions', sessions);
router.use('/reservations', reservations);
router.use('/checkout', checkout);
router.use('/tickets', tickets);
router.use('/holds', holds);
router.use('/discounts', discounts); 

module.exports = router;
