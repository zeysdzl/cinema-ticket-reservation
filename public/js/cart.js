import { api } from './api.js';
import { els, fmtTime } from './ui.js';
import { getCart, saveCart, clearCart } from './state.js';
import { openSeatEditorFromCart } from './movies.js';

function renderGroup(g) {
  const base = (g.price || 0) * (g.seats?.length || 0);
  const pct = Number(g.discountPercent || 0);
  const hasDisc = g.discountCode && pct > 0;
  const subtotal = hasDisc ? Number((base * (100 - pct) / 100).toFixed(2)) : base;

  const seatsStr = (g.seats || []).map(s =>
    `<span class="chip">${s}<button class="chip-x" title="Remove seat" data-seat="${s}" data-id="${g.sessionId}">×</button></span>`
  ).join(' ');

  return `
    <div class="panel" data-id="${g.sessionId}">
      <div class="list-item">
        <div>
          <input type="checkbox" class="chkSession" data-id="${g.sessionId}" checked />
          <strong>${g.movieTitle}</strong> — ${g.room} • ${fmtTime(g.startTime)} • ₺${g.price}/seat
          <div class="small">Session ID: ${g.sessionId}</div>
        </div>
        <button class="danger btnRemoveSession" data-id="${g.sessionId}">Remove session</button>
      </div>

      <div style="margin-top:8px;">
        <strong>Seats:</strong>
        <div class="chips">${seatsStr || '-'}</div>
      </div>

      <div class="discount-row">
        <input class="discountInput" data-id="${g.sessionId}" placeholder="Discount code" value="${g.discountCode || ''}" />
        <button class="btnApplyDiscount" data-id="${g.sessionId}">Apply</button>
        ${hasDisc ? `<span class="discount-ok">Applied: -${pct}%</span>` : `<span class="small">Optional</span>`}
      </div>

      <div style="margin-top:8px;">
        <button class="secondary btnEditSeats" data-id="${g.sessionId}">Open Seat Map</button>
        <span style="margin-left:8px;"><strong>Subtotal:</strong> ₺${subtotal}${hasDisc ? ` <span class="small">(was ₺${base})</span>` : ''}</span>
      </div>
    </div>
  `;
}

export function renderCart() {
  const cart = getCart();
  const groups = Object.values(cart);

  if (groups.length === 0) {
    els.cartList.innerHTML = `<div class="panel">Your cart is empty.</div>`;
    els.cartTotals.textContent = '';
    return;
  }

  els.cartList.innerHTML = groups.map(renderGroup).join('');

  // totals
  let grand = 0;
  groups.forEach(g => {
    const base = (g.price || 0) * (g.seats?.length || 0);
    const pct = Number(g.discountPercent || 0);
    const subtotal = (g.discountCode && pct > 0) ? Number((base * (100 - pct) / 100).toFixed(2)) : base;
    grand += subtotal;
  });
  els.cartTotals.textContent = `Grand Total: ₺${grand}`;

  // Remove session
  els.cartList.querySelectorAll('.btnRemoveSession').forEach(btn => {
    btn.addEventListener('click', async () => {
      const c = getCart();
      const grp = c[btn.dataset.id];
      if (grp && grp.seats?.length) {
        try { await api.releaseHolds(grp.sessionId, grp.seats); } catch (_) {}
      }
      delete c[btn.dataset.id];
      saveCart(c);
      renderCart();
    });
  });

  // Remove single seat (chip X)
  els.cartList.querySelectorAll('.chip-x').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sid = btn.dataset.id;
      const seat = btn.dataset.seat;
      const c = getCart();
      const grp = c[sid];
      if (!grp) return;
      grp.seats = (grp.seats || []).filter(x => x !== seat);
      try { await api.releaseHolds(sid, [seat]); } catch (_) {}
      if (!grp.seats.length) delete c[sid]; // remove whole session if empty
      saveCart(c);
      renderCart();
    });
  });

  // Open seat editor (map-based add/remove)
  els.cartList.querySelectorAll('.btnEditSeats').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await openSeatEditorFromCart(btn.dataset.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        els.cartMsg.textContent = `Error opening seat map: ${err.message}`;
      }
    });
  });

  // Apply discount
  els.cartList.querySelectorAll('.btnApplyDiscount').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sid = btn.dataset.id;
      const input = els.cartList.querySelector(`.discountInput[data-id="${sid}"]`);
      const code = (input.value || '').trim().toUpperCase();
      if (!code) return;

      try {
        const info = await api.validateDiscount(code);
        const c = getCart();
        if (!c[sid]) return;
        c[sid].discountCode = info.code;
        c[sid].discountPercent = info.percent;
        saveCart(c);
        renderCart();
      } catch (e) {
        input.value = '';
        input.placeholder = `Invalid: ${e.message}`;
      }
    });
  });
}

export async function checkoutSelected() {
  const cart = getCart();
  const groups = Object.values(cart);
  const selectedIds = Array.from(els.cartList.querySelectorAll('.chkSession'))
    .filter(chk => chk.checked)
    .map(chk => chk.dataset.id);

  const items = groups
    .filter(g => selectedIds.includes(g.sessionId))
    .map(g => ({ sessionId: g.sessionId, seats: g.seats, discountCode: g.discountCode || undefined }));

  if (items.length === 0) { els.cartMsg.textContent = 'Select at least one session.'; return; }

  els.cartMsg.textContent = 'Processing...';
  try {
    const resp = await api.checkout(items);
    const results = resp.results || [];
    let okCount = 0, failCount = 0;
    results.forEach(r => r.success ? okCount++ : failCount++);

    const newCart = getCart();
    results.filter(r => r.success).forEach(r => {
      const sid = r.reservation.sessionId;
      delete newCart[sid];
    });
    saveCart(newCart);
    renderCart();

    els.cartMsg.textContent = `Checkout complete: ${okCount} success, ${failCount} failed.`;
  } catch (e) {
    els.cartMsg.textContent = e.message;
  }
}

export function initCartActions() {
  els.btnClearCart.addEventListener('click', async () => {
    const c = getCart();
    await Promise.all(Object.values(c).map(g => api.releaseHolds(g.sessionId, g.seats).catch(() => {})));
    clearCart();
    renderCart();
  });
  els.btnCheckoutSelected.addEventListener('click', checkoutSelected);
}
