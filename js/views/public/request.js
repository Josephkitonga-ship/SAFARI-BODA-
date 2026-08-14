/* ============================================
   SAFARI BODA — REQUEST VIEW (public)
   Replaces the old fixed-package booking flow. A
   client (transport OR delivery) requests a pickup
   and dropoff; an admin assigns a rider. M-Pesa
   fields exist on the order but are NOT called yet —
   Daraja integration is a deliberately separate,
   later step (see README).
   ============================================ */

SafariBoda.views.public.request = function () {
  if (!SafariBoda.auth.isSignedIn()) {
    document.getElementById('app').innerHTML = `
      <div class="container sb-section" style="text-align:center;">
        <h1>Sign in to request a ride</h1>
        <p class="sb-section-sub" style="margin: 0 auto var(--space-6);">Create a free account to request transport or a delivery pickup.</p>
        <a href="#/signin" class="btn btn-primary">Sign in / create account</a>
      </div>`;
    return;
  }

  document.getElementById('app').innerHTML = `
    <section class="container sb-section" style="max-width: 520px;">
      <h1 class="sb-section-title">Request a ride</h1>
      <p class="sb-section-sub">Transport around Kimana &amp; Oloitokitok — for you, or a delivery pickup.</p>
      <div class="card">
        <form id="sb-request-form" class="stack gap-4">
          <div class="field">
            <label for="sb-req-type">What do you need?</label>
            <select id="sb-req-type" name="serviceType">
              <option value="transport">Transport (a ride for me)</option>
              <option value="delivery">Delivery pickup</option>
            </select>
          </div>
          <div class="field">
            <label for="sb-req-pickup">Pickup location</label>
            <input type="text" id="sb-req-pickup" name="pickupLocation" required placeholder="e.g. Kimana town center">
          </div>
          <div class="field">
            <label for="sb-req-dropoff">Drop-off location</label>
            <input type="text" id="sb-req-dropoff" name="dropoffLocation" required placeholder="e.g. Oloitokitok market">
          </div>
          <div class="field">
            <label for="sb-req-name">Your name</label>
            <input type="text" id="sb-req-name" name="contactName" required
                   value="${SafariBoda.state.profile?.full_name || ''}">
          </div>
          <div class="field">
            <label for="sb-req-phone">Phone number</label>
            <input type="tel" id="sb-req-phone" name="contactPhone" required placeholder="+254 7XX XXX XXX"
                   value="${SafariBoda.state.profile?.phone || ''}">
          </div>
          <div class="field">
            <label for="sb-req-notes">Notes (optional)</label>
            <textarea id="sb-req-notes" name="notes" rows="2" placeholder="Anything the rider should know"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit request</button>
          <div id="sb-request-error" class="field-error"></div>
        </form>
      </div>
    </section>
  `;

  document.getElementById('sb-request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const reference = 'SB-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { error } = await SafariBoda.supabase.from('orders').insert({
      reference,
      source: 'client',
      client_id: SafariBoda.state.user.id,
      service_type: form.get('serviceType'),
      pickup_location: form.get('pickupLocation'),
      dropoff_location: form.get('dropoffLocation'),
      contact_name: form.get('contactName'),
      contact_phone: form.get('contactPhone'),
      notes: form.get('notes') || null
      // price_kes / deposit_amount_kes / mpesa_reference intentionally
      // left null here — set once pricing + Daraja are wired in.
    });

    if (error) {
      document.getElementById('sb-request-error').textContent = error.message;
      return;
    }

    document.getElementById('app').innerHTML = `
      <div class="container sb-section" style="text-align:center;">
        <h1>Request submitted</h1>
        <p class="mono" style="margin: var(--space-4) 0;">${reference}</p>
        <p class="sb-section-sub" style="margin: 0 auto var(--space-6);">We'll assign a rider and reach out on the number you provided.</p>
        <a href="#/" class="btn btn-secondary">Back to home</a>
      </div>
    `;
  });
};
