const store = require('../services/dataStore');

exports.myTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [reservations, sessions, movies] = await Promise.all([
      store.read('reservations.json'),
      store.read('sessions.json'),
      store.read('movies.json'),
    ]);

    const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
    const sessionsById = byId(sessions);
    const moviesById = byId(movies);

    const mine = reservations
      .filter(r => r.userId === userId)
      .map(r => {
        const s = sessionsById[r.sessionId];
        const m = s ? moviesById[s.movieId] : null;
        return {
          id: r.id,
          sessionId: r.sessionId,
          seats: r.seats,
          totalPrice: r.totalPrice,
          discountPercent: r.discountPercent || 0,
          discountCode: r.discountCode || null,
          createdAt: r.createdAt,
          movieTitle: m ? m.title : null,
          startTime: s ? s.startTime : null,
          room: s ? s.room : null,
          price: s ? s.price : null
        };
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    res.json(mine);
  } catch (err) {
    next(err);
  }
};
