/* ============================================
   SAFARI BODA — BOOKING VIEW (public)
   Three-step flow: details -> M-Pesa STK push -> confirmation.
   Full Supabase writes + Edge Function call to be wired in
   once the schema and M-Pesa Edge Function exist — this
   establishes the step structure and UI now.
   ============================================ */

SafariBoda.views.public.booking = async function (packageId) {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading package…</p></div>`;

  const { data: pkg, error } = await SafariBoda.supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (error || !pkg) {
    app.innerHTML = `
      <div class="container sb-section" style="text-align:center;">
        <h1>Package not found</h1>
        <a href="#/packages" class="btn btn-primary" style="margin-top:var(--space-6);">Back to packages</a>
      </div>`;
    return;
  }

  this._renderStep(pkg, 'details', {});
};

SafariBoda.views.public._renderStep = function (pkg, step, bookingDetails) {
  const app = document.getElementById('app');

  let stepHtml = '';
  if (step === 'details') stepHtml = SafariBoda.components.bookingForm.renderDetailsStep(pkg);
  if (step === 'payment') stepHtml = SafariBoda.components.bookingForm.renderPaymentStep(pkg, bookingDetails);
  if (step === 'confirmation') stepHtml = SafariBoda.components.bookingForm.renderConfirmationStep(bookingDetails.booking);

  app.innerHTML = `
    <section class="container sb-section" style="max-width: 560px;">
      <h1 class="sb-section-title">${pkg.name}</h1>
      <p class="sb-section-sub">${SafariBoda.utils.format.kes(pkg.price_kes)} · ${pkg.duration_label}</p>
      <div class="card">${stepHtml}</div>
    </section>
  `;

  if (step === 'details') {
    document.getElementById('sb-booking-details-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const details = Object.fromEntries(form.entries());
      SafariBoda.views.public._renderStep(pkg, 'payment', details);
    });
  }

  if (step === 'payment') {
    document.getElementById('sb-stk-push-btn').addEventListener('click', async () => {
      // TODO: call Supabase Edge Function to trigger real STK push once built
      const statusEl = document.getElementById('sb-payment-status');
      statusEl.textContent = 'Waiting for payment confirmation…';
      console.warn('STK push not yet wired to a real Edge Function — this is a placeholder.');
    });
  }
};
