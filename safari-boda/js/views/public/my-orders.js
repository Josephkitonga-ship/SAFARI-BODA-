/* ============================================
   SAFARI BODA — MY ORDERS VIEW (client)
   Lets a signed-in client see their own request
   history and live status. Filtered automatically
   by Supabase row-level security (client_id = auth.uid()).
   ============================================ */

SafariBoda.views.public.myOrders = async function () {
  if (!SafariBoda.auth.isSignedIn()) {
    SafariBoda.router.navigate('#/signin');
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading your orders…</p></div>`;

  const { data: orders, error } = await SafariBoda.supabase
    .from('orders')
    .select('*, riders(full_name, phone)')
    .eq('client_id', SafariBoda.state.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${error.message}</p></div>`;
    return;
  }

  const cards = (orders || []).map(o => `
    <div class="card" style="margin-bottom: var(--space-4);">
      <div class="row" style="justify-content: space-between;">
        <span class="mono">${o.reference}</span>
        <span class="badge badge-${o.status}">${SafariBoda.utils.format.statusLabel(o.status)}</span>
      </div>
      <p style="margin-top: var(--space-2);">${o.pickup_location} → ${o.dropoff_location}</p>
      <p class="field-hint">${SafariBoda.utils.format.statusLabel(o.service_type)} · requested ${SafariBoda.utils.format.date(o.created_at)}</p>
      ${o.rider_id && o.riders ? `
        <p style="margin-top: var(--space-2);">Rider: <strong>${o.riders.full_name}</strong> · ${o.riders.phone}</p>
      ` : `<p class="field-hint" style="margin-top: var(--space-2);">Not yet assigned to a rider.</p>`}
      ${o.deposit_amount_kes ? `<p class="field-hint">Deposit: ${SafariBoda.utils.format.kes(o.deposit_amount_kes)}${o.mpesa_reference ? ' · Paid (' + o.mpesa_reference + ')' : ' · Awaiting payment confirmation'}</p>` : ''}
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">My orders</h1>
      ${orders && orders.length ? cards : `
        <p class="field-hint">You haven't made a request yet.</p>
        <a href="#/request" class="btn btn-primary" style="margin-top: var(--space-4);">Request a ride</a>
      `}
    </div>
  `;
};
