/* ============================================
   SAFARI BODA — HOME VIEW (public)
   Rewritten for the general transport + delivery
   model: riders and clients both self-register,
   vendors route delivery orders in via API. No
   more fixed tour packages — see README for the
   full pivot from the original tour-only concept.
   ============================================ */

SafariBoda.views.public.home = function () {
  document.getElementById('app').innerHTML = `
    <section class="horizon sb-hero">
      <div class="container sb-hero-inner">
        <p class="sb-hero-eyebrow">Kimana & Oloitokitok</p>
        <h1 class="sb-hero-headline">
          Transport that<br>
          knows this road.
        </h1>
        <p class="sb-hero-sub">
          Local boda riders, on demand — for a ride, or a delivery pickup.
        </p>
        <div class="row gap-4">
          <a href="#/request" class="btn btn-primary">Request a ride</a>
          <a href="#/become-a-rider" class="btn btn-secondary">Become a rider</a>
        </div>
      </div>
    </section>

    <section class="container sb-section">
      <h2 class="sb-section-title">How it works</h2>
      <div class="sb-trust-grid">
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">Riders</h3>
          <p class="sb-trust-body">Register with your details and start receiving transport and delivery requests around Kimana and Oloitokitok.</p>
        </div>
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">Clients</h3>
          <p class="sb-trust-body">Tourists and locals alike — create an account and request a ride or a delivery pickup in minutes.</p>
        </div>
        <div class="stack gap-2">
          <h3 class="sb-trust-heading">Vendors</h3>
          <p class="sb-trust-body">Local e-commerce sellers can route their delivery orders straight to our riders through an API connection.</p>
        </div>
      </div>
    </section>
  `;
};
