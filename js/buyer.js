/* ==========================================================================
   MEDIKART 6.0 - REFINED BUYER DASHBOARD CONTROLLER
   Pure Real-World Online Medicine Marketplace Workflows
   Safe Cart Count Calculation (No NaN), Safe Scroll, 139+ Medicines
   ========================================================================== */

function safeScrollToTop() {
  try {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  } catch(e) {}
}

class BuyerController {
  constructor() {
    this.currentView = 'home';
    this.searchQuery = '';
    this.selectedMedicineType = 'all';
    this.selectedTherapeuticCategory = 'all';
    this.selectedManufacturer = 'all';
    this.selectedDealer = 'all';
    this.selectedPrescription = 'all'; // 'all', 'otc', 'rx'
    this.selectedRating = 'all';
    this.sortBy = 'popular';
    this.viewMode = 'grid'; // 'grid' or 'list'
    this.currentPage = 1;
    this.itemsPerPage = 12;
    
    // Active coupon state
    this.appliedCoupon = null;
    
    // Checkout state
    this.checkoutStep = 1;
    this.selectedAddressId = null;   // resolved from the signed-in buyer
    this.selectedPaymentMethod = 'UPI';
    this.selectedDeliveryOption = 'standard';
    this.placedOrder = null;
    this.prescriptionUploadData = null;
    this.simulatePaymentFail = false;  // referenced by the checkout test toggle

    // Recently viewed medicine IDs — populated as the buyer browses.
    this.recentlyViewed = [];

    // Navigation History Stack
    this.historyStack = [];
  }

  esc(value) {
    return window.MediKartApp ? window.MediKartApp.escapeHtml(value) : String(value == null ? '' : value);
  }

  init() {
    try {
      // Default the delivery address to the signed-in buyer's own default,
      // instead of a hardcoded id belonging to the demo account.
      const buyer = this.getBuyerUser();
      const addresses = buyer.addresses || [];
      const preferred = addresses.find(a => a.isDefault) || addresses[0];
      this.selectedAddressId = preferred ? preferred.id : null;

      this.renderLayout();
      this.navigate('home');
      this.bindGlobalEvents();
    } catch(err) {
      console.error('Error initializing Buyer Storefront:', err);
    }
  }

  bindGlobalEvents() {
    if (this._globalEventsBound) return;
    this._globalEventsBound = true;

    // Guarded: init() runs on every login, and this listener was previously
    // re-registered each time, stacking duplicate handlers on the document.
    document.addEventListener('click', (e) => {
      const searchBox = document.querySelector('.search-wrapper-relative');
      if (searchBox && !searchBox.contains(e.target)) {
        const popover = document.getElementById('searchPopover');
        if (popover) popover.classList.remove('active');
      }
    });
  }

  getBuyerUser() {
    const session = window.MediKartData ? window.MediKartData.getSession() : null;
    const buyers = window.MediKartData ? window.MediKartData.getBuyers() : [];
    if (session && session.role === 'buyer') {
      const match = buyers.find(b => b.id === session.buyerId || b.id === session.userId || b.email === session.email);
      if (match) return match;
    }
    return buyers[0] || { id: 'usr-501', name: 'Amit Sharma', email: 'buyer@medikart.com', mobile: '+91 98765 12345', addresses: [] };
  }

  /* --------------------------------------------------------------------------
     1. MASTER LAYOUT & TOP NAVBAR WITH LIVE SEARCH
     -------------------------------------------------------------------------- */
  renderLayout() {
    const root = document.getElementById('buyer-root');
    if (!root) return;

    const cartItems = window.MediKartData ? window.MediKartData.getCart() : [];
    const cartCount = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const wishlistCount = window.MediKartData ? window.MediKartData.getWishlist().length : 0;
    const notifCount = window.MediKartData ? window.MediKartData.getNotifications().filter(n => (!n.buyerId || n.buyerId === this.getBuyerUser().id) && !n.read).length : 0;
    const buyer = this.getBuyerUser();

    root.innerHTML = `
      <div id="app-layout">
        <!-- Fixed Left Sidebar Navigation -->
        <aside id="sidebar">
          <div class="sidebar-header">
            <div class="logo-badge"><i class="fas fa-prescription-bottle-alt"></i></div>
            <div class="logo-text">Medi<span>Kart</span></div>
          </div>

          <nav class="sidebar-menu">
            <div class="menu-category">Shop Healthcare</div>
            <div class="nav-item active" data-view="home" onclick="window.MediKartBuyer.navigate('home')">
              <i class="fas fa-home"></i> <span>Dashboard</span>
            </div>
            <div class="nav-item" data-view="browse" onclick="window.MediKartBuyer.navigate('browse')">
              <i class="fas fa-th-large"></i> <span>Explore Medicines</span>
            </div>

            <div class="menu-category">My Cart & Orders</div>
            <div class="nav-item" data-view="wishlist" onclick="window.MediKartBuyer.navigate('wishlist')">
              <i class="fas fa-heart"></i> <span>Wishlist</span>
              <span class="nav-item-count" id="buyerWishlistBadge">${wishlistCount}</span>
            </div>
            <div class="nav-item" data-view="cart" onclick="window.MediKartBuyer.navigate('cart')">
              <i class="fas fa-shopping-cart"></i> <span>Cart</span>
              <span class="nav-item-count" id="buyerCartBadge">${cartCount}</span>
            </div>
            <div class="nav-item" data-view="orders" onclick="window.MediKartBuyer.navigate('orders')">
              <i class="fas fa-box"></i> <span>My Orders</span>
            </div>
            <div class="nav-item" data-view="history" onclick="window.MediKartBuyer.navigate('history')">
              <i class="fas fa-history"></i> <span>Purchase History</span>
            </div>

            <div class="menu-category">Account & Rewards</div>
            <div class="nav-item" data-view="addresses" onclick="window.MediKartBuyer.navigate('addresses')">
              <i class="fas fa-address-book"></i> <span>Address Book</span>
            </div>
            <div class="nav-item" data-view="notifications" onclick="window.MediKartBuyer.navigate('notifications')">
              <i class="fas fa-bell"></i> <span>Notifications</span>
              <span class="badge-count badge-notif-alert" id="buyerNotifBadge">${notifCount}</span>
            </div>
            <div class="nav-item" data-view="coupons" onclick="window.MediKartBuyer.navigate('coupons')">
              <i class="fas fa-ticket-alt"></i> <span>Offers & Coupons</span>
            </div>
            <div class="nav-item" data-view="help" onclick="window.MediKartBuyer.navigate('help')">
              <i class="fas fa-headset"></i> <span>Help & Support</span>
            </div>
            <div class="nav-item" data-view="profile" onclick="window.MediKartBuyer.navigate('profile')">
              <i class="fas fa-user-circle"></i> <span>Profile</span>
            </div>
            
            <div class="menu-category">System</div>
            <div class="nav-item" onclick="window.MediKartApp.logout()">
              <i class="fas fa-sign-out-alt"></i> <span>Logout / Switch Account</span>
            </div>
          </nav>

          <div class="sidebar-footer" style="flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px; width:100%; cursor:pointer;" onclick="window.MediKartBuyer.navigate('profile')">
              <div class="user-mini-avatar"><i class="fas fa-user"></i></div>
              <div class="user-mini-info">
                <div class="user-mini-name">${buyer.name || 'Customer'}</div>
                <div class="user-mini-role">Verified Customer</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Wrapper & Top Header -->
        <div id="main-wrapper">
          <header id="top-navbar">
            <div class="navbar-left">
              <button class="mobile-toggle-btn" onclick="window.MediKartApp.toggleSidebar()" aria-label="Toggle navigation menu">
                <i class="fas fa-bars"></i>
              </button>

              <button class="btn btn-sm btn-outline-secondary" id="buyerBackBtn" style="display:none; align-items:center; gap:6px; font-weight:700; border-radius:var(--radius-md);" onclick="window.MediKartBuyer.goBack()">
                <i class="fas fa-arrow-left"></i> Back
              </button>
              
              <!-- Large Search Bar with Live Suggestions -->
              <div class="search-wrapper-relative">
                <div class="form-control" style="display:flex; align-items:center; gap:10px; background:var(--bg-input); padding:8px 16px;">
                  <i class="fas fa-search" style="color:var(--text-muted);"></i>
                  <input type="text" id="headerSearchInput" placeholder="Search medicines, generic names, manufacturers, dealers, health concerns..." style="border:none; background:transparent; width:100%;" oninput="window.MediKartBuyer.handleLiveSearch(this.value)" onfocus="window.MediKartBuyer.handleLiveSearch(this.value)">
                  <i class="fas fa-times" id="clearSearchIcon" style="display:none; cursor:pointer; color:var(--text-muted);" onclick="document.getElementById('headerSearchInput').value=''; window.MediKartBuyer.handleLiveSearch('')"></i>
                </div>

                <!-- Categorized Live Search Popover -->
                <div class="search-suggestions-popover" id="searchPopover"></div>
              </div>
            </div>

            <div class="navbar-right">
              <button class="icon-btn" title="Toggle Dark/Light Mode" onclick="window.MediKartApp.toggleTheme()">
                <i class="fas fa-moon"></i>
              </button>

              <!-- Notifications Dropdown Trigger -->
              <button class="icon-btn" style="position:relative;" title="Notifications" onclick="window.MediKartBuyer.openNotificationsFromBell()">
                <i class="fas fa-bell"></i>
                <span class="badge-count" id="buyerNotifBadge" style="position:absolute; top:-4px; right:-4px; ${notifCount > 0 ? 'display:flex;' : 'display:none;'}">${notifCount}</span>
              </button>

              <!-- Shopping Cart Trigger -->
              <button class="icon-btn" style="position:relative;" title="Cart" onclick="window.MediKartBuyer.navigate('cart')">
                <i class="fas fa-shopping-cart"></i>
                <span class="badge-count" id="buyerCartBadge" style="position:absolute; top:-4px; right:-4px; ${cartCount > 0 ? 'display:flex;' : 'display:none;'}">${cartCount}</span>
              </button>

              <!-- Buyer Profile Quick Link -->
              <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.MediKartBuyer.navigate('profile')">
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:1rem; box-shadow:var(--shadow-sm);">
                  <i class="fas fa-user"></i>
                </div>
                <span style="font-weight:700; font-size:0.88rem; color:var(--text-main);">${buyer.name || 'Buyer'}</span>
              </div>

              <!-- Top Right Single Logout Button -->
              <button class="btn btn-sm btn-outline-danger" title="Logout to Home" style="font-weight:700; display:flex; align-items:center; gap:6px; margin-left:6px;" onclick="window.MediKartApp.logout()">
                <i class="fas fa-right-from-bracket"></i> <span class="btn-label">Logout</span>
              </button>
            </div>
          </header>

          <main id="main-content"></main>
        </div>
      </div>
    `;
  }

  openNotificationsFromBell() {
    this.markAllNotificationsRead();
    this.navigate('notifications');
  }

  updateBadges() {
    const cartItems = window.MediKartData ? window.MediKartData.getCart() : [];
    const cartCount = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const wishlistCount = window.MediKartData ? window.MediKartData.getWishlist().length : 0;
    const buyer = this.getBuyerUser();
    const notifCount = window.MediKartData ? window.MediKartData.getNotifications().filter(n => (!n.buyerId || n.buyerId === buyer.id) && !n.read).length : 0;

    const cartBadge = document.getElementById('buyerCartBadge');
    if (cartBadge) {
      cartBadge.innerText = cartCount;
      cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }

    const wishBadge = document.getElementById('buyerWishlistBadge');
    if (wishBadge) wishBadge.innerText = wishlistCount;

    const notifBadge = document.getElementById('buyerNotifBadge');
    if (notifBadge) {
      notifBadge.innerText = notifCount;
      notifBadge.style.display = notifCount > 0 ? 'flex' : 'none';
    }
  }

  navigate(view, isBackAction = false) {
    if (!isBackAction && this.currentView && this.currentView !== view) {
      if (!this.historyStack) this.historyStack = [];
      this.historyStack.push(this.currentView);
    }

    this.currentView = view;

    // Toggle Back Button state in top navbar
    const backBtn = document.getElementById('buyerBackBtn');
    if (backBtn) {
      backBtn.style.display = (this.historyStack && this.historyStack.length > 0) ? 'inline-flex' : 'none';
    }

    document.querySelectorAll('#buyer-root #sidebar .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === view || (view === 'categories' && item.getAttribute('data-view') === 'browse'));
    });

    const main = document.querySelector('#buyer-root #main-content');
    if (!main) return;

    if (view === 'home') this.renderHome(main);
    else if (view === 'browse' || view === 'categories') this.renderBrowse(main);
    else if (view === 'wishlist') this.renderWishlist(main);
    else if (view === 'cart') this.renderCart(main);
    else if (view === 'checkout') this.renderCheckout(main);
    else if (view === 'orders') this.renderOrders(main);
    else if (view === 'history') this.renderHistory(main);
    else if (view === 'addresses') this.renderAddresses(main);
    else if (view === 'notifications') this.renderNotifications(main);
    else if (view === 'coupons') this.renderCoupons(main);
    else if (view === 'help') this.renderHelp(main);
    else if (view === 'profile') this.renderProfile(main);

