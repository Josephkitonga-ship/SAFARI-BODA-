/* ============================================
   SAFARI BODA — PACKAGES VIEW (public)
   Full package browser. For now, reuses the same
   grid pattern as the homepage preview; search/
   filter/sort to be added.
   ============================================ */

SafariBoda.views.public.packages = function () {
  document.getElementById('app').innerHTML = `
    <section class="container sb-section">
      <h1 class="sb-section-title">Packages</h1>
      <p class="sb-section-sub">Every tour includes forest and wildlife viewing.</p>
      <div class="grid-packages" id="sb-packages-grid">
        <p class="field-hint">Loading packages…</p>
      </div>
    </section>
  `;

  SafariBoda.views.public._loadFullPackagesGrid();
};

SafariBoda.views.public._loadFullPackagesGrid = async function () {
  const { data: packages, error } = await SafariBoda.supabase
    .from('packages')
    .select('*')
    .eq('active', true)
    .order('price_kes', { ascending: true });

  const grid = document.getElementById('sb-packages-grid');
  if (!grid) return;

  if (error || !packages || packages.length === 0) {
    grid.innerHTML = `<p class="field-hint">No packages available right now.</p>`;
    return;
  }

  grid.innerHTML = packages.map(pkg => SafariBoda.components.packageCard.render(pkg)).join('');
  packages.forEach(pkg => SafariBoda.components.packageCard.mount(pkg));
};
