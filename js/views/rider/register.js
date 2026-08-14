/* ============================================
   SAFARI BODA — RIDER REGISTRATION VIEW
   Self-service — any signed-in user can register as
   a rider here. No admin approval gate for MVP; the
   `verified` flag on the riders table exists for
   Joseph to review/flag riders after the fact.
   ============================================ */

SafariBoda.views.rider.register = function () {
  if (!SafariBoda.auth.isSignedIn()) {
    SafariBoda.router.navigate('#/signin');
    return;
  }

  if (SafariBoda.auth.isRider()) {
    document.getElementById('app').innerHTML = `
      <div class="container sb-section" style="text-align:center;">
        <h1>You're already registered as a rider</h1>
        <a href="#/rider" class="btn btn-primary" style="margin-top:var(--space-6);">Go to your dashboard</a>
      </div>`;
    return;
  }

  document.getElementById('app').innerHTML = `
    <section class="container sb-section" style="max-width: 480px;">
      <h1 class="sb-section-title">Register as a rider</h1>
      <p class="sb-section-sub">Offer transport around Kimana &amp; Oloitokitok. Fill in your details below.</p>
      <div class="card">
        <form id="sb-rider-register-form" class="stack gap-4">
          <div class="field">
            <label for="sb-r-name">Full name</label>
            <input type="text" id="sb-r-name" name="fullName" required>
          </div>
          <div class="field">
            <label for="sb-r-phone">Phone number</label>
            <input type="tel" id="sb-r-phone" name="phone" required placeholder="+254 7XX XXX XXX">
          </div>
          <div class="field">
            <label for="sb-r-nid">National ID number</label>
            <input type="text" id="sb-r-nid" name="nationalId" required>
          </div>
          <div class="field">
            <label for="sb-r-license">Riding license number</label>
            <input type="text" id="sb-r-license" name="licenseNumber" required>
          </div>
          <div class="field">
            <label for="sb-r-plate">Bike registration / plate number</label>
            <input type="text" id="sb-r-plate" name="bikePlate" required>
          </div>
          <div class="field">
            <label for="sb-r-area">Service area</label>
            <select id="sb-r-area" name="serviceArea">
              <option value="Kimana">Kimana</option>
              <option value="Oloitokitok">Oloitokitok</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
          <div id="sb-rider-register-error" class="field-error"></div>
        </form>
      </div>
    </section>
  `;

  document.getElementById('sb-rider-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await SafariBoda.auth.registerAsRider({
        fullName: form.get('fullName'),
        phone: form.get('phone'),
        nationalId: form.get('nationalId'),
        licenseNumber: form.get('licenseNumber'),
        bikePlate: form.get('bikePlate'),
        serviceArea: form.get('serviceArea')
      });
      SafariBoda.router.navigate('#/rider');
    } catch (err) {
      document.getElementById('sb-rider-register-error').textContent = err.message;
    }
  });
};
