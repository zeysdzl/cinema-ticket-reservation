const { Router } = require('express');
const ctrl = require('../controllers/sessionsController');

const router = Router();
router.get('/', ctrl.listSessions);
router.get('/:id', ctrl.getSession);

module.exports = router;
