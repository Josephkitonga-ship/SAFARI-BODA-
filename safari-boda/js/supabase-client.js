/* ============================================
   SAFARI BODA — GLOBAL NAMESPACE + SUPABASE CLIENT
   ============================================
   No ES modules (file:// breaks import/export), so
   every other file attaches functions/values onto
   this single global object instead of using
   import/export. Load order in index.html is what
   makes dependencies available — this file must
   load first.
   ============================================ */

window.SafariBoda = window.SafariBoda || {
  // Populated by other files as they load:
  utils: {},       // format.js, currency.js
  components: {},  // navbar.js, package-card.js, booking-form.js
  views: {         // one render function per route, added by view files
    public: {},
    rider: {},
    admin: {}
  },
  state: {
    user: null,        // current Supabase auth user, or null
    role: 'guest',      // 'guest' | 'client' | 'rider' | 'admin'
    profile: null,       // row from `profiles` table once loaded
  }
};

/* --------------------------------------------
   Supabase client — one instance, reused everywhere.
   Loaded via CDN script tag in index.html (added
   above this file), which exposes a global `supabase`
   factory function.
   -------------------------------------------- */

// Real Supabase project — safari-boda, created August 2026
const SAFARI_BODA_SUPABASE_URL = 'https://adhxjemoptcigvoblvlw.supabase.co';
const SAFARI_BODA_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaHhqZW1vcHRjaWd2b2Jsdmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Nzg1OTEsImV4cCI6MjEwMjI1NDU5MX0.ZxjBKKDw3y0hfBg-oQfI2aHGxsL2jiG5vkpESRtGg_s';

SafariBoda.supabase = supabase.createClient(
  SAFARI_BODA_SUPABASE_URL,
  SAFARI_BODA_SUPABASE_ANON_KEY
);
