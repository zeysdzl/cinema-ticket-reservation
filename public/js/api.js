import { getToken } from './state.js';

async function fetchJSON(url, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!headers['Content-Type'] && options.method && options.method !== 'GET') headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let msg = await res.text();
    try { const j = JSON.parse(msg); msg = j.message || msg; } catch {}
    throw new Error(`${res.status}: ${msg}`);
  }
  return res.json();
}

export const api = {
  // auth
  register: (body) => fetchJSON('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => fetchJSON('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => fetchJSON('/api/users/me'),
  changePassword: (body) => fetchJSON('/api/users/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // movies/sessions
  listMovies: () => fetchJSON('/api/movies'),
  listSessionsByMovie: (movieId) => fetchJSON(`/api/sessions?movieId=${encodeURIComponent(movieId)}`),
  getSession: (id) => fetchJSON(`/api/sessions/${id}`),

  // holds
  holdSeats: (sessionId, seats) => fetchJSON('/api/holds', { method: 'POST', body: JSON.stringify({ sessionId, seats }) }),
  releaseHolds: (sessionId, seats) => fetchJSON('/api/holds', { method: 'DELETE', body: JSON.stringify({ sessionId, seats }) }),

  // discounts
  validateDiscount: (code) => fetchJSON('/api/discounts/validate', { method: 'POST', body: JSON.stringify({ code }) }),

  // checkout
  checkout: (items) => fetchJSON('/api/checkout', { method: 'POST', body: JSON.stringify({ items }) }),

  // tickets
  myTickets: () => fetchJSON('/api/tickets'),
};
