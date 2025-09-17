const store = require('./dataStore');
const { uid } = require('./id');
const holdService = require('./holdService');

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const seatId = (r, c) => `${letters[r]}${c + 1}`;

function buildAllSeats(rows, cols) {
  const all = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) all.push(seatId(r, c));
  return all;
}

exports.reserveSeats = async ({ sessionId, seats, customer, userId = null, discountPercent = 0, discountCode = null }) => {
  const sessions = await store.read('sessions.json');
  const reservations = await store.read('reservations.json');

  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    const e = new Error('Session not found');
    e.status = 404; throw e;
  }

  const allSeats = new Set(buildAllSeats(session.rows, session.cols));
  const invalidSeats = seats.filter(s => !allSeats.has(s));
  if (invalidSeats.length) {
    const e = new Error(`Invalid seat(s): ${invalidSeats.join(', ')}`);
    e.status = 400; throw e;
  }

  // permanent conflicts
  const occupied = new Set(session.occupiedSeats || []);
  const permConflicts = seats.filter(s => occupied.has(s));
  if (permConflicts.length) {
    const e = new Error(`Seat(s) already occupied: ${permConflicts.join(', ')}`);
    e.status = 409; throw e;
  }

  // held by another user?
  const heldByOther = await holdService.anyHeldByAnother(sessionId, seats, userId);
  if (heldByOther) {
    const e = new Error('Some seats are temporarily held by another user');
    e.status = 423; // Locked
    throw e;
  }

  // mark permanent
  session.occupiedSeats = Array.from(new Set([...(session.occupiedSeats || []), ...seats]));

  const baseTotal = (session.price || 0) * seats.length;
  const pct = Math.max(0, Math.min(100, Number(discountPercent || 0)));
  const totalPrice = Number((baseTotal * (100 - pct) / 100).toFixed(2));

  const reservation = {
    id: uid('res_'),
    sessionId,
    seats,
    totalPrice,
    userId,
    customer: customer || null,
    discountPercent: pct,         // <- keep what was applied
    discountCode: discountCode,   // <- keep which code was used (if any)
    createdAt: new Date().toISOString()
  };

  const updatedSessions = sessions.map(s => (s.id === session.id ? session : s));
  await store.write('sessions.json', updatedSessions);
  await store.write('reservations.json', [...reservations, reservation]);

  // clear user's temporary holds for these seats
  if (userId) await holdService.removeUserHoldsForSeats(sessionId, seats, userId);

  return reservation;
};
