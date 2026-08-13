/* ============================================
   SAFARI BODA — HOME VIEW (public)
   The hero is the thesis: the road from Kimana
   toward Kilimanjaro/Amboseli. Low, left-aligned
   headline sitting near the horizon line rather
   than a centered banner — it reads like something
   you pass on the road, not a billboard above it.
   ============================================ */

SafariBoda.views.public.home = function () {
  document.getElementById('app').innerHTML = `
    <section class="horizon sb-hero">
      <div class="container sb-hero-inner">
        <p class="sb-hero-eyebrow">Kimana, Oloitokitok</p>
        <h1 class="sb-hero-headline">
          Ride to Amboseli.<br>
          With someone who<br>
          actually knows the road.
        </h1>
        <p class="sb-hero-sub">
          Vetted local riders. Clear pricing. Wildlife viewing on every tour.
        </p>
        <div class="row gap-4">
          <a href="#/packages" class="btn btn-primary">See packages</a>
          <a href="#packages-preview" class="btn btn-secondary">How it works</a>
        </div>
      </div>
    </section>

    <section class="container sb-section" id="packages-preview">
      <h2 class="sb-section-title">Every tour includes wildlife viewing</h2>
      <p class="sb-section-sub">Pick the shape of your day. Prices shown in KES — your local currency estimate is added automatically.</p>
      <div class="grid-packages" id="sb-home-packages-grid">
        <p class="field-hint">Loading packages…</p>
      </div>
    </section>

    <section class="container sb-section sb-trust-section">
      <h2 class="sb-section-title">Why book through Safari Boda</h2>
      <div class="grid-packages">
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">Riders you can trust</h3>
          <p class="sb-trust-body">Every rider is personally vetted — ID verified, licensed, and known to us before they ever meet a guest.</p>
        </div>
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">One clear price</h3>
          <p class="sb-trust-body">No roadside haggling. Pay a deposit to confirm, settle the balance in cash on the day.</p>
        </div>
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">Real local knowledge</h3>
          <p class="sb-trust-body">Our riders live here. They know where the animals actually are, and when the light is best.</p>
        </div>
      </div>
    </section>
  `;

  SafariBoda.views.public._loadHomePackagesPreview();
};

SafariBoda.views.public._loadHomePackagesPreview = async function () {
  const { data: packages, error } = await SafariBoda.supabase
    .from('packages')
    .select('*')
    .eq('active', true)
    .order('price_kes', { ascending: true });

  const grid = document.getElementById('sb-home-packages-grid');
  if (!grid) return; // user navigated away before this resolved

  if (error || !packages || packages.length === 0) {
    grid.innerHTML = `<p class="field-hint">Packages will appear here shortly.</p>`;
    return;
  }

  grid.innerHTML = packages.map(pkg => SafariBoda.components.packageCard.render(pkg)).join('');
  packages.forEach(pkg => SafariBoda.components.packageCard.mount(pkg));
};
