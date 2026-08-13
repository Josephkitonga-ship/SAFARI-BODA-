/* ============================================
   SAFARI BODA — ROUTER
   Hash-based (works on GitHub Pages / file:// with
   no server rewrite rules needed). Guards admin/
   rider routes client-side for UX only — the real
   security boundary is Supabase row-level security,
   not this file. See Tech Stack Report §5.
   ============================================ */

SafariBoda.router = {

  routes: [
    { pattern: '#/',                 handler: () => SafariBoda.views.public.home() },
    { pattern: '#/packages',         handler: () => SafariBoda.views.public.packages() },
    { pattern: '#/book/:packageId',  handler: (p) => SafariBoda.views.public.booking(p.packageId) },

    { pattern: '#/rider',            handler: () => SafariBoda.views.rider.dashboard(), guard: 'rider' },
    { pattern: '#/rider/bookings',   handler: () => SafariBoda.views.rider.bookings(),  guard: 'rider' },

    { pattern: '#/admin',            handler: () => SafariBoda.views.admin.dashboard(), guard: 'admin' },
    { pattern: '#/admin/riders',     handler: () => SafariBoda.views.admin.riders(),    guard: 'admin' },
    { pattern: '#/admin/bookings',   handler: () => SafariBoda.views.admin.bookings(),  guard: 'admin' },
    { pattern: '#/admin/packages',   handler: () => SafariBoda.views.admin.packages(),  guard: 'admin' },
  ],

  /** Matches a hash like "#/book/123" against a pattern like "#/book/:packageId" */
  _match(hash, pattern) {
    const hashParts = hash.split('/');
    const patternParts = pattern.split('/');
    if (hashParts.length !== patternParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      if (p.startsWith(':')) {
        params[p.slice(1)] = decodeURIComponent(hashParts[i]);
      } else if (p !== hashParts[i]) {
        return null;
      }
    }
    return params;
  },

  _guardPasses(guard) {
    if (!guard) return true;
    if (guard === 'rider') return SafariBoda.auth.isRider() || SafariBoda.auth.isAdmin();
    if (guard === 'admin') return SafariBoda.auth.isAdmin();
    return true;
  },

  resolve() {
    const hash = window.location.hash || '#/';

    for (const route of this.routes) {
      const params = this._match(hash, route.pattern);
      if (params === null) continue;

      if (!this._guardPasses(route.guard)) {
        this._renderForbidden(route.guard);
        return;
      }

      SafariBoda.components.navbar.render();
      route.handler(params);
      return;
    }

    this._renderNotFound();
  },

  /** Re-runs the current route — used after auth state changes */
  rerender() {
    this.resolve();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  _renderForbidden(requiredRole) {
    document.getElementById('app').innerHTML = `
      <div class="container" style="padding-top: var(--space-24); text-align: center;">
        <h1>You don't have access to this page</h1>
        <p style="color: var(--sage-bush); margin-top: var(--space-4);">
          This area is for ${requiredRole === 'admin' ? 'Safari Boda admins' : 'riders'} only.
        </p>
        <a href="#/" class="btn btn-primary" style="margin-top: var(--space-6);">Back to home</a>
      </div>
    `;
  },

  _renderNotFound() {
    document.getElementById('app').innerHTML = `
      <div class="container" style="padding-top: var(--space-24); text-align: center;">
        <h1>Page not found</h1>
        <a href="#/" class="btn btn-primary" style="margin-top: var(--space-6);">Back to home</a>
      </div>
    `;
  }
};

window.addEventListener('hashchange', () => SafariBoda.router.resolve());
