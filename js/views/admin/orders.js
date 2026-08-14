/* ============================================
   SAFARI BODA — ADMIN ORDERS VIEW
   Real order list + manual rider assignment.
   Replaces the old fixed-package "bookings" view.
   ============================================ */

SafariBoda.views.admin.bookings = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading orders…</p></div>`;

  const [{ data: orders, error: ordersError }, { data: riders }] = await Promise.all([
    SafariBoda.supabase.from('orders').select('*').order('created_at', { ascending: false }),
    SafariBoda.supabase.from('riders').select('id, full_name').eq('active', true)
  ]);

  if (ordersError) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${ordersError.message}</p></div>`;
    return;
  }

  const riderOptions = (riders || []).map(r => `<option value="${r.id}">${r.full_name}</option>`).join('');

  const rows = (orders || []).map(o => `
    <tr>
      <td class="mono">${o.reference}</td>
      <td>${SafariBoda.utils.format.statusLabel(o.service_type)}</td>
      <td>${o.pickup_location} → ${o.dropoff_location}</td>
      <td>${o.contact_name}<br><span class="field-hint">${o.contact_phone}</span></td>
      <td><span class="badge badge-${o.status}">${SafariBoda.utils.format.statusLabel(o.status)}</span></td>
      <td>
        <select data-order-id="${o.id}" class="sb-assign-select">
          <option value="">${o.rider_id ? 'Reassign…' : 'Assign rider…'}</option>
          ${riderOptions}
        </select>
      </td>
    </tr>
  `).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Orders</h1>
      ${orders && orders.length ? `
        <table class="sb-admin-table">
          <thead><tr><th>Ref</th><th>Type</th><th>Route</th><th>Contact</th><th>Status</th><th>Assign</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      ` : `<p class="field-hint" style="margin-top:var(--space-6);">No orders yet.</p>`}
    </div>
  `;

  document.querySelectorAll('.sb-assign-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const riderId = e.target.value;
      if (!riderId) return;

      const { error } = await SafariBoda.supabase
        .from('orders')
        .update({ rider_id: riderId, status: 'assigned' })
        .eq('id', orderId);

      if (error) {
        alert('Could not assign rider: ' + error.message);
        return;
      }
      SafariBoda.views.admin.bookings(); // reload to reflect new status
    });
  });
};
