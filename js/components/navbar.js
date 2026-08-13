/* ============================================
   SAFARI BODA — NAVBAR COMPONENT
   Re-rendered on every route change so nav links
   always reflect the current role. Client-side only
   — hiding a link is UX, not security.
   ============================================ */

SafariBoda.components.navbar = {

  render() {
    let existing = document.getElementById('sb-navbar');
    if (existing) existing.remove();

    const nav = document.createElement('nav');
    nav.id = 'sb-navbar';
    nav.className = 'sb-navbar';
    nav.innerHTML = this._html();
    document.body.insertBefore(nav, document.getElementById('app'));

    this._bindEvents(nav);
  },

  _html() {
    const role = SafariBoda.state.role;

    const links = {
      guest:   [{ href: '#/', label: 'Home' }, { href: '#/packages', label: 'Packages' }],
      tourist: [{ href: '#/', label: 'Home' }, { href: '#/packages', label: 'Packages' }],
      rider:   [{ href: '#/rider', label: 'Dashboard' }, { href: '#/rider/bookings', label: 'My bookings' }],
      admin:   [{ href: '#/admin', label: 'Dashboard' }, { href: '#/admin/riders', label: 'Riders' },
                { href: '#/admin/bookings', label: 'Bookings' }, { href: '#/admin/packages', label: 'Packages' }],
    }[role] || [];

    const linksHtml = links.map(l =>
      `<a href="${l.href}" class="sb-navbar-link">${l.label}</a>`
    ).join('');

    const authHtml = SafariBoda.auth.isSignedIn()
      ? `<button class="btn btn-ghost" id="sb-signout-btn">Sign out</button>`
      : `<a href="#/" class="btn btn-primary">Book now</a>`;

    return `
      <div class="container sb-navbar-inner">
        <a href="#/" class="sb-navbar-brand">Safari Boda</a>
        <div class="sb-navbar-links">${linksHtml}</div>
        <div class="sb-navbar-auth">${authHtml}</div>
      </div>
    `;
  },

  _bindEvents(nav) {
    const signoutBtn = nav.querySelector('#sb-signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => SafariBoda.auth.signOut());
    }
  }
};
