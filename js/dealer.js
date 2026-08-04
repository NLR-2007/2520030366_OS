/* ==========================================================================
   MEDIKART 17.0 - INDEPENDENT PHARMACY DEALER PORTAL
   Instant Change Reflection, Comprehensive Multi-Field Search,
   Direct Storefront Publishing, Clean UI/UX, and Notification Alerts.
   ========================================================================== */

class DealerController {
  constructor() {
    this.currentView = 'dashboard';
    this.dealerId = 'dlr-101'; // Default demo pharmacy (Apollo MedShop Pvt Ltd)
    
    // Topbar Search State
    this.topbarSearchQuery = '';

    // Medicine Management Table State
    this.medsSearch = '';
    this.medsFilterStatus = 'all';
    this.medsFilterCategory = 'all';
    this.medsSortCol = 'createdAt';
    this.medsSortDir = 'desc';
    this.medsPage = 1;
    this.recentlyUpdatedMedId = null;

    // Inventory Table State
    this.invSearch = '';
    this.invFilterStatus = 'all';
    this.invSortCol = 'stock';
    this.invSortDir = 'asc';
    this.invPage = 1;

    // Orders Table State
    this.ordersSearch = '';
    this.ordersFilterStatus = 'all';
    this.ordersSortCol = 'orderDate';
    this.ordersSortDir = 'desc';
    this.ordersPage = 1;

    // Revenue Transactions Table State
    this.revSearch = '';
    this.revFilterStatus = 'all';
    this.revSortCol = 'orderDate';
    this.revSortDir = 'desc';
    this.revPage = 1;

    // Audit Log Table State
    this.auditSearch = '';
    this.auditFilterAction = 'all';
    this.auditPage = 1;

    this.pageSize = 10;
    this.chartInstances = {};
  }

  getDealerId() {
    const session = window.MediKartData ? window.MediKartData.getSession() : null;
    if (session && (session.role === 'dealer' || session.role === 'seller' || session.role === 'Pharmacy Seller') && session.dealerId) {
      return session.dealerId;
    }
    return this.dealerId || 'dlr-101';
  }

  getCurrentDealer() {
    const dealers = window.MediKartData ? window.MediKartData.getDealers() : [];
    const id = this.getDealerId();
    return dealers.find(d => d.id === id) || dealers[0] || {
      id: 'dlr-101',
      name: 'Rajesh Sharma',
      ownerName: 'Rajesh Sharma',
      businessName: 'Apollo MedShop Pvt Ltd',
      drugLicense: '20B/DL-88741/2024',
      gstNumber: '07AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      email: 'apollo@medikart.com',
      phone: '+91 98765 43210',
      status: 'pending',
      address: 'Connaught Place, New Delhi',
      rating: 4.9, reviewCount: 142, totalSales: 1250, grossRevenue: 284500
    };
  }

  getDealerStatus() {
    const d = this.getCurrentDealer();
    return d ? d.status : 'approved';
  }

  init() {
    try {
      this.dealerId = this.getDealerId();
      this.renderLayout();
      this.navigate('dashboard');
    } catch (err) {
      console.error('DealerController init error:', err);
      const root = document.getElementById('dealer-root');
      if (root) {
        root.style.display = 'block';
        root.innerHTML = `
          <div style="padding:50px; text-align:center; background:var(--bg-card); margin:40px auto; max-width:600px; border-radius:16px; border:1px solid var(--border-color); box-shadow:var(--shadow-lg);">
            <i class="fas fa-triangle-exclamation" style="font-size:3rem; color:var(--warning); margin-bottom:16px;"></i>
            <h2 style="font-weight:800; color:var(--text-main);">Pharmacy Dashboard Session Alert</h2>
            <p style="color:var(--text-muted); font-size:0.95rem; margin-top:8px;">A stale session token was detected in your browser cache.</p>
            <!-- Signs out only. The previous handler called localStorage.clear(),
                 which destroyed every order, listing and cart for the whole
                 origin without asking. -->
            <button class="btn btn-primary" style="font-weight:800; padding:12px 24px; margin-top:20px;" onclick="window.MediKartApp.logout()">
              <i class="fas fa-rotate"></i> Sign Out & Return to Login
            </button>
            <button class="btn btn-outline-danger btn-sm" style="margin-top:12px;" onclick="window.MediKartDealer.confirmResetDemoData()">
              Reset all demo data
            </button>
          </div>
        `;
      }
    }
  }

  esc(value) {
    return window.MediKartApp ? window.MediKartApp.escapeHtml(value) : String(value == null ? '' : value);
  }

  /* Scoped, confirmed reset. Removes only MediKart's own storage keys. */
  confirmResetDemoData() {
    window.MediKartApp.showConfirm({
      title: 'Reset all demo data?',
      message: 'This permanently deletes every order, listing, cart and account change in this browser and restores the original sample data. This cannot be undone.',
      confirmLabel: 'Reset everything',
      danger: true,
      onConfirm: () => {
        window.MediKartData.resetDemoData();
        window.MediKartApp.logout();
        window.MediKartApp.toast('Demo data reset to its original state.', 'success');
      }
    });
  }

  /* --------------------------------------------------------------------------
     SAFE CHART INSTANCE MANAGEMENT
     -------------------------------------------------------------------------- */
  destroyCharts() {
    Object.keys(this.chartInstances).forEach(key => {
      if (this.chartInstances[key]) {
        try { this.chartInstances[key].destroy(); } catch (e) {}
      }
    });
    this.chartInstances = {};
  }

  renderLayout() {
    const root = document.getElementById('dealer-root');
    if (!root) return;

    this.dealerId = this.getDealerId();
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];
    const unreadNotifs = window.MediKartData.getNotifications().filter(n => (n.dealerId === this.dealerId || !n.dealerId) && !n.read).length;

    root.innerHTML = `
      <div id="app-layout">
        <!-- Fixed Left Sidebar -->
        <aside id="sidebar">
          <div class="sidebar-header">
            <div class="logo-badge" style="background:var(--primary);"><i class="fas fa-clinic-medical"></i></div>
            <div class="logo-text">Medi<span>Kart</span> <span class="dealer-tag">PHARMACY SELLER</span></div>
          </div>

          <nav class="sidebar-menu">
            <div class="menu-category">Main Menu</div>
            <div class="nav-item active" data-view="dashboard" onclick="window.MediKartDealer.navigate('dashboard')">
              <i class="fas fa-chart-pie"></i> <span>Dashboard</span>
            </div>
            <div class="nav-item" data-view="verification" onclick="window.MediKartDealer.navigate('verification')">
              <i class="fas fa-id-card"></i> <span>Pharmacy Verification</span>
            </div>
            <div class="nav-item" data-view="medicines" onclick="window.MediKartDealer.navigate('medicines')">
              <i class="fas fa-pills"></i> <span>Medicine Management</span>
            </div>
            <div class="nav-item" data-view="inventory" onclick="window.MediKartDealer.navigate('inventory')">
              <i class="fas fa-boxes"></i> <span>Inventory</span>
            </div>

            <div class="menu-category">Fulfillment & Sales</div>
            <div class="nav-item" data-view="orders" onclick="window.MediKartDealer.navigate('orders')">
              <i class="fas fa-shipping-fast"></i> <span>Orders</span>
            </div>
            <div class="nav-item" data-view="revenue" onclick="window.MediKartDealer.navigate('revenue')">
              <i class="fas fa-chart-line"></i> <span>Revenue & Analytics</span>
            </div>
            <div class="nav-item" data-view="notifications" onclick="window.MediKartDealer.navigate('notifications')">
              <i class="fas fa-bell"></i> <span>Notifications</span>
              ${unreadNotifs > 0 ? `<span class="badge badge-danger" style="margin-left:auto; font-size:0.75rem;">${unreadNotifs}</span>` : ''}
            </div>

            <div class="menu-category">Settings & Account</div>
            <div class="nav-item" data-view="audit" onclick="window.MediKartDealer.navigate('audit')">
              <i class="fas fa-file-shield"></i> <span>Audit Log</span>
            </div>
            <div class="nav-item" data-view="profile" onclick="window.MediKartDealer.navigate('profile')">
              <i class="fas fa-store-alt"></i> <span>Profile</span>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div style="display:flex; align-items:center; gap:10px; width:100%; cursor:pointer;" onclick="window.MediKartDealer.navigate('profile')">
              <div class="user-mini-avatar"><i class="fas fa-clinic-medical"></i></div>
              <div class="user-mini-info">
                <div class="user-mini-name">${dealer.businessName || 'Pharmacy Store'}</div>
                <div class="user-mini-role">${dealer.name || 'Store Manager'}</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div id="main-wrapper">
          <!-- Top Navigation Header -->
          <header id="top-navbar">
            <div class="navbar-left" style="display:flex; align-items:center; gap:16px; flex:1;">
              <button class="mobile-toggle-btn" onclick="window.MediKartApp.toggleSidebar()" aria-label="Toggle navigation menu">
                <i class="fas fa-bars"></i>
              </button>
              <h2 id="dealer-page-title" style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin:0;">Dashboard Overview</h2>

              <!-- Global Multi-Entity Search Input -->
              <div style="position:relative; width:100%; max-width:380px; margin-left:12px;">
                <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted);"></i>
                <input type="text" id="topbarSearchInput" class="form-control" placeholder="Search medicines, orders, buyers..." style="padding-left:36px; padding-right:12px;" oninput="window.MediKartDealer.handleTopbarSearch(this.value)">
                
                <!-- Live Search Results Dropdown Modal -->
                <div id="topbarSearchDropdown" class="dealer-search-popup" style="display:none;"></div>
              </div>
            </div>

            <div class="navbar-right" style="display:flex; align-items:center; gap:12px;">
              <!-- Notifications Bell Trigger -->
              <button class="icon-btn" style="position:relative;" title="Notifications" onclick="window.MediKartDealer.openNotificationsFromBell()">
                <i class="fas fa-bell"></i>
                <span class="badge-count" id="dealerNotifBadge" style="position:absolute; top:-4px; right:-4px; ${unreadNotifs > 0 ? 'display:flex;' : 'display:none;'}">${unreadNotifs}</span>
              </button>

              <!-- Theme Toggle -->
              <button class="icon-btn" onclick="window.MediKartApp.toggleTheme()"><i class="fas fa-moon"></i></button>

              <!-- Dealer Selection Switcher Dropdown (Demo Testing).
                   Hidden on small screens — it is a testing affordance, not a
                   real feature, and it was crowding the mobile topbar. -->
              <select class="form-control navbar-dealer-switch" aria-label="Switch demo pharmacy" onchange="window.MediKartDealer.switchDealer(this.value)">
                ${dealers.slice(0, 10).map(d => `<option value="${d.id}" ${d.id === this.dealerId ? 'selected' : ''}>${this.esc(d.businessName)}</option>`).join('')}
              </select>

              <button class="btn btn-sm btn-outline-danger" onclick="window.MediKartApp.logout()" title="Logout">
                <i class="fas fa-right-from-bracket"></i> <span class="btn-label">Logout</span>
              </button>
            </div>
          </header>

          <main id="main-content"></main>
        </div>
      </div>
    `;

    // Click handler to close topbar search dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const searchBox = document.getElementById('topbarSearchInput');
      const dropdown = document.getElementById('topbarSearchDropdown');
      if (dropdown && searchBox && !searchBox.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  openNotificationsFromBell() {
    const notifs = window.MediKartData.getNotifications();
    const dealerId = this.getDealerId();
    notifs.forEach(n => {
      if (n.dealerId === dealerId) n.read = true;
    });
    window.MediKartData.saveNotifications(notifs);
    this.renderLayout();
    this.navigate('notifications');
  }

  switchDealer(id) {
    this.dealerId = id;
    this.renderLayout();
    this.navigate(this.currentView);
  }

  navigate(view) {
    this.currentView = view;
    this.destroyCharts();

    document.querySelectorAll('#dealer-root #sidebar .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === view);
    });

    const titleEl = document.getElementById('dealer-page-title');
    const titleMap = {
      dashboard: 'Dashboard Overview',
      verification: 'Pharmacy Verification & Compliance',
      medicines: 'Medicine Catalog Management',
      inventory: 'Inventory & Stock Control',
      orders: 'Customer Order Fulfillment',
      revenue: 'Revenue & Financial Analytics',
      notifications: 'Account Notifications Feed',
      audit: 'Seller Activity Audit Log',
      profile: 'Pharmacy Profile & Credentials'
    };
    if (titleEl) titleEl.innerText = titleMap[view] || 'Pharmacy Seller Dashboard';

    const main = document.querySelector('#dealer-root #main-content');
    if (!main) return;

    window.scrollTo(0, 0);

    if (view === 'dashboard') this.renderDashboard(main);
    else if (view === 'verification' || view === 'registration') this.renderVerification(main);
    else if (view === 'medicines') this.renderMedicines(main);
    else if (view === 'inventory') this.renderInventory(main);
    else if (view === 'orders') this.renderOrders(main);
    else if (view === 'revenue') this.renderRevenue(main);
    else if (view === 'notifications') this.renderNotifications(main);
    else if (view === 'audit') this.renderAuditLog(main);
    else if (view === 'profile') this.renderProfile(main);
  }

  /* --------------------------------------------------------------------------
     GLOBAL SEARCH ACROSS MEDICINES, ORDERS, & BUYERS
     -------------------------------------------------------------------------- */
  handleTopbarSearch(query) {
    const dropdown = document.getElementById('topbarSearchDropdown');
    if (!dropdown) return;

    const q = query.trim().toLowerCase();
    if (!q) {
      dropdown.style.display = 'none';
      return;
    }

    const dealer = window.MediKartData.getDealers().find(d => d.id === this.dealerId) || window.MediKartData.getDealers()[0];
    const medicines = window.MediKartData.getMedicines().filter(m => m.dealerId === this.dealerId || m.dealerName === dealer.businessName);
    const orders = window.MediKartData.getOrders().filter(o => o.dealerName === dealer.businessName || o.dealerId === dealer.id);
    const buyers = window.MediKartData.getBuyers();

    // Match medicines across name, generic name, category, manufacturer, packaging, batch
    const matchedMeds = medicines.filter(m => 
      (m.name && m.name.toLowerCase().includes(q)) || 
      (m.genericName && m.genericName.toLowerCase().includes(q)) || 
      (m.therapeuticCategory && m.therapeuticCategory.toLowerCase().includes(q)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(q))
    ).slice(0, 5);

    // Match orders across order ID, buyer name, email, invoice number, status, item names
    const matchedOrders = orders.filter(o => 
      (o.id && o.id.toLowerCase().includes(q)) || 
      (o.buyerName && o.buyerName.toLowerCase().includes(q)) || 
      (o.buyerEmail && o.buyerEmail.toLowerCase().includes(q)) ||
      (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
      (o.status && o.status.toLowerCase().includes(q)) ||
      (o.items && o.items.some(i => (i.medicineName && i.medicineName.toLowerCase().includes(q)) || (i.genericName && i.genericName.toLowerCase().includes(q))))
    ).slice(0, 5);

    // Match buyers across name, email, phone
    const matchedBuyers = buyers.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.email && b.email.toLowerCase().includes(q)) || 
      (b.phone && b.phone.toLowerCase().includes(q))
    ).slice(0, 5);

