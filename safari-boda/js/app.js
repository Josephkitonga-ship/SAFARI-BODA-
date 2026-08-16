/* ============================================
   SAFARI BODA — APP BOOTSTRAP
   Entry point. Waits for auth state to be known
   before the first route resolves, so the very
   first render already reflects whether someone
   is signed in (avoids a flash of the wrong view).
   ============================================ */

async function bootstrapSafariBoda() {
  await SafariBoda.auth.init();
  SafariBoda.router.resolve();
}

window.addEventListener('DOMContentLoaded', bootstrapSafariBoda);
