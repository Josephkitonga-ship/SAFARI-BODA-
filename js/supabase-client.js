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
    role: 'guest',      // 'guest' | 'tourist' | 'rider' | 'admin'
    profile: null,       // row from `profiles` table once loaded
  }
};

/* --------------------------------------------
   Supabase client — one instance, reused everywhere.
   Loaded via CDN script tag in index.html (added
   above this file), which exposes a global `supabase`
   factory function.
   -------------------------------------------- */

// TODO: replace with real project values once the Supabase project is created
const SAFARI_BODA_SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SAFARI_BODA_SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';

SafariBoda.supabase = supabase.createClient(
  SAFARI_BODA_SUPABASE_URL,
  SAFARI_BODA_SUPABASE_ANON_KEY
);
