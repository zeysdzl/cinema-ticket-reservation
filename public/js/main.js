import { api } from './api.js';
import { els, showLanding, showApp, showView, updateCartBadge } from './ui.js';
import { initAuth } from './auth.js';
import { loadMovies, initMoviesActions } from './movies.js';
import { renderCart, initCartActions } from './cart.js';
import { renderTickets } from './tickets.js';
import { initProfile } from './profile.js';
import { getToken, clearAuth, getCart, clearCart } from './state.js';

// Init auth tabs/forms
initAuth();

// Navbar clicks
els.navMovies.addEventListener('click', () => { showView('movies'); });
els.navCart.addEventListener('click', () => { showView('cart'); renderCart(); });
els.navTickets.addEventListener('click', () => { showView('tickets'); renderTickets(); });
els.navProfile.addEventListener('click', () => { showView('profile'); initProfile(); });

// Logout: release holds best-effort, clear cart, then logout
els.btnLogout.addEventListener('click', async () => {
  const c = getCart();
  await Promise.all(Object.values(c).map(g => api.releaseHolds(g.sessionId, g.seats).catch(() => {})));
  clearCart();
  clearAuth();
  showLanding();
});

// Movies actions
initMoviesActions();

// Cart actions
initCartActions();

// React to cart/auth changes
window.addEventListener('cart-changed', updateCartBadge);
window.addEventListener('auth-changed', updateCartBadge);

// Boot
(async function init() {
  const token = getToken();
  if (token) {
    try {
      await api.me();
      showApp();
      await loadMovies();
      return;
    } catch (_) {}
  }
  showLanding();
})();

// Refresh movies if returning to tab
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden && !els.viewMovies.classList.contains('hidden')) {
    await loadMovies();
  }
});

// Initial load
loadMovies();
