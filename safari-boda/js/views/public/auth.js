/* ============================================
   SAFARI BODA — AUTH VIEW (sign in / sign up)
   Same form for everyone — clients and riders both
   start here. Becoming a rider is a separate step
   after signing in (see rider/register.js).
   ============================================ */

SafariBoda.views.public.auth = function (params, mode = 'signin') {
  document.getElementById('app').innerHTML = `
    <section class="container sb-section" style="max-width: 440px;">
      <div class="row gap-4" style="margin-bottom: var(--space-6);">
        <button class="btn ${mode === 'signin' ? 'btn-primary' : 'btn-secondary'}" id="sb-tab-signin">Sign in</button>
        <button class="btn ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}" id="sb-tab-signup">Create account</button>
      </div>

      <div class="card">
        ${mode === 'signin' ? SafariBoda.views.public._signinForm() : SafariBoda.views.public._signupForm()}
        <div id="sb-auth-error" class="field-error" style="margin-top: var(--space-4);"></div>
      </div>
    </section>
  `;

  document.getElementById('sb-tab-signin').addEventListener('click', () => SafariBoda.views.public.auth(params, 'signin'));
  document.getElementById('sb-tab-signup').addEventListener('click', () => SafariBoda.views.public.auth(params, 'signup'));

  if (mode === 'signin') {
    document.getElementById('sb-signin-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      try {
        await SafariBoda.auth.signInWithPassword(form.get('email'), form.get('password'));
        SafariBoda.router.navigate('#/');
      } catch (err) {
        document.getElementById('sb-auth-error').textContent = err.message;
      }
    });
  } else {
    document.getElementById('sb-signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      try {
        await SafariBoda.auth.signUpWithPassword(
          form.get('email'), form.get('password'), form.get('fullName'), form.get('phone')
        );
        SafariBoda.router.navigate('#/');
      } catch (err) {
        document.getElementById('sb-auth-error').textContent = err.message;
      }
    });
  }
};

SafariBoda.views.public._signinForm = () => `
  <form id="sb-signin-form" class="stack gap-4">
    <div class="field">
      <label for="sb-si-email">Email</label>
      <input type="email" id="sb-si-email" name="email" required autocomplete="email">
    </div>
    <div class="field">
      <label for="sb-si-password">Password</label>
      <input type="password" id="sb-si-password" name="password" required autocomplete="current-password">
    </div>
    <button type="submit" class="btn btn-primary">Sign in</button>
  </form>
`;

SafariBoda.views.public._signupForm = () => `
  <form id="sb-signup-form" class="stack gap-4">
    <div class="field">
      <label for="sb-su-name">Full name</label>
      <input type="text" id="sb-su-name" name="fullName" required autocomplete="name">
    </div>
    <div class="field">
      <label for="sb-su-phone">Phone number</label>
      <input type="tel" id="sb-su-phone" name="phone" required placeholder="+254 7XX XXX XXX" autocomplete="tel">
    </div>
    <div class="field">
      <label for="sb-su-email">Email</label>
      <input type="email" id="sb-su-email" name="email" required autocomplete="email">
    </div>
    <div class="field">
      <label for="sb-su-password">Password</label>
      <input type="password" id="sb-su-password" name="password" required minlength="6" autocomplete="new-password">
      <span class="field-hint">At least 6 characters.</span>
    </div>
    <button type="submit" class="btn btn-primary">Create account</button>
  </form>
`;
