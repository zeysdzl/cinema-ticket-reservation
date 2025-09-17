const store = require('./dataStore');

const HOLDS_FILE = 'holds.json';
const HOLD_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function readHolds() {
  return store.read(HOLDS_FILE);
}

async function writeHolds(data) {
  return store.write(HOLDS_FILE, data);
}

function nowMs() {
  return Date.now();
}

function isExpired(hold) {
  return new Date(hold.expiresAt).getTime() <= nowMs();
}

async function pruneExpired() {
  const holds = await readHolds();
  const filtered = holds.filter(h => !isExpired(h));
  if (filtered.length !== holds.length) {
    await writeHolds(filtered);
  }
  return filtered;
}

async function getHeldSeatsForSession(sessionId) {
  const holds = await pruneExpired();
  return holds.filter(h => h.sessionId === sessionId).map(h => h.seat);
}

async function holdSeats({ userId, sessionId, seats }) {
  const [sessions, holds] = await Promise.all([store.read('sessions.json'), pruneExpired()]);
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    const e = new Error('Session not found');
    e.status = 404; throw e;
  }

  // Validate seat IDs are inside layout
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const seatId = (r, c) => `${letters[r]}${c + 1}`;
  const all = new Set(Array.from({ length: session.rows * session.cols }, (_, i) => {
    const r = Math.floor(i / session.cols), c = i % session.cols; return seatId(r, c);
  }));
  const invalid = seats.filter(s => !all.has(s));
  if (invalid.length) {
    const e = new Error(`Invalid seat(s): ${invalid.join(', ')}`);
    e.status = 400; throw e;
  }

  const occupied = new Set(session.occupiedSeats || []);
  const activeHolds = holds.filter(h => h.sessionId === sessionId);
  const heldMap = new Map(activeHolds.map(h => [`${h.sessionId}:${h.seat}`, h]));

  // Check conflicts: cannot hold if occupied or held by another user
  const conflicts = [];
  for (const seat of seats) {
    if (occupied.has(seat)) { conflicts.push(seat); continue; }
    const key = `${sessionId}:${seat}`;
    const existing = heldMap.get(key);
    if (existing && existing.userId !== userId) conflicts.push(seat);
  }
  if (conflicts.length) {
    const e = new Error(`Seat(s) unavailable: ${conflicts.join(', ')}`);
    e.status = 409; throw e;
  }

  const until = new Date(nowMs() + HOLD_TTL_MS).toISOString();
  // Upsert holds for this user
  const updated = holds.filter(h => !(h.sessionId === sessionId && h.userId === userId && seats.includes(h.seat)));
  for (const seat of seats) {
    updated.push({ sessionId, seat, userId, expiresAt: until });
  }
  await writeHolds(updated);
  return { expiresAt: until };
}

async function releaseSeats({ userId, sessionId, seats }) {
  const holds = await pruneExpired();
  const filtered = holds.filter(h => !(h.userId === userId && h.sessionId === sessionId && seats.includes(h.seat)));
  await writeHolds(filtered);
  return true;
}

async function anyHeldByAnother(sessionId, seats, userId) {
  const holds = await pruneExpired();
  return seats.some(seat => {
    const h = holds.find(x => x.sessionId === sessionId && x.seat === seat);
    return h && h.userId !== userId;
  });
}

async function removeUserHoldsForSeats(sessionId, seats, userId) {
  const holds = await pruneExpired();
  const filtered = holds.filter(h => !(h.userId === userId && h.sessionId === sessionId && seats.includes(h.seat)));
  await writeHolds(filtered);
}

module.exports = {
  HOLD_TTL_MS,
  getHeldSeatsForSession,
  holdSeats,
  releaseSeats,
  anyHeldByAnother,
  removeUserHoldsForSeats,
  pruneExpired
};
