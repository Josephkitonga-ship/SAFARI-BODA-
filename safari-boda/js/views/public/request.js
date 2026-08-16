/* ============================================
   SAFARI BODA — REQUEST VIEW (public)
   Client (transport OR delivery) requests a pickup
   and dropoff, sets a deposit amount, then confirms
   via a real M-Pesa STK Push through the
   mpesa-stk-push Edge Function. An admin assigns a
   rider once the order exists.
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
            <label for="sb-req-phone">Phone number (M-Pesa)</label>
            <input type="tel" id="sb-req-phone" name="contactPhone" required placeholder="+254 7XX XXX XXX"
                   value="${SafariBoda.state.profile?.phone || ''}">
          </div>
          <div class="field">
            <label for="sb-req-deposit">Deposit amount (KES)</label>
            <input type="number" id="sb-req-deposit" name="depositAmount" required min="1" placeholder="e.g. 300">
            <span class="field-hint">Confirms the request. Balance settled with your rider directly.</span>
          </div>
          <div class="field">
            <label for="sb-req-notes">Notes (optional)</label>
            <textarea id="sb-req-notes" name="notes" rows="2" placeholder="Anything the rider should know"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" id="sb-request-submit-btn">Submit &amp; pay deposit</button>
          <div id="sb-request-error" class="field-error"></div>
          <div id="sb-request-status" class="field-hint" aria-live="polite"></div>
        </form>
      </div>
    </section>
  `;

  document.getElementById('sb-request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const reference = 'SB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const submitBtn = document.getElementById('sb-request-submit-btn');
    const statusEl = document.getElementById('sb-request-status');
    const errorEl = document.getElementById('sb-request-error');

    submitBtn.disabled = true;
    errorEl.textContent = '';
    statusEl.textContent = 'Creating your request…';

    const depositAmount = Number(form.get('depositAmount'));

    const { data: order, error } = await SafariBoda.supabase.from('orders').insert({
      reference,
      source: 'client',
      client_id: SafariBoda.state.user.id,
      service_type: form.get('serviceType'),
      pickup_location: form.get('pickupLocation'),
      dropoff_location: form.get('dropoffLocation'),
      contact_name: form.get('contactName'),
      contact_phone: form.get('contactPhone'),
      notes: form.get('notes') || null,
      deposit_amount_kes: depositAmount
    }).select().single();

    if (error) {
      errorEl.textContent = error.message;
      statusEl.textContent = '';
      submitBtn.disabled = false;
      return;
    }

    // Trigger the real M-Pesa STK push via the Edge Function
    statusEl.textContent = 'Sending payment prompt to your phone…';

    const { data: stkResult, error: stkError } = await SafariBoda.supabase.functions.invoke('mpesa-stk-push', {
      body: { orderId: order.id, phone: form.get('contactPhone'), amountKes: depositAmount }
    });

    if (stkError || !stkResult?.success) {
      // The order still exists — payment just didn't go through yet.
      // Don't block the flow entirely; let them know and let admin follow up.
      statusEl.textContent = '';
      errorEl.textContent = 'Request saved, but the payment prompt could not be sent right now. We\'ll follow up by phone.';
    } else {
      statusEl.textContent = '';
    }

    document.getElementById('app').innerHTML = `
      <div class="container sb-section" style="text-align:center;">
        <h1>Request submitted</h1>
        <p class="mono" style="margin: var(--space-4) 0;">${reference}</p>
        <p class="sb-section-sub" style="margin: 0 auto var(--space-6);">
          ${stkResult?.success
            ? 'Check your phone for the M-Pesa PIN prompt to confirm your deposit.'
            : 'We\'ll assign a rider and reach out on the number you provided.'}
        </p>
        <a href="#/" class="btn btn-secondary">Back to home</a>
      </div>
    `;
  });
};
