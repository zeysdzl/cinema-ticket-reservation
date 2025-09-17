import { api } from './api.js';
import { els, fmtTime } from './ui.js';

export async function renderTickets() {
  els.ticketsList.innerHTML = 'Loading...';
  try {
    const items = await api.myTickets();
    if (!items.length) {
      els.ticketsList.innerHTML = `<div class="panel">You have no tickets yet.</div>`;
      return;
    }
    els.ticketsList.innerHTML = items.map(t => `
      <div class="ticket-card">
        <div><strong>${t.movieTitle || 'Movie'}</strong> — ${t.room || '-'} • ${t.startTime ? fmtTime(t.startTime) : '-'}</div>
        <div><strong>Seats:</strong> ${t.seats.join(', ')}</div>
        <div><strong>Total:</strong> ₺${t.totalPrice}
          ${t.discountPercent ? `<span class="small"> (discount: -${t.discountPercent}%${t.discountCode ? ` • code: ${t.discountCode}` : ''})</span>` : ''}
        </div>
        <div class="small">Reservation: ${t.id} • Session: ${t.sessionId} • Purchased: ${fmtTime(t.createdAt)}</div>
      </div>
    `).join('');
  } catch (e) {
    els.ticketsList.innerHTML = `<div class="panel">Error: ${e.message}</div>`;
  }
}
