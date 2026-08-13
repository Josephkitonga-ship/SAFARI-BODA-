/* ============================================
   SAFARI BODA — PACKAGE CARD COMPONENT
   Renders a single package as a glass-on-horizon
   card. Standard is marked as "Most booked" per
   the pricing-psychology discussion (middle-tier
   anchor). Converted price loads async so the KES
   price is never blocked on the FX API.
   ============================================ */

SafariBoda.components.packageCard = {

  /** Returns an HTML string for one package card. Call mount() after inserting to wire the converted price. */
  render(pkg) {
    const featuredClass = pkg.is_featured ? 'card--featured' : '';
    return `
      <div class="card card--interactive ${featuredClass}" data-package-id="${pkg.id}">
        <div class="sb-package-eyebrow">${pkg.duration_label}</div>
        <h3 class="sb-package-name">${pkg.name}</h3>
        <p class="sb-package-tagline">${pkg.tagline}</p>

        <div class="sb-package-price">
          <span class="price price-primary">${SafariBoda.utils.format.kes(pkg.price_kes)}</span>
          <span class="price-converted" data-converted-price="${pkg.id}"></span>
        </div>

        <ul class="sb-package-includes">
          ${pkg.includes.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <a href="#/book/${pkg.id}" class="btn btn-primary sb-package-cta">Book this package</a>
      </div>
    `;
  },

  /** Call after the card's HTML is in the DOM — fills in the converted price without blocking render. */
  async mount(pkg) {
    const target = document.querySelector(`[data-converted-price="${pkg.id}"]`);
    if (!target) return;

    const currency = SafariBoda.utils.currency.guessVisitorCurrency();
    if (currency === 'KES') return; // nothing to show — KES is already the primary price

    const converted = await SafariBoda.utils.currency.convert(pkg.price_kes, currency);
    if (converted !== null) {
      target.textContent = '≈ ' + SafariBoda.utils.currency.formatConverted(converted, currency);
    }
  }
};
