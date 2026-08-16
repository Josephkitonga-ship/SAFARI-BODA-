/* ============================================
   SAFARI BODA — ADMIN VENDORS VIEW
   E-commerce partners whose delivery orders route
   to our riders via API (vendors table + a future
   Edge Function endpoint — see README).
   ============================================ */

SafariBoda.views.admin.vendors = async function () {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading vendors…</p></div>`;

  const { data: vendors, error } = await SafariBoda.supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">${error.message}</p></div>`;
    return;
  }

  const rows = (vendors || []).map(v => `
    <tr>
      <td>${v.business_name}</td>
      <td>${v.contact_email}</td>
      <td>${v.contact_phone || '—'}</td>
      <td><span class="badge ${v.active ? 'badge-completed' : 'badge-cancelled'}">${v.active ? 'Active' : 'Inactive'}</span></td>
    </tr>
  `).join('');

  app.innerHTML = `
    <div class="container sb-section">
      <h1 class="sb-section-title">Vendors</h1>
      <p class="field-hint">E-commerce partners routing delivery orders to Safari Boda riders.</p>
      ${vendors && vendors.length ? `
        <table class="sb-admin-table">
          <thead><tr><th>Business</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      ` : `<p class="field-hint" style="margin-top:var(--space-6);">No vendors registered yet. Vendor onboarding + API key issuing is not yet built — see README.</p>`}
    </div>
  `;
};
