import { api } from './api.js';
import { els, showApp, switchAuthTab } from './ui.js';
import { setAuth } from './state.js';

export function initAuth() {
  // tab switching
  els.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  els.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  // login
  els.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.loginMsg.textContent = 'Signing in...';
    try {
      const data = await api.login({
        email: els.loginEmail.value.trim(),
        password: els.loginPassword.value
      });
      setAuth(data);
      els.loginMsg.textContent = '';
      showApp();
    } catch (err) {
      els.loginMsg.textContent = err.message;
    }
  });

  // register
  els.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.regMsg.textContent = 'Creating account...';
    try {
      const data = await api.register({
        name: els.regName.value.trim(),
        surname: els.regSurname.value.trim(),
        email: els.regEmail.value.trim(),
        password: els.regPassword.value
      });
      setAuth(data);
      els.regMsg.textContent = '';
      showApp();
    } catch (err) {
      els.regMsg.textContent = err.message;
    }
  });
}
