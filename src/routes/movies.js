const { Router } = require('express');
const ctrl = require('../controllers/moviesController');

const router = Router();
router.get('/', ctrl.listMovies);

module.exports = router;
