/* ============================================
   SAFARI BODA — RIDER ORDERS VIEW
   Lists orders assigned to the signed-in rider,
   filtered automatically by Supabase row-level
   security (riders can only see their own).
   ============================================ */

SafariBoda.views.rider.bookings = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading your orders…</p></div>`;

  const { data: rider } = await SafariBoda.supabase
    .from('riders')
    .select('id')
    .eq('profile_id', SafariBoda.state.user.id)
    .single();

  const { data: orders, error } = await SafariBoda.supabase
    .from('orders')
    .select('*')
    .eq('rider_id', rider?.id)
    .order('created_at', { ascending: false });

  if (error) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${error.message}</p></div>`;
    return;
  }

  const cards = (orders || []).map(o => `
    <div class="card" style="margin-bottom:var(--space-4);">
      <div class="row" style="justify-content:space-between;">
        <span class="mono">${o.reference}</span>
        <span class="badge badge-${o.status}">${SafariBoda.utils.format.statusLabel(o.status)}</span>
      </div>
      <p style="margin-top:var(--space-2);">${o.pickup_location} → ${o.dropoff_location}</p>
      <p class="field-hint">${o.contact_name} · ${o.contact_phone}</p>
      ${o.status === 'assigned' ? `
        <button class="btn btn-primary sb-complete-btn" data-order-id="${o.id}" style="margin-top:var(--space-4);">Mark completed</button>
      ` : ''}
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">My orders</h1>
      ${orders && orders.length ? cards : `<p class="field-hint">No orders assigned yet.</p>`}
    </div>
  `;

  document.querySelectorAll('.sb-complete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { error } = await SafariBoda.supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', btn.dataset.orderId);

      if (error) {
        alert('Could not update order: ' + error.message);
        return;
      }
      SafariBoda.views.rider.bookings();
    });
  });
};
