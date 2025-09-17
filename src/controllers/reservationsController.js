const store = require('../services/dataStore');
const service = require('../services/reservationService');

exports.listReservations = async (req, res, next) => {
  try {
    const reservations = await store.read('reservations.json');
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const reservations = await store.read('reservations.json');
    const r = reservations.find(x => x.id === req.params.id);
    if (!r) return res.status(404).json({ error: true, message: 'Reservation not found' });
    res.json(r);
  } catch (err) {
    next(err);
  }
};

exports.createReservation = async (req, res, next) => {
  try {
    const { sessionId, seats, customer } = req.body;
    if (!sessionId || !Array.isArray(seats) || seats.length === 0) {
      const e = new Error('Provide sessionId and a non-empty seats array');
      e.status = 400;
      throw e;
    }
    const userId = req.user?.id || null;
    const created = await service.reserveSeats({ sessionId, seats, customer, userId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};
