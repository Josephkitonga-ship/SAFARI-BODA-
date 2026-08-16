/* ============================================
   SAFARI BODA — RIDER DASHBOARD VIEW
   Summary for the signed-in rider: their own status
   + a quick count of assigned/pending orders.
   ============================================ */

SafariBoda.views.rider.dashboard = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="sb-rider-header"><div class="container"><h1>Rider dashboard</h1></div></div>`;

  const { data: rider } = await SafariBoda.supabase
    .from('riders')
    .select('*')
    .eq('profile_id', SafariBoda.state.user.id)
    .single();

  const { data: orders } = await SafariBoda.supabase
    .from('orders')
    .select('id, status')
    .eq('rider_id', rider?.id);

  const assignedCount = (orders || []).filter(o => o.status === 'assigned').length;
  const completedCount = (orders || []).filter(o => o.status === 'completed').length;

  app.innerHTML = `
    <div class="sb-rider-header">
      <div class="container">
        <h1>Welcome, ${rider?.full_name || SafariBoda.state.profile?.full_name || ''}</h1>
        <p>${rider?.verified ? 'Verified rider' : 'Awaiting verification'} · ${rider?.service_area}</p>
      </div>
    </div>
    <div class="container sb-section">
      <div class="sb-admin-kpi-grid">
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">${assignedCount}</div>
          <div class="sb-admin-kpi-label">Assigned orders</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">${completedCount}</div>
          <div class="sb-admin-kpi-label">Completed</div>
        </div>
      </div>
      <a href="#/rider/orders" class="btn btn-primary" style="margin-top:var(--space-8);">View my orders</a>
    </div>
  `;
};
