const store = require('../services/dataStore');
const holdService = require('../services/holdService');

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const seatId = (r, c) => `${letters[r]}${c + 1}`;

exports.listSessions = async (req, res, next) => {
  try {
    const sessions = await store.read('sessions.json');
    const { movieId } = req.query;
    const filtered = movieId ? sessions.filter(s => s.movieId === movieId) : sessions;
    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const sessions = await store.read('sessions.json');
    const session = sessions.find(s => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: true, message: 'Session not found' });
    }
    const all = [];
    for (let r = 0; r < session.rows; r++) for (let c = 0; c < session.cols; c++) all.push(seatId(r, c));
    const occupied = new Set(session.occupiedSeats || []);

    const heldSeats = await holdService.getHeldSeatsForSession(session.id);
    const held = new Set(heldSeats);

    const available = all.filter(s => !occupied.has(s) && !held.has(s));
    res.json({ ...session, availableSeats: available, heldSeats: Array.from(held) });
  } catch (err) {
    next(err);
  }
};
