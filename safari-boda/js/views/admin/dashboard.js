/* ============================================
   SAFARI BODA — ADMIN DASHBOARD VIEW
   Real KPI counts from Supabase.
   ============================================ */

SafariBoda.views.admin.dashboard = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading dashboard…</p></div>`;

  const [{ count: orderCount }, { count: riderCount }, { count: pendingCount }] = await Promise.all([
    SafariBoda.supabase.from('orders').select('*', { count: 'exact', head: true }),
    SafariBoda.supabase.from('riders').select('*', { count: 'exact', head: true }).eq('active', true),
    SafariBoda.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Admin dashboard</h1>
      <div class="sb-admin-kpi-grid" style="margin-top: var(--space-8);">
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">${orderCount ?? 0}</div>
          <div class="sb-admin-kpi-label">Total orders</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">${riderCount ?? 0}</div>
          <div class="sb-admin-kpi-label">Active riders</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">${pendingCount ?? 0}</div>
          <div class="sb-admin-kpi-label">Pending assignment</div>
        </div>
      </div>
      <div class="row gap-4" style="margin-top:var(--space-8);">
        <a href="#/admin/orders" class="btn btn-primary">Manage orders</a>
        <a href="#/admin/riders" class="btn btn-secondary">Manage riders</a>
      </div>
    </div>
  `;
};