    if (matchedMeds.length === 0 && matchedOrders.length === 0 && matchedBuyers.length === 0) {
      dropdown.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-muted); font-size:0.88rem;">No matching medicines, orders, or buyers found.</div>`;
      dropdown.style.display = 'block';
      return;
    }

    let html = '';

    if (matchedMeds.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase; margin:4px 0 6px 4px;"><i class="fas fa-pills"></i> Medicines (${matchedMeds.length})</div>`;
      matchedMeds.forEach(m => {
        html += `
          <div class="dealer-search-item" onclick="window.MediKartDealer.selectSearchResult('medicines', '${m.id}')">
            <div>
              <strong>${m.name}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted);">${m.genericName} • ${m.packaging}</div>
            </div>
            <span class="badge badge-info">₹${m.sellingPrice}</span>
          </div>
        `;
      });
    }

    if (matchedOrders.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:800; color:var(--secondary); text-transform:uppercase; margin:10px 0 6px 4px;"><i class="fas fa-box"></i> Orders (${matchedOrders.length})</div>`;
      matchedOrders.forEach(o => {
        html += `
          <div class="dealer-search-item" onclick="window.MediKartDealer.selectSearchResult('orders', '${o.id}')">
            <div>
              <strong>#${o.id} — ${o.buyerName}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted);">${o.orderDate} • ₹${o.grandTotal}</div>
            </div>
            <span class="badge ${o.status === 'Delivered' ? 'badge-success' : 'badge-warning'}">${o.status}</span>
          </div>
        `;
      });
    }

    if (matchedBuyers.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:800; color:var(--accent); text-transform:uppercase; margin:10px 0 6px 4px;"><i class="fas fa-user"></i> Buyers (${matchedBuyers.length})</div>`;
      matchedBuyers.forEach(b => {
        html += `
          <div class="dealer-search-item" onclick="window.MediKartDealer.selectSearchResult('orders', '${b.name}')">
            <div>
              <strong>${b.name}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted);">${b.email}</div>
            </div>
            <span class="badge badge-secondary">Buyer</span>
          </div>
        `;
      });
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  }

  selectSearchResult(type, queryVal) {
    const dropdown = document.getElementById('topbarSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';

    if (type === 'medicines') {
      this.medsSearch = queryVal;
      this.medsPage = 1;
      this.navigate('medicines');
    } else if (type === 'orders') {
      this.ordersSearch = queryVal;
      this.ordersPage = 1;
      this.navigate('orders');
    }
  }

  /* --------------------------------------------------------------------------
     1. DASHBOARD HOMEPAGE
     -------------------------------------------------------------------------- */
  renderDashboard(container) {
    const dealer = this.getCurrentDealer();
    const medicines = window.MediKartData.getMedicines().filter(m => m.dealerId === dealer.id || m.dealerName === dealer.businessName);
    const orders = window.MediKartData.getOrders().filter(o => o.dealerName === dealer.businessName || o.dealerId === dealer.id);

    // Compute Summary Cards metrics
    const totalListed = medicines.length;
    const activeListings = medicines.filter(m => m.status === 'Approved' || !m.status).length;
    const draftListings = medicines.filter(m => m.status === 'Draft').length;
    const lowStock = medicines.filter(m => m.stock > 0 && m.stock <= 15).length;
    const outOfStock = medicines.filter(m => m.stock === 0).length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const todaysOrders = orders.filter(o => o.orderDate === '2026-08-02' || o.orderDate === '2026-08-01').length;
    
    // Revenue calculations
    const monthlyRev = orders.filter(o => o.orderDate && o.orderDate.startsWith('2026-08')).reduce((sum, o) => sum + o.grandTotal, 0);

    container.innerHTML = `
      <!-- Verified Pharmacy Banner -->
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:16px 20px; margin-bottom:24px; color:#166534; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:14px; align-items:center;">
          <div style="width:42px; height:42px; border-radius:50%; background:#d1fae5; color:#10b981; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
            <i class="fas fa-certificate"></i>
          </div>
          <div>
            <strong style="font-size:1.05rem;">Verified Pharmacy Partner — ${dealer.businessName}</strong>
            <p style="font-size:0.88rem; margin-top:2px; color:#15803d;">Authorized Storefront under Drug License <code>${dealer.drugLicense}</code> and GSTIN <code>${dealer.gstNumber}</code>.</p>
          </div>
        </div>
        <span class="badge badge-success" style="padding:8px 14px; font-weight:800; font-size:0.85rem;"><i class="fas fa-check-circle"></i> Storefront Active</span>
      </div>

      <!-- 8 Summary Cards Grid -->
      <div class="dealer-summary-grid">
        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('medicines')">
          <div><div class="val">${totalListed}</div><div class="title">Total Medicines Listed</div></div>
          <div class="icon-box" style="background:var(--primary);"><i class="fas fa-pills"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('medicines')">
          <div><div class="val" style="color:var(--success);">${activeListings}</div><div class="title">Active Listings</div></div>
          <div class="icon-box" style="background:var(--success);"><i class="fas fa-check-circle"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('medicines')">
          <div><div class="val" style="color:var(--text-muted);">${draftListings}</div><div class="title">Draft Listings</div></div>
          <div class="icon-box" style="background:#64748b;"><i class="fas fa-file-pen"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('inventory')">
          <div><div class="val" style="color:#d97706;">${lowStock}</div><div class="title">Low Stock Medicines</div></div>
          <div class="icon-box" style="background:#d97706;"><i class="fas fa-triangle-exclamation"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('inventory')">
          <div><div class="val" style="color:var(--danger);">${outOfStock}</div><div class="title">Out of Stock</div></div>
          <div class="icon-box" style="background:var(--danger);"><i class="fas fa-box-open"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('orders')">
          <div><div class="val" style="color:#10b981;">${completedOrders}</div><div class="title">Completed Deliveries</div></div>
          <div class="icon-box" style="background:#10b981;"><i class="fas fa-circle-check"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('orders')">
          <div><div class="val" style="color:var(--secondary);">${todaysOrders}</div><div class="title">Today's Orders</div></div>
          <div class="icon-box" style="background:var(--secondary);"><i class="fas fa-shipping-fast"></i></div>
        </div>

        <div class="dealer-summary-card" onclick="window.MediKartDealer.navigate('revenue')">
          <div><div class="val" style="color:var(--accent);">₹${monthlyRev.toFixed(2)}</div><div class="title">Monthly Revenue</div></div>
          <div class="icon-box" style="background:var(--accent);"><i class="fas fa-wallet"></i></div>
        </div>
      </div>

      <!-- Analytics Charts Section Grid (6 Charts) -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:20px; margin-bottom:28px;">
        <div class="dealer-chart-card">
          <h3><i class="fas fa-chart-line" style="color:var(--primary);"></i> Daily Sales Trend (Aug 2026)</h3>
          <div class="chart-wrapper"><canvas id="chartDailySales"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-chart-column" style="color:var(--secondary);"></i> Monthly Sales Performance</h3>
          <div class="chart-wrapper"><canvas id="chartMonthlySales"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-shopping-bag" style="color:var(--accent);"></i> Orders This Week</h3>
          <div class="chart-wrapper"><canvas id="chartWeeklyOrders"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-chart-pie" style="color:var(--success);"></i> Top Selling Medicines</h3>
          <div class="chart-wrapper"><canvas id="chartTopMeds"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-trend-up" style="color:#8b5cf6;"></i> Revenue Trend</h3>
          <div class="chart-wrapper"><canvas id="chartRevTrend"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-boxes-stacked" style="color:#f59e0b;"></i> Inventory Stock Status Distribution</h3>
          <div class="chart-wrapper"><canvas id="chartInvStatus"></canvas></div>
        </div>
      </div>

      <!-- Recent Activity Stream with Timestamps -->
      <div class="card">
        <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
          <span><i class="fas fa-stream" style="color:var(--primary);"></i> Recent Activity Stream</span>
          <span class="badge badge-info" style="font-size:0.75rem;">Live Feed</span>
        </h3>

        <div class="activity-stream">
          <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-shopping-cart"></i></div>
            <div style="flex:1;">
              <strong>New Order #ORD-980250 Received</strong>
              <div style="font-size:0.85rem; color:var(--text-muted);">Buyer Amit Sharma placed an order for 3x Crocin 650 Advance (₹211.68).</div>
            </div>
            <div class="activity-time">10 mins ago</div>
          </div>

          <div class="activity-item" style="border-left-color:var(--success);">
            <div class="activity-icon" style="background:var(--success-light); color:var(--success);"><i class="fas fa-circle-plus"></i></div>
            <div style="flex:1;">
              <strong>New Medicine Package Published</strong>
              <div style="font-size:0.85rem; color:var(--text-muted);">"Augmentin 625 Duo Tablet" published and active on store catalog.</div>
            </div>
            <div class="activity-time">2 hours ago</div>
          </div>

          <div class="activity-item" style="border-left-color:var(--secondary);">
            <div class="activity-icon" style="background:var(--secondary-light); color:var(--secondary);"><i class="fas fa-truck-fast"></i></div>
            <div style="flex:1;">
              <strong>Order #ORD-980248 Dispatched</strong>
              <div style="font-size:0.85rem; color:var(--text-muted);">Package handed over to delivery partner for express customer shipping.</div>
            </div>
            <div class="activity-time">4 hours ago</div>
          </div>

          <div class="activity-item" style="border-left-color:var(--warning);">
            <div class="activity-icon" style="background:var(--warning-light); color:var(--warning);"><i class="fas fa-boxes"></i></div>
            <div style="flex:1;">
              <strong>Inventory Stock Restocked (+100 Strips)</strong>
              <div style="font-size:0.85rem; color:var(--text-muted);">Batch BTH-2026-X001 stock updated for Crocin 650 Advance.</div>
            </div>
            <div class="activity-time">Yesterday 04:30 PM</div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => this.initDashboardCharts(medicines, orders), 50);
  }

  initDashboardCharts(medicines, orders) {
    if (typeof Chart === 'undefined') return;

    // 1. Daily Sales Chart
    const ctxDaily = document.getElementById('chartDailySales');
    if (ctxDaily) {
      this.chartInstances.daily = new Chart(ctxDaily, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7'],
          datasets: [{
            label: 'Daily Sales (₹)',
            data: [4200, 5800, 3900, 6400, 7200, 5100, 6800],
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.15)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Monthly Sales Chart
    const ctxMonthly = document.getElementById('chartMonthlySales');
    if (ctxMonthly) {
      this.chartInstances.monthly = new Chart(ctxMonthly, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Monthly Sales (₹)',
            data: [28000, 34000, 41000, 38000, 49000, 52000, 61000, 68000],
            backgroundColor: '#0284c7',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 3. Orders This Week Chart
    const ctxWeekly = document.getElementById('chartWeeklyOrders');
    if (ctxWeekly) {
      this.chartInstances.weekly = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders Count',
            data: [14, 22, 18, 25, 30, 28, 20],
            backgroundColor: '#6366f1',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 4. Top Selling Medicines Chart
    const ctxTopMeds = document.getElementById('chartTopMeds');
    if (ctxTopMeds) {
      this.chartInstances.topMeds = new Chart(ctxTopMeds, {
        type: 'doughnut',
        data: {
          labels: ['Crocin 650', 'Dolo 650', 'Augmentin 625', 'Volini Gel', 'Glycomet GP 2'],
          datasets: [{
            data: [420, 380, 290, 240, 190],
            backgroundColor: ['#0d9488', '#0284c7', '#10b981', '#f59e0b', '#6366f1']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 5. Revenue Trend Chart
    const ctxRevTrend = document.getElementById('chartRevTrend');
    if (ctxRevTrend) {
      this.chartInstances.revTrend = new Chart(ctxRevTrend, {
        type: 'line',
        data: {
          labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
          datasets: [{
            label: 'Net Revenue (₹)',
            data: [85000, 110000, 135000, 160000, 210000, 284500],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 6. Inventory Stock Status Distribution Chart
    const activeCount = medicines.filter(m => m.stock > 15).length;
    const lowCount = medicines.filter(m => m.stock > 0 && m.stock <= 15).length;
    const outCount = medicines.filter(m => m.stock === 0).length;

    const ctxInvStatus = document.getElementById('chartInvStatus');
    if (ctxInvStatus) {
      this.chartInstances.invStatus = new Chart(ctxInvStatus, {
        type: 'pie',
        data: {
          labels: ['Optimal Stock (>15)', 'Low Stock (1-15)', 'Out of Stock (0)'],
          datasets: [{
            data: [activeCount, lowCount, outCount],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. PHARMACY REGISTRATION WORKFLOW
     -------------------------------------------------------------------------- */
  renderRegistration(container) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-id-card" style="color:var(--primary);"></i> Pharmacy Statutory Registration</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Manage statutory credentials, Drug License (Form 20B/21B) & GSTIN verification profiles.</p>

      <!-- Verified Pharmacy Status Card -->
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:18px 24px; margin-bottom:24px; color:#166534; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; gap:16px; align-items:center;">
          <div style="width:48px; height:48px; border-radius:50%; background:#d1fae5; color:#10b981; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">
            <i class="fas fa-certificate"></i>
          </div>
          <div>
            <strong style="font-size:1.15rem; color:#166534;">Verified Pharmacy Partner — ${dealer.businessName}</strong>
            <p style="font-size:0.9rem; margin-top:2px; color:#15803d;">Statutory Drug License <code>${dealer.drugLicense}</code> and GSTIN <code>${dealer.gstNumber}</code> active.</p>
          </div>
        </div>
        <span class="badge badge-success" style="padding:8px 16px; font-weight:800; font-size:0.88rem;"><i class="fas fa-shield-check"></i> Approved & Active Partner</span>
      </div>

      <!-- Registration Form & Verification Documents -->
      <form onsubmit="event.preventDefault(); window.MediKartDealer.saveRegistrationForm();" class="card">
        <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:16px;">1. Pharmacy Statutory Details</h3>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:20px;">
          <div class="form-group">
            <label style="font-weight:700;">Pharmacy Business Name *</label>
            <input type="text" id="regPharmacyName" class="form-control" value="${dealer.businessName}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">Owner / Pharmacist Name *</label>
            <input type="text" id="regOwnerName" class="form-control" value="${dealer.name}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">Drug License Number (Form 20B/21B) *</label>
            <input type="text" id="regDrugLicense" class="form-control" value="${dealer.drugLicense}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">GSTIN Number *</label>
            <input type="text" id="regGstNumber" class="form-control" value="${dealer.gstNumber}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">PAN Number (Optional)</label>
            <input type="text" id="regPanNumber" class="form-control" value="${dealer.panNumber || ''}" placeholder="ABCDE1234F">
          </div>

          <div class="form-group">
            <label style="font-weight:700;">Official Contact Email *</label>
            <input type="email" id="regEmail" class="form-control" value="${dealer.email}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">Phone Number *</label>
            <input type="text" id="regPhone" class="form-control" value="${dealer.phone}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">City *</label>
            <input type="text" id="regCity" class="form-control" value="${dealer.city || 'New Delhi'}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">State *</label>
            <input type="text" id="regState" class="form-control" value="${dealer.state || 'Delhi'}" required>
          </div>

          <div class="form-group">
            <label style="font-weight:700;">Pincode *</label>
            <input type="text" id="regPincode" class="form-control" value="${dealer.pincode || '110001'}" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:24px;">
          <label style="font-weight:700;">Full Pharmacy Address *</label>
          <textarea id="regAddress" class="form-control" rows="2" required>${dealer.address}</textarea>
        </div>

        <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:16px;">2. Verification Documents Upload (UI Only)</h3>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:28px;">
          <div class="doc-upload-box" onclick="window.MediKartApp.toast('Drug License Form 20B/21B uploaded', 'success')">
            <i class="fas fa-file-contract" style="font-size:2.2rem; color:var(--primary); margin-bottom:10px;"></i>
            <h4 style="font-weight:800; font-size:0.95rem;">Drug License Copy</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Upload Form 20B or 21B PDF / JPG</p>
            <span class="badge badge-success" style="margin-top:10px;">Uploaded & Verified</span>
          </div>

          <div class="doc-upload-box" onclick="window.MediKartApp.toast('GST Registration Certificate uploaded', 'success')">
            <i class="fas fa-file-invoice-dollar" style="font-size:2.2rem; color:var(--secondary); margin-bottom:10px;"></i>
            <h4 style="font-weight:800; font-size:0.95rem;">GST Certificate</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Upload GSTIN Registration PDF</p>
            <span class="badge badge-success" style="margin-top:10px;">Uploaded & Verified</span>
          </div>

          <div class="doc-upload-box" onclick="window.MediKartApp.toast('Pharmacy Photograph uploaded', 'success')">
            <i class="fas fa-store" style="font-size:2.2rem; color:var(--accent); margin-bottom:10px;"></i>
            <h4 style="font-weight:800; font-size:0.95rem;">Pharmacy Store Photo</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Storefront photo with sign board</p>
            <span class="badge badge-success" style="margin-top:10px;">Uploaded & Verified</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="submit" class="btn btn-primary btn-lg" style="font-weight:800;">
            <i class="fas fa-floppy-disk"></i> Update Pharmacy Statutory Profile
          </button>
        </div>
      </form>
    `;
  }

  saveRegistrationForm() {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];

    dealer.businessName = document.getElementById('regPharmacyName').value;
    dealer.name = document.getElementById('regOwnerName').value;
    dealer.drugLicense = document.getElementById('regDrugLicense').value;
    dealer.gstNumber = document.getElementById('regGstNumber').value;
    dealer.panNumber = document.getElementById('regPanNumber').value;
    dealer.email = document.getElementById('regEmail').value;
    dealer.phone = document.getElementById('regPhone').value;
    dealer.city = document.getElementById('regCity').value;
    dealer.state = document.getElementById('regState').value;
    dealer.pincode = document.getElementById('regPincode').value;
    dealer.address = document.getElementById('regAddress').value;

    window.MediKartData.saveDealers(dealers);
    window.MediKartData.logDealerAudit('Statutory Profile Updated', 'Verification', dealer.id, `${dealer.businessName} — business, license & contact details updated`, dealer.id, dealer.businessName);
    window.MediKartApp.toast('Pharmacy statutory details updated successfully!', 'success');
    this.renderRegistration(document.querySelector('#dealer-root #main-content'));
  }

  /* --------------------------------------------------------------------------
     3. MEDICINE MANAGEMENT
     -------------------------------------------------------------------------- */
  renderMedicines(container) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];
    let medicines = window.MediKartData.getMedicines().filter(m => m.dealerId === this.dealerId || m.dealerName === dealer.businessName);

    // Apply Search across name, genericName, manufacturer, category, medicineType, batchNumber, packaging, status
    if (this.medsSearch) {
      const q = this.medsSearch.trim().toLowerCase();
      medicines = medicines.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
        (m.therapeuticCategory && m.therapeuticCategory.toLowerCase().includes(q)) ||
        (m.medicineType && m.medicineType.toLowerCase().includes(q)) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(q)) ||
        (m.packaging && m.packaging.toLowerCase().includes(q)) ||
        (m.status && m.status.toLowerCase().includes(q))
      );
    }

    // Apply Filters
    if (this.medsFilterStatus === 'Approved') {
      medicines = medicines.filter(m => m.status === 'Approved' || !m.status);
    } else if (this.medsFilterStatus === 'Draft') {
      medicines = medicines.filter(m => m.status === 'Draft');
    }

    if (this.medsFilterCategory !== 'all') {
      medicines = medicines.filter(m => m.therapeuticCategory === this.medsFilterCategory);
    }

    // Apply Sorting
    medicines.sort((a, b) => {
      let valA = a[this.medsSortCol];
      let valB = b[this.medsSortCol];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.medsSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.medsSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalItems = medicines.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.medsPage > totalPages) this.medsPage = totalPages;
    const startIdx = (this.medsPage - 1) * this.pageSize;
    const pageMeds = medicines.slice(startIdx, startIdx + this.pageSize);

    const isApproved = dealer && dealer.status === 'approved';

    const restrictedBannerHtml = !isApproved ? `
      <div class="alert alert-warning" style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:16px; border-radius:12px; margin-bottom:20px; font-weight:700; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <i class="fas fa-lock" style="font-size:1.5rem; color:#d97706;"></i>
          <div>
            <div style="font-size:1.05rem; font-weight:800;">🔒 Selling access is currently unavailable</div>
            <div style="font-size:0.88rem; font-weight:500; margin-top:2px;">Your Pharmacy must be approved by Platform Admin before you can publish medicines on MediKart.</div>
          </div>
        </div>
        <button class="btn btn-warning btn-sm" style="font-weight:800;" onclick="window.MediKartDealer.navigate('verification')">
          <i class="fas fa-id-card"></i> Complete Verification →
        </button>
      </div>
    ` : `
      <div class="alert alert-success" style="background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:12px; margin-bottom:20px; font-weight:700; display:flex; align-items:center; gap:10px;">
        <i class="fas fa-check-circle" style="font-size:1.2rem; color:#16a34a;"></i>
        <div>
          <span style="font-weight:800;">🟢 SELLER STATUS: ACTIVE & VERIFIED</span> — Your Pharmacy is approved to publish medicines directly without per-medicine Admin approvals.
        </div>
      </div>
    `;

    container.innerHTML = `
      ${restrictedBannerHtml}

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <h2 style="font-size:1.5rem; font-weight:800; margin:0;"><i class="fas fa-pills" style="color:var(--primary);"></i> Medicine Catalog Management (${totalItems})</h2>
        <button class="btn ${isApproved ? 'btn-primary' : 'btn-secondary'}" ${!isApproved ? 'disabled title="Selling access locked until Platform Admin approves Pharmacy"' : ''} onclick="window.MediKartDealer.openAddMedicineModal()"><i class="fas ${isApproved ? 'fa-plus' : 'fa-lock'}"></i> ${isApproved ? 'Add New Medicine' : 'Catalog Locked'}</button>
      </div>
      <p style="color:var(--text-muted); font-size:0.85rem; margin:-14px 0 20px;">Manage what's listed here — name, price, category, description. Stock levels, restocks and out-of-stock status live under <a href="javascript:void(0)" onclick="window.MediKartDealer.navigate('inventory')" style="font-weight:700;">Inventory</a>.</p>

      <!-- Search, Sort & Filter Toolbar -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; align-items:center;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Search Catalog</label>
            <input type="text" class="form-control" placeholder="Search by name, generic, batch..." value="${this.medsSearch}" oninput="window.MediKartDealer.medsSearch = this.value; window.MediKartDealer.medsPage = 1; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Filter Listing Status</label>
            <select class="form-control" onchange="window.MediKartDealer.medsFilterStatus = this.value; window.MediKartDealer.medsPage = 1; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
              <option value="all" ${this.medsFilterStatus === 'all' ? 'selected' : ''}>All Listing Statuses</option>
              <option value="Approved" ${this.medsFilterStatus === 'Approved' ? 'selected' : ''}>Active (Published)</option>
              <option value="Draft" ${this.medsFilterStatus === 'Draft' ? 'selected' : ''}>Draft</option>
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Therapeutic Category</label>
            <select class="form-control" onchange="window.MediKartDealer.medsFilterCategory = this.value; window.MediKartDealer.medsPage = 1; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
              <option value="all">All Categories</option>
              ${window.THERAPEUTIC_CATEGORIES.map(tc => `<option value="${tc.name}" ${this.medsFilterCategory === tc.name ? 'selected' : ''}>${tc.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Sort By Column</label>
            <select class="form-control" onchange="window.MediKartDealer.medsSortCol = this.value; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
              <option value="createdAt" ${this.medsSortCol === 'createdAt' ? 'selected' : ''}>Recently Added / Updated</option>
              <option value="name" ${this.medsSortCol === 'name' ? 'selected' : ''}>Medicine Name</option>
              <option value="sellingPrice" ${this.medsSortCol === 'sellingPrice' ? 'selected' : ''}>Price per Package</option>
              <option value="stock" ${this.medsSortCol === 'stock' ? 'selected' : ''}>Current Stock</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Paginated Medicines Table -->
      <div class="card" style="padding:0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Medicine & Generic</th>
                <th>Category / Type</th>
                <th>Packaging Unit</th>
                <th>Price / Pkg</th>
                <th>Stock Left</th>
                <th>Batch & Expiry</th>
                <th>Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pageMeds.length === 0 ? `<tr><td colspan="8" class="text-center" style="padding:32px;">No medicine listings matched the selected filters.</td></tr>` : pageMeds.map(m => {
                const isRecentlyUpdated = this.recentlyUpdatedMedId === m.id;

                return `
                  <tr style="${isRecentlyUpdated ? 'background:#f0fdf4; border-left:4px solid #10b981;' : ''}">
                    <td>
                      <strong style="font-size:1rem; color:var(--text-main);">${m.name}</strong>
                      <div style="font-size:0.78rem; color:var(--text-muted);">${m.genericName} (${m.manufacturer})</div>
                    </td>
                    <td><span class="badge badge-info">${m.therapeuticCategory}</span></td>
                    <td><span class="badge badge-packaging" style="padding:6px 12px; font-weight:700;">${m.packaging || m.packageUnit}</span></td>
                    <td><strong style="font-size:1.05rem; color:var(--primary);">₹${m.sellingPrice}</strong></td>
                    <td><strong style="color:${m.stock === 0 ? 'var(--danger)' : m.stock <= 15 ? '#d97706' : 'var(--success)'}; font-weight:800;">${m.stock} ${m.packageUnit}</strong></td>
                    <td>
                      <div style="font-size:0.8rem; font-weight:700;"><code>${m.batchNumber || 'BTH-2026-X01'}</code></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">Exp: ${m.expiryDate || '2027-12-31'}</div>
                    </td>
                    <td>
                      <span class="badge ${m.status === 'Draft' ? 'badge-secondary' : 'badge-success'}" style="padding:6px 10px; font-weight:800;">
                        <i class="fas ${m.status === 'Draft' ? 'fa-pen-to-square' : 'fa-check-circle'}"></i> ${m.status === 'Draft' ? 'Draft' : 'Active'}
                      </span>
                    </td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button class="btn btn-sm btn-outline-primary" style="padding:4px 10px; font-weight:700; margin-right:4px;" onclick="window.MediKartDealer.openEditMedicineModal('${m.id}')" title="Edit Medicine"><i class="fas fa-edit"></i> Edit</button>
                      <button class="btn btn-sm btn-outline-secondary" style="padding:4px 10px; font-weight:700; margin-right:4px;" onclick="window.MediKartDealer.invSearch = '${m.name.replace(/'/g, "\\'")}'; window.MediKartDealer.invPage = 1; window.MediKartDealer.navigate('inventory')" title="Manage stock for this item in Inventory"><i class="fas fa-boxes"></i> Stock</button>
                      <button class="btn btn-sm btn-outline-danger" style="padding:4px 8px;" onclick="window.MediKartDealer.deleteMedicine('${m.id}')" title="Delete Listing"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Table Pagination Controls Bar -->
        <div class="table-pagination-bar">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Showing ${totalItems === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + this.pageSize, totalItems)} of ${totalItems} medicines
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${this.medsPage <= 1 ? 'disabled' : ''} onclick="window.MediKartDealer.medsPage--; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
              <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span style="font-weight:700; font-size:0.85rem; padding:0 8px;">Page ${this.medsPage} of ${totalPages}</span>
            <button class="pagination-btn" ${this.medsPage >= totalPages ? 'disabled' : ''} onclick="window.MediKartDealer.medsPage++; window.MediKartDealer.renderMedicines(document.querySelector('#dealer-root #main-content'))">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openAddMedicineModal() {
    window.MediKartApp.showModal({
      title: 'Add / List New Medicine Package',
      content: `
        <form id="medModalForm">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Medicine Name *</label><input type="text" id="mName" class="form-control" placeholder="e.g. Crocin 650 Advance" required></div>
            <div class="form-group"><label style="font-weight:700;">Generic Name *</label><input type="text" id="mGeneric" class="form-control" placeholder="e.g. Paracetamol 650mg" required></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Manufacturer *</label><input type="text" id="mMfr" class="form-control" placeholder="e.g. GSK / Sun Pharma" required></div>
            <div class="form-group"><label style="font-weight:700;">Prescription Required (Rx)</label>
              <select id="mRx" class="form-control">
                <option value="false">No (Over The Counter)</option>
                <option value="true">Yes (Rx Required)</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Medicine Type</label>
              <select id="mType" class="form-control">
                ${window.MEDICINE_TYPES.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label style="font-weight:700;">Therapeutic Category</label>
              <select id="mCategory" class="form-control">
                ${window.THERAPEUTIC_CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Packaging Description *</label><input type="text" id="mPack" class="form-control" placeholder="e.g. 10 Tablets / Strip" required></div>
            <div class="form-group"><label style="font-weight:700;">Package Unit Name *</label><input type="text" id="mUnit" class="form-control" placeholder="e.g. Strips / Bottles / Tubes" required></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Price per Package (₹) *</label><input type="number" id="mPrice" class="form-control" placeholder="48" required></div>
            <div class="form-group"><label style="font-weight:700;">Current Stock Quantity *</label><input type="number" id="mStock" class="form-control" placeholder="100" required></div>
            <div class="form-group"><label style="font-weight:700;">Batch Number</label><input type="text" id="mBatch" class="form-control" placeholder="BTH-2026-X01"></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Manufacturing Date</label><input type="date" id="mMfgDate" class="form-control" value="2025-06-15"></div>
            <div class="form-group"><label style="font-weight:700;">Expiry Date</label><input type="date" id="mExpDate" class="form-control" value="2027-12-31"></div>
          </div>

          <div class="form-group"><label style="font-weight:700;">Medicine Description</label><textarea id="mDesc" class="form-control" rows="2" placeholder="Formulation details, dosage, storage instructions..."></textarea></div>
        </form>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-outline-primary" onclick="window.MediKartDealer.saveMedicineFromModal(true)">Save as Draft</button>
        <button class="btn btn-primary" style="font-weight:800;" onclick="window.MediKartDealer.saveMedicineFromModal(false)"><i class="fas fa-check-circle"></i> Publish Medicine</button>
      `
    });
  }

  openEditMedicineModal(medId) {
    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (!m) return;

    window.MediKartApp.showModal({
      title: `Edit Medicine Package — ${m.name}`,
      content: `
        <form id="medModalForm">
          <input type="hidden" id="editMedId" value="${m.id}">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Medicine Name *</label><input type="text" id="mName" class="form-control" value="${m.name}" required></div>
            <div class="form-group"><label style="font-weight:700;">Generic Name *</label><input type="text" id="mGeneric" class="form-control" value="${m.genericName}" required></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Manufacturer *</label><input type="text" id="mMfr" class="form-control" value="${m.manufacturer}" required></div>
            <div class="form-group"><label style="font-weight:700;">Prescription Required (Rx)</label>
              <select id="mRx" class="form-control">
                <option value="false" ${!m.prescriptionRequired ? 'selected' : ''}>No (Over The Counter)</option>
                <option value="true" ${m.prescriptionRequired ? 'selected' : ''}>Yes (Rx Required)</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Medicine Type</label>
              <select id="mType" class="form-control">
                ${window.MEDICINE_TYPES.map(t => `<option value="${t.name}" ${t.name === m.medicineType ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label style="font-weight:700;">Therapeutic Category</label>
              <select id="mCategory" class="form-control">
                ${window.THERAPEUTIC_CATEGORIES.map(c => `<option value="${c.name}" ${c.name === m.therapeuticCategory ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Packaging Description *</label><input type="text" id="mPack" class="form-control" value="${m.packaging}" required></div>
            <div class="form-group"><label style="font-weight:700;">Package Unit Name *</label><input type="text" id="mUnit" class="form-control" value="${m.packageUnit}" required></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Price per Package (₹) *</label><input type="number" id="mPrice" class="form-control" value="${m.sellingPrice}" required></div>
            <div class="form-group"><label style="font-weight:700;">Current Stock Quantity *</label><input type="number" id="mStock" class="form-control" value="${m.stock}" required></div>
            <div class="form-group"><label style="font-weight:700;">Batch Number</label><input type="text" id="mBatch" class="form-control" value="${m.batchNumber || 'BTH-2026-X01'}"></div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Manufacturing Date</label><input type="date" id="mMfgDate" class="form-control" value="${m.mfgDate || '2025-06-15'}"></div>
            <div class="form-group"><label style="font-weight:700;">Expiry Date</label><input type="date" id="mExpDate" class="form-control" value="${m.expiryDate || '2027-12-31'}"></div>
          </div>

          <div class="form-group"><label style="font-weight:700;">Medicine Description</label><textarea id="mDesc" class="form-control" rows="2">${m.description || ''}</textarea></div>
        </form>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" style="font-weight:800;" onclick="window.MediKartDealer.saveMedicineFromModal(false, '${m.id}')"><i class="fas fa-floppy-disk"></i> Update & Publish</button>
      `
    });
  }

  saveMedicineFromModal(isDraft = false, editId = null) {
    const name = document.getElementById('mName').value;
    const genericName = document.getElementById('mGeneric').value;
    const manufacturer = document.getElementById('mMfr').value;
    const prescriptionRequired = document.getElementById('mRx').value === 'true';
    const medicineType = document.getElementById('mType').value;
    const therapeuticCategory = document.getElementById('mCategory').value;
    const packaging = document.getElementById('mPack').value;
    const packageUnit = document.getElementById('mUnit').value || 'Strips';
    const sellingPrice = Number(document.getElementById('mPrice').value) || 50;
    const stock = Number(document.getElementById('mStock').value) || 0;
    const batchNumber = document.getElementById('mBatch').value || 'BTH-2026-X01';
    const mfgDate = document.getElementById('mMfgDate').value || '2025-06-15';
    const expiryDate = document.getElementById('mExpDate').value || '2027-12-31';
    const description = document.getElementById('mDesc').value;

    if (!name || !sellingPrice) {
      window.MediKartApp.toast('Please provide valid medicine name and price per package.', 'error');
      return;
    }

    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];
    const medicines = window.MediKartData.getMedicines();
    let targetMedId = editId;

    let auditDetails = '';

    if (editId) {
      const m = medicines.find(x => x.id === editId);
      if (m) {
        const before = { price: m.sellingPrice, stock: m.stock, status: m.status };
        m.name = name;
        m.genericName = genericName;
        m.manufacturer = manufacturer;
        m.prescriptionRequired = prescriptionRequired;
        m.medicineType = medicineType;
        m.therapeuticCategory = therapeuticCategory;
        m.packaging = packaging;
        m.packageUnit = packageUnit;
        m.sellingPrice = sellingPrice;
        m.mrp = Math.round(sellingPrice * 1.25);
        m.stock = stock;
        m.batchNumber = batchNumber;
        m.mfgDate = mfgDate;
        m.expiryDate = expiryDate;
        m.description = description;
        m.status = isDraft ? 'Draft' : 'Approved';
        m.createdAt = new Date().toISOString();

        const changeParts = [];
        if (before.price !== sellingPrice) changeParts.push(`price ₹${before.price} → ₹${sellingPrice}`);
        if (before.stock !== stock) changeParts.push(`stock ${before.stock} → ${stock}`);
        if (before.status !== m.status) changeParts.push(`status ${before.status || 'Approved'} → ${m.status}`);
        auditDetails = `${name}${changeParts.length ? ' — ' + changeParts.join(', ') : ' — details updated'}`;
      }
    } else {
      targetMedId = `med-${Date.now()}`;
      medicines.unshift({
        id: targetMedId,
        name, genericName, manufacturer,
        dealerId: dealer.id,
        dealerName: dealer.businessName,
        medicineType, therapeuticCategory,
        packaging, packageUnit,
        mrp: Math.round(sellingPrice * 1.25),
        sellingPrice, stock,
        batchNumber, mfgDate, expiryDate,
        description, prescriptionRequired,
        status: isDraft ? 'Draft' : 'Approved',
        createdAt: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        rating: 4.8, reviewCount: 1,
        restockHistory: [
          { id: `rst-${Date.now()}`, date: new Date().toISOString().split('T')[0], change: `+${stock} ${packageUnit}`, type: 'Restock', stockAfter: stock, notes: 'Initial Medicine Listing Stock' }
        ]
      });
      auditDetails = `${name} — listed at ₹${sellingPrice}, opening stock ${stock} ${packageUnit}`;
    }

    // Reset Search, Filter, Sort, and Page so the newly added/edited medicine shows RIGHT AT THE TOP OF PAGE 1!
    this.medsSearch = '';
    this.medsFilterStatus = 'all';
    this.medsFilterCategory = 'all';
    this.medsSortCol = 'createdAt';
    this.medsSortDir = 'desc';
    this.medsPage = 1;
    this.recentlyUpdatedMedId = targetMedId;

    window.MediKartData.saveMedicines(medicines);
    window.MediKartData.logDealerAudit(
      editId ? 'Medicine Updated' : 'Medicine Added',
      'Medicine', targetMedId, auditDetails, dealer.id, dealer.businessName
    );
    window.MediKartApp.closeModal();
    window.MediKartApp.toast(`Medicine "${name}" ${isDraft ? 'saved as Draft' : 'published & active on storefront!'}`, 'success');
    
    // Switch to medicines view if in another view
    this.navigate('medicines');
  }

  deleteMedicine(medId) {
    const target = window.MediKartData.getMedicines().find(x => x.id === medId);
    if (!target) {
      window.MediKartApp.toast('That listing no longer exists.', 'error');
      return;
    }

    // A dealer must not be able to delete another pharmacy's listing.
    if (target.dealerId !== this.getDealerId()) {
      window.MediKartApp.toast('You can only remove listings that belong to your own pharmacy.', 'error');
      return;
    }

    window.MediKartApp.showConfirm({
      title: 'Remove listing',
      message: `Remove "${target.name}" from your store? Existing orders keep their records, but customers will no longer be able to buy it from you.`,
      confirmLabel: 'Remove listing',
      danger: true,
      onConfirm: () => {
        let medicines = window.MediKartData.getMedicines();
        medicines = medicines.filter(x => x.id !== medId);
        window.MediKartData.saveMedicines(medicines);

        const dealer = window.MediKartData.getDealers().find(d => d.id === this.getDealerId());
        window.MediKartData.logDealerAudit(
          'Medicine Deleted', 'Medicine', medId,
          `${target.name} — removed from catalog`,
          this.getDealerId(), dealer ? dealer.businessName : null
        );

        window.MediKartApp.toast('Listing removed from your store.', 'info');
        this.renderMedicines(document.querySelector('#dealer-root #main-content'));
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. INVENTORY CONTROL & RESTOCK HISTORY
     -------------------------------------------------------------------------- */
  renderInventory(container) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];
    let medicines = window.MediKartData.getMedicines().filter(m => m.dealerId === this.dealerId || m.dealerName === dealer.businessName);

    // Filter
    if (this.invSearch) {
      const q = this.invSearch.trim().toLowerCase();
      medicines = medicines.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) || 
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(q)) ||
        (m.packaging && m.packaging.toLowerCase().includes(q))
      );
    }
    if (this.invFilterStatus === 'optimal') medicines = medicines.filter(m => m.stock > 15);
    else if (this.invFilterStatus === 'low') medicines = medicines.filter(m => m.stock > 0 && m.stock <= 15);
    else if (this.invFilterStatus === 'out') medicines = medicines.filter(m => m.stock === 0);

    // Pagination
    const totalItems = medicines.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.invPage > totalPages) this.invPage = totalPages;
    const startIdx = (this.invPage - 1) * this.pageSize;
    const pageMeds = medicines.slice(startIdx, startIdx + this.pageSize);

    // Aggregates
    const allMeds = window.MediKartData.getMedicines().filter(m => m.dealerId === this.dealerId || m.dealerName === dealer.businessName);
    const activeCount = allMeds.filter(m => m.stock > 0).length;
    const lowCount = allMeds.filter(m => m.stock > 0 && m.stock <= 15).length;
    const outCount = allMeds.filter(m => m.stock === 0).length;

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:20px;"><i class="fas fa-boxes" style="color:var(--primary);"></i> Inventory Stock Control</h1>

      <!-- Summary Cards -->
      <div class="dealer-summary-grid">
        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--success);">${activeCount}</div><div class="title">Active In-Stock</div></div>
          <div class="icon-box" style="background:var(--success);"><i class="fas fa-boxes-stacked"></i></div>
        </div>
        <div class="dealer-summary-card">
          <div><div class="val" style="color:#d97706;">${lowCount}</div><div class="title">Low Stock Alert</div></div>
          <div class="icon-box" style="background:#d97706;"><i class="fas fa-triangle-exclamation"></i></div>
        </div>
        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--danger);">${outCount}</div><div class="title">Out of Stock</div></div>
          <div class="icon-box" style="background:var(--danger);"><i class="fas fa-box-open"></i></div>
        </div>
        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--primary);">${allMeds.length}</div><div class="title">Total Inventory Items</div></div>
          <div class="icon-box" style="background:var(--primary);"><i class="fas fa-cubes"></i></div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Search Stock</label>
            <input type="text" class="form-control" placeholder="Search medicine or batch..." value="${this.invSearch}" oninput="window.MediKartDealer.invSearch = this.value; window.MediKartDealer.invPage = 1; window.MediKartDealer.renderInventory(document.querySelector('#dealer-root #main-content'))">
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Filter Stock Condition</label>
            <select class="form-control" onchange="window.MediKartDealer.invFilterStatus = this.value; window.MediKartDealer.invPage = 1; window.MediKartDealer.renderInventory(document.querySelector('#dealer-root #main-content'))">
              <option value="all" ${this.invFilterStatus === 'all' ? 'selected' : ''}>All Stock Items</option>
              <option value="optimal" ${this.invFilterStatus === 'optimal' ? 'selected' : ''}>Optimal Stock (>15)</option>
              <option value="low" ${this.invFilterStatus === 'low' ? 'selected' : ''}>Low Stock (1-15)</option>
              <option value="out" ${this.invFilterStatus === 'out' ? 'selected' : ''}>Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card" style="padding:0; margin-bottom:28px;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Current Stock</th>
                <th>Stock Unit</th>
                <th>Batch Number</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style="text-align:right;">Stock Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pageMeds.length === 0 ? `<tr><td colspan="7" class="text-center" style="padding:32px;">No inventory items match filter criteria.</td></tr>` : pageMeds.map(m => {
                const statusBadge = m.stock === 0 ? '<span class="badge badge-danger">Out of Stock</span>' : m.stock <= 15 ? '<span class="badge badge-warning">Low Stock</span>' : '<span class="badge badge-success">Optimal Stock</span>';

                return `
                  <tr>
                    <td>
                      <strong>${m.name}</strong>
                      <div style="font-size:0.78rem; color:var(--text-muted);">${m.packaging}</div>
                    </td>
                    <td><strong style="font-size:1.05rem; color:${m.stock === 0 ? 'var(--danger)' : m.stock <= 15 ? '#d97706' : 'var(--text-main)'};">${m.stock}</strong></td>
                    <td><span class="badge badge-packaging" style="padding:6px 12px; font-weight:700;">${m.packaging || m.packageUnit}</span></td>
                    <td><code>${m.batchNumber || 'BTH-2026-X01'}</code></td>
                    <td><span style="color:var(--text-main); font-weight:600;">${m.expiryDate || '2027-12-31'}</span></td>
                    <td>${statusBadge}</td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button class="btn btn-sm btn-outline-primary" style="padding:4px 10px; font-weight:700; margin-right:4px;" onclick="window.MediKartDealer.openRestockModal('${m.id}')"><i class="fas fa-plus-circle"></i> Restock</button>
                      <button class="btn btn-sm ${m.stock === 0 ? 'btn-outline-success' : 'btn-outline-danger'}" style="padding:4px 10px; font-weight:700; margin-right:4px;" onclick="window.MediKartDealer.toggleOutOfStock('${m.id}')">
                        ${m.stock === 0 ? 'Restock Item' : 'Mark Out of Stock'}
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" style="padding:4px 8px;" onclick="window.MediKartDealer.viewRestockHistoryModal('${m.id}')"><i class="fas fa-clock-rotate-left"></i> Logs</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="table-pagination-bar">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Showing ${totalItems === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + this.pageSize, totalItems)} of ${totalItems} inventory records
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${this.invPage <= 1 ? 'disabled' : ''} onclick="window.MediKartDealer.invPage--; window.MediKartDealer.renderInventory(document.querySelector('#dealer-root #main-content'))">
              <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span style="font-weight:700; font-size:0.85rem; padding:0 8px;">Page ${this.invPage} of ${totalPages}</span>
            <button class="pagination-btn" ${this.invPage >= totalPages ? 'disabled' : ''} onclick="window.MediKartDealer.invPage++; window.MediKartDealer.renderInventory(document.querySelector('#dealer-root #main-content'))">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Restock History Ledger Feed -->
      <div class="card">
        <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:14px;"><i class="fas fa-history" style="color:var(--primary);"></i> Recent Pharmacy Restock & Stock Movement History</h3>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date & Timestamp</th>
                <th>Medicine Item</th>
                <th>Stock Quantity Change</th>
                <th>Movement Type</th>
                <th>Stock Level After</th>
                <th>Notes / Reference</th>
              </tr>
            </thead>
            <tbody>
              ${allMeds.slice(0, 8).map(m => {
                const logs = m.restockHistory || [
                  { id: '1', date: '2026-07-25', change: `+50 ${m.packageUnit}`, type: 'Restock', stockAfter: m.stock, notes: 'Supplier Restock Shipment' }
                ];
                return logs.map(l => `
                  <tr>
                    <td><strong>${l.date}</strong></td>
                    <td>${m.name}</td>
                    <td><span class="restock-log-badge ${l.type === 'Restock' ? 'type-restock' : 'type-sale'}">${l.change}</span></td>
                    <td><strong>${l.type}</strong></td>
                    <td><strong>${l.stockAfter} ${m.packageUnit}</strong></td>
                    <td style="color:var(--text-muted); font-size:0.85rem;">${l.notes}</td>
                  </tr>
                `).join('');
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  openRestockModal(medId) {
    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (!m) return;

    window.MediKartApp.showModal({
      title: `Restock Inventory — ${m.name}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Current Available Stock</label>
          <input type="text" class="form-control" value="${m.stock} ${m.packageUnit}" readonly style="background:var(--bg-main);">
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Additional Restock Quantity (${m.packageUnit}) *</label>
          <input type="number" id="restockAddQty" class="form-control" placeholder="e.g. 50" required>
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Batch Number Update</label>
          <input type="text" id="restockBatch" class="form-control" value="${m.batchNumber || 'BTH-2026-X01'}">
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Restock Notes / Invoice Reference</label>
          <input type="text" id="restockNotes" class="form-control" placeholder="e.g. Supplier Batch #9982 Arrival">
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.MediKartDealer.saveRestock('${m.id}')">Confirm Restock</button>
      `
    });
  }

  saveRestock(medId) {
    const addQty = Number(document.getElementById('restockAddQty').value);
    const batch = document.getElementById('restockBatch').value;
    const notes = document.getElementById('restockNotes').value || 'Manual Inventory Restock';

    if (!addQty || addQty <= 0) {
      window.MediKartApp.toast('Please enter a valid positive restock quantity', 'error');
      return;
    }

    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (m) {
      m.stock = m.stock + addQty;
      if (batch) m.batchNumber = batch;

      if (!m.restockHistory) m.restockHistory = [];
      m.restockHistory.unshift({
        id: `rst-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        change: `+${addQty} ${m.packageUnit}`,
        type: 'Restock',
        stockAfter: m.stock,
        notes: notes
      });

      window.MediKartData.saveMedicines(medicines);

      const dealer = window.MediKartData.getDealers().find(d => d.id === this.dealerId);
      window.MediKartData.logDealerAudit(
        'Stock Restocked', 'Medicine', medId,
        `${m.name} — +${addQty} ${m.packageUnit} → ${m.stock} total${batch ? `, batch ${batch}` : ''}. ${notes}`,
        this.getDealerId(), dealer ? dealer.businessName : null
      );

      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Successfully added +${addQty} ${m.packageUnit} to ${m.name}!`, 'success');
      this.renderInventory(document.querySelector('#dealer-root #main-content'));
    }
  }

  toggleOutOfStock(medId) {
    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (m) {
      const dealer = window.MediKartData.getDealers().find(d => d.id === this.dealerId);
      if (m.stock > 0) {
        m.stock = 0;
        window.MediKartApp.toast(`Marked ${m.name} as Out of Stock`, 'info');
        window.MediKartData.logDealerAudit('Marked Out of Stock', 'Medicine', medId, `${m.name} — stock set to 0`, this.getDealerId(), dealer ? dealer.businessName : null);
      } else {
        m.stock = 50;
        window.MediKartApp.toast(`Restocked ${m.name} to 50 ${m.packageUnit}`, 'success');
        window.MediKartData.logDealerAudit('Stock Restocked', 'Medicine', medId, `${m.name} — restored to 50 ${m.packageUnit}`, this.getDealerId(), dealer ? dealer.businessName : null);
      }
      window.MediKartData.saveMedicines(medicines);
      this.renderInventory(document.querySelector('#dealer-root #main-content'));
    }
  }

  viewRestockHistoryModal(medId) {
    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (!m) return;

    const logs = m.restockHistory || [
      { id: '1', date: '2026-07-25', change: `+50 ${m.packageUnit}`, type: 'Restock', stockAfter: m.stock, notes: 'Supplier Restock Shipment' }
    ];

    window.MediKartApp.showModal({
      title: `Restock History Ledger — ${m.name}`,
      content: `
        <div style="margin-bottom:12px; font-size:0.9rem;">Current Stock Level: <strong>${m.stock} ${m.packageUnit}</strong> | Batch: <code>${m.batchNumber || 'N/A'}</code></div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Date</th><th>Change</th><th>Type</th><th>Stock After</th><th>Notes</th></tr></thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td>${l.date}</td>
                  <td><span class="restock-log-badge ${l.type === 'Restock' ? 'type-restock' : 'type-sale'}">${l.change}</span></td>
                  <td><strong>${l.type}</strong></td>
                  <td><strong>${l.stockAfter}</strong></td>
                  <td style="color:var(--text-muted);">${l.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `,
      footerButtons: `<button class="btn btn-primary" onclick="window.MediKartApp.closeModal()">Close</button>`
    });
  }

  handleOrdersSearchInput(el) {
    const val = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    this.ordersSearch = val;
    this.ordersPage = 1;
    this.renderOrders(document.querySelector('#dealer-root #main-content'));
    const newInput = document.getElementById('dealerOrdersSearchInput');
    if (newInput) {
      newInput.focus();
      try { newInput.setSelectionRange(start, end); } catch(e) {}
    }
  }

  clearOrdersSearch() {
    this.ordersSearch = '';
    this.ordersPage = 1;
    this.renderOrders(document.querySelector('#dealer-root #main-content'));
  }

  /* --------------------------------------------------------------------------
     5. ORDERS & DELIVERY TIMELINE ADVANCEMENT
     -------------------------------------------------------------------------- */
  renderOrders(container) {
    const dealerId = this.getDealerId();
    const dealerStatus = this.getDealerStatus();
    let orders = window.MediKartData.getDealerOrders(dealerId);

    // Enhanced Multi-Field Search Matching
    if (this.ordersSearch) {
      const q = this.ordersSearch.trim().toLowerCase();
      orders = orders.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.subOrderId && o.subOrderId.toLowerCase().includes(q)) ||
        (o.parentOrderId && o.parentOrderId.toLowerCase().includes(q)) ||
        (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
        (o.buyerEmail && o.buyerEmail.toLowerCase().includes(q)) ||
        (o.buyerPhone && o.buyerPhone.toLowerCase().includes(q)) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
        (o.transactionRef && o.transactionRef.toLowerCase().includes(q)) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q)) ||
        (o.paymentStatus && o.paymentStatus.toLowerCase().includes(q)) ||
        (o.rxStatus && o.rxStatus.toLowerCase().includes(q)) ||
        (o.status && o.status.toLowerCase().includes(q)) ||
        (o.orderDate && o.orderDate.toLowerCase().includes(q)) ||
        (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q)) ||
        (o.items && o.items.some(i => 
          (i.medicineName && i.medicineName.toLowerCase().includes(q)) ||
          (i.genericName && i.genericName.toLowerCase().includes(q)) ||
          (i.therapeuticCategory && i.therapeuticCategory.toLowerCase().includes(q)) ||
          (i.packaging && i.packaging.toLowerCase().includes(q)) ||
          (i.packageUnit && i.packageUnit.toLowerCase().includes(q))
        ))
      );
    }

    if (this.ordersFilterStatus !== 'all') {
      orders = orders.filter(o => o.status === this.ordersFilterStatus);
    }

    // Pagination
    const totalItems = orders.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.ordersPage > totalPages) this.ordersPage = totalPages;
    const startIdx = (this.ordersPage - 1) * this.pageSize;
    const pageOrders = orders.slice(startIdx, startIdx + this.pageSize);

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-shipping-fast" style="color:var(--primary);"></i> Customer Orders Fulfillment</h1>
      <p style="color:var(--text-muted); margin-bottom:20px;">Process buyer orders, update delivery timeline progression, and view invoice details.</p>

      ${dealerStatus !== 'approved' ? `
        <div class="alert alert-warning" style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:16px; border-radius:12px; margin-bottom:20px; font-weight:700; display:flex; align-items:center; gap:12px;">
          <i class="fas fa-triangle-exclamation" style="font-size:1.3rem;"></i>
          <span>Account status is <strong>${dealerStatus.toUpperCase()}</strong>: Fulfillment and order status modifications are currently disabled.</span>
        </div>
      ` : ''}

      <!-- Filter Toolbar -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Search Orders (${totalItems})</label>
            <div style="position:relative; display:flex; align-items:center;">
              <i class="fas fa-search" style="position:absolute; left:12px; color:var(--text-muted); font-size:0.9rem;"></i>
              <input type="text" id="dealerOrdersSearchInput" class="form-control" style="padding-left:36px; padding-right:${this.ordersSearch ? '36px' : '12px'};" placeholder="Search order #, buyer, email, phone, medicine, payment, status..." value="${this.ordersSearch}" oninput="window.MediKartDealer.handleOrdersSearchInput(this)">
              ${this.ordersSearch ? `<i class="fas fa-circle-xmark" style="position:absolute; right:12px; cursor:pointer; color:var(--text-muted);" onclick="window.MediKartDealer.clearOrdersSearch()"></i>` : ''}
            </div>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Filter Order Stage</label>
            <select class="form-control" onchange="window.MediKartDealer.ordersFilterStatus = this.value; window.MediKartDealer.ordersPage = 1; window.MediKartDealer.renderOrders(document.querySelector('#dealer-root #main-content'))">
              <option value="all">All Order Stages</option>
              <option value="Placed" ${this.ordersFilterStatus === 'Placed' ? 'selected' : ''}>Placed (New Order)</option>
              <option value="Accepted" ${this.ordersFilterStatus === 'Accepted' ? 'selected' : ''}>Accepted</option>
              <option value="Packed" ${this.ordersFilterStatus === 'Packed' ? 'selected' : ''}>Packed</option>
              <option value="Shipped" ${this.ordersFilterStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Out for Delivery" ${this.ordersFilterStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${this.ordersFilterStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders List Cards / Timeline -->
      ${pageOrders.length === 0 ? `
        <div class="card text-center" style="padding:40px;">No customer orders match the selected search query or stage filter.</div>
      ` : pageOrders.map(ord => `
        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
            <div>
              <strong style="font-size:1.1rem; color:var(--primary);">Order #${ord.id}</strong>
              <span style="font-size:0.85rem; color:var(--text-muted); margin-left:10px;">Invoice: <code>${ord.invoiceNumber || 'INV-2026-9801'}</code> • Placed: ${ord.orderDate}</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="badge ${ord.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">Payment: ${ord.paymentStatus || 'Paid'}</span>
              ${ord.rxStatus && ord.rxStatus !== 'N/A' ? `
                <span class="badge ${ord.rxStatus === 'Verified' ? 'badge-success' : ord.rxStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}">
                  Rx: ${ord.rxStatus}
                </span>
              ` : ''}
              <span class="badge badge-info">${ord.status}</span>
              <button class="btn btn-xs btn-outline-primary" onclick="window.MediKartDealer.viewInvoiceModal('${ord.id}')"><i class="fas fa-file-invoice"></i> Invoice</button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
            <div>
              <div style="font-size:0.85rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Buyer & Shipping Address</div>
              <div style="font-size:0.9rem; margin-bottom:12px;">
                <strong>${ord.buyerName}</strong> (${ord.buyerEmail || 'buyer@medikart.com'})<br>
                <span style="color:var(--text-muted);">${ord.shippingAddress || 'Flat 402, Green Glen Apartments, HSR Layout, Bengaluru'}</span>
              </div>

              <!-- Prescription Review Section -->
              ${ord.rxStatus && ord.rxStatus !== 'N/A' ? `
                <div style="background:#fffbeb; border:1px solid #fde68a; padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:0.85rem; font-weight:800; color:#92400e;">
                      <i class="fas fa-file-prescription"></i> Doctor Prescription Review Required:
                    </div>
                    <span class="badge ${ord.rxStatus === 'Verified' ? 'badge-success' : ord.rxStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}">${ord.rxStatus}</span>
                  </div>
                  ${ord.rxRejectionReason ? `<div style="font-size:0.82rem; color:var(--danger); margin-top:4px;"><strong>Rejection Reason:</strong> ${ord.rxRejectionReason}</div>` : ''}
                  
                  <div style="margin-top:8px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-xs btn-outline-secondary" onclick="window.MediKartDealer.viewPrescriptionModal('${ord.id}')">
                      <i class="fas fa-eye"></i> View File (${(ord.rxData && ord.rxData.fileName) || 'Prescription.pdf'})
                    </button>
                    ${ord.rxStatus === 'Pending' ? `
                      <button class="btn btn-xs btn-success" onclick="window.MediKartDealer.verifyRx('${ord.id}')">
                        <i class="fas fa-check"></i> Verify Rx
                      </button>
                      <button class="btn btn-xs btn-danger" onclick="window.MediKartDealer.openRejectRxModal('${ord.id}')">
                        <i class="fas fa-xmark"></i> Reject Rx
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <div style="font-size:0.85rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Order Items</div>
              <div style="background:var(--bg-main); padding:10px 14px; border-radius:var(--radius-sm);">
                ${ord.items ? ord.items.map(it => `
                  <div style="display:flex; justify-content:space-between; font-size:0.88rem; padding:4px 0;">
                    <span><strong>${it.medicineName}</strong> (x${it.quantity} ${it.packageUnit || 'Strips'})</span>
                    <strong>₹${(it.subtotal || (it.pricePerUnit * it.quantity)).toFixed(2)}</strong>
                  </div>
                `).join('') : `<div>1x Medicine Package — ₹${ord.grandTotal}</div>`}
              </div>
            </div>

            <!-- Dealer Order Stage Controls -->
            <div style="border-left:1px solid var(--border-color); padding-left:16px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="font-size:0.85rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Grand Total</div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--primary);">₹${(ord.grandTotal || ord.subtotal).toFixed(2)}</div>
              </div>

              <div>
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:8px;">Advance Delivery Stage:</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${dealerStatus !== 'approved' ? `
                    <button class="btn btn-sm btn-outline-secondary" disabled>Fulfillment Blocked</button>
                  ` : (ord.rxStatus === 'Pending' || ord.rxStatus === 'Rejected') ? `
                    <button class="btn btn-sm btn-outline-danger" disabled style="font-size:0.8rem;">
                      <i class="fas fa-lock"></i> Rx ${ord.rxStatus} (Fulfillment Paused)
                    </button>
                  ` : ord.status === 'Placed' ? `
                    <button class="btn btn-sm btn-primary" onclick="window.MediKartDealer.updateOrderStatus('${ord.id}', 'Accepted')"><i class="fas fa-check"></i> Accept Order</button>
                  ` : ord.status === 'Accepted' ? `
                    <button class="btn btn-sm btn-warning" onclick="window.MediKartDealer.updateOrderStatus('${ord.id}', 'Packed')"><i class="fas fa-box"></i> Mark Packed</button>
                  ` : ord.status === 'Packed' ? `
                    <button class="btn btn-sm btn-info" onclick="window.MediKartDealer.updateOrderStatus('${ord.id}', 'Shipped')"><i class="fas fa-truck"></i> Mark Shipped</button>
                  ` : ord.status === 'Shipped' ? `
                    <button class="btn btn-sm btn-secondary" onclick="window.MediKartDealer.updateOrderStatus('${ord.id}', 'Out for Delivery')"><i class="fas fa-motorcycle"></i> Out for Delivery</button>
                  ` : ord.status === 'Out for Delivery' ? `
                    <button class="btn btn-sm btn-success" onclick="window.MediKartDealer.updateOrderStatus('${ord.id}', 'Delivered')"><i class="fas fa-circle-check"></i> Mark Delivered</button>
                  ` : `
                    <span class="badge badge-success" style="padding:8px; font-weight:800; text-align:center;"><i class="fas fa-check-double"></i> Delivered Successfully</span>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}

      <!-- Pagination -->
      <div class="table-pagination-bar" style="border:1px solid var(--border-color); border-radius:var(--radius-md);">
        <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
          Showing ${totalItems === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + this.pageSize, totalItems)} of ${totalItems} customer orders
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" ${this.ordersPage <= 1 ? 'disabled' : ''} onclick="window.MediKartDealer.ordersPage--; window.MediKartDealer.renderOrders(document.querySelector('#dealer-root #main-content'))">
            <i class="fas fa-chevron-left"></i> Prev
          </button>
          <span style="font-weight:700; font-size:0.85rem; padding:0 8px;">Page ${this.ordersPage} of ${totalPages}</span>
          <button class="pagination-btn" ${this.ordersPage >= totalPages ? 'disabled' : ''} onclick="window.MediKartDealer.ordersPage++; window.MediKartDealer.renderOrders(document.querySelector('#dealer-root #main-content'))">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  verifyRx(orderId) {
    const dealerId = this.getDealerId();
    window.MediKartData.verifyOrderPrescription(orderId, dealerId);
    window.MediKartApp.toast(`Prescription for Order #${orderId} verified successfully! Fulfillment unlocked.`, 'success');
    this.renderOrders(document.querySelector('#dealer-root #main-content'));
  }

  openRejectRxModal(orderId) {
    window.MediKartApp.showModal({
      title: `Reject Prescription — Order #${orderId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Rejection Reason / Regulatory Finding *</label>
          <textarea id="rejectRxReasonInput" class="form-control" rows="3" placeholder="e.g. Doctor signature missing, prescription expired, or dosage mismatch." required></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="window.MediKartDealer.saveRejectRx('${orderId}')">Confirm Rejection</button>
      `
    });
  }

  saveRejectRx(orderId) {
    const reason = document.getElementById('rejectRxReasonInput').value;
    if (!reason || !reason.trim()) {
      window.MediKartApp.toast('Please specify a rejection reason.', 'error');
      return;
    }
    const dealerId = this.getDealerId();
    window.MediKartData.rejectOrderPrescription(orderId, dealerId, reason.trim());
    window.MediKartApp.closeModal();
    window.MediKartApp.toast(`Prescription for Order #${orderId} rejected. Order fulfillment paused.`, 'warning');
    this.renderOrders(document.querySelector('#dealer-root #main-content'));
  }

  viewPrescriptionModal(orderId) {
    const orders = window.MediKartData.getOrders();
    let ord = orders.find(o => o.id === orderId);
    if (!ord) {
      orders.forEach(o => {
        if (o.subOrders) {
          const sub = o.subOrders.find(s => s.subOrderId === orderId);
          if (sub) ord = sub;
        }
      });
    }

    const rxData = (ord && ord.rxData) || { fileName: 'Doctor_Prescription.pdf', fileType: 'pdf', uploadTime: new Date().toISOString() };

    window.MediKartApp.showModal({
      title: `Prescription Verification Document — Order #${orderId}`,
      content: `
        <div style="text-align:center; padding:20px; background:var(--bg-input); border-radius:var(--radius-md);">
          <i class="fas fa-file-pdf" style="font-size:3rem; color:var(--danger); margin-bottom:12px;"></i>
          <h3 style="font-weight:800; font-size:1.1rem;">${rxData.fileName}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">Uploaded: ${rxData.uploadTime}</p>
          <div class="badge badge-info" style="font-size:0.85rem; padding:8px 16px;">Verified Schedule H Medical Document Preview</div>
        </div>
      `,
      footerButtons: `<button class="btn btn-primary" onclick="window.MediKartApp.closeModal()">Close Preview</button>`
    });
  }

  updateOrderStatus(orderId, newStatus) {
    const dealerId = this.getDealerId();
    const dealerStatus = this.getDealerStatus();
    if (dealerStatus !== 'approved') {
      window.MediKartApp.toast(`Order stage update disabled: Dealer status is ${dealerStatus.toUpperCase()}`, 'error');
      return;
    }

    const res = window.MediKartData.updateOrderStage(orderId, newStatus, dealerId);
    if (!res.success) {
      window.MediKartApp.toast(res.error, 'error');
      return;
    }

    window.MediKartApp.toast(`Order stage updated to ${newStatus}!`, 'success');
    this.renderOrders(document.querySelector('#dealer-root #main-content'));
  }

  viewInvoiceModal(orderId) {
    const orders = window.MediKartData.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    window.MediKartApp.showModal({
      title: `Official Invoice — ${ord.invoiceNumber || 'INV-2026-9801'}`,
      content: `
        <div style="font-size:0.9rem; line-height:1.6;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:12px;">
            <div>
              <strong>Seller:</strong> ${ord.dealerName}<br>
              <strong>Date:</strong> ${ord.orderDate}<br>
              <strong>Payment:</strong> ${ord.paymentMethod || 'UPI'} (${ord.paymentStatus || 'Paid'})
            </div>
            <div style="text-align:right;">
              <strong>Billed To:</strong> ${ord.buyerName}<br>
              <strong>Order ID:</strong> #${ord.id}<br>
              <strong>Status:</strong> <span class="badge badge-success">${ord.status}</span>
            </div>
          </div>

          <div style="background:var(--bg-main); padding:12px; border-radius:var(--radius-sm); margin-bottom:12px;">
            ${ord.items ? ord.items.map(it => `
              <div style="display:flex; justify-content:space-between; padding:4px 0;">
                <span>${it.medicineName} (x${it.quantity})</span>
                <strong>₹${it.subtotal || (it.pricePerUnit * it.quantity)}</strong>
              </div>
            `).join('') : `<div>1x Medicine Package — ₹${ord.grandTotal}</div>`}
          </div>

          <div style="text-align:right; font-size:1.1rem; font-weight:800; color:var(--primary);">
            Grand Total Paid: ₹${ord.grandTotal.toFixed(2)}
          </div>
        </div>
      `,
      footerButtons: `<button class="btn btn-primary" onclick="window.MediKartApp.closeModal()">Close Invoice</button>`
    });
  }

  /* --------------------------------------------------------------------------
     6. REVENUE & FINANCIAL ANALYTICS
     -------------------------------------------------------------------------- */
  renderRevenue(container) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];
    const orders = window.MediKartData.getOrders().filter(o => o.dealerName === dealer.businessName || o.dealerId === dealer.id);
    const settings = window.MediKartData.getSettings();

    // Revenue is net product value (what the pharmacy actually earns), not the
    // grand total — that includes GST owed to the tax authority and delivery
    // fees owed to logistics, and commission must not be charged on either.
    const commRate = window.MediKartData.getCommissionRate();
    const netOf = o => window.MediKartData.getCommissionableValue(o);

    const fin = window.MediKartData.summarizeOrderFinancials(orders, commRate);
    const totalRev = fin.netProductValue;
    const commDeduction = fin.platformCommission;
    const netPayout = fin.dealerPayout;

    // Date windows computed relative to today, not pinned to fixed 2026 dates.
    const today = new Date();
    const iso = d => d.toISOString().split('T')[0];
    const todayStr = iso(today);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const currentMonthPrefix = todayStr.slice(0, 7);

    const todayRev = orders.filter(o => o.orderDate === todayStr).reduce((s, o) => s + netOf(o), 0);
    const weeklyRev = orders.filter(o => o.orderDate && o.orderDate >= iso(weekAgo)).reduce((s, o) => s + netOf(o), 0);
    const monthlyRev = orders.filter(o => o.orderDate && o.orderDate.startsWith(currentMonthPrefix)).reduce((s, o) => s + netOf(o), 0);

    // Filtered Recent Transactions
    let transactions = [...orders];
    if (this.revSearch) {
      const q = this.revSearch.trim().toLowerCase();
      transactions = transactions.filter(t => 
        (t.id && t.id.toLowerCase().includes(q)) || 
        (t.buyerName && t.buyerName.toLowerCase().includes(q)) ||
        (t.buyerEmail && t.buyerEmail.toLowerCase().includes(q)) ||
        (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(q))
      );
    }

    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.revPage > totalPages) this.revPage = totalPages;
    const startIdx = (this.revPage - 1) * this.pageSize;
    const pageTx = transactions.slice(startIdx, startIdx + this.pageSize);

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-chart-line" style="color:var(--primary);"></i> Revenue & Financial Analytics</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Gross customer sales, platform commission deductions, and net payout settlements.</p>

      <!-- Revenue Summary Cards -->
      <div class="dealer-summary-grid">
        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--primary);">₹${todayRev.toFixed(2)}</div><div class="title">Today's Revenue</div></div>
          <div class="icon-box" style="background:var(--primary);"><i class="fas fa-sun"></i></div>
        </div>

        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--secondary);">₹${weeklyRev.toFixed(2)}</div><div class="title">Weekly Revenue</div></div>
          <div class="icon-box" style="background:var(--secondary);"><i class="fas fa-calendar-week"></i></div>
        </div>

        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--accent);">₹${monthlyRev.toFixed(2)}</div><div class="title">Monthly Revenue</div></div>
          <div class="icon-box" style="background:var(--accent);"><i class="fas fa-calendar-days"></i></div>
        </div>

        <div class="dealer-summary-card">
          <div><div class="val" style="color:var(--success);">₹${netPayout.toFixed(2)}</div><div class="title">Net Payout (${100 - commRate}%)</div></div>
          <div class="icon-box" style="background:var(--success);"><i class="fas fa-wallet"></i></div>
        </div>
      </div>

      <!-- Financial Charts Section -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:20px; margin-bottom:28px;">
        <div class="dealer-chart-card">
          <h3><i class="fas fa-chart-line" style="color:var(--primary);"></i> Revenue Growth Trend</h3>
          <div class="chart-wrapper"><canvas id="revGrowthChart"></canvas></div>
        </div>

        <div class="dealer-chart-card">
          <h3><i class="fas fa-chart-column" style="color:var(--secondary);"></i> Category Revenue Performance</h3>
          <div class="chart-wrapper"><canvas id="categoryRevChart"></canvas></div>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div class="card" style="padding:0;">
        <div style="padding:16px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <h3 style="font-weight:800; font-size:1.1rem; margin:0;"><i class="fas fa-list-check" style="color:var(--primary);"></i> Recent Transaction Ledger</h3>
          <input type="text" class="form-control" style="width:240px;" placeholder="Search transactions..." value="${this.revSearch}" oninput="window.MediKartDealer.revSearch = this.value; window.MediKartDealer.revPage = 1; window.MediKartDealer.renderRevenue(document.querySelector('#dealer-root #main-content'))">
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Order Reference</th>
                <th>Transaction Date</th>
                <th>Buyer Name</th>
                <th>Customer Paid</th>
                <th>Net Sale (commissionable)</th>
                <th>Commission (${commRate}%)</th>
                <th>Net Dealer Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${pageTx.length === 0 ? `<tr><td colspan="8" class="text-center" style="padding:32px;">No transactions found.</td></tr>` : pageTx.map(t => {
                const netSale = netOf(t);
                const comm = netSale * (commRate / 100);
                const net = netSale - comm;
                return `
                  <tr>
                    <td><strong>#${this.esc(t.id)}</strong></td>
                    <td>${this.esc(t.orderDate)}</td>
                    <td>${this.esc(t.buyerName)}</td>
                    <td>₹${(Number(t.grandTotal) || 0).toFixed(2)}</td>
                    <td><strong>₹${netSale.toFixed(2)}</strong></td>
                    <td style="color:var(--danger);">-₹${comm.toFixed(2)}</td>
                    <td style="color:var(--success);"><strong>₹${net.toFixed(2)}</strong></td>
                    <td><span class="badge ${t.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${this.esc(t.paymentStatus || 'Paid')}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="table-pagination-bar">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Showing ${totalItems === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + this.pageSize, totalItems)} of ${totalItems} transactions
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${this.revPage <= 1 ? 'disabled' : ''} onclick="window.MediKartDealer.revPage--; window.MediKartDealer.renderRevenue(document.querySelector('#dealer-root #main-content'))">
              <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span style="font-weight:700; font-size:0.85rem; padding:0 8px;">Page ${this.revPage} of ${totalPages}</span>
            <button class="pagination-btn" ${this.revPage >= totalPages ? 'disabled' : ''} onclick="window.MediKartDealer.revPage++; window.MediKartDealer.renderRevenue(document.querySelector('#dealer-root #main-content'))">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => this.initRevenueCharts(), 50);
  }

  initRevenueCharts() {
    if (typeof Chart === 'undefined') return;

    const ctxGrowth = document.getElementById('revGrowthChart');
    if (ctxGrowth) {
      this.chartInstances.revGrowth = new Chart(ctxGrowth, {
        type: 'line',
        data: {
          labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Monthly Net Payout (₹)',
            data: [34000, 41000, 38000, 49000, 52000, 61000, 68000],
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctxCat = document.getElementById('categoryRevChart');
    if (ctxCat) {
      this.chartInstances.categoryRev = new Chart(ctxCat, {
        type: 'bar',
        data: {
          labels: ['Fever', 'Pain Relief', 'Antibiotics', 'Diabetes', 'Cardiology', 'Vitamins'],
          datasets: [{
            label: 'Sales by Category (₹)',
            data: [84000, 62000, 51000, 43000, 39000, 28000],
            backgroundColor: '#0284c7',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. NOTIFICATIONS MODULE
     -------------------------------------------------------------------------- */
  renderNotifications(container) {
    const notifs = window.MediKartData.getNotifications().filter(n => n.dealerId === this.dealerId || !n.dealerId);

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; margin:0;"><i class="fas fa-bell" style="color:var(--primary);"></i> Dealer Account Notifications</h1>
          <p style="color:var(--text-muted); margin-top:2px;">Statutory registration updates, order alerts, stock warnings, and payment receipts.</p>
        </div>
        <button class="btn btn-outline-primary" onclick="window.MediKartDealer.markAllNotificationsRead()"><i class="fas fa-check-double"></i> Mark All as Read</button>
      </div>

      <div class="card" style="padding:0;">
        ${notifs.length === 0 ? `
          <div style="padding:40px; text-align:center; color:var(--text-muted);">No account notifications available.</div>
        ` : notifs.map(n => `
          <div style="padding:16px 20px; border-bottom:1px solid var(--border-color); display:flex; align-items:flex-start; gap:14px; background:${n.read ? 'transparent' : 'var(--primary-light)'}; transition:var(--transition);">
            <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">
              <i class="fas ${n.category === 'Pharmacy Registration' ? 'fa-id-card' : n.category === 'Stock Alert' ? 'fa-triangle-exclamation' : n.category === 'Payment Received' ? 'fa-wallet' : 'fa-bell'}"></i>
            </div>

            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="font-size:0.98rem; color:var(--text-main);">${n.title}</strong>
                <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">${n.time}</span>
              </div>
              <p style="font-size:0.88rem; color:var(--text-muted); margin:0;">${n.message}</p>
            </div>

            <div style="display:flex; gap:6px;">
              ${!n.read ? `<button class="btn btn-xs btn-outline-success" onclick="window.MediKartDealer.markNotifRead('${n.id}')" title="Mark as Read"><i class="fas fa-check"></i></button>` : ''}
              <button class="btn btn-xs btn-outline-danger" onclick="window.MediKartDealer.deleteNotification('${n.id}')" title="Delete Notification"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  markNotifRead(id) {
    const notifs = window.MediKartData.getNotifications();
    const n = notifs.find(x => x.id === id);
    if (n) {
      n.read = true;
      window.MediKartData.saveNotifications(notifs);
      this.renderLayout();
      this.navigate('notifications');
    }
  }

  markAllNotificationsRead() {
    const notifs = window.MediKartData.getNotifications();
    notifs.forEach(n => { if (n.dealerId === this.dealerId || !n.dealerId) n.read = true; });
    window.MediKartData.saveNotifications(notifs);
    window.MediKartApp.toast('All notifications marked as read', 'success');
    this.renderLayout();
    this.navigate('notifications');
  }

  deleteNotification(id) {
    let notifs = window.MediKartData.getNotifications();
    notifs = notifs.filter(x => x.id !== id);
    window.MediKartData.saveNotifications(notifs);
    window.MediKartApp.toast('Notification deleted', 'info');
    this.renderLayout();
    this.navigate('notifications');
  }

  /* --------------------------------------------------------------------------
     8. SELLER ACTIVITY AUDIT LOG
     -------------------------------------------------------------------------- */
  renderAuditLog(container) {
    const dealerId = this.getDealerId();
    let logs = window.MediKartData.getDealerAuditLogs(dealerId);

    // Search across action, entity, target id, notes
    if (this.auditSearch) {
      const q = this.auditSearch.trim().toLowerCase();
      logs = logs.filter(l =>
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.entity && l.entity.toLowerCase().includes(q)) ||
        (l.targetId && String(l.targetId).toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q))
      );
    }

    // Filter by action category
    if (this.auditFilterAction !== 'all') {
      logs = logs.filter(l => l.entity === this.auditFilterAction);
    }

    // Pagination
    const totalItems = logs.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.auditPage > totalPages) this.auditPage = totalPages;
    const startIdx = (this.auditPage - 1) * this.pageSize;
    const pageLogs = logs.slice(startIdx, startIdx + this.pageSize);

    const entityIcon = {
      Medicine: 'fa-pills',
      Profile: 'fa-store-alt',
      Verification: 'fa-id-card'
    };
    const actionColor = (action) => {
      const a = (action || '').toLowerCase();
      if (a.includes('delete')) return 'var(--danger)';
      if (a.includes('restock') || a.includes('added') || a.includes('restored')) return 'var(--success)';
      if (a.includes('out of stock')) return '#d97706';
      return 'var(--primary)';
    };

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-file-shield" style="color:var(--primary);"></i> Seller Activity Audit Log</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">A read-only ledger of every change you've made — medicine listings, restocks, stock status, and pharmacy profile updates. Nothing here can be edited or deleted.</p>

      <!-- Toolbar -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Search Log</label>
            <input type="text" class="form-control" placeholder="Search action, medicine, notes..." value="${this.auditSearch}" oninput="window.MediKartDealer.auditSearch = this.value; window.MediKartDealer.auditPage = 1; window.MediKartDealer.renderAuditLog(document.querySelector('#dealer-root #main-content'))">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Filter by Category</label>
            <select class="form-control" onchange="window.MediKartDealer.auditFilterAction = this.value; window.MediKartDealer.auditPage = 1; window.MediKartDealer.renderAuditLog(document.querySelector('#dealer-root #main-content'))">
              <option value="all" ${this.auditFilterAction === 'all' ? 'selected' : ''}>All Activity</option>
              <option value="Medicine" ${this.auditFilterAction === 'Medicine' ? 'selected' : ''}>Medicine & Stock Changes</option>
              <option value="Profile" ${this.auditFilterAction === 'Profile' ? 'selected' : ''}>Profile Changes</option>
              <option value="Verification" ${this.auditFilterAction === 'Verification' ? 'selected' : ''}>Verification Changes</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="card" style="padding:0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Item</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${pageLogs.length === 0 ? `
                <tr><td colspan="4" class="text-center" style="padding:32px;">No activity recorded yet${this.auditSearch || this.auditFilterAction !== 'all' ? ' for this filter' : ''}. Actions like restocks, listing edits, and profile updates will show up here.</td></tr>
              ` : pageLogs.map(l => `
                <tr>
                  <td style="white-space:nowrap;"><strong>${new Date(l.timestamp).toLocaleString()}</strong></td>
                  <td><span class="badge" style="background:${actionColor(l.action)}; color:#fff; font-weight:700;"><i class="fas ${entityIcon[l.entity] || 'fa-circle-info'}"></i> ${l.action}</span></td>
                  <td><code>${l.targetId}</code></td>
                  <td style="color:var(--text-muted); font-size:0.85rem;">${l.reason || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="table-pagination-bar">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Showing ${totalItems === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + this.pageSize, totalItems)} of ${totalItems} activity entries
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${this.auditPage <= 1 ? 'disabled' : ''} onclick="window.MediKartDealer.auditPage--; window.MediKartDealer.renderAuditLog(document.querySelector('#dealer-root #main-content'))">
              <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span style="font-weight:700; font-size:0.85rem; padding:0 8px;">Page ${this.auditPage} of ${totalPages}</span>
            <button class="pagination-btn" ${this.auditPage >= totalPages ? 'disabled' : ''} onclick="window.MediKartDealer.auditPage++; window.MediKartDealer.renderAuditLog(document.querySelector('#dealer-root #main-content'))">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     8. PROFILE & EDITABLE CREDENTIALS
     -------------------------------------------------------------------------- */
  renderProfile(container) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-store-alt" style="color:var(--primary);"></i> Pharmacy Profile & License</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Manage statutory credentials, contact information, and store locations.</p>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
        <form onsubmit="event.preventDefault(); window.MediKartDealer.saveProfile();" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:14px; margin-bottom:20px;">
            <h2 style="font-weight:800; font-size:1.2rem; margin:0;">${dealer.businessName}</h2>
            <span class="badge badge-success"><i class="fas fa-check-circle"></i> VERIFIED PHARMACY</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label style="font-weight:700;">Drug License No. (Form 20B/21B) [Read-Only]</label>
              <input type="text" class="form-control" value="${dealer.drugLicense}" readonly style="background:var(--bg-main); font-family:monospace; font-weight:700;">
            </div>

            <div class="form-group">
              <label style="font-weight:700;">GSTIN Number [Read-Only]</label>
              <input type="text" class="form-control" value="${dealer.gstNumber}" readonly style="background:var(--bg-main); font-family:monospace; font-weight:700;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label style="font-weight:700;">Registered Owner / Pharmacist</label>
              <input type="text" class="form-control" value="${dealer.name}" readonly style="background:var(--bg-main);">
            </div>

            <div class="form-group">
              <label style="font-weight:700;">Official Email Address *</label>
              <input type="email" id="profEmail" class="form-control" value="${dealer.email}" required>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:700;">Contact Phone Number *</label>
            <input type="text" id="profPhone" class="form-control" value="${dealer.phone}" required>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label style="font-weight:700;">Pharmacy Address *</label>
            <textarea id="profAddress" class="form-control" rows="3" required>${dealer.address}</textarea>
          </div>

          <button type="submit" class="btn btn-primary font-weight-800"><i class="fas fa-save"></i> Update Profile Information</button>
        </form>

        <div class="card">
          <h3 style="font-weight:800; font-size:1.1rem; margin-bottom:14px;">Store Credentials Summary</h3>
          <div style="font-size:0.9rem; line-height:1.8; color:var(--text-muted);">
            <div>Rating: <strong style="color:var(--warning);"><i class="fas fa-star"></i> ${dealer.rating}</strong> (${dealer.reviewCount} reviews)</div>
            <div>Years on MediKart: <strong>${dealer.yearsOnMediKart || 4} Years Partner</strong></div>
            <div>Delivery Service: <strong>${dealer.deliveryTime || 'Same Day Delivery'}</strong></div>
            <div>Bank Account: <strong>${dealer.bankAccount || 'HDFC Bank • A/C 987654321'}</strong></div>
            <div>IFSC Code: <code>${dealer.ifscCode || 'HDFC0000123'}</code></div>
          </div>
        </div>
      </div>
    `;
  }

  renderVerification(container) {
    const dealer = this.getCurrentDealer();
    const status = dealer.status || 'pending';

    let statusBadgeHtml = '';
    if (status === 'approved') {
      statusBadgeHtml = `
        <div class="card" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; margin-bottom:20px; padding:20px; border-radius:14px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">VERIFICATION STATUS</div>
              <h2 style="font-size:1.6rem; font-weight:900; margin:4px 0;"><i class="fas fa-shield-check"></i> 🟢 PHARMACY APPROVED — SELLER STATUS: ACTIVE</h2>
              <p style="margin:0; opacity:0.95; font-size:0.95rem;">Your Pharmacy is fully verified & compliant with MediKart Statutory Marketplace rules. You can directly list and publish medicines on the marketplace.</p>
            </div>
            <button class="btn btn-light" style="font-weight:800; color:#059669;" onclick="window.MediKartDealer.navigate('medicines')">
              <i class="fas fa-pills"></i> Go to Medicine Catalog →
            </button>
          </div>
        </div>
      `;
    } else if (status === 'correction_required') {
      statusBadgeHtml = `
        <div class="card" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; margin-bottom:20px; padding:20px; border-radius:14px;">
          <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">VERIFICATION STATUS</div>
          <h2 style="font-size:1.6rem; font-weight:900; margin:4px 0;"><i class="fas fa-exclamation-triangle"></i> 🟡 ACTION REQUIRED: CORRECTION REQUESTED BY PLATFORM ADMIN</h2>
          <div style="background:rgba(0,0,0,0.15); padding:12px 16px; border-radius:10px; margin-top:10px; font-weight:600; font-size:0.95rem;">
            <i class="fas fa-comment-dots"></i> <strong>Admin Remarks:</strong> ${dealer.adminCorrectionNote || 'Please update missing statutory credentials and re-upload required license documents.'}
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      statusBadgeHtml = `
        <div class="card" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; margin-bottom:20px; padding:20px; border-radius:14px;">
          <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">VERIFICATION STATUS</div>
          <h2 style="font-size:1.6rem; font-weight:900; margin:4px 0;"><i class="fas fa-times-circle"></i> 🔴 APPLICATION REJECTED BY PLATFORM ADMIN</h2>
          <div style="background:rgba(0,0,0,0.15); padding:12px 16px; border-radius:10px; margin-top:10px; font-weight:600; font-size:0.95rem;">
            <i class="fas fa-exclamation-circle"></i> <strong>Rejection Reason:</strong> ${dealer.adminRejectionReason || 'Mandatory statutory requirements were not met.'}
          </div>
        </div>
      `;
    } else {
      statusBadgeHtml = `
        <div class="card" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:#fff; margin-bottom:20px; padding:20px; border-radius:14px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">VERIFICATION STATUS</div>
              <h2 style="font-size:1.6rem; font-weight:900; margin:4px 0;"><i class="fas fa-hourglass-half"></i> ⏳ PENDING PLATFORM ADMIN VERIFICATION</h2>
              <p style="margin:0; opacity:0.95; font-size:0.95rem;">Your statutory verification application has been submitted and is currently under review by Platform Admin auditors.</p>
            </div>
            <div style="background:rgba(255,255,255,0.2); padding:8px 16px; border-radius:20px; font-weight:800;">
              🔒 Selling Access Restricted
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      ${statusBadgeHtml}

      <!-- 1. BUSINESS IDENTITY -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-building" style="color:var(--primary);"></i> 1. Business Identity Credentials</h3>
        <form id="verifBizForm" onsubmit="event.preventDefault(); window.MediKartDealer.saveVerificationData('biz');">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Pharmacy / Business Name *</label><input type="text" id="vBizName" class="form-control" value="${dealer.businessName || ''}" required></div>
            <div class="form-group"><label style="font-weight:700;">Owner / Authorized Person Name *</label><input type="text" id="vOwnerName" class="form-control" value="${dealer.ownerName || dealer.name || ''}" required></div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Company PAN Card Number *</label><input type="text" id="vPan" class="form-control" value="${dealer.panNumber || ''}" required></div>
            <div class="form-group"><label style="font-weight:700;">GSTIN Registration Number</label><input type="text" id="vGst" class="form-control" value="${dealer.gstNumber || ''}"></div>
            <div class="form-group"><label style="font-weight:700;">Phone Contact *</label><input type="text" id="vPhone" class="form-control" value="${dealer.phone || ''}" required></div>
          </div>
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:12px;">
            <div class="form-group"><label style="font-weight:700;">Street Address *</label><input type="text" id="vAddr" class="form-control" value="${dealer.address || ''}" required></div>
            <div class="form-group"><label style="font-weight:700;">City *</label><input type="text" id="vCity" class="form-control" value="${dealer.city || ''}" required></div>
            <div class="form-group"><label style="font-weight:700;">State *</label><input type="text" id="vState" class="form-control" value="${dealer.state || ''}" required></div>
            <div class="form-group"><label style="font-weight:700;">Pincode *</label><input type="text" id="vPincode" class="form-control" value="${dealer.pincode || ''}" required></div>
          </div>
          <button type="submit" class="btn btn-sm btn-outline-primary" style="font-weight:800;"><i class="fas fa-save"></i> Save Business Details</button>
        </form>
      </div>

      <!-- 2. DRUG LICENCE & PHARMACIST -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="card">
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-file-medical" style="color:var(--primary);"></i> 2. Statutory Drug License (Form 20B / 21B)</h3>
          <form id="verifLicForm" onsubmit="event.preventDefault(); window.MediKartDealer.saveVerificationData('lic');">
            <div class="form-group"><label style="font-weight:700;">Drug License Number *</label><input type="text" id="vLicNo" class="form-control" value="${dealer.drugLicense || ''}" required placeholder="e.g. 20B/DL-88741/2024"></div>
            <div class="form-group"><label style="font-weight:700;">License Type</label><input type="text" id="vLicType" class="form-control" value="${dealer.licenseType || 'Form 20B & Form 21B Retail'}" placeholder="Form 20B / Form 21B"></div>
            <div class="form-group"><label style="font-weight:700;">Issuing Drug Control Authority</label><input type="text" id="vLicAuth" class="form-control" value="${dealer.issuingAuthority || 'State Drug Control Department'}" placeholder="State Drug Control Dept"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group"><label style="font-weight:700;">Issue Date</label><input type="date" id="vLicIssue" class="form-control" value="${dealer.issueDate || '2024-01-10'}"></div>
              <div class="form-group"><label style="font-weight:700;">Expiry Date *</label><input type="date" id="vLicExp" class="form-control" value="${dealer.expiryDate || '2028-12-31'}" required></div>
            </div>
            <button type="submit" class="btn btn-sm btn-outline-primary" style="font-weight:800;"><i class="fas fa-save"></i> Save License Info</button>
          </form>
        </div>

        <div class="card">
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-user-md" style="color:var(--primary);"></i> 3. Registered Pharmacist Credentials</h3>
          <form id="verifPharmForm" onsubmit="event.preventDefault(); window.MediKartDealer.saveVerificationData('pharm');">
            <div class="form-group"><label style="font-weight:700;">Pharmacist Full Name *</label><input type="text" id="vPharmName" class="form-control" value="${dealer.pharmacistName || ''}" required placeholder="Dr. Rajesh Sharma"></div>
            <div class="form-group"><label style="font-weight:700;">State Council Reg Number *</label><input type="text" id="vPharmReg" class="form-control" value="${dealer.pharmacistRegNo || ''}" required placeholder="REG-78420-DL"></div>
            <div class="form-group"><label style="font-weight:700;">State Pharmacy Council</label><input type="text" id="vPharmAuth" class="form-control" value="${dealer.regAuthority || 'State Pharmacy Council'}"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group"><label style="font-weight:700;">Qualification</label><input type="text" id="vPharmQual" class="form-control" value="${dealer.qualification || 'B.Pharm'}"></div>
              <div class="form-group"><label style="font-weight:700;">Registration Validity Date</label><input type="date" id="vPharmVal" class="form-control" value="${dealer.pharmacistValidity || '2029-05-20'}"></div>
            </div>
            <button type="submit" class="btn btn-sm btn-outline-primary" style="font-weight:800;"><i class="fas fa-save"></i> Save Pharmacist Info</button>
          </form>
        </div>
      </div>

      <!-- 4. STATUTORY REQUIRED DOCUMENTS CHECKLIST -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-folder-open" style="color:var(--primary);"></i> 4. Statutory Uploaded Documents Checklist</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">DRUG LICENSE (FORM 20B/21B)</div>
            <div style="font-weight:800; margin-top:4px;">${dealer.docDrugLicense ? `<span class="badge badge-success"><i class="fas fa-check"></i> ${dealer.docDrugLicense}</span>` : `<span class="badge badge-danger"><i class="fas fa-times"></i> Missing</span>`}</div>
          </div>
          <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">PHARMACIST REGISTRATION CERT</div>
            <div style="font-weight:800; margin-top:4px;">${dealer.docPharmacistCert ? `<span class="badge badge-success"><i class="fas fa-check"></i> ${dealer.docPharmacistCert}</span>` : `<span class="badge badge-danger"><i class="fas fa-times"></i> Missing</span>`}</div>
          </div>
          <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">GSTIN CERTIFICATE</div>
            <div style="font-weight:800; margin-top:4px;">${dealer.docGst ? `<span class="badge badge-success"><i class="fas fa-check"></i> ${dealer.docGst}</span>` : `<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Optional / Missing</span>`}</div>
          </div>
          <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">PAN CARD</div>
            <div style="font-weight:800; margin-top:4px;">${dealer.docPan ? `<span class="badge badge-success"><i class="fas fa-check"></i> ${dealer.docPan}</span>` : `<span class="badge badge-danger"><i class="fas fa-times"></i> Missing</span>`}</div>
          </div>
          <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted);">COMMERCIAL ADDRESS PROOF</div>
            <div style="font-weight:800; margin-top:4px;">${dealer.docAddressProof ? `<span class="badge badge-success"><i class="fas fa-check"></i> ${dealer.docAddressProof}</span>` : `<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Pending</span>`}</div>
          </div>
        </div>
      </div>

      <!-- 5. MARKETPLACE COMPLIANCE AGREEMENT -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-handshake" style="color:var(--primary);"></i> 5. Marketplace Compliance & Quality Agreement</h3>
        <p style="font-size:0.9rem; color:var(--text-muted);">As a verified Pharmacy Seller on MediKart, you must acknowledge and adhere strictly to the following statutory guidelines:</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule1" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Medicines listed must be genuine and sourced from authorized distributors.
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule2" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Counterfeit or falsified drugs are strictly prohibited.
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule3" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Expired or near-expiry medicines must not be dispatched.
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule4" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Accurate medicine composition, batch & expiry information must be maintained.
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule5" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Prescription (Schedule H/H1) medicines must follow required Rx verification.
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; cursor:pointer;">
            <input type="checkbox" id="chkRule6" ${dealer.marketplaceRulesAccepted ? 'checked' : ''}> Customer orders must be fulfilled correctly and promptly.
          </label>
        </div>

        <button class="btn btn-primary font-weight-800" onclick="window.MediKartDealer.submitVerificationApplication()">
          <i class="fas fa-paper-plane"></i> Save & Submit Application for Verification
        </button>
      </div>

      <!-- 6. COMPLIANCE & AUDIT HISTORY -->
      <div class="card">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px;"><i class="fas fa-history" style="color:var(--primary);"></i> 6. Pharmacy Verification & Audit History</h3>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Audit / Event Issue</th>
                <th>Severity</th>
                <th>Action Taken</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${dealer.complianceHistory && dealer.complianceHistory.length > 0 ? dealer.complianceHistory.map(h => `
                <tr>
                  <td><code>${h.date}</code></td>
                  <td><strong>${h.issue}</strong><div style="font-size:0.8rem; color:var(--text-muted);">${h.notes || ''}</div></td>
                  <td><span class="badge ${h.severity === 'High' ? 'badge-danger' : h.severity === 'Medium' ? 'badge-warning' : 'badge-info'}">${h.severity}</span></td>
                  <td>${h.action}</td>
                  <td><span class="badge ${h.status === 'Resolved' ? 'badge-success' : 'badge-secondary'}">${h.status}</span></td>
                </tr>
              `).join('') : `<tr><td colspan="5" class="text-center" style="padding:20px; color:var(--text-muted);">No compliance warnings recorded. Good standing.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  saveVerificationData(sec) {
    const dealer = this.getCurrentDealer();
    if (!dealer) return;

    if (sec === 'biz') {
      dealer.businessName = document.getElementById('vBizName').value;
      dealer.ownerName = document.getElementById('vOwnerName').value;
      dealer.panNumber = document.getElementById('vPan').value;
      dealer.gstNumber = document.getElementById('vGst').value;
      dealer.phone = document.getElementById('vPhone').value;
      dealer.address = document.getElementById('vAddr').value;
      dealer.city = document.getElementById('vCity').value;
      dealer.state = document.getElementById('vState').value;
      dealer.pincode = document.getElementById('vPincode').value;
    } else if (sec === 'lic') {
      dealer.drugLicense = document.getElementById('vLicNo').value;
      dealer.licenseType = document.getElementById('vLicType').value;
      dealer.issuingAuthority = document.getElementById('vLicAuth').value;
      dealer.issueDate = document.getElementById('vLicIssue').value;
      dealer.expiryDate = document.getElementById('vLicExp').value;
    } else if (sec === 'pharm') {
      dealer.pharmacistName = document.getElementById('vPharmName').value;
      dealer.pharmacistRegNo = document.getElementById('vPharmReg').value;
      dealer.regAuthority = document.getElementById('vPharmAuth').value;
      dealer.qualification = document.getElementById('vPharmQual').value;
      dealer.pharmacistValidity = document.getElementById('vPharmVal').value;
    }

    const dealers = window.MediKartData.getDealers();
    const idx = dealers.findIndex(d => d.id === dealer.id);
    if (idx !== -1) dealers[idx] = dealer;
    window.MediKartData.saveDealers(dealers);

    const sectionLabel = { biz: 'Business Details', lic: 'License Info', pharm: 'Pharmacist Info' }[sec] || sec;
    window.MediKartData.logDealerAudit('Verification Details Updated', 'Verification', dealer.id, `${sectionLabel} section updated`, dealer.id, dealer.businessName);

    if (window.MediKartApp && window.MediKartApp.showToast) {
      window.MediKartApp.showToast('Verification credentials updated successfully.', 'success');
    }
  }

  submitVerificationApplication() {
    const dealer = this.getCurrentDealer();
    if (!dealer) return;

    dealer.marketplaceRulesAccepted = true;
    dealer.acceptedDate = new Date().toISOString().split('T')[0];
    dealer.status = 'pending'; // Submit for pending review

    if (!dealer.complianceHistory) dealer.complianceHistory = [];
    dealer.complianceHistory.push({
      date: dealer.acceptedDate,
      issue: 'Verification Application Resubmitted',
      severity: 'Info',
      action: 'Resubmitted',
      status: 'Pending Review',
      notes: 'Pharmacy resubmitted updated credentials for Platform Admin audit.'
    });

    const dealers = window.MediKartData.getDealers();
    const idx = dealers.findIndex(d => d.id === dealer.id);
    if (idx !== -1) dealers[idx] = dealer;
    window.MediKartData.saveDealers(dealers);

    if (window.MediKartApp && window.MediKartApp.showToast) {
      window.MediKartApp.showToast('Application submitted! Status updated to Pending Verification.', 'success');
    }
    this.renderVerification(document.querySelector('#dealer-root #main-content'));
  }

  saveProfile() {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === this.dealerId) || dealers[0];

    dealer.email = document.getElementById('profEmail').value;
    dealer.phone = document.getElementById('profPhone').value;
    dealer.address = document.getElementById('profAddress').value;

    window.MediKartData.saveDealers(dealers);
    window.MediKartData.logDealerAudit('Profile Updated', 'Profile', dealer.id, `${dealer.businessName} — contact email, phone or address changed`, dealer.id, dealer.businessName);
    window.MediKartApp.toast('Pharmacy profile updated successfully!', 'success');
    this.renderLayout();
    this.navigate('profile');
  }
}

window.MediKartDealer = new DealerController();
