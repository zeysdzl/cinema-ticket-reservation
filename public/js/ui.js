import { getCart, getUser } from './state.js';

export const els = {
  landing: document.getElementById('landing'),
  app: document.getElementById('app'),

  // tabs/forms
  tabLogin: document.getElementById('tabLogin'),
  tabRegister: document.getElementById('tabRegister'),
  loginForm: document.getElementById('loginForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginMsg: document.getElementById('loginMsg'),
  registerForm: document.getElementById('registerForm'),
  regName: document.getElementById('regName'),
  regSurname: document.getElementById('regSurname'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regMsg: document.getElementById('regMsg'),

  // navbar
  navMovies: document.getElementById('navMovies'),
  navCart: document.getElementById('navCart'),
  navTickets: document.getElementById('navTickets'),
  navProfile: document.getElementById('navProfile'),
  btnLogout: document.getElementById('btnLogout'),
  cartCount: document.getElementById('cartCount'),

  // views
  viewMovies: document.getElementById('viewMovies'),
  viewCart: document.getElementById('viewCart'),
  viewTickets: document.getElementById('viewTickets'),
  viewProfile: document.getElementById('viewProfile'),

  // movies view
  moviesGrid: document.getElementById('moviesGrid'),
  sessionsPanel: document.getElementById('sessionsPanel'),
  sessionsTitle: document.getElementById('sessionsTitle'),
  sessionsList: document.getElementById('sessionsList'),
  seatsPanel: document.getElementById('seatsPanel'),
  seatsTitle: document.getElementById('seatsTitle'),
  seatsGrid: document.getElementById('seatsGrid'),
  seatsMsg: document.getElementById('seatsMsg'),
  btnAddToCart: document.getElementById('btnAddToCart'),
  btnDoneEdit: document.getElementById('btnDoneEdit'),

  // cart view
  cartList: document.getElementById('cartList'),
  cartTotals: document.getElementById('cartTotals'),
  btnCheckoutSelected: document.getElementById('btnCheckoutSelected'),
  btnClearCart: document.getElementById('btnClearCart'),
  cartMsg: document.getElementById('cartMsg'),

  // tickets view
  ticketsList: document.getElementById('ticketsList'),

  // profile view
  profileBox: document.getElementById('profileBox'),
  changePassForm: document.getElementById('changePassForm'),
  curPass: document.getElementById('curPass'),
  newPass: document.getElementById('newPass'),
  passMsg: document.getElementById('passMsg'),
};

export function showLanding() {
  els.landing.classList.remove('hidden');
  els.app.classList.add('hidden');
}

export function showApp() {
  els.landing.classList.add('hidden');
  els.app.classList.remove('hidden');
  showView('movies');
  updateProfileBox();
  updateCartBadge();
}

export function showView(name) {
  els.viewMovies.classList.toggle('hidden', name !== 'movies');
  els.viewCart.classList.toggle('hidden', name !== 'cart');
  els.viewTickets.classList.toggle('hidden', name !== 'tickets');
  els.viewProfile.classList.toggle('hidden', name !== 'profile');
}

export function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function updateCartBadge() {
  const cart = getCart();
  let count = 0;
  Object.values(cart).forEach(group => count += (group.seats?.length || 0));
  els.cartCount.textContent = count;
}

export function updateProfileBox() {
  const u = getUser();
  if (!u) return;
  els.profileBox.innerHTML = `
    <div><strong>Name:</strong> ${u.name} ${u.surname}</div>
    <div><strong>Email:</strong> ${u.email}</div>
    <div class="small">Use the form below to change your password.</div>
  `;
}

export function switchAuthTab(active) {
  if (active === 'login') {
    els.tabLogin.classList.add('active');
    els.tabRegister.classList.remove('active');
    els.loginForm.classList.remove('hidden');
    els.registerForm.classList.add('hidden');
  } else {
    els.tabRegister.classList.add('active');
    els.tabLogin.classList.remove('active');
    els.registerForm.classList.remove('hidden');
    els.loginForm.classList.add('hidden');
  }
}
