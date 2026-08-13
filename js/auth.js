/* ============================================
   SAFARI BODA — AUTH
   Handles login/logout and keeps SafariBoda.state
   in sync with the current Supabase session + role.
   Role comes from a `profiles` table row keyed to
   the Supabase Auth user (schema TBD — for now this
   assumes a `profiles` table with a `role` column:
   'tourist' | 'rider' | 'admin').
   ============================================ */

SafariBoda.auth = {

  /**
   * Call once on app boot. Restores any existing session,
   * loads the role, and subscribes to future auth changes.
   */
  async init() {
    const { data: { session } } = await SafariBoda.supabase.auth.getSession();
    await this._applySession(session);

    SafariBoda.supabase.auth.onAuthStateChange(async (_event, session) => {
      await this._applySession(session);
      SafariBoda.router.rerender();
    });
  },

  async _applySession(session) {
    if (!session) {
      SafariBoda.state.user = null;
      SafariBoda.state.profile = null;
      SafariBoda.state.role = 'guest';
      return;
    }

    SafariBoda.state.user = session.user;

    const { data: profile, error } = await SafariBoda.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Failed to load profile for signed-in user:', error);
      SafariBoda.state.profile = null;
      SafariBoda.state.role = 'tourist'; // safe fallback — least privilege
      return;
    }

    SafariBoda.state.profile = profile;
    SafariBoda.state.role = profile.role; // 'tourist' | 'rider' | 'admin'
  },

  async signInWithPassword(email, password) {
    const { data, error } = await SafariBoda.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await SafariBoda.supabase.auth.signOut();
    window.location.hash = '#/';
  },

  isSignedIn() {
    return !!SafariBoda.state.user;
  },

  isRider() {
    return SafariBoda.state.role === 'rider';
  },

  isAdmin() {
    return SafariBoda.state.role === 'admin';
  }
};
