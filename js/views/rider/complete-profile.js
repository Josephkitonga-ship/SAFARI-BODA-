/* ============================================
   SAFARI BODA — RIDER PROFILE COMPLETION
   Follow-up step after initial rider registration.
   Not required to start receiving orders, but riders
   who complete it rank higher in admin's matching —
   capability (what kind of work they take) and their
   specific parking stage both feed directly into the
   rule-based filtering + sort on the admin orders view.
   ============================================ */

SafariBoda.views.rider.completeProfile = async function () {
  if (!SafariBoda.auth.isRider()) {
    SafariBoda.router.navigate('#/become-a-rider');
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `<div class="container sb-section"><p class="field-hint">Loading…</p></div>`;

  const { data: rider, error: loadError } = await SafariBoda.supabase
    .from('riders')
    .select('*')
    .eq('profile_id', SafariBoda.state.user.id)
    .single();

  if (loadError || !rider) {
    app.innerHTML = `<div class="container sb-section"><p class="field-error">Could not load your rider profile.</p></div>`;
    return;
  }

  app.innerHTML = `
    <section class="container sb-section" style="max-width: 480px;">
      <h1 class="sb-section-title">Complete your rider profile</h1>
      <p class="sb-section-sub">A couple more details help us match you to the right orders — and rank you higher when we're assigning work.</p>
      <div class="card">
        <form id="sb-complete-profile-form" class="stack gap-4">
          <div class="field">
            <label for="sb-cp-capability">What work do you want?</label>
            <select id="sb-cp-capability" name="serviceCapability">
              <option value="transport" ${rider.service_capability === 'transport' ? 'selected' : ''}>Transport only (rides)</option>
              <option value="delivery" ${rider.service_capability === 'delivery' ? 'selected' : ''}>Delivery only (packages, e.g. Kimana Market)</option>
              <option value="both" ${rider.service_capability === 'both' ? 'selected' : ''}>Both</option>
            </select>
          </div>
          <div class="field">
            <label for="sb-cp-stage">Your usual parking stage / base</label>
            <input type="text" id="sb-cp-stage" name="parkingStage" required
                   value="${rider.parking_stage || ''}" placeholder="e.g. Kimana main stage">
            <span class="field-hint">Where you're usually based waiting for orders — helps us match you to nearby pickups.</span>
          </div>
          <button type="submit" class="btn btn-primary">Save</button>
          <div id="sb-complete-profile-error" class="field-error"></div>
        </form>
      </div>
    </section>
  `;

  document.getElementById('sb-complete-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const { error } = await SafariBoda.supabase
      .from('riders')
      .update({
        service_capability: form.get('serviceCapability'),
        parking_stage: form.get('parkingStage'),
        profile_completed: true
      })
      .eq('profile_id', SafariBoda.state.user.id);

    if (error) {
      document.getElementById('sb-complete-profile-error').textContent = error.message;
      return;
    }

    SafariBoda.router.navigate('#/rider');
  });
};
