import { api } from './api.js';
import { els, fmtTime, showView } from './ui.js';
import { getCart, saveCart } from './state.js';
import { getToken } from './state.js';

let movies = [];
let currentMovie = null;
let currentSession = null;
let currentSessionDetail = null;
let selectedSeats = new Set();

let editMode = false;

export async function loadMovies() {
  movies = await api.listMovies();
  els.moviesGrid.innerHTML = movies.map(m => `
    <div class="card" data-id="${m.id}">
      <div><strong>${m.title}</strong></div>
    </div>
  `).join('');
  els.sessionsPanel.classList.add('hidden');
  els.seatsPanel.classList.add('hidden');

  els.moviesGrid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => showSessions(card.dataset.id));
  });
}

async function showSessions(movieId) {
  const movie = movies.find(m => m.id === movieId);
  currentMovie = movie;
  els.sessionsTitle.textContent = `Sessions — ${movie.title}`;
  const sessions = await api.listSessionsByMovie(movieId);
  els.sessionsList.innerHTML = sessions.map(s => `
    <div class="list-item">
      <div>${s.room} • ${fmtTime(s.startTime)} • ₺${s.price}</div>
      <button data-id="${s.id}" class="secondary">Select Seats</button>
    </div>
  `).join('');
  els.sessionsPanel.classList.remove('hidden');
  els.seatsPanel.classList.add('hidden');

  els.sessionsList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => showSeats(btn.dataset.id));
  });
}

async function showSeats(sessionId) {
  const session = await api.getSession(sessionId);
  currentSession = session.id;
  currentSessionDetail = session;

  if (!currentMovie) {
    if (!movies.length) movies = await api.listMovies();
    currentMovie = movies.find(m => m.id === session.movieId) || null;
  }

  els.seatsTitle.textContent = `${currentMovie?.title || 'Movie'} — ${session.room} • ${fmtTime(session.startTime)} (₺${session.price}/seat)`;

  selectedSeats = new Set();
  els.seatsGrid.innerHTML = '';
  els.seatsGrid.style.gridTemplateColumns = `repeat(${session.cols}, 38px)`;

  const occupiedPermanent = new Set(session.occupiedSeats || []);
  const heldSeats = new Set(session.heldSeats || []);
  const cart = getCart();
  const cartSeats = new Set(cart[sessionId]?.seats || []);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const seatId = (r, c) => `${letters[r]}${c + 1}`;

  for (let r = 0; r < session.rows; r++) {
    for (let c = 0; c < session.cols; c++) {
      const id = seatId(r, c);
      const el = document.createElement('div');
      el.className = 'seat';
      el.textContent = id;

      if (occupiedPermanent.has(id)) {
        el.classList.add('occupied');
      } else if (heldSeats.has(id)) {
        if (cartSeats.has(id)) {
          el.classList.add('selected');
          selectedSeats.add(id);
          el.addEventListener('click', () => toggleSeatInCart(sessionId, id, el, cartSeats));
        } else {
          el.classList.add('occupied');
        }
      } else {
        el.addEventListener('click', () => toggleSeatInCart(sessionId, id, el, cartSeats));
      }
      els.seatsGrid.appendChild(el);
    }
  }

  els.seatsMsg.textContent = editMode ? 'Click seats to add/remove. Your held seats are blue.' : '';
  els.seatsPanel.classList.remove('hidden');

  // toggle action buttons
  els.btnAddToCart.classList.toggle('hidden', editMode);
  els.btnDoneEdit.classList.toggle('hidden', !editMode);
}

async function toggleSeatInCart(sessionId, seatIdStr, el, cartSeats) {
  const cart = getCart();
  const grp = cart[sessionId] || (cart[sessionId] = {
    sessionId,
    movieTitle: currentMovie?.title || '',
    startTime: currentSessionDetail.startTime,
    room: currentSessionDetail.room,
    price: currentSessionDetail.price,
    seats: []
  });

  if (el.classList.contains('selected')) {
    try { await api.releaseHolds(sessionId, [seatIdStr]); } catch (_) {}
    grp.seats = (grp.seats || []).filter(x => x !== seatIdStr);
    el.classList.remove('selected');
    cartSeats.delete(seatIdStr);
  } else {
    if (!getToken()) { els.seatsMsg.textContent = 'Please log in to hold seats.'; return; }
    try {
      await api.holdSeats(sessionId, [seatIdStr]);
      const set = new Set(grp.seats || []);
      set.add(seatIdStr);
      grp.seats = Array.from(set);
      el.classList.add('selected');
      cartSeats.add(seatIdStr);
    } catch (e) {
      els.seatsMsg.textContent = e.message;
      return;
    }
  }

  if (!grp.seats.length) delete cart[sessionId];
  saveCart(cart);

  window.dispatchEvent(new Event('cart-changed'));
}

async function addToCart() {
  const seats = Array.from(selectedSeats);
  if (seats.length === 0) { els.seatsMsg.textContent = 'Select at least one seat.'; return; }
  if (!getToken()) {
    els.seatsMsg.textContent = 'Please log in to add seats (holds for 5 minutes).';
    return;
  }

  try {
    await api.holdSeats(currentSession, seats);
    const cart = getCart();
    const sId = currentSession;
    const s = currentSessionDetail;
    if (!cart[sId]) {
      cart[sId] = {
        sessionId: sId,
        movieTitle: currentMovie?.title || '',
        startTime: s.startTime,
        room: s.room,
        price: s.price,
        seats: []
      };
    }
    const set = new Set(cart[sId].seats || []);
    seats.forEach(x => set.add(x));
    cart[sId].seats = Array.from(set);
    saveCart(cart);

    els.seatsMsg.textContent = `Held ${seats.length} seat(s) and added to cart.`;
    selectedSeats.clear();
    els.seatsGrid.querySelectorAll('.seat.selected').forEach(el => el.classList.remove('selected'));
  } catch (e) {
    els.seatsMsg.textContent = e.message;
  }
}

export function initMoviesActions() {
  els.btnAddToCart.addEventListener('click', addToCart);

  els.btnDoneEdit.addEventListener('click', async () => {
    editMode = false;
    // Re-render cart after editing via seat map
    const { renderCart } = await import('./cart.js'); // dynamic import avoids circular deps
    renderCart();
    showView('cart');
  });
}


export async function openSeatEditorFromCart(sessionId) {
  editMode = true;
  showView('movies');
  if (!movies.length) movies = await api.listMovies();
  await showSeats(sessionId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// legacy helper
export async function jumpToEditSeats(sessionId) {
  return openSeatEditorFromCart(sessionId);
}
