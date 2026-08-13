/* ============================================
   SAFARI BODA — ADMIN DASHBOARD VIEW
   Stub — KPI cards wired to real Supabase counts
   once the schema exists.
   ============================================ */

SafariBoda.views.admin.dashboard = function () {
  document.getElementById('app').innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Admin dashboard</h1>
      <div class="sb-admin-kpi-grid" style="margin-top: var(--space-8);">
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">—</div>
          <div class="sb-admin-kpi-label">Bookings this month</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">—</div>
          <div class="sb-admin-kpi-label">Active riders</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">—</div>
          <div class="sb-admin-kpi-label">Revenue (KES)</div>
        </div>
        <div class="sb-admin-kpi-card">
          <div class="sb-admin-kpi-value">—</div>
          <div class="sb-admin-kpi-label">Pending assignment</div>
        </div>
      </div>
      <p class="field-hint" style="margin-top: var(--space-8);">Live figures will populate once the schema is wired in.</p>
    </div>
  `;
};
