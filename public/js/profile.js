import { api } from './api.js';
import { els, updateProfileBox } from './ui.js';

export function initProfile() {
  els.changePassForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.passMsg.textContent = 'Submitting...';
    try {
      await api.changePassword({ currentPassword: els.curPass.value, newPassword: els.newPass.value });
      els.passMsg.textContent = 'Password changed. Please log out and log in again.';
      els.curPass.value = '';
      els.newPass.value = '';
    } catch (e2) {
      els.passMsg.textContent = e2.message;
    }
  });

  updateProfileBox();
}
