// Auth & cart state + simple event notifications
export const TOKEN_KEY = 'auth_token';
export const USER_KEY  = 'auth_user';
export const CART_KEY_PREFIX = 'cart_';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser  = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');

export function setAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

export const cartKey = () => {
  const u = getUser();
  return `${CART_KEY_PREFIX}${u ? u.id : 'guest'}`;
};

export const getCart = () => JSON.parse(localStorage.getItem(cartKey()) || '{}');

export function saveCart(cartObj) {
  localStorage.setItem(cartKey(), JSON.stringify(cartObj));
  window.dispatchEvent(new CustomEvent('cart-changed'));
}

export function clearCart() {
  localStorage.removeItem(cartKey());
  window.dispatchEvent(new CustomEvent('cart-changed'));
}
