/* ============================================
   SAFARI BODA — CURRENCY UTILS
   Converts KES package prices to the visitor's local
   currency for display only. KES remains the true
   transaction currency (Foundations Report §6).
   Rates are cached in-memory + localStorage for a few
   hours so we don't hit the free-tier FX API on every
   page load.
   ============================================ */

SafariBoda.utils.currency = {

  _cacheKey: 'safariBoda_fxRates',
  _cacheHours: 6,
  _rates: null, // { base: 'KES', rates: { USD: 0.0077, EUR: ..., ... }, fetchedAt: <ms> }

  /** Best-effort visitor currency guess from the browser locale. Falls back to USD. */
  guessVisitorCurrency() {
    try {
      const locale = navigator.language || 'en-US';
      const currencyByRegion = {
        US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
        KE: 'KES', CA: 'CAD', AU: 'AUD', IN: 'INR', CN: 'CNY', JP: 'JPY'
      };
      const region = locale.split('-')[1];
      return currencyByRegion[region] || 'USD';
    } catch {
      return 'USD';
    }
  },

  async _loadRates() {
    if (this._rates && (Date.now() - this._rates.fetchedAt) < this._cacheHours * 3600 * 1000) {
      return this._rates;
    }

    const cached = localStorage.getItem(this._cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if ((Date.now() - parsed.fetchedAt) < this._cacheHours * 3600 * 1000) {
        this._rates = parsed;
        return parsed;
      }
    }

    // Frankfurter (free, no key required). Base KES.
    const res = await fetch('https://api.frankfurter.app/latest?from=KES');
    if (!res.ok) throw new Error('FX rate fetch failed: ' + res.status);
    const data = await res.json();

    const rates = { base: 'KES', rates: data.rates, fetchedAt: Date.now() };
    this._rates = rates;
    localStorage.setItem(this._cacheKey, JSON.stringify(rates));
    return rates;
  },

  /**
   * Converts a KES amount to the target currency.
   * Returns null (not a fallback price) if the rate can't be loaded —
   * callers should hide the converted price rather than show a wrong one.
   */
  async convert(kesAmount, targetCurrency) {
    if (targetCurrency === 'KES') return kesAmount;
    try {
      const { rates } = await this._loadRates();
      const rate = rates[targetCurrency];
      if (!rate) return null;
      return Math.round(kesAmount * rate * 100) / 100;
    } catch (err) {
      console.error('Currency conversion unavailable:', err);
      return null;
    }
  },

  /** e.g. formatConverted(42.50, 'USD') -> "$42.50" */
  formatConverted(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }
};
