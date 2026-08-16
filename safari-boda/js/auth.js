/* ============================================
   SAFARI BODA — AUTH
   Handles login/logout and keeps SafariBoda.state
   in sync with the current Supabase session + role.
   Role comes from a `profiles` table row keyed to
   the Supabase Auth user (schema TBD — for now this
   assumes a `profiles` table with a `role` column:
   'client' | 'rider' | 'admin').
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
      SafariBoda.state.role = 'client'; // safe fallback — least privilege
      return;
    }

    SafariBoda.state.profile = profile;
    SafariBoda.state.role = profile.role; // 'client' | 'rider' | 'admin'
  },

  async signInWithPassword(email, password) {
    const { data, error } = await SafariBoda.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /**
   * Self-registration for both clients and riders — everyone signs up
   * the same way. role starts as 'client'; becoming a rider is a
   * separate step (registerAsRider) after signing in.
   */
  async signUpWithPassword(email, password, fullName, phone) {
    const { data, error } = await SafariBoda.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone }
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Turns the current signed-in user into a rider. Inserts their
   * rider record; a database trigger flips profiles.role to 'rider'
   * automatically. Must be signed in first.
   */
  async registerAsRider({ fullName, phone, nationalId, licenseNumber, bikePlate, serviceArea }) {
    if (!this.isSignedIn()) throw new Error('Must be signed in to register as a rider');

    const { data, error } = await SafariBoda.supabase
      .from('riders')
      .insert({
        profile_id: SafariBoda.state.user.id,
        full_name: fullName,
        phone,
        national_id: nationalId,
        license_number: licenseNumber,
        bike_plate: bikePlate,
        service_area: serviceArea || 'Kimana'
      })
      .select()
      .single();

    if (error) throw error;

    // Refresh local role/profile state so the UI updates immediately
    await this._applySession((await SafariBoda.supabase.auth.getSession()).data.session);
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
