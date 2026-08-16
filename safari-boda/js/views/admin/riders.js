/* ============================================
   SAFARI BODA — ADMIN RIDERS VIEW
   Riders self-register now (no admin creation step),
   but Joseph can still review and verify/deactivate
   them here.
   ============================================ */

SafariBoda.views.admin.riders = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading riders…</p></div>`;

  const { data: riders, error } = await SafariBoda.supabase
    .from('riders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${error.message}</p></div>`;
    return;
  }

  const rows = (riders || []).map(r => `
    <tr>
      <td>${r.full_name}</td>
      <td>${r.phone}</td>
      <td>${r.service_area}</td>
      <td>${r.bike_plate}</td>
      <td><span class="badge ${r.verified ? 'badge-completed' : 'badge-pending'}">${r.verified ? 'Verified' : 'Unverified'}</span></td>
      <td><span class="badge ${r.active ? 'badge-completed' : 'badge-cancelled'}">${r.active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-ghost sb-verify-btn" data-rider-id="${r.id}" data-verified="${r.verified}">
          ${r.verified ? 'Unverify' : 'Verify'}
        </button>
      </td>
    </tr>
  `).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Riders</h1>
      <p class="field-hint">Riders self-register through the site. Verify riders here after checking their details.</p>
      ${riders && riders.length ? `
        <table class="sb-admin-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Area</th><th>Plate</th><th>Verified</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      ` : `<p class="field-hint" style="margin-top:var(--space-6);">No riders registered yet.</p>`}
    </div>
  `;

  document.querySelectorAll('.sb-verify-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const riderId = btn.dataset.riderId;
      const currentlyVerified = btn.dataset.verified === 'true';

      const { error } = await SafariBoda.supabase
        .from('riders')
        .update({ verified: !currentlyVerified })
        .eq('id', riderId);

      if (error) {
        alert('Could not update rider: ' + error.message);
        return;
      }
      SafariBoda.views.admin.riders();
    });
  });
};