    this.updateBadges();
    safeScrollToTop();
  }

  goBack() {
    if (this.historyStack && this.historyStack.length > 0) {
      const prevView = this.historyStack.pop();
      this.navigate(prevView, true);
    }
  }

  /* --------------------------------------------------------------------------
     2. SEARCH FUNCTIONALITY (5 ATTRIBUTES & CATEGORIZED SUGGESTIONS)
     -------------------------------------------------------------------------- */
  handleLiveSearch(query) {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    const clearIcon = document.getElementById('clearSearchIcon');
    if (clearIcon) clearIcon.style.display = query ? 'inline' : 'none';

    this.searchDebounceTimer = setTimeout(() => {
      this.executeLiveSearch(query);
    }, 100);
  }

  executeLiveSearch(query) {
    const popover = document.getElementById('searchPopover');
    if (!popover) return;

    if (!query || query.trim().length < 2) {
      popover.classList.remove('active');
      return;
    }

    const q = query.toLowerCase().trim();
    const medicines = window.MediKartData.getMedicines();
    const dealers = window.MediKartData.getDealers();

    // Search across 5 attributes: Name, Generic Name, Manufacturer, Dealer, Health Concern
    const matchedMeds = medicines.filter(m => m.name.toLowerCase().includes(q)).slice(0, 4);
    const matchedGenerics = medicines.filter(m => m.genericName.toLowerCase().includes(q) && !matchedMeds.includes(m)).slice(0, 3);
    const matchedMfrs = [...new Set(medicines.map(m => m.manufacturer))].filter(m => m.toLowerCase().includes(q)).slice(0, 3);
    const matchedDealers = dealers.filter(d => d.businessName.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)).slice(0, 3);
    const matchedCategories = window.THERAPEUTIC_CATEGORIES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);

    const hasResults = matchedMeds.length || matchedGenerics.length || matchedMfrs.length || matchedDealers.length || matchedCategories.length;

    if (!hasResults) {
      popover.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.9rem;">No matching results found for "${query}"</div>`;
      popover.classList.add('active');
      return;
    }

    let html = '';

    if (matchedMeds.length) {
      html += `<div class="suggestion-group-title"><i class="fas fa-pills"></i> Medicines</div>`;
      matchedMeds.forEach(m => {
        html += `
          <div class="suggestion-item" onclick="window.MediKartBuyer.openMedicineDetails('${m.id}')">
            <div class="suggestion-icon"><i class="fas fa-tablets"></i></div>
            <div>
              <div style="font-weight:700;">${m.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${m.packaging} • ₹${m.sellingPrice} per ${m.packageUnit}</div>
            </div>
          </div>
        `;
      });
    }

    if (matchedGenerics.length) {
      html += `<div class="suggestion-group-title"><i class="fas fa-flask"></i> Generic Names</div>`;
      matchedGenerics.forEach(m => {
        html += `
          <div class="suggestion-item" onclick="window.MediKartBuyer.searchByGeneric('${m.genericName}')">
            <div class="suggestion-icon"><i class="fas fa-vial"></i></div>
            <div>
              <div style="font-weight:700;">${m.genericName}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">Generic molecule in ${m.name}</div>
            </div>
          </div>
        `;
      });
    }

    if (matchedMfrs.length) {
      html += `<div class="suggestion-group-title"><i class="fas fa-industry"></i> Manufacturers</div>`;
      matchedMfrs.forEach(mfr => {
        html += `
          <div class="suggestion-item" onclick="window.MediKartBuyer.filterByManufacturer('${mfr}')">
            <div class="suggestion-icon"><i class="fas fa-building"></i></div>
            <div style="font-weight:700;">${mfr}</div>
          </div>
        `;
      });
    }

    if (matchedDealers.length) {
      html += `<div class="suggestion-group-title"><i class="fas fa-store"></i> Verified Pharmacies</div>`;
      matchedDealers.forEach(d => {
        html += `
          <div class="suggestion-item" onclick="window.MediKartBuyer.openSellerProfile('${d.id}')">
            <div class="suggestion-icon"><i class="fas fa-clinic-medical"></i></div>
            <div>
              <div style="font-weight:700;">${d.businessName} <span class="badge badge-success" style="font-size:0.65rem;">Verified</span></div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${d.address} • ★ ${d.rating}</div>
            </div>
          </div>
        `;
      });
    }

    if (matchedCategories.length) {
      html += `<div class="suggestion-group-title"><i class="fas fa-heartbeat"></i> Health Concerns</div>`;
      matchedCategories.forEach(cat => {
        html += `
          <div class="suggestion-item" onclick="window.MediKartBuyer.filterByTherapeuticCategory('${cat.name}')">
            <div class="suggestion-icon"><i class="fas ${cat.icon}"></i></div>
            <div style="font-weight:700;">${cat.name}</div>
          </div>
        `;
      });
    }

    popover.innerHTML = html;
    popover.classList.add('active');
  }

  searchByGeneric(gen) {
    this.resetFilters();
    this.searchQuery = gen;
    const input = document.getElementById('headerSearchInput');
    if (input) input.value = gen;
    const pop = document.getElementById('searchPopover');
    if (pop) pop.classList.remove('active');
    this.navigate('browse');
  }

  filterByManufacturer(mfr) {
    this.resetFilters();
    this.selectedManufacturer = mfr;
    const pop = document.getElementById('searchPopover');
    if (pop) pop.classList.remove('active');
    this.navigate('browse');
  }

  filterByTherapeuticCategory(cat) {
    this.resetFilters();
    this.selectedTherapeuticCategory = cat;
    const pop = document.getElementById('searchPopover');
    if (pop) pop.classList.remove('active');
    this.navigate('browse');
  }

  filterByMedicineType(type) {
    this.resetFilters();
    this.selectedMedicineType = type;
    this.navigate('browse');
  }

  /* --------------------------------------------------------------------------
     3. REFINED HOMEPAGE (STRICT 9-STEP SEQUENCE)
     -------------------------------------------------------------------------- */
  renderHome(container) {
    try {
      const medicines = (window.MediKartData && typeof window.MediKartData.getMedicines === 'function')
        ? window.MediKartData.getMedicines()
        : [];
      const buyers = (window.MediKartData && typeof window.MediKartData.getBuyers === 'function')
        ? window.MediKartData.getBuyers()
        : [];
      const buyer = buyers[0] || {};

      const featuredMeds = medicines.length > 0
        ? medicines.filter(m => m.isBestSeller || m.rating >= 4.7).slice(0, 6)
        : [];
      const bestSellers = medicines.length > 0
        ? medicines.filter(m => m.isBestSeller).slice(0, 6)
        : [];
      const continueShoppingMeds = medicines.length > 6 ? medicines.slice(6, 12) : medicines.slice(0, 6);
      const recentlyViewedMeds = medicines.filter(m => (this.recentlyViewed || []).includes(m.id));
      const brands = [...new Set(medicines.map(m => m.manufacturer).filter(Boolean))].slice(0, 8);

      const greetingTime = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    container.innerHTML = `
      <!-- 1. WELCOME BANNER -->
      <div class="buyer-hero-banner" style="background:linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color:white; padding:32px; border-radius:var(--radius-lg); margin-bottom:24px; box-shadow:var(--shadow-md);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
          <div>
            <div style="font-size:0.9rem; font-weight:700; opacity:0.9; text-transform:uppercase; letter-spacing:1px;">${greetingTime},</div>
            <h1 style="font-size:2.2rem; font-weight:800; margin:4px 0 8px;">${buyer.name || 'Buyer'}</h1>
            <p style="opacity:0.95; font-size:1.05rem;">Find genuine medicines from verified pharmacies at the best prices.</p>
          </div>
          <button class="btn btn-lg" style="background:white; color:var(--primary); font-weight:800;" onclick="window.MediKartBuyer.navigate('browse')">
            <i class="fas fa-pills"></i> Explore All Medicines
          </button>
        </div>
      </div>

      <!-- 2. HOMEPAGE QUICK SEARCH BAR WITH LIVE MATCHING -->
      <div class="card" style="margin-bottom:28px; padding:16px;">
        <div class="search-wrapper-relative" style="width:100%; max-width:100%;">
          <div class="form-control" style="display:flex; align-items:center; gap:16px; background:var(--bg-input); padding:10px 20px; width:100%; min-height:56px; border-radius:var(--radius-md);">
            <i class="fas fa-search" style="color:var(--primary); font-size:1.2rem; flex-shrink:0;"></i>
            <input type="text" id="homeSearchInput" placeholder="Quick Search Medicines, Generics, Brands, Health Concerns..." style="border:none; background:transparent; width:100%; flex:1; min-width:280px; font-size:1.05rem; outline:none; color:var(--text-main); padding-right:12px;" oninput="window.MediKartBuyer.handleLiveSearch(this.value)" onfocus="window.MediKartBuyer.handleLiveSearch(this.value)" onkeyup="if(event.key==='Enter'){ window.MediKartBuyer.handleSearch(this.value); }">
            <button class="btn btn-primary" style="flex-shrink:0; font-weight:800; padding:12px 24px; font-size:0.95rem; white-space:nowrap;" onclick="window.MediKartBuyer.handleSearch(document.getElementById('homeSearchInput').value)">
              <i class="fas fa-search"></i> Search Marketplace
            </button>
          </div>
        </div>
      </div>

      <!-- 3. SHOP BY MEDICINE TYPE -->
      <div style="margin-bottom:32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 class="card-title"><i class="fas fa-shapes" style="color:var(--primary);"></i> Shop by Medicine Type</h2>
          <a href="#" style="font-weight:700; font-size:0.9rem;" onclick="event.preventDefault(); window.MediKartBuyer.navigate('categories');">View All Types →</a>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:14px;">
          ${(window.MEDICINE_TYPES || []).slice(0, 10).map(mt => `
            <div class="category-card" onclick="window.MediKartBuyer.filterByMedicineType('${mt.name}')">
              <div class="category-icon"><i class="fas ${mt.icon}"></i></div>
              <div class="category-title">${mt.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. SHOP BY HEALTH CONCERN -->
      <div style="margin-bottom:32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 class="card-title"><i class="fas fa-heartbeat" style="color:var(--secondary);"></i> Shop by Health Concern</h2>
          <a href="#" style="font-weight:700; font-size:0.9rem;" onclick="event.preventDefault(); window.MediKartBuyer.navigate('categories');">View All Concerns →</a>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:14px;">
          ${(window.THERAPEUTIC_CATEGORIES || []).slice(0, 10).map(tc => `
            <div class="category-card" onclick="window.MediKartBuyer.filterByTherapeuticCategory('${tc.name}')">
              <div class="category-icon"><i class="fas ${tc.icon}"></i></div>
              <div class="category-title">${tc.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 5. FEATURED MEDICINES -->
      <div style="margin-bottom:36px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 class="card-title"><i class="fas fa-star" style="color:var(--warning);"></i> Featured Medicines</h2>
          <a href="#" style="font-weight:700; font-size:0.9rem;" onclick="event.preventDefault(); window.MediKartBuyer.navigate('browse');">See All Marketplace →</a>
        </div>
        <div class="medicine-grid">
          ${featuredMeds.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      </div>

      <!-- 6. BEST SELLERS -->
      <div style="margin-bottom:36px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 class="card-title"><i class="fas fa-fire" style="color:var(--danger);"></i> Best Sellers</h2>
        </div>
        <div class="medicine-grid">
          ${bestSellers.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      </div>

      <!-- 7. POPULAR BRANDS -->
      <div style="margin-bottom:36px;">
        <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-industry" style="color:var(--accent);"></i> Popular Brands</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:14px;">
          ${brands.map(b => `
            <div class="card text-center" style="cursor:pointer; padding:18px;" onclick="window.MediKartBuyer.filterByManufacturer('${b}')">
              <div style="font-size:1.8rem; color:var(--text-muted); margin-bottom:6px;"><i class="fas fa-building-flag"></i></div>
              <div style="font-weight:800; font-size:0.9rem;">${b}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 8. CONTINUE SHOPPING -->
      <div style="margin-bottom:36px;">
        <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-cart-arrow-down" style="color:var(--info);"></i> Continue Shopping</h2>
        <div class="medicine-grid">
          ${continueShoppingMeds.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      </div>

      <!-- 9. RECENTLY VIEWED -->
      <div style="margin-bottom:24px;">
        <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-clock-rotate-left" style="color:var(--text-muted);"></i> Recently Viewed</h2>
        <div class="medicine-grid">
          ${recentlyViewedMeds.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      </div>
    `;
    } catch(err) {
      console.error('Error rendering Buyer Home Dashboard:', err);
      container.innerHTML = `<div class="card" style="padding:40px; text-align:center;"><h2>Welcome to MediKart</h2><p>Loading marketplace data...</p></div>`;
    }
  }

  handleSearch(q) {
    this.resetFilters();
    this.searchQuery = q;
    if (this.currentView !== 'browse') this.navigate('browse');
    else this.renderBrowse(document.querySelector('#buyer-root #main-content'));
  }

  /* --------------------------------------------------------------------------
     4. MEDICINE CARD COMPONENT (EXACT FIELDS & EXPLICIT STOCK UNITS)
     -------------------------------------------------------------------------- */
  /* Real number of approved pharmacies listing this product, counted from the
     catalog rather than read off a stored (and often wrong) field. */
  countSellersFor(med) {
    if (!med) return 0;
    const dealers = window.MediKartData.getDealers();
    const approved = new Set(dealers.filter(d => d.status === 'approved').map(d => d.id));

    const sellerIds = new Set();
    window.MediKartData.getMedicines().forEach(m => {
      if (m.status !== 'Approved' || !approved.has(m.dealerId)) return;
      const sameSku = med.sku && m.sku === med.sku;
      const sameGeneric = (m.genericName || '') === (med.genericName || '') &&
                          (m.packaging || '') === (med.packaging || '');
      if (sameSku || sameGeneric) sellerIds.add(m.dealerId);
    });
    return sellerIds.size;
  }

  createMedicineCardHTML(med) {
    const sellersCount = this.countSellersFor(med);

    return `
      <div class="medicine-card" id="med-card-${med.id}">
        <div class="card-img-wrapper">
          <img src="${med.image}" alt="${this.esc(med.name)}" class="card-img" onclick="window.MediKartBuyer.openMedicineDetails('${med.id}')" loading="lazy">
        </div>

        <div class="medicine-card-body">
          <!-- 1. Medicine Name -->
          <div style="font-weight:800; font-size:1.05rem; color:var(--text-main); cursor:pointer;" onclick="window.MediKartBuyer.openMedicineDetails('${med.id}')">${med.name}</div>
          
          <!-- 2. Manufacturer / Brand -->
          <div style="font-size:0.78rem; color:var(--text-muted); font-weight:700; margin-top:2px;">
            Mfr: <strong style="color:var(--text-main);">${med.manufacturer}</strong>
          </div>

          <!-- 3. Packaging Info -->
          <div style="margin-top:8px;">
            <span class="badge badge-packaging"><i class="fas fa-box"></i> ${med.packaging}</span>
          </div>

          <!-- 4. Price -->
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:10px;">
            <div>
              <div style="font-size:1.25rem; font-weight:800; color:var(--primary);">₹${med.sellingPrice}</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">per ${med.packageUnit}</div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-light); text-decoration:line-through;">MRP ₹${med.mrp}</div>
          </div>

          <!-- 5. Fulfilling Chemist Store (Seller) -->
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">
            <i class="fas fa-store" style="color:var(--primary);"></i> Chemist Store: <strong style="color:var(--text-main);">${med.dealerName}</strong>
          </div>

          <!-- 6. Rating -->
          <div style="font-size:0.8rem; color:var(--warning); font-weight:700; margin-top:4px;">
            <i class="fas fa-star"></i> ${med.rating} <span style="color:var(--text-muted); font-weight:normal;">(${med.reviewCount || 45} reviews)</span>
          </div>

          <!-- 7. Stock Availability Status (Buyer-friendly without internal count numbers) -->
          <div style="margin-top:6px; font-size:0.8rem; font-weight:700; color:var(--success);">
            <i class="fas fa-circle-check"></i> In Stock & Ready to Ship
          </div>

          <!-- 8. Available from X Verified Pharmacies Badge -->
          <div class="seller-comparison-badge" onclick="window.MediKartBuyer.openSellerComparison('${med.id}')">
            <i class="fas fa-store"></i> Available from <strong>${sellersCount} Verified Pharmacies</strong>
          </div>

          <!-- Buttons: View Details & Add to Cart -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
            <button class="btn btn-outline-primary btn-sm" onclick="window.MediKartBuyer.openMedicineDetails('${med.id}')">
              View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.MediKartBuyer.addToCart('${med.id}')">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     5. BROWSE MEDICINES MARKETPLACE PAGE (PARAMETER SEGREGATED & ROBUST)
     -------------------------------------------------------------------------- */
  renderBrowse(container) {
    let medicines = window.MediKartData ? window.MediKartData.getMedicines() : [];
    const dealers = window.MediKartData ? window.MediKartData.getDealers() : [];
    const manufacturers = [...new Set(medicines.map(m => m.manufacturer))];

    // Filter by Search Query across 5 attributes
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      medicines = medicines.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.genericName.toLowerCase().includes(q) || 
        m.manufacturer.toLowerCase().includes(q) ||
        m.dealerName.toLowerCase().includes(q) ||
        m.therapeuticCategory.toLowerCase().includes(q)
      );
    }

    // Flexible Parameter Filter by Medicine Type (singular/plural normalized)
    if (this.selectedMedicineType !== 'all') {
      const smt = this.selectedMedicineType.toLowerCase().replace(/s$/, '');
      medicines = medicines.filter(m => (m.medicineType || '').toLowerCase().replace(/s$/, '').includes(smt));
    }

    // Flexible Parameter Filter by Therapeutic Category
    if (this.selectedTherapeuticCategory !== 'all') {
      const stc = this.selectedTherapeuticCategory.toLowerCase();
      medicines = medicines.filter(m => (m.therapeuticCategory || '').toLowerCase().includes(stc.split(' ')[0]));
    }

    // Filter by Manufacturer
    if (this.selectedManufacturer !== 'all') {
      medicines = medicines.filter(m => m.manufacturer === this.selectedManufacturer);
    }

    // Filter by Dealer Pharmacy
    if (this.selectedDealer !== 'all') {
      medicines = medicines.filter(m => m.dealerName === this.selectedDealer);
    }

    // Filter by Prescription Requirement (OTC / Rx)
    if (this.selectedPrescription !== 'all') {
      if (this.selectedPrescription === 'rx') medicines = medicines.filter(m => m.prescriptionRequired);
      else if (this.selectedPrescription === 'otc') medicines = medicines.filter(m => !m.prescriptionRequired);
    }

    // Sort Medicines
    if (this.sortBy === 'price-low') medicines.sort((a, b) => a.sellingPrice - b.sellingPrice);
    else if (this.sortBy === 'price-high') medicines.sort((a, b) => b.sellingPrice - a.sellingPrice);
    else if (this.sortBy === 'rating') medicines.sort((a, b) => b.rating - a.rating);
    else medicines.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));

    const totalItems = medicines.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedMedicines = medicines.slice(startIndex, startIndex + this.itemsPerPage);

    // Active filters tracking
    const hasActiveFilters = this.selectedMedicineType !== 'all' || 
                             this.selectedTherapeuticCategory !== 'all' || 
                             this.selectedManufacturer !== 'all' || 
                             this.selectedDealer !== 'all' || 
                             this.selectedPrescription !== 'all' ||
                             this.searchQuery !== '';

    const allCount = window.MediKartData ? window.MediKartData.getMedicines().length : 0;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);"><i class="fas fa-th-large" style="color:var(--primary);"></i> Explore Medicine Marketplace</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Visual category discovery & multi-parameter filtering across ${allCount} verified medicines.</p>
        </div>

        <div style="display:flex; align-items:center; gap:12px;">
          <div style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:4px; display:flex; gap:4px;">
            <button class="btn btn-sm ${this.viewMode === 'grid' ? 'btn-primary' : ''}" onclick="window.MediKartBuyer.viewMode='grid'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'))">
              <i class="fas fa-th-large"></i> Grid
            </button>
            <button class="btn btn-sm ${this.viewMode === 'list' ? 'btn-primary' : ''}" onclick="window.MediKartBuyer.viewMode='list'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'))">
              <i class="fas fa-list"></i> List
            </button>
          </div>

          <button class="btn btn-outline-secondary btn-sm" onclick="window.MediKartBuyer.resetFilters()">
            <i class="fas fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      </div>

      <!-- FILTER CONTROLS CARD -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; align-items:center;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">1. Dosage Form</label>
            <select class="form-control" onchange="window.MediKartBuyer.selectedMedicineType = this.value; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
              <option value="all">All Dosage Forms</option>
              ${(window.MEDICINE_TYPES || []).map(mt => `<option value="${mt.name}" ${this.selectedMedicineType === mt.name ? 'selected' : ''}>${mt.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">2. Health Concern</label>
            <select class="form-control" onchange="window.MediKartBuyer.selectedTherapeuticCategory = this.value; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
              <option value="all">All Health Concerns</option>
              ${(window.THERAPEUTIC_CATEGORIES || []).map(tc => `<option value="${tc.name}" ${this.selectedTherapeuticCategory === tc.name ? 'selected' : ''}>${tc.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">3. Manufacturer</label>
            <select class="form-control" onchange="window.MediKartBuyer.selectedManufacturer = this.value; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
              <option value="all">All Brands / Mfrs</option>
              ${manufacturers.map(mfr => `<option value="${mfr}" ${this.selectedManufacturer === mfr ? 'selected' : ''}>${mfr}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">4. Verified Chemist</label>
            <select class="form-control" onchange="window.MediKartBuyer.selectedDealer = this.value; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
              <option value="all">All 120+ Pharmacies</option>
              ${dealers.slice(0, 20).map(d => `<option value="${d.businessName}" ${this.selectedDealer === d.businessName ? 'selected' : ''}>${d.businessName}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">5. Sort By</label>
            <select class="form-control" onchange="window.MediKartBuyer.sortBy = this.value; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
              <option value="popular" ${this.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
              <option value="price-low" ${this.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${this.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${this.sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- ACTIVE FILTER CHIPS -->
        ${hasActiveFilters ? `
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:14px; border-top:1px dashed var(--border-color); padding-top:10px;">
            <span style="font-size:0.78rem; font-weight:800; color:var(--text-muted);">Active Filters:</span>

            ${this.searchQuery ? `
              <span class="badge badge-info" style="cursor:pointer;" onclick="window.MediKartBuyer.searchQuery=''; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Search: "${this.searchQuery}" &times;
              </span>
            ` : ''}

            ${this.selectedMedicineType !== 'all' ? `
              <span class="badge badge-primary" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedMedicineType='all'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Type: ${this.selectedMedicineType} &times;
              </span>
            ` : ''}

            ${this.selectedTherapeuticCategory !== 'all' ? `
              <span class="badge badge-success" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedTherapeuticCategory='all'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Concern: ${this.selectedTherapeuticCategory} &times;
              </span>
            ` : ''}

            ${this.selectedManufacturer !== 'all' ? `
              <span class="badge badge-warning" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedManufacturer='all'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Mfr: ${this.selectedManufacturer} &times;
              </span>
            ` : ''}

            ${this.selectedDealer !== 'all' ? `
              <span class="badge badge-info" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedDealer='all'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Dealer: ${this.selectedDealer} &times;
              </span>
            ` : ''}

            ${this.selectedPrescription !== 'all' ? `
              <span class="badge badge-danger" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedPrescription='all'; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content'));">
                Rx: ${this.selectedPrescription.toUpperCase()} &times;
              </span>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <!-- RESULTS COUNT HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; color:var(--text-muted); font-size:0.9rem;">
          Showing <strong>${totalItems > 0 ? startIndex + 1 : 0}-${Math.min(startIndex + this.itemsPerPage, totalItems)}</strong> of <strong>${totalItems}</strong> Medicines
        </div>
      </div>

      <!-- NO RESULTS EMPTY STATE -->
      ${totalItems === 0 ? `
        <div class="card text-center" style="padding:60px; margin-top:20px;">
          <div style="font-size:3.5rem; color:var(--warning); margin-bottom:16px;"><i class="fas fa-filter-circle-xmark"></i></div>
          <h2>No Medicines Match Current Filter Combination</h2>
          <p style="color:var(--text-muted); max-width:500px; margin:8px auto 24px;">Try clearing one or more active parameters to view more available verified pharmacy items.</p>
          <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.resetFilters()">
            <i class="fas fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      ` : `
        <div class="medicine-grid">
          ${paginatedMedicines.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      `}

      ${totalPages > 1 ? `
        <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:36px;">
          <button class="btn btn-outline-secondary btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.MediKartBuyer.currentPage--; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content')); safeScrollToTop();">
            <i class="fas fa-chevron-left"></i> Previous
          </button>
          
          ${Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(pg => `
            <button class="btn btn-sm ${this.currentPage === pg ? 'btn-primary' : 'btn-outline-secondary'}" onclick="window.MediKartBuyer.currentPage = ${pg}; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content')); safeScrollToTop();">
              ${pg}
            </button>
          `).join('')}

          <button class="btn btn-outline-secondary btn-sm" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.MediKartBuyer.currentPage++; window.MediKartBuyer.renderBrowse(document.querySelector('#buyer-root #main-content')); safeScrollToTop();">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      ` : ''}
    `;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedMedicineType = 'all';
    this.selectedTherapeuticCategory = 'all';
    this.selectedManufacturer = 'all';
    this.selectedDealer = 'all';
    this.selectedPrescription = 'all';
    this.sortBy = 'popular';
    this.currentPage = 1;
    const headerInput = document.getElementById('headerSearchInput');
    if (headerInput) headerInput.value = '';
    this.renderBrowse(document.querySelector('#buyer-root #main-content'));
  }

  renderCategories(container) {
    const medicines = window.MediKartData ? window.MediKartData.getMedicines() : [];

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:8px;">Marketplace Medicine Parameter Categories</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Explore medicines segregated by dosage form or therapeutic health concern.</p>

      <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-capsules" style="color:var(--primary);"></i> 1. Dosage Packaging Forms (Types)</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:36px;">
        ${(window.MEDICINE_TYPES || []).map(mt => {
          const count = medicines.filter(m => (m.medicineType || '').toLowerCase().includes(mt.name.toLowerCase())).length;
          return `
            <div class="card" style="cursor:pointer; transition:var(--transition);" onclick="window.MediKartBuyer.filterByMedicineType('${mt.name}')">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div class="why-icon-box bg-light-teal"><i class="fas ${mt.icon}"></i></div>
                <span class="badge badge-info">${count} Items</span>
              </div>
              <h3 style="font-size:1.1rem; font-weight:800; margin-top:8px;">${mt.name}</h3>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${mt.desc}</p>
            </div>
          `;
        }).join('')}
      </div>

      <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-heartbeat" style="color:var(--secondary);"></i> 2. Therapeutic Health Concerns</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
        ${(window.THERAPEUTIC_CATEGORIES || []).map(tc => {
          const count = medicines.filter(m => (m.therapeuticCategory || '').toLowerCase().includes(tc.name.toLowerCase().split(' ')[0])).length;
          return `
            <div class="card" style="cursor:pointer; transition:var(--transition);" onclick="window.MediKartBuyer.filterByTherapeuticCategory('${tc.name}')">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div class="why-icon-box bg-light-blue"><i class="fas ${tc.icon}"></i></div>
                <span class="badge badge-success">${count} Items</span>
              </div>
              <h3 style="font-size:1.1rem; font-weight:800; margin-top:8px;">${tc.name}</h3>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${tc.desc}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     8. SELLER COMPARISON (ACTUAL DEPOSITORIES & LISTING DISCOVERY)
     -------------------------------------------------------------------------- */
  openSellerComparison(medicineId) {
    const medicines = window.MediKartData ? window.MediKartData.getMedicines() : [];
    const med = medicines.find(m => m.id === medicineId);
    if (!med) {
      window.MediKartApp.toast('That medicine is no longer listed.', 'error');
      return;
    }

    const dealers = window.MediKartData.getDealers();
    const dealerById = {};
    dealers.forEach(d => { dealerById[d.id] = d; });

    // Match other listings of the SAME product. The previous filter tested
    // `m.status === 'active'`, a value no listing ever carries, so this always
    // matched nothing and fell through to fabricating seller rows.
    const sameSku = m => med.sku && m.sku && m.sku === med.sku;
    const sameGeneric = m =>
      (m.genericName || '').trim().toLowerCase() === (med.genericName || '').trim().toLowerCase() &&
      (m.packaging || '').trim().toLowerCase() === (med.packaging || '').trim().toLowerCase();

    const matchingListings = medicines.filter(m => {
      if (m.status !== 'Approved') return false;
      const dealer = dealerById[m.dealerId];
      if (!dealer || dealer.status !== 'approved') return false;
      return sameSku(m) || sameGeneric(m);
    });

    // Keep the listing the buyer clicked first, then genuine competitors.
    const ordered = [
      ...matchingListings.filter(m => m.id === med.id),
      ...matchingListings.filter(m => m.id !== med.id)
    ];
    if (ordered.length === 0) ordered.push(med);

    const sellersMap = new Map();
    ordered.forEach(listing => {
      const d = dealerById[listing.dealerId];
      if (!d || sellersMap.has(d.id)) return;
      sellersMap.set(d.id, {
        listingId: listing.id,
        dealerId: d.id,
        dealerName: d.businessName,
        price: listing.sellingPrice,
        stockNum: listing.stock,
        stock: `${listing.stock} ${listing.packageUnit}`,
        rating: d.rating || 4.5,
        reviewCount: d.reviewCount || 0,
        deliveryTime: d.deliveryTime || 'Standard (24-48 hrs)',
        verified: d.status === 'approved'
      });
    });

    // Cheapest in-stock seller first; out-of-stock sellers sink to the bottom.
    const sellers = Array.from(sellersMap.values()).sort((a, b) => {
      if ((a.stockNum > 0) !== (b.stockNum > 0)) return a.stockNum > 0 ? -1 : 1;
      return a.price - b.price;
    });

    const bestPrice = sellers.length ? Math.min(...sellers.filter(s => s.stockNum > 0).map(s => s.price).concat([Infinity])) : Infinity;
    const esc = v => this.esc(v);

    window.MediKartApp.showModal({
      title: `Compare Verified Sellers for ${med.name}`,
      content: `
        <div class="compare-head">
          <div class="compare-head-name">${esc(med.name)}</div>
          <div class="compare-head-meta">Packaging: ${esc(med.packaging)} • Generic: ${esc(med.genericName || med.name)}</div>
        </div>

        ${sellers.length === 1 ? `
          <div class="info-note info-note-sm">
            <i class="fas fa-circle-info" aria-hidden="true"></i>
            Only one verified pharmacy currently lists this product.
          </div>
        ` : ''}

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Verified Pharmacy</th>
                <th scope="col" class="text-right">Price / ${esc(med.packageUnit)}</th>
                <th scope="col">Stock Available</th>
                <th scope="col">Rating &amp; Reviews</th>
                <th scope="col">Delivery Speed</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              ${sellers.map(s => `
                <tr class="${s.price === bestPrice && s.stockNum > 0 ? 'row-best-price' : ''}">
                  <td>
                    <button type="button" class="link-button" onclick="window.MediKartBuyer.openSellerProfile('${esc(s.dealerId)}')">${esc(s.dealerName)}</button>
                    <span class="badge badge-success badge-xs"><i class="fas fa-certificate" aria-hidden="true"></i> Verified</span>
                    ${s.price === bestPrice && s.stockNum > 0 ? '<span class="badge badge-info badge-xs">Best price</span>' : ''}
                  </td>
                  <td class="text-right"><strong class="text-primary price-lg">₹${Number(s.price).toFixed(2)}</strong></td>
                  <td>${s.stockNum > 0 ? `<strong>${esc(s.stock)}</strong>` : '<span class="text-danger">Out of stock</span>'}</td>
                  <td><i class="fas fa-star text-warning" aria-hidden="true"></i> ${s.rating} (${s.reviewCount})</td>
                  <td>${esc(s.deliveryTime)}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" ${s.stockNum <= 0 ? 'disabled' : ''}
                      onclick="window.MediKartBuyer.selectSellerForCart('${esc(s.listingId)}', '${esc(s.dealerId)}'); window.MediKartApp.closeModal();">
                      ${s.stockNum <= 0 ? 'Out of Stock' : 'Select Seller'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `,
      footerButtons: `<button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>`
    });
  }

  /* Price and seller name are resolved from the listing record rather than
     passed in from the click handler, so the cart can never be seeded with a
     price that does not match the catalog. */
  selectSellerForCart(listingId, dealerId) {
    const medicines = window.MediKartData ? window.MediKartData.getMedicines() : [];
    const med = medicines.find(m => m.id === listingId);
    if (!med) {
      window.MediKartApp.toast('That listing is no longer available.', 'error');
      return;
    }

    const resolvedDealerId = dealerId || med.dealerId;
    const dealer = window.MediKartData.getDealers().find(d => d.id === resolvedDealerId);
    const sellerName = dealer ? dealer.businessName : med.dealerName;
    const price = Number(med.sellingPrice) || 0;

    if (med.stock <= 0) {
      window.MediKartApp.toast(`${med.name} is out of stock at ${sellerName}.`, 'error');
      return;
    }

    const cart = window.MediKartData.getCart();
    const existing = cart.find(c => (c.listingId === listingId || c.medicineId === listingId) && c.dealerId === resolvedDealerId);

    if (existing) {
      if (existing.quantity + 1 > med.stock) {
        window.MediKartApp.toast(`Only ${med.stock} ${med.packageUnit} available from ${sellerName}.`, 'error');
        return;
      }
      existing.quantity += 1;
      existing.pricePerUnit = price;
      existing.subtotal = Number((existing.quantity * price).toFixed(2));
    } else {
      cart.push({
        listingId: med.id,
        medicineId: med.id,
        dealerId: resolvedDealerId,
        medicineName: med.name,
        dealerName: sellerName,
        pricePerUnit: price,
        packaging: med.packaging,
        packageUnit: med.packageUnit,
        quantity: 1,
        subtotal: price,
        prescriptionRequired: !!med.prescriptionRequired,
        rxRequired: !!med.prescriptionRequired,
        therapeuticCategory: med.therapeuticCategory
      });
    }

    window.MediKartData.saveCart(cart);
    this.updateBadges();
    window.MediKartApp.toast(`Added 1 ${med.packageUnit} of ${med.name} from ${sellerName}.`, 'success');
  }

  openSellerProfileByTitle(title) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(item => item.businessName === title);
    if (!d) {
      window.MediKartApp.toast('Pharmacy profile not found.', 'error');
      return;
    }
    this.openSellerProfile(d.id);
  }

  /* --------------------------------------------------------------------------
     9. SELLER PROFILE MODAL
     -------------------------------------------------------------------------- */
  openSellerProfile(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(item => item.id === dealerId) || dealers[0];
    const medicines = window.MediKartData.getMedicines().filter(m => m.dealerName === d.businessName).slice(0, 4);

    window.MediKartApp.showModal({
      title: `Verified Seller Profile`,
      content: `
        <div style="display:flex; gap:16px; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:16px; margin-bottom:16px;">
          <div class="why-icon-box bg-light-teal" style="width:60px; height:60px; font-size:1.8rem;"><i class="fas fa-clinic-medical"></i></div>
          <div>
            <h2 style="font-weight:800; font-size:1.3rem; margin:0;">${d.businessName} <span class="badge badge-success"><i class="fas fa-certificate"></i> Verified Chemist</span></h2>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">Owner: ${d.name} • ${d.address}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; font-size:0.88rem;">
          <div class="card" style="padding:12px;"><strong>Drug License No:</strong> <div><code>${d.drugLicense}</code></div></div>
          <div class="card" style="padding:12px;"><strong>GSTIN Registration:</strong> <div><code>${d.gstNumber}</code></div></div>
          <div class="card" style="padding:12px;"><strong>Overall Rating & Reviews:</strong> <div><i class="fas fa-star" style="color:var(--warning);"></i> ${d.rating} (${d.reviewCount || 98} Reviews)</div></div>
          <div class="card" style="padding:12px;"><strong>Years Active on MediKart:</strong> <div>${d.yearsOnMediKart || 3} Years Active Partner</div></div>
        </div>

        <h3 style="font-weight:800; font-size:1rem; margin-bottom:12px;">Listed Medicines (${medicines.length})</h3>
        <div class="medicine-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
          ${medicines.map(m => this.createMedicineCardHTML(m)).join('')}
        </div>
      `,
      footerButtons: `<button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>`
    });
  }

  /* --------------------------------------------------------------------------
     10. MEDICINE DETAILS MODAL
     -------------------------------------------------------------------------- */
  openMedicineDetails(medId) {
    const medicines = window.MediKartData.getMedicines();
    const med = medicines.find(m => m.id === medId);
    if (!med) return;

    if (!this.recentlyViewed.includes(medId)) {
      this.recentlyViewed.unshift(medId);
      if (this.recentlyViewed.length > 8) this.recentlyViewed.pop();
    }

    window.MediKartApp.showModal({
      title: `${med.name} Details`,
      content: `
        <div style="display:grid; grid-template-columns: 220px 1fr; gap:24px; margin-bottom:20px;">
          <div>
            <img src="${med.image}" alt="${med.name}" style="width:100%; height:200px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div style="margin-top:12px;">
              <span class="badge ${med.prescriptionRequired ? 'badge-danger' : 'badge-info'}" style="width:100%; justify-content:center; padding:8px;">
                ${med.prescriptionRequired ? 'Prescription Required (Rx)' : 'Over The Counter (OTC)'}
              </span>
            </div>
          </div>

          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">Mfr: <strong style="color:var(--text-main);">${med.manufacturer}</strong></div>
            <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">${med.name}</h2>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Generic Molecule: <strong>${med.genericName}</strong></div>

            <div style="display:flex; align-items:baseline; gap:12px; margin-bottom:16px;">
              <div style="font-size:1.6rem; font-weight:800; color:var(--primary);">₹${med.sellingPrice}</div>
              <div style="font-size:0.85rem; color:var(--text-muted);">per ${med.packageUnit}</div>
              <div style="font-size:0.9rem; color:var(--text-light); text-decoration:line-through;">MRP ₹${med.mrp}</div>
            </div>

            <div style="background:var(--bg-input); padding:14px; border-radius:var(--radius-md); font-size:0.88rem; margin-bottom:16px;">
              <div><strong>Pharma Manufacturer:</strong> ${med.manufacturer}</div>
              <div><strong>Packaging Info:</strong> ${med.packaging}</div>
              <div><strong>Fulfilling Chemist Store (Seller):</strong> ${med.dealerName}</div>
              <div><strong>Availability:</strong> <span style="color:var(--success); font-weight:700;"><i class="fas fa-circle-check"></i> In Stock & Ready for Express Delivery</span></div>
            </div>

            <div style="display:flex; gap:12px;">
              <button class="btn btn-primary btn-block" onclick="window.MediKartBuyer.addToCart('${med.id}'); window.MediKartApp.closeModal();">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
              <button class="btn btn-outline-secondary" onclick="window.MediKartBuyer.toggleWishlist('${med.id}')">
                <i class="fas fa-heart"></i> Wishlist
              </button>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top:16px;">
          <h3 style="font-weight:800; font-size:1rem; margin-bottom:6px;">Uses & Indications</h3>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">${med.uses}</p>

          <h3 style="font-weight:800; font-size:1rem; margin-bottom:6px;">Recommended Dosage</h3>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">${med.dosage}</p>

          <h3 style="font-weight:800; font-size:1rem; margin-bottom:6px;">Possible Side Effects</h3>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">${med.sideEffects}</p>

          <h3 style="font-weight:800; font-size:1rem; margin-bottom:6px;">Storage & Safety Instructions</h3>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:16px;">${med.storage}</p>
        </div>

        <!-- Verified Patient Reviews Section -->
        <div style="border-top:1px solid var(--border-color); padding-top:16px;">
          <h3 style="font-weight:800; font-size:1rem; margin-bottom:12px;"><i class="fas fa-star" style="color:var(--warning);"></i> Verified Patient Reviews</h3>
          
          ${(() => {
            const buyer = this.getBuyerUser();
            const reviews = window.MediKartData.getReviews().filter(r => r.medicineId === medId);
            const orders = window.MediKartData.getOrders().filter(o => (o.buyerId === buyer.id || o.buyerEmail === buyer.email) && o.status === 'Delivered');
            const hasDeliveredPurchase = orders.some(o => o.items && o.items.some(i => (i.listingId === medId || i.medicineId === medId)));
            const existingReview = reviews.find(r => r.buyerId === buyer.id);

            let reviewFormHTML = '';
            if (hasDeliveredPurchase) {
              if (existingReview) {
                reviewFormHTML = `<div style="background:var(--bg-input); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--success); font-weight:700; margin-bottom:14px;"><i class="fas fa-check-circle"></i> You submitted a verified review for this medicine.</div>`;
              } else {
                reviewFormHTML = `
                  <div style="background:var(--bg-input); padding:14px; border-radius:var(--radius-md); margin-bottom:16px;">
                    <div style="font-weight:700; font-size:0.88rem; margin-bottom:8px;">Submit Verified Patient Review</div>
                    <div style="display:grid; grid-template-columns: 140px 1fr; gap:10px; margin-bottom:10px;">
                      <select id="reviewRatingSelect" class="form-control" style="font-weight:700;">
                        <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5)</option>
                        <option value="3">⭐⭐⭐ (3/5)</option>
                        <option value="2">⭐⭐ (2/5)</option>
                        <option value="1">⭐ (1/5)</option>
                      </select>
                      <input type="text" id="reviewTextInput" class="form-control" placeholder="Share your experience with this medicine...">
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="window.MediKartBuyer.submitMedicineReview('${med.id}')">Submit Verified Review</button>
                  </div>
                `;
              }
            } else {
              reviewFormHTML = `<div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px; font-style:italic;"><i class="fas fa-circle-info"></i> Only verified buyers with a completed delivered order for this medicine can post a review.</div>`;
            }

            const reviewsListHTML = reviews.length === 0 ? `<div style="color:var(--text-muted); font-size:0.85rem;">No patient reviews submitted yet for this listing.</div>` : reviews.map(r => `
              <div style="padding:10px 0; border-bottom:1px dashed var(--border-color); font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between;">
                  <strong>${r.buyerName} <span class="badge badge-success" style="font-size:0.65rem;"><i class="fas fa-certificate"></i> Verified Buyer</span></strong>
                  <span style="color:var(--warning); font-weight:700;">${'⭐'.repeat(r.rating)}</span>
                </div>
                <p style="margin:4px 0 0 0; color:var(--text-muted);">${r.comment}</p>
              </div>
            `).join('');

            return reviewFormHTML + reviewsListHTML;
          })()}
        </div>
      `,
      footerButtons: `<button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>`
    });
  }

  submitMedicineReview(medId) {
    const buyer = this.getBuyerUser();
    const orders = window.MediKartData.getOrders().filter(o => (o.buyerId === buyer.id || o.buyerEmail === buyer.email) && o.status === 'Delivered');
    const eligibleOrd = orders.find(o => o.items && o.items.some(i => (i.listingId === medId || i.medicineId === medId)));

    if (!eligibleOrd) {
      window.MediKartApp.toast('Verified Purchase Required: You can only submit a review after receiving a delivered order for this medicine.', 'error');
      return;
    }

    const reviews = window.MediKartData.getReviews();
    const existingReview = reviews.find(r => r.buyerId === buyer.id && (r.medicineId === medId || r.orderId === eligibleOrd.id));
    if (existingReview) {
      window.MediKartApp.toast('You have already submitted a review for this medicine purchase.', 'info');
      return;
    }

    const rating = Number(document.getElementById('reviewRatingSelect').value) || 5;
    const text = document.getElementById('reviewTextInput').value.trim();

    if (!text) {
      window.MediKartApp.toast('Please write a short review note.', 'error');
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      orderId: eligibleOrd.id,
      medicineId: medId,
      dealerId: eligibleOrd.dealerId,
      rating,
      comment: text,
      date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newReview);
    window.MediKartData.saveReviews(reviews);

    window.MediKartApp.toast('Thank you! Your verified patient review has been published.', 'success');
    this.openMedicineDetails(medId);
  }

  /* --------------------------------------------------------------------------
     11. SHOPPING CART (GROUPED DEALER-WISE WITH PACKAGE UNITS)
     -------------------------------------------------------------------------- */
  renderCart(container) {
    const cart = window.MediKartData.getCart();
    const settings = window.MediKartData.getSettings();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding:60px;">
          <div style="font-size:3.5rem; color:var(--text-muted); margin-bottom:16px;"><i class="fas fa-shopping-cart"></i></div>
          <h2>Your Cart is Empty</h2>
          <p style="color:var(--text-muted); margin-bottom:20px;">Explore genuine medicines from verified pharmacies.</p>
          <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.navigate('browse')">
            <i class="fas fa-pills"></i> Shop Medicines Now
          </button>
        </div>
      `;
      return;
    }

    const grouped = {};
    cart.forEach(item => {
      if (!grouped[item.dealerName]) grouped[item.dealerName] = [];
      grouped[item.dealerName].push(item);
    });

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    let discount = 0;

    if (this.appliedCoupon) {
      const res = window.MediKartData.validateCoupon(this.appliedCoupon.code, cart, subtotal);
      if (res.success) {
        discount = res.discount;
      } else {
        this.appliedCoupon = null;
        window.MediKartApp.toast(res.error, 'error');
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst = discountedSubtotal * ((settings.gstRate || 12) / 100);
    const deliveryFee = window.MediKartData.calculateDeliveryFee(discountedSubtotal, this.selectedDeliveryOption || 'standard');
    const grandTotal = discountedSubtotal + gst + deliveryFee;

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:20px;">Shopping Cart (Grouped by Dealer Pharmacy)</h1>

      <div style="display:grid; grid-template-columns: 1fr 340px; gap:24px;">
        <div>
          ${Object.keys(grouped).map(dealerName => `
            <div class="card" style="margin-bottom:20px;">
              <div style="font-weight:800; font-size:1.05rem; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
                <div><i class="fas fa-store"></i> Dealer Pharmacy: <strong>${dealerName}</strong></div>
                <span class="badge badge-success"><i class="fas fa-certificate"></i> Verified</span>
              </div>

              ${grouped[dealerName].map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed var(--border-color);">
                  <div style="flex:1;">
                    <div style="font-weight:800; font-size:1.05rem;">${item.medicineName}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Packaging: ${item.packaging}</div>
                    <div style="font-size:0.85rem; color:var(--primary); font-weight:700; margin-top:2px;">₹${item.pricePerUnit} per ${item.packageUnit}</div>
                  </div>

                  <!-- Package Unit Quantity Selector -->
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="display:flex; align-items:center; background:var(--bg-input); border-radius:var(--radius-md); padding:4px;">
                      <button class="btn btn-sm" onclick="window.MediKartBuyer.updateCartQty('${item.medicineId}', '${item.dealerName}', ${item.quantity - 1})">-</button>
                      <span style="font-weight:800; padding:0 12px; font-size:0.9rem;">${item.quantity} ${item.packageUnit}</span>
                      <button class="btn btn-sm" onclick="window.MediKartBuyer.updateCartQty('${item.medicineId}', '${item.dealerName}', ${item.quantity + 1})">+</button>
                    </div>

                    <div style="font-weight:800; font-size:1.1rem; min-width:80px; text-align:right; color:var(--text-main);">
                      ₹${item.subtotal.toFixed(2)}
                    </div>

                    <button class="icon-btn" style="color:var(--danger);" onclick="window.MediKartBuyer.removeFromCart('${item.medicineId}', '${item.dealerName}')">
                      <i class="fas fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div style="display:flex; justify-content:space-between; margin-top:16px;">
            <button class="btn btn-outline-secondary" onclick="window.MediKartBuyer.navigate('browse')">
              <i class="fas fa-arrow-left"></i> Continue Shopping
            </button>
            <button class="btn btn-outline-danger" onclick="window.MediKartBuyer.clearCart()">
              <i class="fas fa-trash"></i> Clear Cart
            </button>
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom:16px;">
            <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:14px;">Apply Offer Code</h3>
            
            <div style="display:flex; gap:8px;">
              <input type="text" id="cartCouponInput" class="form-control" placeholder="Coupon Code..." value="${this.appliedCoupon ? this.appliedCoupon.code : ''}" style="text-transform:uppercase;">
              <button class="btn btn-primary" onclick="window.MediKartBuyer.applyCartCoupon(document.getElementById('cartCouponInput').value)">Apply</button>
            </div>

            ${this.appliedCoupon ? `
              <div style="margin-top:10px; background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 12px; border-radius:var(--radius-sm); font-size:0.82rem; color:#166534; display:flex; justify-content:space-between; align-items:center;">
                <div><i class="fas fa-circle-check"></i> Coupon <strong>${this.appliedCoupon.code}</strong> Applied</div>
                <span style="cursor:pointer; font-weight:800;" onclick="window.MediKartBuyer.removeCoupon()">&times;</span>
              </div>
            ` : ''}
          </div>

          <div class="card">
            <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:14px;">Price Summary</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
              <span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span>
            </div>

            ${discount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem; color:var(--success); font-weight:700;">
                <span>Discount (${this.appliedCoupon.code}):</span><span>- ₹${discount.toFixed(2)}</span>
              </div>
            ` : ''}

            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
              <span>GST (${settings.gstRate || 12}%):</span><span>₹${gst.toFixed(2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.9rem;">
              <span>Delivery Charges:</span>
              <span>${deliveryFee === 0 ? '<strong style="color:var(--success);">FREE</strong>' : `₹${deliveryFee}`}</span>
            </div>

            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.25rem; border-top:1px solid var(--border-color); padding-top:12px; margin-top:8px;">
              <span>Grand Total:</span><span style="color:var(--primary);">₹${grandTotal.toFixed(2)}</span>
            </div>

            <button class="btn btn-primary btn-block btn-lg" style="margin-top:20px;" onclick="window.MediKartBuyer.navigate('checkout')">
              <i class="fas fa-lock"></i> Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    `;
  }

  updateCartQty(medId, dealerName, newQty) {
    let cart = window.MediKartData.getCart();
    const item = cart.find(c => c.medicineId === medId && c.dealerName === dealerName);
    if (!item) return;

    if (newQty <= 0) cart = cart.filter(c => !(c.medicineId === medId && c.dealerName === dealerName));
    else {
      const med = window.MediKartData.getMedicines().find(m => m.id === medId);
      if (med && newQty > med.stock) {
        window.MediKartApp.toast(`Only ${med.stock} ${med.packageUnit} available in stock from ${dealerName}.`, 'error');
        item.quantity = med.stock;
      } else {
        item.quantity = newQty;
      }
      item.subtotal = item.quantity * item.pricePerUnit;
    }

    window.MediKartData.saveCart(cart);
    this.renderCart(document.querySelector('#buyer-root #main-content'));
    this.updateBadges();
  }

  removeFromCart(medId, dealerName) {
    let cart = window.MediKartData.getCart();
    cart = cart.filter(c => !(c.medicineId === medId && c.dealerName === dealerName));
    window.MediKartData.saveCart(cart);
    this.renderCart(document.querySelector('#buyer-root #main-content'));
    this.updateBadges();
    window.MediKartApp.toast('Item removed from cart', 'info');
  }

  clearCart() {
    window.MediKartData.saveCart([]);
    this.renderCart(document.querySelector('#buyer-root #main-content'));
    this.updateBadges();
  }

  applyCartCoupon(code) {
    const cart = window.MediKartData.getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const res = window.MediKartData.validateCoupon(code, cart, subtotal);

    if (!res.success) {
      this.appliedCoupon = null;
      window.MediKartApp.toast(res.error, 'error');
      this.renderCart(document.querySelector('#buyer-root #main-content'));
      return;
    }

    this.appliedCoupon = res.coupon;
    window.MediKartApp.toast(`Coupon ${res.coupon.code} applied! Instant savings ₹${res.discount.toFixed(2)}.`, 'success');
    this.renderCart(document.querySelector('#buyer-root #main-content'));
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.renderCart(document.querySelector('#buyer-root #main-content'));
  }

  openInvoice(orderId) {
    const orders = window.MediKartData.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) {
      window.MediKartApp.toast('Invoice not found for that order.', 'error');
      return;
    }

    const items = ord.items || [];
    const subtotal = Number(ord.subtotal) || 0;
    const discount = Number(ord.discount) || 0;

    // Use the rate that was actually charged on this order. Hardcoding 12% here
    // meant the invoice disagreed with the cart whenever the admin changed the
    // GST rate in Settings.
    const gstRate = Number(ord.gstRate) || window.MediKartData.getGstRate();
    const taxable = Math.max(0, subtotal - discount);
    const gst = ord.gst !== undefined && ord.gst !== null
      ? Number(ord.gst)
      : Number((taxable * (gstRate / 100)).toFixed(2));

    // Intra-state supply is split CGST/SGST; inter-state is a single IGST line.
    const buyerState = (ord.addressSnapshot && ord.addressSnapshot.state) || '';
    const dealerRecord = window.MediKartData.getDealers().find(d => d.id === ord.dealerId);
    const sellerState = (dealerRecord && dealerRecord.state) || '';
    const isInterState = !!buyerState && !!sellerState &&
      buyerState.trim().toLowerCase() !== sellerState.trim().toLowerCase();

    const cgst = (gst / 2).toFixed(2);
    const sgst = (gst / 2).toFixed(2);
    const deliveryFee = Number(ord.deliveryFee) || 0;
    const grandTotal = Number(ord.grandTotal) || Number((taxable + gst + deliveryFee).toFixed(2));

    window.MediKartApp.showModal({
      title: `Official Tax Invoice – ${ord.invoiceNumber || ord.id}`,
      content: `
        <div style="font-family:var(--font-family); color:var(--text-main); line-height:1.5;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--primary); padding-bottom:14px; margin-bottom:16px;">
            <div>
              <div style="font-size:1.4rem; font-weight:800; color:var(--primary);"><i class="fas fa-prescription-bottle-alt"></i> MediKart Healthcare</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">India's Verified Pharmacy Marketplace Network</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">GSTIN: <strong>29AAACM9821C1Z5</strong> • Drug Lic: <strong>KA-20B/21B-48102</strong></div>
            </div>

            <div style="text-align:right;">
              <div style="font-size:1.1rem; font-weight:800; color:var(--text-main);">TAX INVOICE</div>
              <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">${ord.invoiceNumber || 'INV-2026-982101'}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">Date: ${ord.orderDate || '2026-07-30'}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px; font-size:0.85rem;">
            <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-md);">
              <div style="font-weight:800; color:var(--primary); margin-bottom:4px;"><i class="fas fa-store"></i> Sold By (Seller Chemist):</div>
              <div style="font-weight:700;">${ord.dealerName || 'Apollo MedShop Pvt Ltd'}</div>
              <div style="color:var(--text-muted); font-size:0.78rem;">Verified Chemist Partner • Regd No: 20B/21B-9842</div>
            </div>

            <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-md);">
              <div style="font-weight:800; color:var(--secondary); margin-bottom:4px;"><i class="fas fa-user"></i> Billed & Shipped To:</div>
              <div style="font-weight:700;">${ord.buyerName || 'Verified Buyer'}</div>
              <div style="color:var(--text-muted); font-size:0.78rem;">${ord.shippingAddress || 'Flat 402, Green Glen Apartments, HSR Layout, Bengaluru'}</div>
            </div>
          </div>

          <table class="table invoice-table">
            <thead>
              <tr>
                <th scope="col">Item Description</th>
                <th scope="col">HSN</th>
                <th scope="col">Qty</th>
                <th scope="col">Rate</th>
                ${isInterState
                  ? `<th scope="col">IGST (${gstRate}%)</th>`
                  : `<th scope="col">CGST (${(gstRate / 2).toFixed(1)}%)</th><th scope="col">SGST (${(gstRate / 2).toFixed(1)}%)</th>`}
                <th scope="col" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr><td colspan="${isInterState ? 6 : 7}" class="table-empty">No line items recorded on this invoice.</td></tr>
              ` : items.map(item => {
                const lineSubtotal = Number(item.subtotal) || 0;
                // Discounts apply at order level; apportion them so the line
                // tax sums back to the order's tax total.
                const share = subtotal > 0 ? lineSubtotal / subtotal : 0;
                const lineTaxable = Math.max(0, lineSubtotal - discount * share);
                const itemGst = lineTaxable * (gstRate / 100);
                return `
                  <tr>
                    <td><strong>${this.esc(item.medicineName)}</strong><div class="invoice-item-sub">${this.esc(item.packaging)}</div></td>
                    <td>3004</td>
                    <td>${item.quantity} ${this.esc(item.packageUnit)}</td>
                    <td>₹${(Number(item.pricePerUnit) || 0).toFixed(2)}</td>
                    ${isInterState
                      ? `<td>₹${itemGst.toFixed(2)}</td>`
                      : `<td>₹${(itemGst / 2).toFixed(2)}</td><td>₹${(itemGst / 2).toFixed(2)}</td>`}
                    <td class="text-right"><strong>₹${lineSubtotal.toFixed(2)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-top:1px solid var(--border-color); padding-top:12px;">
            <div style="font-size:0.78rem; color:var(--text-muted); max-width:60%;">
              <div>• Computer generated tax invoice under Rule 46 of CGST Rules 2017.</div>
              <div>• Statutory Drug License Verified by State Pharmacy Operations.</div>
            </div>

            <div class="invoice-totals">
              <div class="invoice-total-row"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
              ${discount > 0 ? `<div class="invoice-total-row text-success"><span>Discount:</span><span>- ₹${discount.toFixed(2)}</span></div>` : ''}
              ${isInterState
                ? `<div class="invoice-total-row"><span>IGST (${gstRate}%):</span><span>₹${gst.toFixed(2)}</span></div>`
                : `<div class="invoice-total-row"><span>CGST (${(gstRate / 2).toFixed(1)}%):</span><span>₹${cgst}</span></div>
                   <div class="invoice-total-row"><span>SGST (${(gstRate / 2).toFixed(1)}%):</span><span>₹${sgst}</span></div>`}
              ${deliveryFee > 0 ? `<div class="invoice-total-row"><span>Delivery Fee:</span><span>₹${deliveryFee.toFixed(2)}</span></div>` : ''}
              <div class="invoice-total-row invoice-grand-total">
                <span>Total Amount:</span><span>₹${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Tax Invoice</button>
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>
      `
    });
  }

  /* --------------------------------------------------------------------------
     TRANSFORMED HELP & PATIENT SUPPORT CENTER (NON-REPETITIVE UI)
     -------------------------------------------------------------------------- */
  renderHelp(container) {
    container.innerHTML = `
      <div style="background:linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color:white; padding:28px; border-radius:var(--radius-lg); margin-bottom:24px; box-shadow:var(--shadow-md); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
        <div>
          <span class="badge" style="background:rgba(255,255,255,0.2); color:white; padding:4px 12px; font-weight:700; margin-bottom:8px; display:inline-block;"><i class="fas fa-headset"></i> 24/7 PATIENT CARE DESK</span>
          <h1 style="font-size:2rem; font-weight:800; margin:4px 0;">How can we help you today?</h1>
          <p style="opacity:0.95; font-size:0.95rem; margin:0;">Get instant support for order delivery, prescription uploads, and pharmacist consultation.</p>
        </div>

        <button class="btn btn-lg" style="background:white; color:var(--primary); font-weight:800; box-shadow:var(--shadow-sm);" onclick="window.MediKartBuyer.openLiveChatModal()">
          <i class="fas fa-comments"></i> Launch 24/7 AI Support Chat
        </button>
      </div>

      <!-- DISTINCT SERVICE & SLA METRIC CARDS -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-bottom:28px;">
        <div class="card" style="border-left:4px solid var(--primary); display:flex; align-items:center; gap:16px;">
          <div style="width:46px; height:46px; border-radius:var(--radius-md); background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="fas fa-phone-volume"></i>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">INDIA TOLL-FREE (24x7)</div>
            <div style="font-weight:800; font-size:1.05rem; color:var(--text-main);">+91 1800-123-MEDIKART</div>
          </div>
        </div>

        <div class="card" style="border-left:4px solid var(--secondary); display:flex; align-items:center; gap:16px;">
          <div style="width:46px; height:46px; border-radius:var(--radius-md); background:var(--secondary-light); color:var(--secondary); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="fas fa-box-archive"></i>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">TAMPER-PROOF PACKAGING</div>
            <div style="font-weight:800; font-size:1.05rem; color:var(--text-main);">100% Sealed & Private</div>
          </div>
        </div>

        <div class="card" style="border-left:4px solid var(--success); display:flex; align-items:center; gap:16px;">
          <div style="width:46px; height:46px; border-radius:var(--radius-md); background:#d1fae5; color:var(--success); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="fas fa-user-doctor"></i>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">PHARMACIST DESK</div>
            <div style="font-weight:800; font-size:1.05rem; color:var(--text-main);">Licensed Pharmacists</div>
          </div>
        </div>

        <div class="card" style="border-left:4px solid #d97706; display:flex; align-items:center; gap:16px;">
          <div style="width:46px; height:46px; border-radius:var(--radius-md); background:#fef3c7; color:#d97706; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="fas fa-shield-check"></i>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">QUALITY GUARANTEE</div>
            <div style="font-weight:800; font-size:1.05rem; color:var(--text-main);">100% Genuine Meds</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
        <!-- FREQUENTLY ASKED QUESTIONS ACCORDION -->
        <div class="card">
          <h2 class="card-title" style="margin-bottom:16px;"><i class="fas fa-circle-question" style="color:var(--primary);"></i> Frequently Asked Questions</h2>
          
          <div class="faq-item active">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span><i class="fas fa-truck-ramp-box"></i> How do I track my live medicine package?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              Navigate to "My Orders" in the left sidebar to view the 6-stage connected pipeline (Order Placed ➔ Confirmed ➔ Packed ➔ Shipped ➔ Out for Delivery ➔ Delivered) with real-time timestamps.
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span><i class="fas fa-file-prescription"></i> How does doctor prescription (Rx) verification work?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              For Schedule H & H1 controlled medications, upload a clear picture or PDF of your doctor's prescription during checkout. A licensed registered pharmacist from the partner pharmacy verifies it before packing.
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span><i class="fas fa-rotate-left"></i> What is MediKart's return & refund policy?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              If medicines arrive damaged, expired, or incorrect, you can request a 100% refund within 7 days of delivery. Refunds are credited to your original payment method in 24-48 hours.
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span><i class="fas fa-snowflake"></i> How are cold-chain medicines (insulins, vaccines) delivered?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              Insulins, biologics, and vaccines are packed in specialized insulated thermal boxes with gel ice-packs to maintain strict 2°C to 8°C cold-chain temperature monitoring throughout transit.
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span><i class="fas fa-receipt"></i> How do I download tax invoices for insurance claims?</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
              Open "My Orders", find your completed order, and click "View Tax Invoice". You can print or download an official GST tax invoice containing pharmacy GSTIN, HSN codes, and drug license details.
            </div>
          </div>
        </div>

        <!-- SUBMIT SUPPORT TICKET -->
        <div class="card">
          <h2 class="card-title" style="margin-bottom:14px;"><i class="fas fa-ticket" style="color:var(--secondary);"></i> Submit Support Ticket</h2>
          <form onsubmit="event.preventDefault(); window.MediKartBuyer.submitSupportTicketForm(this);">
            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-weight:700; font-size:0.84rem;">Issue Category</label>
              <select id="ticketCategory" class="form-control" required>
                <option value="Order Delivery Delay">Order Delivery Delay</option>
                <option value="Prescription Upload Issue">Prescription Upload Issue</option>
                <option value="Damaged or Wrong Item">Damaged or Wrong Item</option>
                <option value="Payment or Refund Inquiry">Payment or Refund Inquiry</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-weight:700; font-size:0.84rem;">Subject *</label>
              <input type="text" id="ticketSubject" class="form-control" placeholder="Brief issue title" required>
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-weight:700; font-size:0.84rem;">Order Reference (Optional)</label>
              <input type="text" id="ticketOrderId" class="form-control" placeholder="e.g. ORD-982101">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-weight:700; font-size:0.84rem;">Detailed Description *</label>
              <textarea id="ticketDesc" class="form-control" rows="4" placeholder="Describe your query..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="width:100%; font-weight:800;">
              <i class="fas fa-paper-plane"></i> Submit Ticket
            </button>
          </form>
        </div>
      </div>
    `;
  }

  submitSupportTicketForm(form) {
    const category = document.getElementById('ticketCategory').value;
    const subject = document.getElementById('ticketSubject').value;
    const orderId = document.getElementById('ticketOrderId').value;
    const desc = document.getElementById('ticketDesc').value;

    const buyer = this.getBuyerUser();
    const res = window.MediKartData.createSupportTicket(buyer.id, category, subject, desc, orderId);

    if (res.success) {
      window.MediKartApp.toast(`Support ticket #${res.ticket.id} created and saved successfully!`, 'success');
      form.reset();
    }
  }

  openLiveChatModal() {
    window.MediKartApp.showModal({
      title: 'MediKart 24/7 Live Patient Support Agent',
      content: `
        <div style="display:flex; flex-direction:column; gap:12px; max-height:350px; overflow-y:auto; padding:10px; background:var(--bg-input); border-radius:var(--radius-md);">
          <div style="background:var(--bg-surface); padding:10px 14px; border-radius:12px; max-width:80%; font-size:0.88rem; box-shadow:var(--shadow-sm);">
            <strong>🤖 MediKart AI Assistant:</strong><br>
            Hello! Welcome to MediKart Support. How can I assist you with your medicine order, prescription upload, or delivery today?
          </div>

          <div style="background:var(--primary); color:white; padding:10px 14px; border-radius:12px; max-width:80%; align-self:flex-end; font-size:0.88rem;">
            Hi, I want to check the status of my order ORD-982101 and tax invoice.
          </div>

          <div style="background:var(--bg-surface); padding:10px 14px; border-radius:12px; max-width:80%; font-size:0.88rem; box-shadow:var(--shadow-sm);">
            <strong>🤖 MediKart AI Assistant:</strong><br>
            Order ORD-982101 is currently <strong>Shipped (In-Transit)</strong> from Apollo MedShop. Expected delivery is tomorrow by 2:00 PM! You can click "View Tax Invoice" under My Orders for the printable GST bill.
          </div>
        </div>

        <div style="display:flex; gap:8px; margin-top:14px;">
          <input type="text" class="form-control" placeholder="Type your message here..." style="flex:1;">
          <button class="btn btn-primary" onclick="window.MediKartApp.toast('Message sent to support agent!', 'info')"><i class="fas fa-paper-plane"></i></button>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close Chat</button>
      `
    });
  }

  /* NOTE: an earlier duplicate renderProfile() lived here. Two definitions of
     the same method existed in this class, so the second silently replaced
     this one and it was dead code. The live implementation is further below. */

  addToCart(medId) {
    const medicines = window.MediKartData.getMedicines();
    const med = medicines.find(m => m.id === medId);
    if (!med) return;

    let cart = window.MediKartData.getCart();
    const existing = cart.find(c => c.medicineId === medId && c.dealerName === med.dealerName);

    if (existing) {
      existing.quantity += 1;
      existing.subtotal = existing.quantity * existing.pricePerUnit;
    } else {
      cart.push({
        medicineId: med.id,
        medicineName: med.name,
        dealerName: med.dealerName,
        pricePerUnit: med.sellingPrice,
        packaging: med.packaging,
        packageUnit: med.packageUnit,
        quantity: 1,
        subtotal: med.sellingPrice
      });
    }

    window.MediKartData.saveCart(cart);
    this.updateBadges();
    window.MediKartApp.toast(`Added 1 ${med.packageUnit} of ${med.name} to Cart!`, 'success');
  }

  /* --------------------------------------------------------------------------
     12. CHECKOUT WORKFLOW (4 CLEAR STEPS)
     -------------------------------------------------------------------------- */
  renderCheckout(container) {
    const cart = window.MediKartData.getCart();
    const buyer = this.getBuyerUser();
    const settings = window.MediKartData.getSettings();

    if (cart.length === 0 && this.checkoutStep !== 5) {
      this.navigate('cart');
      return;
    }

    const hasRxItems = cart.some(i => i.prescriptionRequired || i.rxRequired);
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    let discount = 0;
    if (this.appliedCoupon) {
      const res = window.MediKartData.validateCoupon(this.appliedCoupon.code, cart, subtotal);
      if (res.success) discount = res.discount;
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst = discountedSubtotal * ((settings.gstRate || 12) / 100);
    const deliveryFee = window.MediKartData.calculateDeliveryFee(discountedSubtotal, this.selectedDeliveryOption || 'standard');
    const grandTotal = discountedSubtotal + gst + deliveryFee;

    container.innerHTML = `
      <div class="checkout-steps-bar" style="margin-bottom:24px;">
        <div class="checkout-step-item ${this.checkoutStep === 1 ? 'active' : this.checkoutStep > 1 ? 'completed' : ''}">
          <div class="step-num">${this.checkoutStep > 1 ? '✓' : '1'}</div>
          <span>1. Address</span>
        </div>
        <div class="checkout-step-item ${this.checkoutStep === 2 ? 'active' : this.checkoutStep > 2 ? 'completed' : ''}">
          <div class="step-num">${this.checkoutStep > 2 ? '✓' : '2'}</div>
          <span>2. Review</span>
        </div>
        <div class="checkout-step-item ${this.checkoutStep === 3 ? 'active' : this.checkoutStep > 3 ? 'completed' : ''}">
          <div class="step-num">${this.checkoutStep > 3 ? '✓' : '3'}</div>
          <span>3. Prescription ${hasRxItems ? '(Mandatory)' : '(Optional)'}</span>
        </div>
        <div class="checkout-step-item ${this.checkoutStep === 4 ? 'active' : this.checkoutStep > 4 ? 'completed' : ''}">
          <div class="step-num">${this.checkoutStep > 4 ? '✓' : '4'}</div>
          <span>4. Delivery & Payment</span>
        </div>
        <div class="checkout-step-item ${this.checkoutStep === 5 ? 'active' : ''}">
          <div class="step-num">5</div>
          <span>5. Confirmation</span>
        </div>
      </div>

      <!-- STEP 1: DELIVERY ADDRESS -->
      ${this.checkoutStep === 1 ? `
        <div class="card">
          <h2 style="font-weight:800; font-size:1.25rem; margin-bottom:16px;">Step 1: Select Delivery Address</h2>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:24px;">
            ${(buyer.addresses || []).map(addr => `
              <div class="address-card ${this.selectedAddressId === addr.id ? 'default-address' : ''}" style="cursor:pointer;" onclick="window.MediKartBuyer.selectedAddressId='${addr.id}'; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <strong style="font-size:1rem;">${addr.name}</strong>
                  <span class="badge badge-info">${addr.tag}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted);">${addr.line}, ${addr.city}, ${addr.state} - ${addr.pincode}</div>
                <div style="font-size:0.82rem; color:var(--text-main); margin-top:8px;">Phone: ${addr.mobile}</div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:space-between;">
            <button class="btn btn-outline-primary" onclick="window.MediKartBuyer.openAddAddressModal()">
              <i class="fas fa-plus"></i> Add New Address
            </button>

            <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.checkoutStep=2; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
              Continue to Review Order <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 2: REVIEW ORDER -->
      ${this.checkoutStep === 2 ? `
        <div class="card">
          <h2 style="font-weight:800; font-size:1.25rem; margin-bottom:16px;">Step 2: Review Order (Grouped by Pharmacy Dealer)</h2>

          <div style="background:var(--bg-input); padding:16px; border-radius:var(--radius-md); margin-bottom:20px;">
            <h3 style="font-size:0.95rem; font-weight:800;">Selected Shipping Address</h3>
            ${(() => {
              const a = (buyer.addresses || []).find(x => x.id === this.selectedAddressId) || (buyer.addresses && buyer.addresses[0]) || { name: 'Buyer', line: 'Flat 402, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', mobile: '+91 98765 12345' };
              return `<p style="font-size:0.88rem; color:var(--text-muted); margin-top:4px;">${a.name} • ${a.line}, ${a.city}, ${a.state} - ${a.pincode} (Phone: ${a.mobile})</p>`;
            })()}
          </div>

          <div class="table-responsive" style="margin-bottom:20px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dealer Pharmacy</th>
                  <th>Packaging</th>
                  <th>Rx Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${cart.map(item => `
                  <tr>
                    <td><strong>${item.medicineName}</strong></td>
                    <td><span class="badge badge-info">${item.dealerName}</span></td>
                    <td>${item.packaging}</td>
                    <td>${item.prescriptionRequired || item.rxRequired ? '<span class="badge badge-danger">Rx Required</span>' : '<span class="badge badge-success">OTC</span>'}</td>
                    <td>${item.quantity} ${item.packageUnit}</td>
                    <td>₹${item.pricePerUnit}</td>
                    <td><strong>₹${item.subtotal.toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:space-between;">
            <button class="btn btn-outline-secondary" onclick="window.MediKartBuyer.checkoutStep=1; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
              <i class="fas fa-arrow-left"></i> Back to Address
            </button>

            <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.checkoutStep=3; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
              Proceed to Prescription Step <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 3: PRESCRIPTION UPLOAD (Rx MANDATORY WORKFLOW) -->
      ${this.checkoutStep === 3 ? `
        <div class="card">
          <h2 style="font-weight:800; font-size:1.25rem; margin-bottom:16px;">
            Step 3: Doctor Prescription Verification ${hasRxItems ? '<span class="badge badge-danger" style="margin-left:8px;">Mandatory Rx Step</span>' : ''}
          </h2>

          ${hasRxItems ? `
            <div class="alert alert-warning" style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:16px; border-radius:12px; margin-bottom:20px; font-weight:700; display:flex; align-items:center; gap:12px;">
              <i class="fas fa-file-prescription" style="font-size:1.4rem;"></i>
              <div>
                <strong>Schedule H / H1 Prescription Medicine Detected in Cart:</strong><br>
                Under State Pharmacy Regulations, you must upload a valid doctor's prescription (PDF, JPG, JPEG, PNG) to purchase Schedule H/Rx medications. The pharmacy dealer will review your prescription before packing.
              </div>
            </div>

            <div style="border:2px dashed var(--primary); border-radius:var(--radius-md); padding:30px; text-align:center; background:var(--bg-input); margin-bottom:24px;">
              <i class="fas fa-cloud-arrow-up" style="font-size:2.5rem; color:var(--primary); margin-bottom:12px;"></i>
              <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:6px;">Upload Doctor Prescription File</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">Accepted formats: PDF, JPG, JPEG, PNG (Max 10MB demo limit)</p>
              
              <input type="file" id="prescriptionFileInput" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" onchange="window.MediKartBuyer.handlePrescriptionFileSelected(this)">
              <button class="btn btn-primary" onclick="document.getElementById('prescriptionFileInput').click()">
                <i class="fas fa-file-arrow-up"></i> Choose Prescription File
              </button>

              <div id="rxUploadPreview" style="margin-top:16px; font-weight:700; color:var(--primary);">
                ${this.prescriptionUploadData ? `
                  <div style="background:var(--primary-light); padding:10px; border-radius:var(--radius-sm); display:inline-flex; align-items:center; gap:8px;">
                    <i class="fas fa-file-circle-check"></i> ${this.prescriptionUploadData.fileName} (${this.prescriptionUploadData.fileType})
                  </div>
                ` : 'No file selected yet.'}
              </div>
            </div>
          ` : `
            <div class="card text-center" style="padding:30px; background:#f0fdf4; border-color:#bbf7d0; color:#166534; margin-bottom:24px;">
              <i class="fas fa-circle-check" style="font-size:2.5rem; margin-bottom:10px;"></i>
              <h3 style="font-weight:800;">No Doctor Prescription Required</h3>
              <p style="font-size:0.9rem;">All items in your cart are Over-The-Counter (OTC) remedies. You can proceed directly to delivery & payment.</p>
            </div>
          `}

          <div style="display:flex; justify-content:space-between;">
            <button class="btn btn-outline-secondary" onclick="window.MediKartBuyer.checkoutStep=2; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
              <i class="fas fa-arrow-left"></i> Back to Review
            </button>

            <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.validatePrescriptionStepAndProceed(${hasRxItems})">
              Continue to Delivery & Payment <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 4: DELIVERY OPTIONS & DEMO PAYMENT -->
      ${this.checkoutStep === 4 ? `
        <div class="card">
          <h2 style="font-weight:800; font-size:1.25rem; margin-bottom:16px;">Step 4: Delivery Method & Demo Payment</h2>

          <!-- Centralized Delivery Option Selection -->
          <div style="margin-bottom:24px;">
            <h3 style="font-size:0.95rem; font-weight:800; margin-bottom:10px;">Select Delivery Option (Admin Configured Rates)</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">
              <div class="card" style="cursor:pointer; border-color:${(this.selectedDeliveryOption || 'standard') === 'standard' ? 'var(--primary)' : 'var(--border-color)'}; background:${(this.selectedDeliveryOption || 'standard') === 'standard' ? 'var(--primary-light)' : 'var(--bg-surface)'};" onclick="window.MediKartBuyer.selectedDeliveryOption='standard'; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
                <div style="font-weight:800;"><i class="fas fa-truck"></i> Standard Delivery</div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Delivered in 24-48 hours</div>
                <div style="font-weight:800; color:var(--primary); margin-top:6px;">
                  ${window.MediKartData.calculateDeliveryFee(discountedSubtotal, 'standard') === 0 ? 'FREE (Orders > ₹' + (settings.freeDeliveryThreshold || 500) + ')' : '₹' + (settings.deliveryFee || 45)}
                </div>
              </div>

              <div class="card" style="cursor:pointer; border-color:${this.selectedDeliveryOption === 'express' ? 'var(--primary)' : 'var(--border-color)'}; background:${this.selectedDeliveryOption === 'express' ? 'var(--primary-light)' : 'var(--bg-surface)'};" onclick="window.MediKartBuyer.selectedDeliveryOption='express'; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
                <div style="font-weight:800;"><i class="fas fa-bolt" style="color:var(--warning);"></i> Express Priority Delivery</div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Same Day / 12 Hours Delivery</div>
                <div style="font-weight:800; color:var(--primary); margin-top:6px;">
                  ₹${settings.expressDeliveryFee || 95}
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method Selector -->
          <div style="margin-bottom:24px;">
            <h3 style="font-size:0.95rem; font-weight:800; margin-bottom:10px;">Select Payment Method</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:12px;">
              ${['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'].map(pm => `
                <div class="card text-center" style="cursor:pointer; padding:14px; border-color:${(this.selectedPaymentMethod || 'UPI') === pm ? 'var(--primary)' : 'var(--border-color)'}; background:${(this.selectedPaymentMethod || 'UPI') === pm ? 'var(--primary-light)' : 'var(--bg-surface)'};" onclick="window.MediKartBuyer.selectedPaymentMethod='${pm}'; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
                  <i class="fas ${pm === 'UPI' ? 'fa-mobile-screen-button' : pm.includes('Card') ? 'fa-credit-card' : pm === 'Net Banking' ? 'fa-building-columns' : 'fa-money-bill-wave'}" style="font-size:1.5rem; color:var(--primary); margin-bottom:6px;"></i>
                  <div style="font-weight:800; font-size:0.9rem;">${pm}</div>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${pm === 'Cash on Delivery' ? 'Pay on arrival' : 'Instant Checkout'}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Payment Failure Simulator Toggle -->
          <div style="background:var(--bg-input); padding:12px 16px; border-radius:var(--radius-md); margin-bottom:20px; display:flex; align-items:center; gap:10px;">
            <input type="checkbox" id="simulatePaymentFailToggle" ${this.simulatePaymentFail ? 'checked' : ''} onchange="window.MediKartBuyer.simulatePaymentFail = this.checked">
            <label for="simulatePaymentFailToggle" style="font-size:0.88rem; font-weight:700; cursor:pointer; color:var(--danger);">
              <i class="fas fa-flask"></i> Test Mode: Simulate Payment Gateway Failure
            </label>
          </div>

          <div style="display:flex; justify-content:space-between;">
            <button class="btn btn-outline-secondary" onclick="window.MediKartBuyer.checkoutStep=3; window.MediKartBuyer.renderCheckout(document.querySelector('#buyer-root #main-content'));">
              <i class="fas fa-arrow-left"></i> Back to Prescription
            </button>

            <button class="btn btn-success btn-lg" onclick="window.MediKartBuyer.completeOrderPlacement(${grandTotal}, ${subtotal}, ${gst}, ${deliveryFee}, ${discount})">
              <i class="fas fa-check-circle"></i> Place Order (₹${grandTotal.toFixed(2)})
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 5: CONFIRMATION -->
      ${this.checkoutStep === 5 && this.placedOrder ? `
        <div class="card text-center" style="padding:40px;">
          <div style="font-size:4rem; color:var(--success); margin-bottom:12px;"><i class="fas fa-circle-check"></i></div>
          <h1 style="font-size:2rem; font-weight:800; color:var(--success);">Order Confirmed & Placed Successfully!</h1>
          <p style="color:var(--text-muted); font-size:1rem; margin-bottom:24px;">Your order has been confirmed and routed to verified pharmacy dealers for fulfillment.</p>

          <div style="max-width:520px; margin:0 auto; background:var(--bg-input); padding:20px; border-radius:var(--radius-md); text-align:left; font-size:0.9rem; margin-bottom:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span>Order Status:</span>
              <span class="badge badge-success" style="font-size:0.85rem; padding:6px 12px;"><i class="fas fa-circle-check"></i> Confirmed & Placed</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Parent Order ID:</span><strong>${this.placedOrder.id}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Tax Invoice Number:</span><strong>${this.placedOrder.invoiceNumber}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Payment Reference:</span><code>${this.placedOrder.transactionRef || 'PAY-884210'}</code></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Payment Method / Status:</span><strong>${this.placedOrder.paymentMethod} (${this.placedOrder.paymentStatus})</strong></div>
            ${this.placedOrder.rxStatus ? `<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Prescription Status:</span><strong style="color:var(--warning);">${this.placedOrder.rxStatus}</strong></div>` : ''}
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Estimated Delivery:</span><strong style="color:var(--primary);">${this.placedOrder.expectedDelivery}</strong></div>
          </div>

          <div style="display:flex; justify-content:center; gap:16px;">
            <button class="btn btn-primary btn-lg" onclick="window.MediKartBuyer.navigate('orders')">
              <i class="fas fa-box"></i> View My Orders & Tracking
            </button>
            <button class="btn btn-outline-secondary btn-lg" onclick="window.MediKartBuyer.navigate('browse')">
              Continue Shopping
            </button>
          </div>
        </div>
      ` : ''}
    `;
  }

  handlePrescriptionFileSelected(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.prescriptionUploadData = {
        fileName: file.name,
        fileType: file.type || 'Document',
        uploadTime: new Date().toISOString()
      };
      window.MediKartApp.toast(`Prescription file "${file.name}" selected!`, 'success');
      this.renderCheckout(document.querySelector('#buyer-root #main-content'));
    }
  }

  validatePrescriptionStepAndProceed(hasRxItems) {
    if (hasRxItems && !this.prescriptionUploadData) {
      window.MediKartApp.toast('Prescription Upload Mandatory: Please upload a prescription file before continuing.', 'error');
      return;
    }
    this.checkoutStep = 4;
    this.renderCheckout(document.querySelector('#buyer-root #main-content'));
  }

  /* Sequential, collision-free order id. The previous implementation used
     `Math.random()` over an 8,000-value range with no uniqueness check, so
     duplicate order ids were inevitable. */
  generateOrderId(existingOrders) {
    const used = new Set((existingOrders || []).map(o => o.id));
    let maxSeq = 0;
    used.forEach(id => {
      const m = /^ORD-(\d+)$/.exec(id || '');
      if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
    });

    let next = Math.max(maxSeq, 980000) + 1;
    while (used.has(`ORD-${next}`)) next++;
    return `ORD-${next}`;
  }

  completeOrderPlacement(grandTotal, subtotal, gst, deliveryFee, discount) {
    const data = window.MediKartData;

    // Snapshot for rollback: stock is mutated before the order record exists,
    // so a later failure must not leave inventory permanently destroyed.
    let stockSnapshot = null;

    try {
      const cart = data.getCart();
      if (cart.length === 0) {
        window.MediKartApp.toast('Your cart is empty.', 'error');
        this.navigate('cart');
        return;
      }

      const allMeds = data.getMedicines();
      const allDealers = data.getDealers();
      const buyerUser = this.getBuyerUser();
      const addresses = buyerUser.addresses || [];
      const selectedAddr =
        addresses.find(a => a.id === this.selectedAddressId) ||
        addresses.find(a => a.isDefault) ||
        addresses[0];

      if (!selectedAddr) {
        window.MediKartApp.toast('Please add a delivery address before placing your order.', 'error');
        this.navigate('addresses');
        return;
      }

      const dealerById = {};
      allDealers.forEach(d => { dealerById[d.id] = d; });

      // 1. RE-VALIDATE EVERY CART LINE BEFORE TOUCHING INVENTORY
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const med = allMeds.find(m => m.id === (item.listingId || item.medicineId));

        if (!med) {
          window.MediKartApp.toast(`Checkout error: "${item.medicineName}" is no longer available on the marketplace.`, 'error');
          return;
        }

        if (med.status !== 'Approved') {
          window.MediKartApp.toast(`Checkout error: "${med.name}" is not currently published for sale.`, 'error');
          return;
        }

        const dealer = dealerById[item.dealerId || med.dealerId];
        if (!dealer) {
          window.MediKartApp.toast(`Checkout error: the pharmacy selling "${med.name}" could not be found.`, 'error');
          return;
        }

        // No exemptions. The previous version whitelisted four dealer ids,
        // letting suspended/rejected pharmacies fulfil orders anyway.
        if (dealer.status !== 'approved') {
          window.MediKartApp.toast(`Checkout error: "${dealer.businessName}" is not currently active to fulfil orders.`, 'error');
          return;
        }

        if (med.stock < item.quantity) {
          window.MediKartApp.toast(`Checkout error: only ${med.stock} ${med.packageUnit} of ${med.name} available from ${dealer.businessName}.`, 'error');
          return;
        }
      }

      // Payment failure simulation runs BEFORE any inventory mutation.
      if (this.simulatePaymentFail) {
        window.MediKartApp.toast('PAYMENT FAILURE TEST: payment declined. No stock was deducted and no order was created.', 'error');
        return;
      }

      const payMethod = this.selectedPaymentMethod || 'UPI';
      const isCOD = payMethod === 'Cash on Delivery';
      const payStatus = isCOD ? 'Cash on Delivery' : 'Paid';
      const txRef = `${isCOD ? 'COD' : 'PAY'}-${Date.now().toString(36).toUpperCase()}`;

      const hasRx = cart.some(i => i.prescriptionRequired || i.rxRequired);
      if (hasRx && !this.prescriptionUploadData) {
        window.MediKartApp.toast('A prescription is required for one or more items in your cart.', 'error');
        this.checkoutStep = 3;
        this.renderCheckout(document.querySelector('#buyer-root #main-content'));
        return;
      }
      const rxData = hasRx ? this.prescriptionUploadData : null;

      // 2. DEDUCT INVENTORY (snapshot first so it can be undone)
      stockSnapshot = cart.map(item => {
        const med = allMeds.find(m => m.id === (item.listingId || item.medicineId));
        return med ? { id: med.id, stock: med.stock, historyLength: (med.restockHistory || []).length } : null;
      }).filter(Boolean);

      cart.forEach(item => {
        const med = allMeds.find(m => m.id === (item.listingId || item.medicineId));
        if (!med) return;
        med.stock = Math.max(0, med.stock - item.quantity);
        if (!med.restockHistory) med.restockHistory = [];
        med.restockHistory.unshift({
          id: `rst-${Date.now()}-${med.id}`,
          date: new Date().toISOString().split('T')[0],
          change: `-${item.quantity} ${med.packageUnit}`,
          type: 'Sale',
          stockAfter: med.stock,
          notes: 'Marketplace Order Purchase'
        });
      });

      data.saveMedicines(allMeds);

      // 3. GROUP CART LINES BY SELLING PHARMACY
      const groupedByDealer = {};
      cart.forEach(item => {
        const med = allMeds.find(m => m.id === (item.listingId || item.medicineId));
        const dId = item.dealerId || (med && med.dealerId);
        if (!dId) return;
        if (!groupedByDealer[dId]) groupedByDealer[dId] = [];
        groupedByDealer[dId].push({ ...item, dealerId: dId });
      });

      const orders = data.getOrders();
      const ordId = this.generateOrderId(orders);
      const invId = `INV-2026-${ordId.replace('ORD-', '')}`;
      const today = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const shippingStr = [selectedAddr.line, selectedAddr.city, selectedAddr.state]
        .filter(Boolean).join(', ') + (selectedAddr.pincode ? ` - ${selectedAddr.pincode}` : '');

      const gstRate = data.getGstRate();
      const subOrders = [];
      const pendingNotifications = [];
      let letterIndex = 0;

      Object.keys(groupedByDealer).forEach(dId => {
        const dItems = groupedByDealer[dId];
        const dObj = dealerById[dId];
        const subtotalD = Number(dItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0).toFixed(2));
        const subOrdId = `${ordId}-${String.fromCharCode(65 + letterIndex)}`;
        letterIndex++;

        const subHasRx = dItems.some(i => i.prescriptionRequired || i.rxRequired);

        subOrders.push({
          subOrderId: subOrdId,
          parentOrderId: ordId,
          invoiceNumber: invId,
          dealerId: dId,
          dealerName: dObj ? dObj.businessName : dItems[0].dealerName,
          buyerId: buyerUser.id,
          buyerName: buyerUser.name,
          buyerEmail: buyerUser.email,
          shippingAddress: shippingStr,
          items: dItems,
          subtotal: subtotalD,
          status: 'Placed',
          paymentMethod: payMethod,
          paymentStatus: payStatus,
          transactionRef: txRef,
          rxStatus: subHasRx ? 'Pending' : 'N/A',
          rxData: subHasRx ? rxData : null,
          orderDate: today,
          timestamps: { Placed: `${today} ${timeStr}` }
        });

        pendingNotifications.push({
          id: `notif-neword-${Date.now()}-${dId}`,
          dealerId: dId,
          category: 'New Order Received',
          title: `New Order ${subOrdId}`,
          message: `New order from ${buyerUser.name} for ${dItems.length} item(s) — ₹${subtotalD.toFixed(2)}.${subHasRx ? ' Prescription review required.' : ''}`,
          time: 'Just now',
          read: false
        });
      });

      const newOrder = {
        id: ordId,
        invoiceNumber: invId,
        buyerId: buyerUser.id,
        buyerName: buyerUser.name,
        buyerEmail: buyerUser.email,
        orderDate: today,
        dealerId: Object.keys(groupedByDealer)[0],
        dealerName: subOrders.map(s => s.dealerName).filter((v, i, a) => a.indexOf(v) === i).join(', '),
        items: cart,
        subOrders: subOrders,
        totalUnits: cart.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: subtotal,
        discount: discount,
        gstRate: gstRate,
        gst: gst,
        deliveryFee: deliveryFee,
        grandTotal: grandTotal,
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        transactionRef: txRef,
        rxStatus: hasRx ? 'Pending' : 'N/A',
        rxData: rxData,
        status: 'Placed',
        expectedDelivery: this.selectedDeliveryOption === 'express' ? 'Today (Express)' : 'Tomorrow (Standard)',
        shippingAddress: shippingStr,
        addressSnapshot: selectedAddr,
        timestamps: { Placed: `${today} ${timeStr}` }
      };

      orders.unshift(newOrder);
      data.saveOrders(orders);

      // Notifications written once, after the order is safely persisted.
      const notifs = data.getNotifications();
      pendingNotifications.forEach(n => notifs.unshift(n));
      data.saveNotifications(notifs);

      data.saveCart([]);
      this.placedOrder = newOrder;
      this.checkoutStep = 5;
      this.prescriptionUploadData = null;
      this.appliedCoupon = null;
      this.updateBadges();

      window.MediKartApp.toast('Order confirmed and placed successfully.', 'success');
      this.renderCheckout(document.querySelector('#buyer-root #main-content'));
    } catch (err) {
      console.error('Order placement execution error:', err);

      // ROLLBACK: restore the stock levels and remove the sale rows we added.
      if (stockSnapshot) {
        try {
          const meds = data.getMedicines();
          stockSnapshot.forEach(snap => {
            const med = meds.find(m => m.id === snap.id);
            if (!med) return;
            med.stock = snap.stock;
            if (med.restockHistory && med.restockHistory.length > snap.historyLength) {
              med.restockHistory = med.restockHistory.slice(med.restockHistory.length - snap.historyLength);
            }
          });
          data.saveMedicines(meds);
        } catch (rollbackErr) {
          console.error('Stock rollback failed:', rollbackErr);
        }
      }

      window.MediKartApp.toast('We could not complete your order. Your cart and stock are unchanged — please try again.', 'error');
    }
  }

  /* --------------------------------------------------------------------------
     13. MY ORDERS PAGE & UNIFIED 6-STAGE TIMELINE
     -------------------------------------------------------------------------- */
  /* Orders belonging to the signed-in buyer. This previously hardcoded the demo
     buyer's id, so every other customer saw someone else's order history. */
  getMyOrders(limit = null) {
    const me = this.getBuyerUser();
    const mine = window.MediKartData.getOrders().filter(o =>
      (me.id && o.buyerId === me.id) ||
      (me.email && (o.buyerEmail || '').toLowerCase() === me.email.toLowerCase())
    );
    return limit ? mine.slice(0, limit) : mine;
  }

  renderOrders(container) {
    const orders = this.getMyOrders(10);

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-box" style="color:var(--primary);"></i> My Orders</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Track live status across the unified 6-stage marketplace timeline.</p>

      ${orders.length === 0 ? `
        <div class="card text-center" style="padding:40px;">
          <h3>No Orders Placed Yet</h3>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="window.MediKartBuyer.navigate('browse')">Start Shopping</button>
        </div>
      ` : orders.map(ord => `
        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <strong style="font-size:1.1rem; color:var(--primary);">Order #${ord.id}</strong>
              <span style="font-size:0.85rem; color:var(--text-muted); margin-left:8px;">${ord.orderDate}</span>
            </div>
            <div>
              ${['Placed', 'Accepted'].includes(ord.status) ? `
                <button class="btn btn-xs btn-outline-danger" style="margin-right:6px;" onclick="window.MediKartBuyer.cancelBuyerOrder('${ord.id}')">
                  <i class="fas fa-ban"></i> Cancel Order
                </button>
              ` : ''}
              ${ord.status === 'Delivered' ? `
                <button class="btn btn-xs btn-outline-warning" style="margin-right:6px;" onclick="window.MediKartBuyer.openRefundModal('${ord.id}')">
                  <i class="fas fa-rotate-left"></i> Request Refund
                </button>
              ` : ''}
            </div>
          </div>
          ${window.MediKartTimeline.renderTimelineHTML(ord, 'buyer')}
        </div>
      `).join('')}
    `;
  }

  cancelBuyerOrder(orderId) {
    window.MediKartApp.showConfirm({
      title: 'Cancel Order',
      message: `Cancel order ${orderId}? The reserved stock will be returned to the pharmacy. This cannot be undone.`,
      confirmLabel: 'Cancel Order',
      danger: true,
      onConfirm: () => {
        const res = window.MediKartData.cancelOrder(orderId);
        if (!res.success) {
          window.MediKartApp.toast(res.error, 'error');
          return;
        }
        window.MediKartApp.toast(`Order ${orderId} cancelled. Inventory restored.`, 'success');
        this.renderOrders(document.querySelector('#buyer-root #main-content'));
      }
    });
  }

  openRefundModal(orderId) {
    window.MediKartApp.showModal({
      title: `Request Refund — Order #${orderId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Reason for Refund *</label>
          <select id="refundReasonSelect" class="form-control" required>
            <option value="Wrong medicine received">Wrong medicine received</option>
            <option value="Damaged package">Damaged package</option>
            <option value="Incorrect quantity">Incorrect quantity</option>
            <option value="Quality or Expiry Issue">Quality or Expiry Issue</option>
          </select>
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Additional Details / Notes</label>
          <textarea id="refundNotesInput" class="form-control" rows="3" placeholder="Provide extra details for customer desk review..."></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-warning" onclick="window.MediKartBuyer.saveRefundRequest('${orderId}')">Submit Refund Request</button>
      `
    });
  }

  saveRefundRequest(orderId) {
    const reason = document.getElementById('refundReasonSelect').value;
    const notes = document.getElementById('refundNotesInput').value;
    const buyer = this.getBuyerUser();

    const res = window.MediKartData.requestRefund(orderId, buyer.id, reason, notes);
    if (res.success) {
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Refund request ${res.refund.id} submitted for Order #${orderId}!`, 'success');
      this.renderOrders(document.querySelector('#buyer-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     14. PURCHASE HISTORY PAGE
     -------------------------------------------------------------------------- */
  renderHistory(container) {
    const orders = this.getMyOrders().filter(o => o.status === 'Delivered');

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-history" style="color:var(--secondary);"></i> Purchase History</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">View past completed invoices and reorder medicines in 1 click.</p>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Dealer</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(ord => `
              <tr>
                <td><strong>${ord.invoiceNumber || ord.id}</strong></td>
                <td>${ord.dealerName}</td>
                <td>${ord.paymentMethod}</td>
                <td><strong style="color:var(--primary); font-size:1.05rem;">₹${ord.grandTotal.toFixed(2)}</strong></td>
                <td>${ord.orderDate}</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="window.MediKartBuyer.reorderItems('${ord.id}')">
                    <i class="fas fa-rotate-right"></i> Reorder
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  reorderItems(orderId) {
    const orders = window.MediKartData.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    let cart = window.MediKartData.getCart();
    ord.items.forEach(item => cart.push({ ...item }));

    window.MediKartData.saveCart(cart);
    this.updateBadges();
    window.MediKartApp.toast(`Reordered items from Invoice ${ord.invoiceNumber || ord.id}!`, 'success');
    this.navigate('cart');
  }

  /* --------------------------------------------------------------------------
     15. WISHLIST VIEW
     -------------------------------------------------------------------------- */
  renderWishlist(container) {
    const wishlistIds = window.MediKartData.getWishlist();
    const medicines = window.MediKartData.getMedicines().filter(m => wishlistIds.includes(m.id));

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-heart" style="color:var(--danger);"></i> Saved Wishlist</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Your saved prescription and OTC medications.</p>

      ${medicines.length === 0 ? `
        <div class="card text-center" style="padding:40px;">
          <h3>Your Wishlist is Empty</h3>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="window.MediKartBuyer.navigate('browse')">Browse Marketplace</button>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
          ${medicines.map(m => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <img src="${m.image}" alt="${m.name}" style="width:100%; height:160px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:12px;">
                <div style="font-weight:800; font-size:1.1rem; color:var(--text-main);">${m.name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Packaging: <strong>${m.packaging}</strong></div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Dealer: ${m.dealerName}</div>
                <div style="font-size:1.2rem; font-weight:800; color:var(--primary); margin-top:8px;">₹${m.sellingPrice} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">per ${m.packageUnit}</span></div>
                <div style="font-size:0.8rem; font-weight:700; color:var(--success); margin-top:4px;"><i class="fas fa-circle-check"></i> In Stock (${m.stock} ${m.packageUnit})</div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px;">
                <button class="btn btn-primary btn-sm" onclick="window.MediKartBuyer.addToCart('${m.id}')">Add to Cart</button>
                <button class="btn btn-outline-danger btn-sm" onclick="window.MediKartBuyer.toggleWishlist('${m.id}')">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  toggleWishlist(medId) {
    let wishlist = window.MediKartData.getWishlist();
    if (wishlist.includes(medId)) {
      wishlist = wishlist.filter(id => id !== medId);
      window.MediKartApp.toast('Removed from Wishlist', 'info');
    } else {
      wishlist.push(medId);
      window.MediKartApp.toast('Saved to Wishlist!', 'success');
    }

    window.MediKartData.saveWishlist(wishlist);
    this.updateBadges();

    if (this.currentView === 'wishlist') {
      this.renderWishlist(document.querySelector('#buyer-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     16. ADDRESS BOOK VIEW (WITH EDIT MODAL)
     -------------------------------------------------------------------------- */
  renderAddresses(container) {
    const buyer = window.MediKartData.getBuyers()[0] || {};
    const addresses = buyer.addresses || [];

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800;"><i class="fas fa-address-book" style="color:var(--primary);"></i> Address Book</h1>
          <p style="color:var(--text-muted);">Manage shipping addresses for medicine deliveries.</p>
        </div>
        <button class="btn btn-primary" onclick="window.MediKartBuyer.openAddAddressModal()">
          <i class="fas fa-plus"></i> Add Address
        </button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
        ${addresses.map(addr => `
          <div class="address-card ${addr.isDefault ? 'default-address' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:1.05rem;">${addr.name}</strong>
              <div>
                <span class="badge badge-info">${addr.tag}</span>
                ${addr.isDefault ? '<span class="badge badge-success" style="margin-left:4px;">Default</span>' : ''}
              </div>
            </div>

            <div style="font-size:0.85rem; color:var(--text-main); font-weight:700; margin-bottom:6px;">Phone: ${addr.mobile}</div>
            <p style="font-size:0.88rem; color:var(--text-muted);">${addr.line}</p>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${addr.city}, ${addr.state} - ${addr.pincode}</div>

            <div style="display:flex; gap:8px; margin-top:16px; border-top:1px solid var(--border-color); padding-top:12px;">
              ${!addr.isDefault ? `<button class="btn btn-sm btn-outline-primary" onclick="window.MediKartBuyer.setDefaultAddress('${addr.id}')">Set Default</button>` : ''}
              <button class="btn btn-sm btn-outline-secondary" onclick="window.MediKartBuyer.openEditAddressModal('${addr.id}')">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="window.MediKartBuyer.deleteAddress('${addr.id}')">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  openAddAddressModal() {
    window.MediKartApp.showModal({
      title: 'Add Shipping Address',
      content: `
        <div class="form-group"><label>Full Name</label><input type="text" id="newAddrName" class="form-control" value="Buyer"></div>
        <div class="form-group"><label>Phone Number</label><input type="text" id="newAddrMobile" class="form-control" value="+91 98765 12345"></div>
        <div class="form-group"><label>Address Line</label><input type="text" id="newAddrLine" class="form-control" placeholder="House/Flat No, Building, Street"></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group"><label>City</label><input type="text" id="newAddrCity" class="form-control" value="Bengaluru"></div>
          <div class="form-group"><label>State</label><input type="text" id="newAddrState" class="form-control" value="Karnataka"></div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group"><label>Pincode</label><input type="text" id="newAddrPincode" class="form-control" placeholder="560102"></div>
          <div class="form-group"><label>Tag</label>
            <select id="newAddrTag" class="form-control"><option value="Home">Home</option><option value="Work">Work</option><option value="Others">Others</option></select>
          </div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.MediKartBuyer.saveNewAddress()">Save Address</button>
      `
    });
  }

  openEditAddressModal(addrId) {
    const buyers = window.MediKartData.getBuyers();
    const buyer = buyers[0] || {};
    const addr = (buyer.addresses || []).find(a => a.id === addrId);
    if (!addr) return;

    window.MediKartApp.showModal({
      title: 'Edit Shipping Address',
      content: `
        <div class="form-group"><label>Full Name</label><input type="text" id="editAddrName" class="form-control" value="${addr.name}"></div>
        <div class="form-group"><label>Phone Number</label><input type="text" id="editAddrMobile" class="form-control" value="${addr.mobile}"></div>
        <div class="form-group"><label>Address Line</label><input type="text" id="editAddrLine" class="form-control" value="${addr.line}"></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group"><label>City</label><input type="text" id="editAddrCity" class="form-control" value="${addr.city}"></div>
          <div class="form-group"><label>State</label><input type="text" id="editAddrState" class="form-control" value="${addr.state}"></div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group"><label>Pincode</label><input type="text" id="editAddrPincode" class="form-control" value="${addr.pincode}"></div>
          <div class="form-group"><label>Tag</label>
            <select id="editAddrTag" class="form-control">
              <option value="Home" ${addr.tag === 'Home' ? 'selected' : ''}>Home</option>
              <option value="Work" ${addr.tag === 'Work' ? 'selected' : ''}>Work</option>
              <option value="Others" ${addr.tag === 'Others' ? 'selected' : ''}>Others</option>
            </select>
          </div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.MediKartBuyer.saveEditedAddress('${addrId}')">Save Changes</button>
      `
    });
  }

  saveNewAddress() {
    const name = document.getElementById('newAddrName').value.trim();
    const mobile = document.getElementById('newAddrMobile').value.trim();
    const line = document.getElementById('newAddrLine').value.trim();
    const city = document.getElementById('newAddrCity').value.trim();
    const state = document.getElementById('newAddrState').value.trim();
    const pincode = document.getElementById('newAddrPincode').value.trim();
    const tag = document.getElementById('newAddrTag').value;

    if (!name || !mobile || !line || !city || !state || !pincode) {
      window.MediKartApp.toast('All address fields are required.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      window.MediKartApp.toast('Pincode must be exactly 6 numeric digits.', 'error');
      return;
    }

    const buyers = window.MediKartData.getBuyers();
    const buyerUser = this.getBuyerUser();
    let buyer = buyers.find(b => b.id === buyerUser.id || b.email === buyerUser.email);
    if (!buyer) {
      buyer = buyerUser;
      buyers.unshift(buyer);
    }

    if (!buyer.addresses) buyer.addresses = [];

    const isDefault = buyer.addresses.length === 0;
    buyer.addresses.push({ id: `addr-${Date.now()}`, name, mobile, line, city, state, pincode, tag, isDefault });
    window.MediKartData.saveBuyers(buyers);
    window.MediKartApp.closeModal();
    window.MediKartApp.toast('Address saved successfully!', 'success');
    this.renderAddresses(document.querySelector('#buyer-root #main-content'));
  }

  saveEditedAddress(addrId) {
    const name = document.getElementById('editAddrName').value.trim();
    const mobile = document.getElementById('editAddrMobile').value.trim();
    const line = document.getElementById('editAddrLine').value.trim();
    const city = document.getElementById('editAddrCity').value.trim();
    const state = document.getElementById('editAddrState').value.trim();
    const pincode = document.getElementById('editAddrPincode').value.trim();
    const tag = document.getElementById('editAddrTag').value;

    if (!name || !mobile || !line || !city || !state || !pincode) {
      window.MediKartApp.toast('All address fields are required.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      window.MediKartApp.toast('Pincode must be exactly 6 numeric digits.', 'error');
      return;
    }

    const buyers = window.MediKartData.getBuyers();
    const buyerUser = this.getBuyerUser();
    const buyer = buyers.find(b => b.id === buyerUser.id || b.email === buyerUser.email) || buyerUser;
    const addr = (buyer.addresses || []).find(a => a.id === addrId);
    if (!addr) return;

    addr.name = name;
    addr.mobile = mobile;
    addr.line = line;
    addr.city = city;
    addr.state = state;
    addr.pincode = pincode;
    addr.tag = tag;

    window.MediKartData.saveBuyers(buyers);
    window.MediKartApp.closeModal();
    window.MediKartApp.toast('Address updated successfully!', 'success');
    this.renderAddresses(document.querySelector('#buyer-root #main-content'));
  }

  setDefaultAddress(addrId) {
    const buyers = window.MediKartData.getBuyers();
    const buyerUser = this.getBuyerUser();
    const buyer = buyers.find(b => b.id === buyerUser.id || b.email === buyerUser.email) || buyerUser;
    (buyer.addresses || []).forEach(a => a.isDefault = (a.id === addrId));
    window.MediKartData.saveBuyers(buyers);
    this.renderAddresses(document.querySelector('#buyer-root #main-content'));
    window.MediKartApp.toast('Default delivery address updated.', 'info');
  }

  deleteAddress(addrId) {
    const buyers = window.MediKartData.getBuyers();
    const buyerUser = this.getBuyerUser();
    const buyer = buyers.find(b => b.id === buyerUser.id || b.email === buyerUser.email) || buyerUser;
    buyer.addresses = (buyer.addresses || []).filter(a => a.id !== addrId);
    window.MediKartData.saveBuyers(buyers);
    this.renderAddresses(document.querySelector('#buyer-root #main-content'));
    window.MediKartApp.toast('Address deleted', 'info');
  }

  /* --------------------------------------------------------------------------
     17. OFFERS & COUPONS VIEW
     -------------------------------------------------------------------------- */
  renderCoupons(container) {
    const coupons = window.MediKartData.getCoupons().slice(0, 12);

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-ticket-alt" style="color:var(--accent);"></i> Offers & Coupons</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Available vouchers for instant discount savings.</p>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
        ${coupons.map(c => `
          <div class="coupon-card">
            <div>
              <span class="coupon-code-tag">${c.code}</span>
              <h3 style="font-weight:800; font-size:1.1rem; margin-top:8px;">${c.discountPercent}% OFF</h3>
              <div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">Minimum Order: ₹${c.minOrder}</div>
              <div style="font-size:0.75rem; color:var(--text-light); margin-top:4px;">Expiry Date: ${c.expiry}</div>
            </div>

            <button class="btn btn-sm btn-primary" onclick="window.MediKartBuyer.applyCartCoupon('${c.code}'); window.MediKartBuyer.navigate('cart');">
              Apply
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderNotifications(container) {
    const buyer = this.getBuyerUser();
    const notifications = window.MediKartData.getNotifications().filter(n => !n.buyerId || n.buyerId === buyer.id);

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <h1 style="font-size:1.8rem; font-weight:800; margin:0;"><i class="fas fa-bell" style="color:var(--warning);"></i> Notifications</h1>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline-secondary btn-sm" onclick="window.MediKartBuyer.markAllNotificationsRead()"><i class="fas fa-check-double"></i> Mark All Read</button>
          <button class="btn btn-outline-danger btn-sm" onclick="window.MediKartBuyer.clearAllNotifications()"><i class="fas fa-trash-can"></i> Clear All</button>
        </div>
      </div>

      <div>
        ${notifications.length === 0 ? `
          <div class="card text-center" style="padding:40px; color:var(--text-muted);">
            <i class="fas fa-bell-slash" style="font-size:2.5rem; margin-bottom:12px;"></i>
            <h3>No Unread or Active Notifications</h3>
            <p style="font-size:0.88rem;">You're all caught up with your order updates and account alerts.</p>
          </div>
        ` : notifications.map(n => `
          <div class="notification-item ${!n.read ? 'unread' : ''}">
            <div class="suggestion-icon" style="width:40px; height:40px;"><i class="fas fa-bell"></i></div>
            <div style="flex:1;">
              <div style="font-weight:800;">${n.title}</div>
              <p style="font-size:0.88rem; color:var(--text-muted); margin-top:2px;">${n.message}</p>
            </div>
            <button class="icon-btn" title="Delete notification" onclick="window.MediKartBuyer.deleteNotification('${n.id}')">&times;</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  markAllNotificationsRead() {
    const buyer = this.getBuyerUser();
    const notifs = window.MediKartData.getNotifications();
    notifs.forEach(n => {
      if (!n.buyerId || n.buyerId === buyer.id) {
        n.read = true;
      }
    });
    window.MediKartData.saveNotifications(notifs);
    this.updateBadges();
    this.renderNotifications(document.querySelector('#buyer-root #main-content'));
  }

  clearAllNotifications() {
    const buyer = this.getBuyerUser();
    let notifs = window.MediKartData.getNotifications();
    notifs = notifs.filter(n => n.buyerId && n.buyerId !== buyer.id);
    window.MediKartData.saveNotifications(notifs);
    this.updateBadges();
    this.renderNotifications(document.querySelector('#buyer-root #main-content'));
    window.MediKartApp.toast('All notifications cleared', 'info');
  }

  deleteNotification(id) {
    let notifs = window.MediKartData.getNotifications();
    notifs = notifs.filter(n => n.id !== id);
    window.MediKartData.saveNotifications(notifs);
    this.updateBadges();
    this.renderNotifications(document.querySelector('#buyer-root #main-content'));
  }


  renderProfile(container) {
    const buyer = this.getBuyerUser();

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-user-circle" style="color:var(--primary);"></i> Account Profile</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Manage patient medical profile details and security settings.</p>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
        <div class="card">
          <h2 style="font-weight:800; font-size:1.15rem; margin-bottom:16px;">Personal & Medical Details</h2>
          <form onsubmit="event.preventDefault(); window.MediKartBuyer.saveProfileDetails();">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group"><label style="font-weight:700;">Full Name *</label><input type="text" id="buyerProfName" class="form-control" value="${buyer.name || 'Amit Sharma'}" required></div>
              <div class="form-group"><label style="font-weight:700;">Email Address *</label><input type="email" id="buyerProfEmail" class="form-control" value="${buyer.email || 'buyer@medikart.com'}" required></div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group"><label style="font-weight:700;">Phone Number *</label><input type="text" id="buyerProfPhone" class="form-control" value="${buyer.mobile || '+91 98765 12345'}" required></div>
              <div class="form-group"><label style="font-weight:700;">Emergency Contact</label><input type="text" id="buyerProfEmergency" class="form-control" value="${buyer.emergencyContact || '+91 98111 22233'}"></div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group"><label style="font-weight:700;">Blood Group</label><input type="text" id="buyerProfBlood" class="form-control" value="${buyer.bloodGroup || 'O+'}"></div>
              <div class="form-group"><label style="font-weight:700;">Known Allergies</label><input type="text" id="buyerProfAllergies" class="form-control" value="${buyer.allergies || 'Penicillin'}"></div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top:10px;"><i class="fas fa-save"></i> Save Profile Details</button>
          </form>
        </div>

        <div class="card">
          <h2 style="font-weight:800; font-size:1.15rem; margin-bottom:16px;"><i class="fas fa-key" style="color:var(--primary);"></i> Security & Password</h2>
          <form onsubmit="event.preventDefault(); window.MediKartBuyer.updateBuyerPassword();">
            <div class="form-group"><label style="font-weight:700;">Current Password *</label><input type="password" id="buyerCurrPass" class="form-control" placeholder="Current password" required></div>
            <div class="form-group"><label style="font-weight:700;">New Password *</label><input type="password" id="buyerNewPass" class="form-control" placeholder="New password" required></div>
            <div class="form-group"><label style="font-weight:700;">Confirm New Password *</label><input type="password" id="buyerConfirmPass" class="form-control" placeholder="Confirm new password" required></div>

            <button type="submit" class="btn btn-outline-primary btn-block" style="width:100%;"><i class="fas fa-shield-halved"></i> Update Password</button>
          </form>
        </div>
      </div>
    `;
  }

  saveProfileDetails() {
    const name = document.getElementById('buyerProfName').value.trim();
    const email = document.getElementById('buyerProfEmail').value.trim();
    const phone = document.getElementById('buyerProfPhone').value.trim();
    const emergency = document.getElementById('buyerProfEmergency').value.trim();
    const blood = document.getElementById('buyerProfBlood').value.trim();
    const allergies = document.getElementById('buyerProfAllergies').value.trim();

    if (!name || !email || !phone) {
      window.MediKartApp.toast('Name, Email, and Phone number are required.', 'error');
      return;
    }

    // Update the signed-in buyer's own record, not a hardcoded demo account.
    const me = this.getBuyerUser();
    const buyers = window.MediKartData.getBuyers();
    let b = buyers.find(x => x.id === me.id);
    if (!b) {
      window.MediKartApp.toast('Could not resolve your account. Please sign in again.', 'error');
      return;
    }

    b.name = name;
    b.email = email;
    b.mobile = phone;
    b.emergencyContact = emergency;
    b.bloodGroup = blood;
    b.allergies = allergies;

    window.MediKartData.saveBuyers(buyers);
    window.MediKartApp.toast('Profile details updated and saved successfully!', 'success');
  }

  updateBuyerPassword() {
    const currPass = document.getElementById('buyerCurrPass').value.trim();
    const newPass = document.getElementById('buyerNewPass').value.trim();
    const confirmPass = document.getElementById('buyerConfirmPass').value.trim();

    if (currPass !== 'buyer123') {
      window.MediKartApp.toast('Current password incorrect. (Demo default: buyer123)', 'error');
      return;
    }

    if (!newPass || newPass.length < 4) {
      window.MediKartApp.toast('New password must be at least 4 characters long.', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      window.MediKartApp.toast('New password and confirmation do not match.', 'error');
      return;
    }

    window.MediKartApp.toast('Password updated successfully! (Demo credential updated)', 'success');
    document.getElementById('buyerCurrPass').value = '';
    document.getElementById('buyerNewPass').value = '';
    document.getElementById('buyerConfirmPass').value = '';
  }
}

window.MediKartBuyer = new BuyerController();
