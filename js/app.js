/* ==========================================================================
   MEDIKART 4.0 - MAIN APPLICATION CONTROLLER & ROUTER
   Single Unified Login Card with Role Tabs (Buyer, Dealer, Admin)
   ========================================================================== */

const THEME_STORAGE_KEY = 'medikart_theme_v4';

class MediKartApp {
  constructor() {
    this.currentRole = 'landing';
    this.activeLoginRole = 'buyer';
  }

  /* --------------------------------------------------------------------------
     MOBILE SIDEBAR DRAWER
     -------------------------------------------------------------------------- */
  activeSidebar() {
    const rootId = { buyer: 'buyer-root', dealer: 'dealer-root', admin: 'admin-root' }[this.currentRole];
    return rootId ? document.querySelector(`#${rootId} #sidebar`) : null;
  }

  toggleSidebar() {
    const sidebar = this.activeSidebar();
    if (!sidebar) return;
    const willOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);

    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) backdrop.classList.toggle('active', willOpen);
  }

  closeSidebar() {
    document.querySelectorAll('#sidebar.open').forEach(el => el.classList.remove('open'));
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  bindGlobalUiEvents() {
    if (this._uiEventsBound) return;
    this._uiEventsBound = true;

    // Tapping a nav item on mobile should navigate AND dismiss the drawer,
    // otherwise the drawer stays parked over the content you just opened.
    document.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('#sidebar .nav-item')) {
        this.closeSidebar();
      }
    });

    // Escape closes the topmost layer.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const overlay = document.getElementById('modalOverlay');
      if (overlay && overlay.classList.contains('active')) this.closeModal();
      else this.closeSidebar();
    });

    // Returning to a desktop width must not leave a stale drawer state behind.
    // Threshold matches the CSS breakpoint where the sidebar stops being a drawer.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) this.closeSidebar();
    });

    // Clicking the dimmed area outside the modal card dismisses it.
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }
  }

  init() {
    this.restoreTheme();
    this.bindGlobalUiEvents();

    // Restore an existing session so a page refresh does not log the user out.
    const session = window.MediKartData ? window.MediKartData.getSession() : null;
    if (session && session.role) {
      const revalidated = window.MediKartData.revalidateSession(session);
      if (revalidated.success) {
        this.routeToRole(revalidated.session.role);
        return;
      }
      // Session references an account that is no longer permitted to sign in.
      window.MediKartData.clearSession();
      if (revalidated.error) this.toast(revalidated.error, 'warning');
    }

    this.showLandingPage();
  }

  routeToRole(role) {
    if (role === 'buyer') this.showBuyerStorefront();
    else if (role === 'dealer') this.showDealerPortal();
    else if (role === 'admin') this.showAdminPortal();
    else this.showLandingPage();
  }

  /* --------------------------------------------------------------------------
     SHARED HTML ESCAPING
     All dynamic values interpolated into innerHTML templates must pass through
     this. Data now originates from dealer/buyer text inputs, so raw
     interpolation is an injection sink.
     -------------------------------------------------------------------------- */
  escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Escapes a value for safe use inside a single-quoted inline handler. */
  escapeAttr(value) {
    return this.escapeHtml(value).replace(/\\/g, '\\\\');
  }

  showLandingPage() {
    this.currentRole = 'landing';
    this.setActiveRoot('landing-root');
    this.renderLandingStats();
    this.selectLoginRole(this.activeLoginRole || 'buyer');

    if (window.MediKartData) window.MediKartData.setCurrentUser({ role: 'guest' });
  }

  /* Landing counters are read from the real dataset rather than advertising
     hardcoded totals the marketplace does not actually have. */
  renderLandingStats() {
    if (!window.MediKartData) return;

    let stats;
    try {
      stats = window.MediKartData.getMarketplaceStats();
    } catch (err) {
      console.error('Unable to compute marketplace stats:', err);
      return;
    }

    const fmt = n => Number(n || 0).toLocaleString('en-IN');
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    set('statPharmacies', fmt(stats.verifiedPharmacies));
    set('statMedicines', fmt(stats.listedMedicines));
    set('statCustomers', fmt(stats.customers));
    set('statDelivered', fmt(stats.ordersDelivered));
  }

  setActiveRoot(activeId) {
    ['landing-root', 'buyer-root', 'dealer-root', 'admin-root'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === activeId ? 'block' : 'none';
    });
  }

  showBuyerStorefront() {
    this.currentRole = 'buyer';
    this.setActiveRoot('buyer-root');

    if (window.MediKartData) window.MediKartData.setCurrentUser({ role: 'buyer' });

    if (window.MediKartBuyer) {
      try {
        window.MediKartBuyer.init();
      } catch (err) {
        console.error('Error in Buyer Storefront init:', err);
        this.toast('Unable to open the customer dashboard. Please try again.', 'error');
      }
    }
  }

  showDealerPortal() {
    this.currentRole = 'dealer';
    this.setActiveRoot('dealer-root');

    if (window.MediKartData) window.MediKartData.setCurrentUser({ role: 'dealer' });

    if (window.MediKartDealer) {
      try {
        window.MediKartDealer.init();
      } catch (err) {
        console.error('Error in Dealer Portal init:', err);
        this.toast('Unable to open the pharmacy dashboard. Please try again.', 'error');
      }
    }
  }

  showAdminPortal() {
    this.currentRole = 'admin';
    this.setActiveRoot('admin-root');

    if (window.MediKartData) window.MediKartData.setCurrentUser({ role: 'admin' });

    if (window.MediKartAdmin) {
      try {
        window.MediKartAdmin.init();
      } catch (err) {
        console.error('Error in Admin Portal init:', err);
        this.toast('Unable to open the admin dashboard. Please try again.', 'error');
      }
    }
  }

  selectLoginRole(role) {
    this.activeLoginRole = role;

    const bTab = document.getElementById('roleTabBuyer');
    const dTab = document.getElementById('roleTabDealer');
    const aTab = document.getElementById('roleTabAdmin');
    const btn = document.getElementById('loginSubmitBtn');
    const hint = document.getElementById('loginRoleHint');

    [[bTab, 'buyer'], [dTab, 'dealer'], [aTab, 'admin']].forEach(([tab, tabRole]) => {
      if (!tab) return;
      const isActive = role === tabRole;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const labels = {
      buyer: 'Login & Enter Customer Dashboard',
      dealer: 'Login & Enter Pharmacy Seller Dashboard',
      admin: 'Login & Enter Platform Admin Dashboard'
    };
    if (btn) btn.innerHTML = `<i class="fas fa-right-to-bracket"></i> ${labels[role] || labels.buyer}`;

    // Demo credentials are shown as a dismissible hint rather than pre-filled
    // into the live email/password fields.
    if (hint && window.MediKartData) {
      const demo = window.MediKartData.getDemoCredentialHint(role);
      hint.innerHTML = demo
        ? `<i class="fas fa-circle-info"></i> Demo credentials — <strong>${this.escapeHtml(demo.email)}</strong> / <strong>${this.escapeHtml(demo.password)}</strong>
           <button type="button" class="btn-link-inline" onclick="window.MediKartApp.fillDemoCredentials()">Use these</button>`
        : '';
    }
  }

  fillDemoCredentials() {
    const demo = window.MediKartData.getDemoCredentialHint(this.activeLoginRole || 'buyer');
    if (!demo) return;
    const emailIn = document.getElementById('loginEmail');
    const passIn = document.getElementById('loginPassword');
    if (emailIn) emailIn.value = demo.email;
    if (passIn) passIn.value = demo.password;
  }

  handleFormLogin() {
    const emailIn = document.getElementById('loginEmail');
    const passIn = document.getElementById('loginPassword');
    const email = emailIn ? emailIn.value : '';
    const password = passIn ? passIn.value : '';
    const targetRole = this.activeLoginRole || 'buyer';

    const authResult = window.MediKartData.authenticate(email, password, targetRole);

    if (!authResult.success) {
      this.toast(authResult.error, 'error');
      return;
    }

    window.MediKartData.saveSession(authResult.session);
    this.toast(`Welcome ${authResult.session.name}! Signed in as ${authResult.session.role.toUpperCase()}`, 'success');
    this.routeToRole(authResult.session.role);
  }

  switchAccount(role) {
    this.selectLoginRole(role);
    this.fillDemoCredentials();
    this.handleFormLogin();
  }

  logout() {
    if (window.MediKartData) window.MediKartData.clearSession();
    this.toast('Logged out successfully', 'info');
    this.showLandingPage();
  }

  showModal({ title, content, footerButtons = '' }) {
    const mTitle = document.getElementById('modalTitle');
    const mBody = document.getElementById('modalBody');
    const mFooter = document.getElementById('modalFooter');
    const overlay = document.getElementById('modalOverlay');

    if (mTitle) mTitle.innerText = title;
    if (mBody) mBody.innerHTML = content;
    if (mFooter) mFooter.innerHTML = footerButtons;
    if (overlay) overlay.classList.add('active');
  }

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  /* --------------------------------------------------------------------------
     PROMPT REPLACEMENT
     Styled modal equivalent of window.prompt(), used for admin moderation
     reasons so compliance decisions are captured in the app's own UI.
     -------------------------------------------------------------------------- */
  showPrompt({ title, label, defaultValue = '', confirmLabel = 'Confirm', required = true, onConfirm }) {
    this._promptCallback = onConfirm;
    this._promptRequired = required;

    this.showModal({
      title,
      content: `
        <div class="form-group">
          <label style="font-weight:700; display:block; margin-bottom:6px;">${this.escapeHtml(label)}${required ? ' *' : ''}</label>
          <textarea id="appPromptInput" class="form-control" rows="4">${this.escapeHtml(defaultValue)}</textarea>
          <div id="appPromptError" class="form-error-text" style="display:none;">This field is required.</div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.MediKartApp.submitPrompt()">${this.escapeHtml(confirmLabel)}</button>
      `
    });

    setTimeout(() => {
      const input = document.getElementById('appPromptInput');
      if (input) input.focus();
    }, 50);
  }

  submitPrompt() {
    const input = document.getElementById('appPromptInput');
    const error = document.getElementById('appPromptError');
    const value = input ? input.value.trim() : '';

    if (this._promptRequired && !value) {
      if (error) error.style.display = 'block';
      return;
    }

    const cb = this._promptCallback;
    this._promptCallback = null;
    this.closeModal();
    if (typeof cb === 'function') cb(value);
  }

  /* --------------------------------------------------------------------------
     CONFIRM REPLACEMENT
     -------------------------------------------------------------------------- */
  showConfirm({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) {
    this._confirmCallback = onConfirm;

    this.showModal({
      title,
      content: `<p style="font-size:0.95rem; line-height:1.6; color:var(--text-muted);">${this.escapeHtml(message)}</p>`,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" onclick="window.MediKartApp.submitConfirm()">${this.escapeHtml(confirmLabel)}</button>
      `
    });
  }

  submitConfirm() {
    const cb = this._confirmCallback;
    this._confirmCallback = null;
    this.closeModal();
    if (typeof cb === 'function') cb();
  }

  /* --------------------------------------------------------------------------
     TOASTS
     -------------------------------------------------------------------------- */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation',
      info: 'fa-info-circle'
    };
    const validType = icons[type] ? type : 'info';

    const toast = document.createElement('div');
    toast.className = `toast toast-${validType}`;
    toast.setAttribute('role', validType === 'error' ? 'alert' : 'status');
    toast.innerHTML = `<i class="fas ${icons[validType]}" aria-hidden="true"></i> <span></span>`;
    // textContent, not innerHTML — toast messages interpolate medicine names,
    // pharmacy names and error strings that originate from user input.
    toast.querySelector('span').textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-leaving');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  /* Alias — admin.js and dealer.js call showToast(). */
  showToast(message, type = 'info') {
    this.toast(message, type);
  }

  /* --------------------------------------------------------------------------
     THEME
     -------------------------------------------------------------------------- */
  restoreTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch (e) {}
    const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    this.applyTheme(theme, false);
  }

  applyTheme(theme, announce = true) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}

    document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    if (announce) {
      this.toast(`Switched to ${theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`, 'info');
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.applyTheme(current === 'light' ? 'dark' : 'light');
  }
}

window.MediKartApp = new MediKartApp();

document.addEventListener('DOMContentLoaded', () => {
  window.MediKartApp.init();
});
