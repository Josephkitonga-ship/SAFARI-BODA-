/* ============================================
   SAFARI BODA — FORMAT UTILS
   ============================================ */

SafariBoda.utils.format = {

  /** 3000 -> "KES 3,000" */
  kes(amount) {
    return 'KES ' + Number(amount).toLocaleString('en-KE');
  },

  /** Formats an ISO date string for display, e.g. "Thu, 13 Aug 2026" */
  date(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  /** Formats an ISO date string as a short time, e.g. "9:30 AM" */
  time(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  },

  /** Capitalizes a status string for display: "no_show" -> "No show" */
  statusLabel(status) {
    return status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());
  }
};
