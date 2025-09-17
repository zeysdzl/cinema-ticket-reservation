const holdService = require('../services/holdService');

exports.create = async (req, res, next) => {
  try {
    const { sessionId, seats } = req.body || {};
    if (!sessionId || !Array.isArray(seats) || seats.length === 0) {
      const e = new Error('sessionId and seats[] required');
      e.status = 400; throw e;
    }
    const userId = req.user.id;
    const result = await holdService.holdSeats({ userId, sessionId, seats });
    res.status(201).json({ ok: true, ...result });
  } catch (err) { next(err); }
};

exports.release = async (req, res, next) => {
  try {
    const { sessionId, seats } = req.body || {};
    if (!sessionId || !Array.isArray(seats) || seats.length === 0) {
      const e = new Error('sessionId and seats[] required');
      e.status = 400; throw e;
    }
    const userId = req.user.id;
    await holdService.releaseSeats({ userId, sessionId, seats });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
