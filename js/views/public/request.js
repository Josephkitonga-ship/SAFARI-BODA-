/* ============================================
   SAFARI BODA — REQUEST VIEW (public)
   Two real steps: ride details, then a dedicated
   payment screen. The payment step is visually its
   own thing — not a field buried in the details form
   — and actually polls for a real success/failed
   result from the mpesa-callback Edge Function instead
   of firing the STK push and immediately declaring
   success.
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

  SafariBoda.views.public._renderRequestDetailsStep();
};

SafariBoda.views.public._renderRequestDetailsStep = function () {
  document.getElementById('app').innerHTML = `
    <section class="container sb-section" style="max-width: 520px;">
      <h1 class="sb-section-title">Request a ride</h1>
      <p class="sb-section-sub">Step 1 of 2 — ride details</p>
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
            <label for="sb-req-notes">Notes (optional)</label>
            <textarea id="sb-req-notes" name="notes" rows="2" placeholder="Anything the rider should know"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Continue to payment</button>
          <div id="sb-request-error" class="field-error"></div>
        </form>
      </div>
    </section>
  `;

  document.getElementById('sb-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const details = Object.fromEntries(form.entries());
    SafariBoda.views.public._renderPaymentStep(details);
  });
};

SafariBoda.views.public._renderPaymentStep = function (details) {
  document.getElementById('app').innerHTML = `
    <section class="container sb-section" style="max-width: 480px;">
      <h1 class="sb-section-title">Pay deposit</h1>
      <p class="sb-section-sub">Step 2 of 2 — a deposit confirms your request. Balance is settled with your rider directly.</p>
      <div class="card glass" style="border: 1.5px solid var(--murram-orange);">
        <div class="field">
          <label for="sb-pay-amount">Deposit amount (KES)</label>
          <input type="number" id="sb-pay-amount" min="1" required placeholder="e.g. 300" class="price mono" style="font-size: var(--text-2xl);">
        </div>
        <p class="field-hint">Sent to <strong>${details.contactPhone}</strong> via M-Pesa.</p>
        <button id="sb-pay-btn" class="btn btn-primary" style="width:100%; margin-top: var(--space-4);">Send M-Pesa payment prompt</button>
        <div id="sb-pay-status" class="field-hint" aria-live="polite" style="margin-top: var(--space-4);"></div>
        <div id="sb-pay-error" class="field-error"></div>
      </div>
    </section>
  `;

  document.getElementById('sb-pay-btn').addEventListener('click', async () => {
    const amountInput = document.getElementById('sb-pay-amount');
    const depositAmount = Number(amountInput.value);
    const payBtn = document.getElementById('sb-pay-btn');
    const statusEl = document.getElementById('sb-pay-status');
    const errorEl = document.getElementById('sb-pay-error');

    if (!depositAmount || depositAmount <= 0) {
      errorEl.textContent = 'Enter a deposit amount.';
      return;
    }

    payBtn.disabled = true;
    errorEl.textContent = '';
    statusEl.textContent = 'Creating your request…';

    const reference = 'SB-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data: order, error } = await SafariBoda.supabase.from('orders').insert({
      reference,
      source: 'client',
      client_id: SafariBoda.state.user.id,
      service_type: details.serviceType,
      pickup_location: details.pickupLocation,
      dropoff_location: details.dropoffLocation,
      contact_name: details.contactName,
      contact_phone: details.contactPhone,
      notes: details.notes || null,
      deposit_amount_kes: depositAmount
    }).select().single();

    if (error) {
      errorEl.textContent = error.message;
      statusEl.textContent = '';
      payBtn.disabled = false;
      return;
    }

    statusEl.textContent = 'Sending payment prompt to your phone…';

    const { data: stkResult, error: stkError } = await SafariBoda.supabase.functions.invoke('mpesa-stk-push', {
      body: { orderId: order.id, phone: details.contactPhone, amountKes: depositAmount }
    });

    if (stkError || !stkResult?.success) {
      statusEl.textContent = '';
      errorEl.textContent = 'Could not send the payment prompt. Your request is saved — we\'ll follow up by phone to arrange payment.';
      payBtn.textContent = 'Try payment again';
      payBtn.disabled = false;
      return;
    }

    statusEl.textContent = 'Check your phone — enter your M-Pesa PIN to confirm.';
    SafariBoda.views.public._pollPaymentStatus(order, reference);
  });
};

/**
 * Polls the payments table for a real result after the STK push is sent.
 * Stops on success/failed, or after a timeout — never leaves the client
 * staring at a spinner forever if the callback is slow or never arrives.
 */
SafariBoda.views.public._pollPaymentStatus = async function (order, reference) {
  const maxAttempts = 20; // ~60 seconds at 3s intervals
  let attempts = 0;

  const poll = async () => {
    attempts++;
    const { data: payment } = await SafariBoda.supabase
      .from('payments')
      .select('status, mpesa_receipt_number')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (payment?.status === 'success') {
      SafariBoda.views.public._renderRequestOutcome(reference, 'success', payment.mpesa_receipt_number);
      return;
    }
    if (payment?.status === 'failed') {
      SafariBoda.views.public._renderRequestOutcome(reference, 'failed');
      return;
    }
    if (attempts >= maxAttempts) {
      SafariBoda.views.public._renderRequestOutcome(reference, 'timeout');
      return;
    }
    setTimeout(poll, 3000);
  };

  poll();
};

SafariBoda.views.public._renderRequestOutcome = function (reference, outcome, receiptNumber) {
  const messages = {
    success: {
      title: 'Payment confirmed',
      body: `Deposit received${receiptNumber ? ' — M-Pesa receipt ' + receiptNumber : ''}. We'll assign a rider shortly.`
    },
    failed: {
      title: 'Payment failed',
      body: 'The M-Pesa payment wasn\'t completed. Your request is saved — you can try paying again from My orders, or we\'ll follow up by phone.'
    },
    timeout: {
      title: 'Still waiting on payment confirmation',
      body: 'This is taking longer than expected. Your request is saved — check My orders shortly, or we\'ll follow up by phone.'
    }
  };
  const m = messages[outcome];

  document.getElementById('app').innerHTML = `
    <div class="container sb-section" style="text-align:center;">
      <h1>${m.title}</h1>
      <p class="mono" style="margin: var(--space-4) 0;">${reference}</p>
      <p class="sb-section-sub" style="margin: 0 auto var(--space-6);">${m.body}</p>
      <div class="row gap-4" style="justify-content:center;">
        <a href="#/my-orders" class="btn btn-primary">View my orders</a>
        <a href="#/" class="btn btn-secondary">Back to home</a>
      </div>
    </div>
  `;
};
