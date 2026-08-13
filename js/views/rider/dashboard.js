/* ============================================
   SAFARI BODA — RIDER DASHBOARD VIEW
   Stub — full build comes after the Supabase schema
   and auth/roles are finalized.
   ============================================ */

SafariBoda.views.rider.dashboard = function () {
  document.getElementById('app').innerHTML = `
    <div class="sb-rider-header">
      <div class="container">
        <h1>Rider dashboard</h1>
        <p>Welcome back${SafariBoda.state.profile ? ', ' + SafariBoda.state.profile.full_name : ''}.</p>
      </div>
    </div>
    <div class="container sb-section">
      <p class="field-hint">Assigned bookings and earnings will appear here once the schema is wired in.</p>
    </div>
  `;
};
