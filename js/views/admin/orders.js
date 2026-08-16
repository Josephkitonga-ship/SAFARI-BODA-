/* ============================================
   SAFARI BODA — ADMIN ORDERS VIEW
   Rider dropdown is now filtered + sorted instead of
   a flat list:
     1. Rule-based filter — only active riders whose
        capability matches the order's service_type
        (or who take 'both'), and whose service_area
        matches the order (falls back to all active
        riders if nothing matches — never blocks
        assignment entirely).
     2. Load-balancing — sorted by fewest current
        active orders first, so work spreads out.
     3. Verified + profile-completed riders sort above
        unverified/incomplete ones as a tiebreaker.
   Admin still makes the final manual call — this only
   narrows and orders the list, per the locked MVP
   decision (Foundations Report §6).
   ============================================ */

SafariBoda.views.admin.bookings = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading orders…</p></div>`;

  const [{ data: orders, error: ordersError }, { data: riders }, { data: activeOrders }] = await Promise.all([
    SafariBoda.supabase.from('orders').select('*').order('created_at', { ascending: false }),
    SafariBoda.supabase.from('riders').select('*').eq('active', true),
    SafariBoda.supabase.from('orders').select('rider_id').in('status', ['assigned', 'in_progress'])
  ]);

  if (ordersError) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${ordersError.message}</p></div>`;
    return;
  }

  // Load count per rider, for the load-balancing sort
  const loadByRider = {};
  (activeOrders || []).forEach(o => {
    if (!o.rider_id) return;
    loadByRider[o.rider_id] = (loadByRider[o.rider_id] || 0) + 1;
  });

  const rows = (orders || []).map(o => {
    const eligibleRiders = SafariBoda.views.admin._matchRiders(riders || [], o, loadByRider);
    const riderOptions = eligibleRiders.map(r =>
      `<option value="${r.id}">${r.full_name} — ${r.load} active${r.verified ? '' : ' · unverified'}</option>`
    ).join('');

    return `
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
    `;
  }).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Orders</h1>
      <p class="field-hint">Rider dropdown is pre-sorted: matching capability &amp; area first, fewest active orders first, verified riders first.</p>
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
      SafariBoda.views.admin.bookings(); // reload to reflect new status + updated loads
    });
  });
};

/**
 * Rule-based filter + load-balance sort. Returns riders with a `load`
 * field attached, ready to render. Falls back to the full active list
 * (still sorted by load) if strict matching finds nobody — assignment
 * should never be blocked outright by the filter.
 */
SafariBoda.views.admin._matchRiders = function (riders, order, loadByRider) {
  const withLoad = riders.map(r => ({ ...r, load: loadByRider[r.id] || 0 }));

  const capabilityMatches = (r) => r.service_capability === 'both' || r.service_capability === order.service_type;
  const areaMatches = (r) => r.service_area === 'Both' ||
    (order.pickup_location || '').toLowerCase().includes(r.service_area.toLowerCase()) ||
    (order.dropoff_location || '').toLowerCase().includes(r.service_area.toLowerCase());

  let eligible = withLoad.filter(r => capabilityMatches(r) && areaMatches(r));
  if (eligible.length === 0) eligible = withLoad.filter(capabilityMatches);
  if (eligible.length === 0) eligible = withLoad;

  return eligible.sort((a, b) => {
    if (a.load !== b.load) return a.load - b.load;                                   // fewest active orders first
    if (a.verified !== b.verified) return a.verified ? -1 : 1;                        // verified first
    if (a.profile_completed !== b.profile_completed) return a.profile_completed ? -1 : 1; // completed profile first
    return 0;
  });
};
