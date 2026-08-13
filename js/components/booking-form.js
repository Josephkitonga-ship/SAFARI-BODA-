/* ============================================
   SAFARI BODA — BOOKING FORM COMPONENT
   The core conversion moment: tourist -> confirmed
   booking + M-Pesa deposit. Renders the form; the
   booking view (js/views/public/booking.js) owns
   the step state and Supabase/Edge Function calls.
   ============================================ */

SafariBoda.components.bookingForm = {

  /** Step 1: tourist details */
  renderDetailsStep(pkg) {
    return `
      <form id="sb-booking-details-form" class="stack gap-4">
        <div class="field">
          <label for="sb-name">Full name</label>
          <input type="text" id="sb-name" name="name" required autocomplete="name">
        </div>
        <div class="field">
          <label for="sb-phone">Phone number (for M-Pesa + coordination)</label>
          <input type="tel" id="sb-phone" name="phone" required placeholder="+254 7XX XXX XXX" autocomplete="tel">
        </div>
        <div class="field">
          <label for="sb-email">Email</label>
          <input type="email" id="sb-email" name="email" required autocomplete="email">
        </div>
        <div class="field">
          <label for="sb-date">Preferred tour date</label>
          <input type="date" id="sb-date" name="date" required min="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="field">
          <label for="sb-riders">Number of people</label>
          <input type="number" id="sb-riders" name="partySize" min="1" max="6" value="1" required>
        </div>
        <button type="submit" class="btn btn-primary">Continue to payment — ${SafariBoda.utils.format.kes(pkg.price_kes)} deposit</button>
      </form>
    `;
  },

  /** Step 2: M-Pesa STK push trigger + waiting state */
  renderPaymentStep(pkg, bookingDetails) {
    return `
      <div class="stack gap-4">
        <p>We'll send an M-Pesa payment prompt to <strong>${bookingDetails.phone}</strong> for the deposit of
          <strong>${SafariBoda.utils.format.kes(pkg.price_kes)}</strong>. Enter your M-Pesa PIN on your phone to confirm.</p>
        <button id="sb-stk-push-btn" class="btn btn-primary">Send payment prompt</button>
        <div id="sb-payment-status" class="field-hint" aria-live="polite"></div>
      </div>
    `;
  },

  /** Step 3: confirmation */
  renderConfirmationStep(booking) {
    return `
      <div class="stack gap-4" style="text-align:center;">
        <h2>You're booked</h2>
        <p>Booking reference: <span class="mono">${booking.reference}</span></p>
        <p style="color: var(--sage-bush);">We've sent confirmation details to your email. Your rider will be assigned shortly, and you'll get their name and contact ahead of your tour.</p>
        <a href="#/" class="btn btn-secondary">Back to home</a>
      </div>
    `;
  }
};
