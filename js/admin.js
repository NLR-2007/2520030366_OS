/* ==========================================================================
   MEDIKART 3.0 - ADVANCED ADMIN MANAGEMENT & MARKETPLACE CONTROL PORTAL
   Platform Earnings, Dealer Revenue Breakdown, Dealer Approval Workflow (Form 20B/21B),
   Financial Payout Settlement, Inventory Control & System Commission Settings
   ========================================================================== */

class AdminController {
  constructor() {
    this.currentView = 'dashboard';
    this.dealerFilter = 'all'; // 'all', 'pending', 'approved', 'suspended'
    this.payoutFilter = 'all'; // 'all', 'pending', 'processing', 'settled', 'failed', 'onhold'
    this.searchQuery = '';
    this.chartInstances = {};
  }

  init() {
    this.renderLayout();
    this.navigate('dashboard');
  }

  esc(value) {
    return window.MediKartApp ? window.MediKartApp.escapeHtml(value) : String(value == null ? '' : value);
  }

  /* Chart.js refuses to bind a canvas that still has a live chart attached.
     Every re-render must tear the previous instances down first. */
  destroyCharts() {
    Object.keys(this.chartInstances).forEach(key => {
      try { this.chartInstances[key].destroy(); } catch (e) {}
    });
    this.chartInstances = {};
  }

  /* Convenience: the admin main content region. */
  mainContent() {
    return document.querySelector('#admin-root #main-content');
  }

  renderLayout() {
    const root = document.getElementById('admin-root');
    const dealers = window.MediKartData.getDealers();
    const pendingCount = dealers.filter(d => d.status === 'pending').length;

    root.innerHTML = `
      <div id="app-layout">
        <!-- Admin Navigation Sidebar -->
        <aside id="sidebar">
          <div class="sidebar-header">
            <div class="logo-badge" style="background:var(--accent);"><i class="fas fa-user-shield"></i></div>
            <div class="logo-text">Medi<span style="color:var(--primary);">Kart</span> <span style="font-size:0.7rem; background:var(--accent); color:#ffffff; font-weight:800; padding:2px 8px; border-radius:4px; margin-left:4px;">PLATFORM ADMIN</span></div>
          </div>

          <nav class="sidebar-menu">
            <div class="menu-category">Platform Oversight</div>
            <div class="nav-item active" data-view="dashboard" onclick="window.MediKartAdmin.navigate('dashboard')">
              <i class="fas fa-chart-pie"></i> <span>Dashboard & Earnings</span>
            </div>
            <div class="nav-item" data-view="dealers" onclick="window.MediKartAdmin.navigate('dealers')">
              <i class="fas fa-store"></i> <span>Pharmacy Seller Verification</span>
              ${pendingCount > 0 ? `<span class="badge-count" id="adminPendingBadge">${pendingCount}</span>` : ''}
            </div>
            <div class="nav-item" data-view="payouts" onclick="window.MediKartAdmin.navigate('payouts')">
              <i class="fas fa-wallet"></i> <span>Pharmacy Seller Payouts Ledger</span>
            </div>

            <div class="menu-category">Marketplace Inventory</div>
            <div class="nav-item" data-view="medicines" onclick="window.MediKartAdmin.navigate('medicines')">
              <i class="fas fa-pills"></i> <span>Medicine Catalog</span>
            </div>

            <div class="menu-category">Operations & Audit</div>
            <div class="nav-item" data-view="orders" onclick="window.MediKartAdmin.navigate('orders')">
              <i class="fas fa-box"></i> <span>Orders Logistics</span>
            </div>
            <div class="nav-item" data-view="refunds" onclick="window.MediKartAdmin.navigate('refunds')">
              <i class="fas fa-rotate-left"></i> <span>Refund Claims</span>
            </div>
            <div class="nav-item" data-view="tickets" onclick="window.MediKartAdmin.navigate('tickets')">
              <i class="fas fa-headset"></i> <span>Support Desk</span>
            </div>
            <div class="nav-item" data-view="buyers" onclick="window.MediKartAdmin.navigate('buyers')">
              <i class="fas fa-users"></i> <span>Registered Customers</span>
            </div>
            <div class="nav-item" data-view="audit" onclick="window.MediKartAdmin.navigate('audit')">
              <i class="fas fa-file-shield"></i> <span>Audit Log</span>
            </div>
            <div class="nav-item" data-view="reports" onclick="window.MediKartAdmin.navigate('reports')">
              <i class="fas fa-chart-line"></i> <span>Financial Reports</span>
            </div>
            <div class="nav-item" data-view="settings" onclick="window.MediKartAdmin.navigate('settings')">
              <i class="fas fa-sliders-h"></i> <span>System Settings</span>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div style="display:flex; align-items:center; gap:10px; width:100%;">
              <div class="user-mini-avatar" style="background:var(--accent);">PA</div>
              <div class="user-mini-info">
                <div class="user-mini-name">Platform Admin</div>
                <div class="user-mini-role">Platform Operations</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div id="main-wrapper">
          <header id="top-navbar">
            <div class="navbar-left">
              <button class="mobile-toggle-btn" onclick="window.MediKartApp.toggleSidebar()" aria-label="Toggle navigation menu">
                <i class="fas fa-bars"></i>
              </button>
              <div style="font-weight:800; font-size:1.15rem; color:var(--text-main);">
                <i class="fas fa-shield-halved" style="color:var(--accent);"></i> MediKart Marketplace Platform Admin Portal
              </div>
            </div>

            <div class="navbar-right">
              <button class="icon-btn" title="Toggle Theme" onclick="window.MediKartApp.toggleTheme()"><i class="fas fa-moon"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="window.MediKartApp.logout()">
                <i class="fas fa-right-from-bracket"></i> <span class="btn-label">Logout</span>
              </button>
            </div>
          </header>

          <main id="main-content">
            <!-- Dynamic View Render Target -->
          </main>
        </div>
      </div>
    `;
  }

  updateBadges() {
    const dealers = window.MediKartData.getDealers();
    const pendingCount = dealers.filter(d => d.status === 'pending').length;
    const badge = document.getElementById('adminPendingBadge');
    if (badge) badge.innerText = pendingCount;
  }

  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('#admin-root #sidebar .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === view);
    });

    const main = document.querySelector('#admin-root #main-content');
    if (!main) return;

    // Tear down charts from the previous view before its canvases are replaced.
    this.destroyCharts();
    if (window.MediKartReports && window.MediKartReports.destroyCharts) {
      window.MediKartReports.destroyCharts();
    }

    if (view === 'dashboard') this.renderDashboard(main);
    else if (view === 'dealers') this.renderDealers(main);
    else if (view === 'payouts') this.renderPayouts(main);
    else if (view === 'medicines') this.renderMedicines(main);
    else if (view === 'inventory') this.renderInventory(main);
    else if (view === 'buyers') this.renderBuyers(main);
    else if (view === 'orders') this.renderOrders(main);
    else if (view === 'refunds') this.renderRefunds(main);
    else if (view === 'tickets') this.renderTickets(main);
    else if (view === 'audit') this.renderAuditLogs(main);
    else if (view === 'reports') window.MediKartReports.renderReportsView(main);
    else if (view === 'settings') this.renderSettings(main);

    this.updateBadges();
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    } catch(e) {}
  }

  /* --------------------------------------------------------------------------
     1. ADMIN EXECUTIVE DASHBOARD & PLATFORM EARNINGS
     -------------------------------------------------------------------------- */
  renderDashboard(container) {
    const dealers = window.MediKartData.getDealers();
    const medicines = window.MediKartData.getMedicines();
    const orders = window.MediKartData.getOrders();
    const settings = window.MediKartData.getSettings();

    const pendingDealers = dealers.filter(d => d.status === 'pending');
    const activeDealersCount = dealers.filter(d => d.status === 'approved').length;

    // Financial metrics. Commission applies to net product value, not to the
    // grand total — the grand total includes GST owed to the tax authority and
    // delivery fees owed to logistics, neither of which the platform earns.
    const commRate = window.MediKartData.getCommissionRate();
    const fin = window.MediKartData.summarizeOrderFinancials(orders, commRate);
    const gmv = fin.netProductValue;
    const platformCommissionNet = fin.platformCommission;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);">Platform Operations & Financial Dashboard</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Real-time marketplace revenue, commission earnings, and dealer verification queue.</p>
        </div>

        <button class="btn btn-outline-primary" onclick="window.MediKartAdmin.navigate('reports')">
          <i class="fas fa-chart-line"></i> Detailed Financial Reports
        </button>
      </div>

      <!-- KEY EXECUTIVE METRICS GRID -->
      <div class="dashboard-grid">
        <div class="stat-card" style="border-left:4px solid var(--primary);" onclick="window.MediKartAdmin.navigate('reports')">
          <div>
            <div class="stat-value" style="color:var(--primary);">₹${platformCommissionNet.toFixed(2)}</div>
            <div class="stat-title">Platform Net Earnings (${commRate}% Commission)</div>
          </div>
          <div class="logo-badge" style="background:var(--primary);"><i class="fas fa-percentage"></i></div>
        </div>

        <div class="stat-card" style="border-left:4px solid var(--secondary);" onclick="window.MediKartAdmin.navigate('orders')">
          <div>
            <div class="stat-value">₹${gmv.toFixed(2)}</div>
            <div class="stat-title">Net Merchandise Value (commissionable)</div>
          </div>
          <div class="logo-badge" style="background:var(--secondary);"><i class="fas fa-wallet"></i></div>
        </div>

        <div class="stat-card" style="border-left:4px solid var(--warning);" onclick="window.MediKartAdmin.navigate('dealers')">
          <div>
            <div class="stat-value" style="color:var(--warning);">${pendingDealers.length}</div>
            <div class="stat-title">Pending Dealer Approvals</div>
          </div>
          <div class="logo-badge" style="background:var(--warning);"><i class="fas fa-clock"></i></div>
        </div>

        <div class="stat-card" style="border-left:4px solid var(--success);" onclick="window.MediKartAdmin.navigate('dealers')">
          <div>
            <div class="stat-value">${activeDealersCount}</div>
            <div class="stat-title">Approved Verified Pharmacies</div>
          </div>
          <div class="logo-badge" style="background:var(--success);"><i class="fas fa-clinic-medical"></i></div>
        </div>
      </div>

      <!-- PENDING DEALER APPROVAL QUEUE WIDGET -->
      <div class="card" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
          <h2 class="card-title" style="margin:0;"><i class="fas fa-user-clock" style="color:var(--warning);"></i> Pending Dealer Applications Queue (${pendingDealers.length})</h2>
          <a href="#" style="font-weight:700; font-size:0.88rem;" onclick="event.preventDefault(); window.MediKartAdmin.navigate('dealers');">View All Dealers →</a>
        </div>

        ${pendingDealers.length === 0 ? `
          <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.9rem;">
            <i class="fas fa-check-circle" style="color:var(--success); font-size:1.5rem; margin-bottom:6px;"></i><br>
            All dealer applications have been processed and verified!
          </div>
        ` : `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Pharmacy Name</th>
                  <th>Owner / Pharmacist</th>
                  <th>Drug License (20B/21B)</th>
                  <th>GST Number</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pendingDealers.slice(0, 5).map(d => `
                  <tr>
                    <td><strong>${d.businessName}</strong></td>
                    <td>${d.name}</td>
                    <td><code>${d.drugLicense}</code></td>
                    <td><code>${d.gstNumber}</code></td>
                    <td>${d.registrationDate}</td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm btn-success" onclick="window.MediKartAdmin.approveDealer('${d.id}')">
                          <i class="fas fa-check"></i> Approve Dealer
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.MediKartAdmin.inspectDealer('${d.id}')">
                          <i class="fas fa-eye"></i> Inspect Documents
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- SYSTEM METRICS & ANALYTICS PIE CHART OVERVIEW -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-top:20px;">
        <div class="card">
          <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:12px;"><i class="fas fa-boxes-stacked" style="color:var(--primary);"></i> Inventory & Listing Overview</h3>
          <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px dashed var(--border-color);">
            <span>Total Listed Medicines:</span><strong>${medicines.length} Items</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:12px 0;">
            <span>Prescription Required (Rx):</span><strong>${medicines.filter(m => m.prescriptionRequired).length} Items</strong>
          </div>
        </div>

        <div class="card">
          <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:12px;"><i class="fas fa-receipt" style="color:var(--secondary);"></i> Order Fulfillment Metrics</h3>
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed var(--border-color);">
            <span>Total Processed Orders:</span><strong>${orders.length} Orders</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed var(--border-color);">
            <span>Delivered Successfully:</span><strong>${orders.filter(o => o.status === 'Delivered').length} Orders</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:10px 0;">
            <span>Active In-Transit Orders:</span><strong>${orders.filter(o => o.status !== 'Delivered').length} Orders</strong>
          </div>
        </div>

        <div class="card" style="text-align:center;">
          <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:10px;"><i class="fas fa-chart-pie" style="color:var(--accent);"></i> Order Status Breakdown</h3>
          <div style="position:relative; height:150px; width:100%;">
            <canvas id="adminOrderPieChart"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const ctx = document.getElementById('adminOrderPieChart');
      if (ctx && typeof Chart !== 'undefined') {
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const shipped = orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length;
        const pending = Math.max(0, orders.length - (delivered + shipped));

        this.chartInstances.orderPie = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Delivered', 'In-Transit', 'Pending'],
            datasets: [{
              data: [delivered, shipped, pending],
              backgroundColor: ['#10b981', '#0284c7', '#f59e0b'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11, weight: '700' } } }
            }
          }
        });
      }
    }, 50);
  }

  /* --------------------------------------------------------------------------
     2. DEALER VERIFICATION & APPROVAL CENTER
     -------------------------------------------------------------------------- */
  renderDealers(container) {
    let dealers = window.MediKartData.getDealers();
    const settings = window.MediKartData.getSettings();
    const commRate = settings.commissionRate || 8;

    // Filter dealers based on dealerFilter
    if (this.dealerFilter === 'pending') {
      dealers = dealers.filter(d => d.status === 'pending');
    } else if (this.dealerFilter === 'eligible') {
      dealers = dealers.filter(d => window.MediKartData.analyzePharmacyVerification(d).overallStatus === 'ELIGIBLE');
    } else if (this.dealerFilter === 'correction') {
      dealers = dealers.filter(d => d.status === 'correction_required');
    } else if (this.dealerFilter === 'approved') {
      dealers = dealers.filter(d => d.status === 'approved');
    } else if (this.dealerFilter === 'rejected') {
      dealers = dealers.filter(d => d.status === 'rejected');
    } else if (this.dealerFilter === 'expiring') {
      dealers = dealers.filter(d => window.MediKartData.analyzePharmacyVerification(d).warningIssues.some(w => w.text.includes('expires soon')));
    } else if (this.dealerFilter === 'blocked') {
      dealers = dealers.filter(d => window.MediKartData.analyzePharmacyVerification(d).overallStatus === 'BLOCKED');
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      dealers = dealers.filter(d => d.businessName.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || (d.drugLicense && d.drugLicense.toLowerCase().includes(q)));
    }

    const allDealers = window.MediKartData.getDealers();

    container.innerHTML = `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main); margin:0;"><i class="fas fa-store" style="color:var(--primary);"></i> Pharmacy Seller Verification & Approval Center</h1>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px; margin-bottom:14px;">Review Drug Licenses (Form 20B/21B), Pharmacist Credentials, GST & Approve Verified Pharmacies.</p>

        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
          <button class="btn btn-sm ${this.dealerFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='all'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            All (${allDealers.length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'pending' ? 'btn-warning' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='pending'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            Pending (${allDealers.filter(d => d.status === 'pending').length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'eligible' ? 'btn-success' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='eligible'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            🟢 Eligible for Approval (${allDealers.filter(d => window.MediKartData.analyzePharmacyVerification(d).overallStatus === 'ELIGIBLE').length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'correction' ? 'btn-warning' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='correction'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            🟡 Needs Correction (${allDealers.filter(d => d.status === 'correction_required').length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'approved' ? 'btn-success' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='approved'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            Approved (${allDealers.filter(d => d.status === 'approved').length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'rejected' ? 'btn-danger' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='rejected'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            Rejected (${allDealers.filter(d => d.status === 'rejected').length})
          </button>
          <button class="btn btn-sm ${this.dealerFilter === 'expiring' ? 'btn-warning' : 'btn-outline-secondary'}" style="white-space:nowrap;" onclick="window.MediKartAdmin.dealerFilter='expiring'; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
            ⚠️ Expiring Soon (${allDealers.filter(d => window.MediKartData.analyzePharmacyVerification(d).warningIssues.some(w => w.text.includes('expires soon'))).length})
          </button>
        </div>
      </div>

      <!-- DEALER SEARCH BAR -->
      <div class="card" style="margin-bottom:20px; padding:14px;">
        <div class="form-control" style="display:flex; align-items:center; gap:10px; background:var(--bg-input);">
          <i class="fas fa-search" style="color:var(--text-muted);"></i>
          <input type="text" placeholder="Search by Pharmacy Name, Owner Name, Drug License No..." value="${this.searchQuery}" style="border:none; background:transparent; width:100%;" oninput="window.MediKartAdmin.searchQuery=this.value; window.MediKartAdmin.renderDealers(document.querySelector('#admin-root #main-content'))">
        </div>
      </div>

      <!-- DEALERS TABLE WITH DETAILS & APPROVAL BUTTONS -->
      <div class="card" style="padding:0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pharmacy Business</th>
                <th>Owner / Pharmacist</th>
                <th>Drug License (20B/21B)</th>
                <th>GSTIN</th>
                <th>Gross Sales</th>
                <th>Platform Comm (${commRate}%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${(() => { this._finByDealer = window.MediKartData.getFinancialsByDealer(commRate); return ''; })()}
              ${dealers.map(d => {
                // Live figures, not the seeded snapshot on the dealer record.
                const dFin = this._finByDealer[d.id];
                const sales = dFin ? dFin.netProductValue : 0;
                const comm = dFin ? dFin.platformCommission : 0;
                const analysis = window.MediKartData.analyzePharmacyVerification(d);

                let badgeClass = 'badge-secondary';
                let badgeText = d.status.toUpperCase();
                if (d.status === 'approved') {
                  badgeClass = 'badge-success';
                  badgeText = '<i class="fas fa-check-circle"></i> Approved';
                } else if (d.status === 'pending') {
                  badgeClass = analysis.overallStatus === 'ELIGIBLE' ? 'badge-success' : analysis.overallStatus === 'NEEDS_REVIEW' ? 'badge-warning' : 'badge-danger';
                  badgeText = analysis.overallStatus === 'ELIGIBLE' ? '🟢 Eligible' : analysis.overallStatus === 'NEEDS_REVIEW' ? '🟡 Needs Review' : '🔴 Blocked';
                } else if (d.status === 'correction_required') {
                  badgeClass = 'badge-warning';
                  badgeText = '🟡 Correction Req';
                } else if (d.status === 'rejected') {
                  badgeClass = 'badge-danger';
                  badgeText = '🔴 Rejected';
                }

                return `
                  <tr>
                    <td>
                      <strong style="color:var(--primary); cursor:pointer;" onclick="window.MediKartAdmin.inspectDealer('${d.id}')">${d.businessName}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${d.address}</div>
                    </td>
                    <td>${d.ownerName || d.name}</td>
                    <td><code>${d.drugLicense || 'Missing'}</code></td>
                    <td><code>${d.gstNumber || 'N/A'}</code></td>
                    <td><strong>₹${sales.toFixed(2)}</strong></td>
                    <td><strong style="color:var(--success);">₹${comm.toFixed(2)}</strong></td>
                    <td>
                      <span class="badge ${badgeClass}" style="font-weight:800; padding:6px 10px;">
                        ${badgeText}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex; gap:6px; flex-wrap:nowrap;">
                        <button class="btn btn-sm ${d.status === 'approved' ? 'btn-outline-success' : 'btn-success'}" style="white-space:nowrap; font-weight:800;" title="Inspect & Approve Pharmacy" onclick="window.MediKartAdmin.inspectDealer('${d.id}')">
                          <i class="fas fa-shield-check"></i> ${d.status === 'approved' ? 'Verified' : 'Inspect & Approve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     PHARMACY MODERATION ACTIONS

     Consolidated. This class previously declared approveDealer() twice — the
     second definition silently replaced the first, so the compliance-history
     write in the first version never ran. There is now one implementation that
     records the audit trail, the compliance entry and the dealer notification.
     -------------------------------------------------------------------------- */
  appendComplianceEntry(dealer, entry) {
    if (!dealer.complianceHistory) dealer.complianceHistory = [];
    dealer.complianceHistory.push({
      date: new Date().toISOString().split('T')[0],
      ...entry
    });
  }

  /* Applies a status change plus a compliance-history entry in one write. */
  applyDealerModeration(dealerId, status, reason, complianceEntry, toastMessage, toastType) {
    const res = window.MediKartData.updateDealerStatus(dealerId, status, reason);
    if (!res.success) {
      window.MediKartApp.toast(res.error, 'error');
      return false;
    }

    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === dealerId);
    if (dealer) {
      this.appendComplianceEntry(dealer, complianceEntry);
      window.MediKartData.saveDealers(dealers);
    }

    window.MediKartApp.closeModal();
    this.updateBadges();
    window.MediKartApp.toast(toastMessage, toastType);
    this.navigate(this.currentView);
    return true;
  }

  approveDealer(id) {
    const dealer = window.MediKartData.getDealers().find(d => d.id === id);
    if (!dealer) {
      window.MediKartApp.toast('Pharmacy not found.', 'error');
      return;
    }

    // Do not let an admin approve a pharmacy that still fails a blocking check.
    const analysis = window.MediKartData.analyzePharmacyVerification(dealer);
    if (analysis.blockingIssues.length > 0) {
      window.MediKartApp.showConfirm({
        title: 'Approve despite blocking issues?',
        message: `${dealer.businessName} still has ${analysis.blockingIssues.length} unresolved blocking issue(s), starting with: "${analysis.blockingIssues[0].text}". Approving now will let this pharmacy dispense medicines. Continue?`,
        confirmLabel: 'Approve anyway',
        danger: true,
        onConfirm: () => this.finalizeApproval(dealer.id, true)
      });
      return;
    }

    this.finalizeApproval(dealer.id, false);
  }

  finalizeApproval(dealerId, overridden) {
    const dealers = window.MediKartData.getDealers();
    const dealer = dealers.find(d => d.id === dealerId);
    if (!dealer) return;

    this.applyDealerModeration(
      dealerId,
      'approved',
      'State pharmacy statutory compliance verified',
      {
        issue: 'Pharmacy Verification Approved by Platform Admin',
        severity: overridden ? 'Medium' : 'Info',
        action: 'Approved',
        status: 'Resolved',
        notes: overridden
          ? 'Approved by admin override while blocking verification issues were still outstanding.'
          : 'Statutory drug license and pharmacist credentials verified cleanly.'
      },
      `${dealer.businessName} approved and authorised to sell on MediKart.`,
      'success'
    );
  }

  requestCorrectionDealer(id) {
    const dealer = window.MediKartData.getDealers().find(d => d.id === id);
    if (!dealer) {
      window.MediKartApp.toast('Pharmacy not found.', 'error');
      return;
    }

    const defaultNote = 'Please upload a clear high-resolution scan of the Form 20B/21B Drug License and the Pharmacist Registration Certificate.';

    window.MediKartApp.showPrompt({
      title: `Request Correction — ${dealer.businessName}`,
      label: 'Correction instructions sent to the pharmacy',
      defaultValue: dealer.adminCorrectionNote || defaultNote,
      confirmLabel: 'Send Correction Request',
      required: true,
      onConfirm: (note) => {
        const dealers = window.MediKartData.getDealers();
        const d = dealers.find(x => x.id === id);
        if (d) {
          d.adminCorrectionNote = note;
          window.MediKartData.saveDealers(dealers);
        }

        this.applyDealerModeration(
          id,
          'correction_required',
          note,
          {
            issue: 'Correction Requested by Platform Admin',
            severity: 'Medium',
            action: 'Correction Requested',
            status: 'Unresolved',
            notes: note
          },
          `Correction request sent to ${dealer.businessName}.`,
          'info'
        );
      }
    });
  }

  rejectDealerWithReason(id) {
    const dealer = window.MediKartData.getDealers().find(d => d.id === id);
    if (!dealer) {
      window.MediKartApp.toast('Pharmacy not found.', 'error');
      return;
    }

    const defaultReason = 'Mandatory statutory drug license requirements or pharmacist credentials could not be verified.';

    window.MediKartApp.showPrompt({
      title: `Reject Application — ${dealer.businessName}`,
      label: 'Statutory rejection reason (recorded in the audit trail)',
      defaultValue: dealer.adminRejectionReason || defaultReason,
      confirmLabel: 'Confirm Rejection',
      required: true,
      onConfirm: (reason) => {
        const dealers = window.MediKartData.getDealers();
        const d = dealers.find(x => x.id === id);
        if (d) {
          d.adminRejectionReason = reason;
          window.MediKartData.saveDealers(dealers);
        }

        this.applyDealerModeration(
          id,
          'rejected',
          reason,
          {
            issue: 'Application Rejected by Platform Admin',
            severity: 'High',
            action: 'Rejected',
            status: 'Rejected',
            notes: reason
          },
          `Application rejected for ${dealer.businessName}. Reason logged.`,
          'error'
        );
      }
    });
  }

  rejectDealer(id) {
    this.rejectDealerWithReason(id);
  }

  suspendDealer(id) {
    const dealer = window.MediKartData.getDealers().find(d => d.id === id);
    if (!dealer) {
      window.MediKartApp.toast('Pharmacy not found.', 'error');
      return;
    }

    window.MediKartApp.showPrompt({
      title: `Suspend Pharmacy — ${dealer.businessName}`,
      label: 'Reason for suspension (recorded in the audit trail)',
      defaultValue: '',
      confirmLabel: 'Suspend Pharmacy',
      required: true,
      onConfirm: (reason) => {
        this.applyDealerModeration(
          id,
          'suspended',
          reason,
          {
            issue: 'Selling Licence Suspended by Platform Admin',
            severity: 'High',
            action: 'Suspended',
            status: 'Unresolved',
            notes: reason
          },
          `Selling licence suspended for ${dealer.businessName}.`,
          'warning'
        );
      }
    });
  }

  inspectDealer(id) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === id) || dealers[0];
    const analysis = window.MediKartData.analyzePharmacyVerification(d);

    let statusBannerHtml = '';
    if (analysis.overallStatus === 'ELIGIBLE') {
      statusBannerHtml = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:16px; border-radius:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div>
              <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px;">VERIFICATION ANALYSIS</div>
              <h2 style="font-size:1.4rem; font-weight:900; margin:2px 0;"><i class="fas fa-check-circle" style="color:#16a34a;"></i> 🟢 VERIFICATION STATUS: ELIGIBLE FOR APPROVAL</h2>
              <p style="margin:0; font-size:0.88rem; opacity:0.9;">All mandatory statutory drug license, pharmacist, tax, and compliance checks have PASSED.</p>
            </div>
            <span class="badge badge-success" style="font-size:0.9rem; padding:8px 14px; font-weight:800;">🟢 CLEAN PHARMACY</span>
          </div>
        </div>
      `;
    } else if (analysis.overallStatus === 'NEEDS_REVIEW') {
      statusBannerHtml = `
        <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:16px; border-radius:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div>
              <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px;">VERIFICATION ANALYSIS</div>
              <h2 style="font-size:1.4rem; font-weight:900; margin:2px 0;"><i class="fas fa-exclamation-triangle" style="color:#d97706;"></i> 🟡 VERIFICATION STATUS: NEEDS MANUAL REVIEW</h2>
              <p style="margin:0; font-size:0.88rem; opacity:0.9;">Minor profile warnings or expiring licenses detected. Admin review recommended before approval.</p>
            </div>
            <span class="badge badge-warning" style="font-size:0.9rem; padding:8px 14px; font-weight:800;">🟡 REVIEW REQUIRED</span>
          </div>
        </div>
      `;
    } else {
      statusBannerHtml = `
        <div style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:16px; border-radius:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div>
              <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px;">VERIFICATION ANALYSIS</div>
              <h2 style="font-size:1.4rem; font-weight:900; margin:2px 0;"><i class="fas fa-ban" style="color:#dc2626;"></i> 🔴 VERIFICATION STATUS: APPROVAL BLOCKED</h2>
              <p style="margin:0; font-size:0.88rem; opacity:0.9;">Mandatory statutory requirements failed. Approval button is disabled until resolved.</p>
            </div>
            <span class="badge badge-danger" style="font-size:0.9rem; padding:8px 14px; font-weight:800;">🔴 BLOCKED</span>
          </div>
        </div>
      `;
    }

    const issuesFoundHtml = (analysis.blockingIssues.length > 0 || analysis.warningIssues.length > 0) ? `
      <div class="card" style="margin-bottom:16px; padding:14px; background:#fafafa; border:1px solid var(--border-color);">
        <h4 style="font-size:0.95rem; font-weight:800; margin:0 0 8px 0; color:var(--text-main);"><i class="fas fa-exclamation-circle"></i> ISSUES FOUND SUMMARY</h4>
        ${analysis.blockingIssues.map(b => `<div style="color:#dc2626; font-size:0.85rem; font-weight:700; margin-bottom:4px;"><i class="fas fa-times-circle"></i> ❌ BLOCKING: ${b.text}</div>`).join('')}
        ${analysis.warningIssues.map(w => `<div style="color:#d97706; font-size:0.85rem; font-weight:700; margin-bottom:4px;"><i class="fas fa-exclamation-triangle"></i> ⚠️ WARNING: ${w.text}</div>`).join('')}
      </div>
    ` : `
      <div class="card" style="margin-bottom:16px; padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.88rem; font-weight:700;">
        <i class="fas fa-check-circle" style="color:#16a34a;"></i> 🟢 ALL REQUIRED CHECKS PASSED — Zero Blocking Issues or Warnings Found.
      </div>
    `;

    window.MediKartApp.showModal({
      title: `Pharmacy Verification Center – ${d.businessName}`,
      content: `
        ${statusBannerHtml}
        ${issuesFoundHtml}

        <!-- 6-CATEGORY STRUCTURED CHECKLIST -->
        <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:12px;"><i class="fas fa-list-check" style="color:var(--primary);"></i> Statutory Verification Checklist (6 Categories)</h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
          <!-- Category A: Business Identity -->
          <div class="card" style="padding:12px; background:var(--bg-input);">
            <strong style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">A. Business Identity</strong>
            <div style="font-weight:800; font-size:1rem; margin-top:4px;">${d.businessName}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Owner: <strong>${d.ownerName || d.name}</strong></div>
            <div style="font-size:0.8rem; margin-top:4px;">PAN: <code>${d.panNumber || 'Missing'}</code> | GST: <code>${d.gstNumber || 'N/A'}</code></div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Phone: ${d.phone} | Email: ${d.email}</div>
          </div>

          <!-- Category B: Drug License -->
          <div class="card" style="padding:12px; background:var(--bg-input);">
            <strong style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">B. Statutory Drug License</strong>
            <div style="font-weight:800; font-size:1rem; margin-top:4px; color:var(--primary);"><code>${d.drugLicense || 'Missing License'}</code></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Type: ${d.licenseType || 'Form 20B/21B'}</div>
            <div style="font-size:0.8rem; margin-top:4px;">Authority: ${d.issuingAuthority || 'State Drug Control'}</div>
            <div style="font-size:0.78rem; font-weight:700; margin-top:2px;">Expiry: ${d.expiryDate ? `<span style="color:${new Date(d.expiryDate) < new Date() ? 'red' : 'green'};">${d.expiryDate}</span>` : 'Unverified'}</div>
          </div>

          <!-- Category C: Registered Pharmacist -->
          <div class="card" style="padding:12px; background:var(--bg-input);">
            <strong style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">C. Registered Pharmacist</strong>
            <div style="font-weight:800; font-size:1rem; margin-top:4px;">${d.pharmacistName || 'Missing Pharmacist'}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Council Reg #: <code>${d.pharmacistRegNo || 'Missing'}</code></div>
            <div style="font-size:0.8rem; margin-top:4px;">Qualification: ${d.qualification || 'B.Pharm'} (${d.regAuthority || 'State Council'})</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Validity: ${d.pharmacistValidity || '2029-05-20'}</div>
          </div>

          <!-- Category D: Address & Location -->
          <div class="card" style="padding:12px; background:var(--bg-input);">
            <strong style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">D. Address & Location Proof</strong>
            <div style="font-weight:800; font-size:0.95rem; margin-top:4px;">${d.address || 'Address missing'}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">City: ${d.city || ''}, ${d.state || ''} — ${d.pincode || ''}</div>
            <div style="font-size:0.78rem; color:var(--success); margin-top:4px;"><i class="fas fa-check-circle"></i> Physical Commercial Store Premises</div>
          </div>
        </div>

        <!-- Category E: Statutory Documents Checklist -->
        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:8px;"><i class="fas fa-folder-tree"></i> E. Required Documents Audit</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:8px; margin-bottom:16px; font-size:0.8rem;">
          <div style="padding:8px 10px; background:var(--bg-input); border-radius:6px;">Drug License: ${d.docDrugLicense ? '<strong style="color:green;">✓ Attached</strong>' : '<strong style="color:red;">❌ Missing</strong>'}</div>
          <div style="padding:8px 10px; background:var(--bg-input); border-radius:6px;">Pharmacist Cert: ${d.docPharmacistCert ? '<strong style="color:green;">✓ Attached</strong>' : '<strong style="color:red;">❌ Missing</strong>'}</div>
          <div style="padding:8px 10px; background:var(--bg-input); border-radius:6px;">PAN Document: ${d.docPan ? '<strong style="color:green;">✓ Attached</strong>' : '<strong style="color:red;">❌ Missing</strong>'}</div>
          <div style="padding:8px 10px; background:var(--bg-input); border-radius:6px;">GST Document: ${d.docGst ? '<strong style="color:green;">✓ Attached</strong>' : '<strong style="color:orange;">⚠️ Optional</strong>'}</div>
          <div style="padding:8px 10px; background:var(--bg-input); border-radius:6px;">Address Proof: ${d.docAddressProof ? '<strong style="color:green;">✓ Attached</strong>' : '<strong style="color:orange;">⚠️ Pending</strong>'}</div>
        </div>

        <!-- Category F: Marketplace Compliance & History Ledger -->
        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:8px;"><i class="fas fa-shield"></i> F. Marketplace Compliance & History Ledger</h4>
        <div style="margin-bottom:12px; font-size:0.85rem;">
          Rules Agreement Status: ${d.marketplaceRulesAccepted ? `<span class="badge badge-success"><i class="fas fa-check"></i> Accepted (${d.acceptedDate || '2026-07-20'})</span>` : `<span class="badge badge-danger"><i class="fas fa-times"></i> Rules Not Accepted</span>`}
        </div>
        
        <div class="table-responsive" style="max-height:160px; overflow-y:auto; font-size:0.8rem;">
          <table class="table" style="margin:0;">
            <thead>
              <tr><th>Date</th><th>Issue / Log Entry</th><th>Severity</th><th>Action</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${d.complianceHistory && d.complianceHistory.length > 0 ? d.complianceHistory.map(h => `
                <tr>
                  <td><code>${h.date}</code></td>
                  <td><strong>${h.issue}</strong></td>
                  <td><span class="badge ${h.severity === 'High' ? 'badge-danger' : h.severity === 'Medium' ? 'badge-warning' : 'badge-info'}">${h.severity}</span></td>
                  <td>${h.action}</td>
                  <td><span class="badge ${h.status === 'Resolved' ? 'badge-success' : 'badge-secondary'}">${h.status}</span></td>
                </tr>
              `).join('') : `<tr><td colspan="5" class="text-center" style="padding:10px; color:var(--text-muted);">No compliance warnings recorded. Good standing.</td></tr>`}
            </tbody>
          </table>
        </div>
      `,
      footerButtons: `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; gap:8px;">
            <button class="btn btn-warning btn-sm" style="font-weight:800;" onclick="window.MediKartAdmin.requestCorrectionDealer('${d.id}')">
              <i class="fas fa-edit"></i> Request Correction
            </button>
            <button class="btn btn-outline-danger btn-sm" style="font-weight:800;" onclick="window.MediKartAdmin.rejectDealerWithReason('${d.id}')">
              <i class="fas fa-times"></i> Reject Application
            </button>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline-secondary btn-sm" onclick="window.MediKartApp.closeModal()">Close</button>
            <button class="btn btn-success" style="font-weight:900;" ${analysis.overallStatus === 'BLOCKED' ? 'disabled title="Approval Blocked: Mandatory statutory checks failed"' : ''} onclick="window.MediKartAdmin.approveDealer('${d.id}'); window.MediKartApp.closeModal();">
              <i class="fas fa-check-double"></i> APPROVE PHARMACY
            </button>
          </div>
        </div>
      `
    });
  }

  /* --------------------------------------------------------------------------
     3. DEALER REVENUE & FINANCIAL PAYOUTS LEDGER
     -------------------------------------------------------------------------- */
  renderPayouts(container) {
    const allDealers = window.MediKartData.getDealers();
    const settings = window.MediKartData.getSettings();
    const commRate = settings.commissionRate || 8;

    // Filter dealers based on payoutFilter
    let filteredDealers = allDealers;
    if (this.payoutFilter === 'pending') {
      filteredDealers = allDealers.filter(d => d.payoutStatus === 'Pending Settlement');
    } else if (this.payoutFilter === 'processing') {
      filteredDealers = allDealers.filter(d => d.payoutStatus === 'Processing');
    } else if (this.payoutFilter === 'settled') {
      filteredDealers = allDealers.filter(d => d.payoutStatus === 'Settled');
    } else if (this.payoutFilter === 'failed') {
      filteredDealers = allDealers.filter(d => d.payoutStatus === 'Failed');
    } else if (this.payoutFilter === 'onhold') {
      filteredDealers = allDealers.filter(d => d.payoutStatus === 'On Hold');
    }

    // Financial Metrics Calculation across all approved dealers
    let settledTotal = 0;
    let pendingTotal = 0;
    let processingTotal = 0;
    let failedCount = 0;
    let onHoldCount = 0;

    const finByDealer = window.MediKartData.getFinancialsByDealer(commRate);

    allDealers.forEach(d => {
      const dFin = finByDealer[d.id];
      const net = dFin ? dFin.dealerPayout : 0;
      if (d.payoutStatus === 'Settled') settledTotal += net;
      else if (d.payoutStatus === 'Pending Settlement') pendingTotal += net;
      else if (d.payoutStatus === 'Processing') processingTotal += net;
      else if (d.payoutStatus === 'Failed') failedCount++;
      else if (d.payoutStatus === 'On Hold') onHoldCount++;
    });

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);"><i class="fas fa-wallet" style="color:var(--primary);"></i> Dealer Revenue & Financial Payouts Ledger</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Track dealer sales, platform commission deductions, and resolve bank payout exceptions.</p>
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          <span class="badge badge-success" style="padding:8px 12px; font-size:0.82rem;"><i class="fas fa-bolt"></i> Auto-Settlement Active</span>
          <button class="btn btn-success" onclick="window.MediKartAdmin.runBatchAutoSettlement()">
            <i class="fas fa-money-bill-transfer"></i> Run 1-Click Batch Settlement
          </button>
          <button class="btn btn-outline-primary" onclick="window.print()">
            <i class="fas fa-print"></i> Export Ledger
          </button>
        </div>
      </div>

      <!-- PAYOUT FINANCIAL OVERVIEW CARDS -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="card" style="border-left:4px solid var(--success);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Total Settled Payouts</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--success);">₹${settledTotal.toFixed(2)}</div>
        </div>

        <div class="card" style="border-left:4px solid var(--warning);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Pending Settlement Pool</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--warning);">₹${pendingTotal.toFixed(2)}</div>
        </div>

        <div class="card" style="border-left:4px solid var(--info);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Processing Bank Transfers</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--info);">₹${processingTotal.toFixed(2)}</div>
        </div>

        <div class="card" style="border-left:4px solid var(--danger);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Failed Payout Alerts</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--danger);">${failedCount} Dealers</div>
        </div>

        <div class="card" style="border-left:4px solid var(--secondary);">
          <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Statutory / Risk Holds</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-main);">${onHoldCount} Dealers</div>
        </div>
      </div>

      <!-- PAYOUT STATUS FILTER TABS -->
      <div class="card" style="margin-bottom:20px; padding:12px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <strong style="margin-right:8px; font-size:0.9rem; color:var(--text-muted);"><i class="fas fa-filter"></i> Filter Status:</strong>
          <button class="btn btn-sm ${this.payoutFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='all'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            All (${allDealers.length})
          </button>
          <button class="btn btn-sm ${this.payoutFilter === 'pending' ? 'btn-warning' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='pending'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            Pending (${allDealers.filter(d => d.payoutStatus === 'Pending Settlement').length})
          </button>
          <button class="btn btn-sm ${this.payoutFilter === 'processing' ? 'btn-info' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='processing'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            Processing (${allDealers.filter(d => d.payoutStatus === 'Processing').length})
          </button>
          <button class="btn btn-sm ${this.payoutFilter === 'settled' ? 'btn-success' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='settled'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            Settled (${allDealers.filter(d => d.payoutStatus === 'Settled').length})
          </button>
          <button class="btn btn-sm ${this.payoutFilter === 'failed' ? 'btn-danger' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='failed'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            Failed (${allDealers.filter(d => d.payoutStatus === 'Failed').length})
          </button>
          <button class="btn btn-sm ${this.payoutFilter === 'onhold' ? 'btn-secondary' : 'btn-outline-secondary'}" onclick="window.MediKartAdmin.payoutFilter='onhold'; window.MediKartAdmin.renderPayouts(document.querySelector('#admin-root #main-content'))">
            On Hold (${allDealers.filter(d => d.payoutStatus === 'On Hold').length})
          </button>
        </div>
      </div>

      <!-- FINANCIAL LEDGER TABLE -->
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pharmacy Dealer</th>
                <th>Bank Account & IFSC</th>
                <th>Gross Dealer Sales</th>
                <th>Platform Comm (${commRate}%)</th>
                <th>Net Dealer Payout</th>
                <th>Payout Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDealers.length === 0 ? `
                <tr><td colspan="7" class="text-center" style="padding:30px; color:var(--text-muted);">No dealers match the selected payout status filter.</td></tr>
              ` : filteredDealers.map(d => {
                const dFin = finByDealer[d.id];
                const sales = dFin ? dFin.netProductValue : 0;
                const comm = dFin ? dFin.platformCommission : 0;
                const net = dFin ? dFin.dealerPayout : 0;
                const status = d.payoutStatus || 'Pending Settlement';

                let badgeClass = 'badge-warning';
                let iconClass = 'fa-clock';
                if (status === 'Settled') { badgeClass = 'badge-success'; iconClass = 'fa-check-circle'; }
                else if (status === 'Processing') { badgeClass = 'badge-info'; iconClass = 'fa-spinner fa-spin'; }
                else if (status === 'Failed') { badgeClass = 'badge-danger'; iconClass = 'fa-circle-exclamation'; }
                else if (status === 'On Hold') { badgeClass = 'badge-secondary'; iconClass = 'fa-hand-holding-dollar'; }

                return `
                  <tr>
                    <td>
                      <strong style="color:var(--text-main);">${d.businessName}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${d.name}</div>
                    </td>
                    <td>
                      <div style="font-size:0.82rem; font-weight:700;">${this.esc(d.bankAccount || 'Not on file')}</div>
                      ${(() => {
                        // Guarded: most dealer records have no ifscCode, and the
                        // unguarded .includes() call here crashed the whole page.
                        const ifsc = d.ifscCode || '';
                        const invalid = ifsc.includes('INVALID');
                        return `
                          <div style="font-size:0.75rem; color:${invalid ? 'var(--danger)' : 'var(--text-muted)'}; font-family:monospace;">
                            IFSC: ${this.esc(ifsc || 'Not on file')} ${invalid ? '<i class="fas fa-triangle-exclamation"></i>' : ''}
                          </div>
                        `;
                      })()}
                    </td>
                    <td><strong>₹${sales.toFixed(2)}</strong></td>
                    <td><strong style="color:var(--success);">₹${comm.toFixed(2)}</strong></td>
                    <td><strong style="color:var(--primary); font-size:1.05rem;">₹${net.toFixed(2)}</strong></td>
                    <td>
                      <span class="badge ${badgeClass}" style="display:inline-flex; align-items:center; gap:5px;">
                        <i class="fas ${iconClass}"></i> ${status}
                      </span>
                      ${d.payoutErrorReason ? `<div style="font-size:0.72rem; color:var(--danger); margin-top:4px; max-width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${d.payoutErrorReason}"><i class="fas fa-info-circle"></i> ${d.payoutErrorReason}</div>` : ''}
                    </td>
                    <td>
                      ${status === 'Pending Settlement' && sales > 0 ? `
                        <button class="btn btn-sm btn-primary" onclick="window.MediKartAdmin.settlePayout('${d.id}')">
                          <i class="fas fa-paper-plane"></i> Process Payout
                        </button>
                      ` : status === 'Processing' ? `
                        <button class="btn btn-sm btn-outline-info" title="Confirm Bank Settlement Webhook" onclick="window.MediKartAdmin.markAsSettled('${d.id}')">
                          <i class="fas fa-check"></i> Complete
                        </button>
                      ` : status === 'Failed' ? `
                        <button class="btn btn-sm btn-danger" onclick="window.MediKartAdmin.inspectFailedPayout('${d.id}')">
                          <i class="fas fa-wrench"></i> Fix & Retry
                        </button>
                      ` : status === 'On Hold' ? `
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.MediKartAdmin.inspectHoldPayout('${d.id}')">
                          <i class="fas fa-shield-halved"></i> Inspect Hold
                        </button>
                      ` : `
                        <span style="font-size:0.8rem; color:var(--text-muted);"><i class="fas fa-check-double"></i> Settled (${d.transactionRef || 'TXN'})</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  runBatchAutoSettlement() {
    const dealers = window.MediKartData.getDealers();
    let settledCount = 0;
    let settledAmount = 0;

    dealers.forEach(d => {
      if (d.payoutStatus === 'Pending Settlement' || !d.payoutStatus) {
        const sales = d.grossRevenue || 0;
        const net = sales * 0.92;
        d.payoutStatus = 'Settled';
        d.transactionRef = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
        d.payoutErrorReason = null;
        settledCount++;
        settledAmount += net;
      }
    });

    if (settledCount > 0) {
      window.MediKartData.saveDealers(dealers);
      window.MediKartApp.toast(`Automated Batch Settlement Complete! Processed ₹${settledAmount.toFixed(2)} across ${settledCount} eligible pharmacy accounts.`, 'success');
      this.renderPayouts(document.querySelector('#admin-root #main-content'));
    } else {
      window.MediKartApp.toast('All eligible pending payouts have already been settled!', 'info');
    }
  }

  settlePayout(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (d) {
      d.payoutStatus = 'Settled';
      d.transactionRef = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
      d.payoutErrorReason = null;
      window.MediKartData.saveDealers(dealers);
      window.MediKartApp.toast(`Bank Payout of ₹${((d.grossRevenue || 0) * 0.92).toFixed(2)} successfully transferred to ${d.businessName}!`, 'success');
      this.renderPayouts(document.querySelector('#admin-root #main-content'));
    }
  }

  markAsSettled(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (d) {
      d.payoutStatus = 'Settled';
      d.transactionRef = d.transactionRef || `TXN${Math.floor(100000 + Math.random() * 900000)}`;
      d.payoutErrorReason = null;
      window.MediKartData.saveDealers(dealers);
      window.MediKartApp.toast(`Processing Payout confirmed for ${d.businessName}! Ref: ${d.transactionRef}`, 'success');
      this.renderPayouts(document.querySelector('#admin-root #main-content'));
    }
  }

  inspectFailedPayout(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (!d) return;

    window.MediKartApp.showModal({
      title: `Bank Payout Failure Resolution – ${d.businessName}`,
      content: `
        <div style="background:#fef2f2; border:1px solid #fecaca; padding:14px; border-radius:var(--radius-md); font-size:0.88rem; color:#991b1b; margin-bottom:16px;">
          <i class="fas fa-triangle-exclamation"></i> <strong>Bank Failure Details:</strong><br>
          ${d.payoutErrorReason || 'Bank account / IFSC validation failed during NEFT transfer.'}
        </div>

        <div class="form-group" style="margin-bottom:12px;">
          <label>Bank Account Number</label>
          <input type="text" id="fixBankAccount" class="form-control" value="${d.bankAccount || 'HDFC Bank A/C 987654321'}">
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label>IFSC Code</label>
          <input type="text" id="fixIfscCode" class="form-control" value="${this.esc(!d.ifscCode || d.ifscCode.includes('INVALID') ? 'HDFC0000123' : d.ifscCode)}">
          <small style="color:var(--text-muted);">Ensure 11-digit valid RBI bank IFSC code.</small>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-success" onclick="window.MediKartAdmin.retryFailedPayout('${d.id}')">
          <i class="fas fa-rotate-right"></i> Save Details & Retry Payout
        </button>
      `
    });
  }

  retryFailedPayout(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (d) {
      const acc = document.getElementById('fixBankAccount').value;
      const ifsc = document.getElementById('fixIfscCode').value;

      d.bankAccount = acc;
      d.ifscCode = ifsc;
      d.payoutStatus = 'Settled';
      d.payoutErrorReason = null;
      d.transactionRef = `TXN-RETRY-${Math.floor(100000 + Math.random() * 900000)}`;

      window.MediKartData.saveDealers(dealers);
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Bank details updated & payout settled for ${d.businessName}! Ref: ${d.transactionRef}`, 'success');
      this.renderPayouts(document.querySelector('#admin-root #main-content'));
    }
  }

  inspectHoldPayout(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (!d) return;

    window.MediKartApp.showModal({
      title: `Statutory / Compliance Hold Inspection – ${d.businessName}`,
      content: `
        <div style="background:#fffbebf; border:1px solid #fef08a; padding:14px; border-radius:var(--radius-md); font-size:0.88rem; color:#854d0e; margin-bottom:16px;">
          <i class="fas fa-hand-holding-dollar"></i> <strong>Hold Reason:</strong><br>
          ${d.payoutErrorReason || 'Form 20B Statutory Drug License annual renewal pending verification.'}
        </div>

        <div style="font-size:0.88rem; line-height:1.6; margin-bottom:16px;">
          <div>Pharmacy Owner: <strong>${d.name}</strong></div>
          <div>Drug License: <code>${d.drugLicense}</code></div>
          <div>GSTIN: <code>${d.gstNumber}</code></div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>
        <button class="btn btn-success" onclick="window.MediKartAdmin.releaseHoldPayout('${d.id}')">
          <i class="fas fa-lock-open"></i> Clear Audit & Release Payout
        </button>
      `
    });
  }

  releaseHoldPayout(dealerId) {
    const dealers = window.MediKartData.getDealers();
    const d = dealers.find(x => x.id === dealerId);
    if (d) {
      d.payoutStatus = 'Pending Settlement';
      d.payoutErrorReason = null;
      window.MediKartData.saveDealers(dealers);
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Compliance hold released for ${d.businessName}! Status set to Pending Settlement.`, 'success');
      this.renderPayouts(document.querySelector('#admin-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     4. MEDICINE INVENTORY & LISTING OVERSIGHT
     -------------------------------------------------------------------------- */
  renderMedicines(container) {
    const medicines = window.MediKartData.getMedicines();

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-pills" style="color:var(--primary);"></i> Medicine Catalog & Inventory Control</h1>
      <p style="color:var(--text-muted); margin-bottom:20px;">Inspect listed medicines across all verified dealers and enforce compliance.</p>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Generic Molecule</th>
                <th>Manufacturer</th>
                <th>Seller Pharmacy</th>
                <th>Packaging</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rx Status</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.slice(0, 30).map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.genericName}</td>
                  <td>${m.manufacturer}</td>
                  <td>${m.dealerName}</td>
                  <td><span class="badge badge-packaging">${m.packaging}</span></td>
                  <td><strong>₹${m.sellingPrice}</strong></td>
                  <td>${m.stock} ${m.packageUnit}</td>
                  <td>
                    <span class="badge ${m.prescriptionRequired ? 'badge-danger' : 'badge-info'}">
                      ${m.prescriptionRequired ? 'Rx Required' : 'OTC'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  toggleMedicineRx(medId) {
    const medicines = window.MediKartData.getMedicines();
    const m = medicines.find(x => x.id === medId);
    if (m) {
      m.prescriptionRequired = !m.prescriptionRequired;
      window.MediKartData.saveMedicines(medicines);
      window.MediKartApp.toast(`Updated Rx status for ${m.name}`, 'info');
      this.renderMedicines(document.querySelector('#admin-root #main-content'));
    }
  }

  renderInventory(container) {
    this.renderMedicines(container);
  }

  renderBuyers(container) {
    const buyers = window.MediKartData.getBuyers();
    const activeCount = buyers.filter(b => b.status === 'active').length;
    const verifiedCount = buyers.filter(b => b.status === 'verified').length;
    const premiumCount = buyers.filter(b => b.status === 'premium').length;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);"><i class="fas fa-users" style="color:var(--primary);"></i> Registered Customers Directory</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Monitor customer accounts, delivery address books, and order history metrics.</p>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="card" style="padding:8px 16px; margin:0; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-user-check" style="color:var(--success);"></i> <strong>${buyers.length} Registered Customers</strong>
          </div>
        </div>
      </div>

      <!-- SEARCH BAR -->
      <div class="card" style="margin-bottom:20px; padding:14px;">
        <div class="form-control" style="display:flex; align-items:center; gap:10px; background:var(--bg-input);">
          <i class="fas fa-search" style="color:var(--text-muted);"></i>
          <input type="text" id="buyerSearchInput" placeholder="Search by Buyer Name, Email, Mobile..." style="border:none; background:transparent; width:100%;" oninput="window.MediKartAdmin.filterBuyersTable(this.value)">
        </div>
      </div>

      <!-- BUYERS TABLE -->
      <div class="card">
        <div class="table-responsive">
          <table class="table" id="buyersDirectoryTable">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Total Orders</th>
                <th>Saved Addresses</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${buyers.map(b => {
                const addrs = b.addresses || [];
                const statusBadge = b.status === 'premium' ? 'badge-warning' : b.status === 'verified' ? 'badge-info' : 'badge-success';
                const statusIcon = b.status === 'premium' ? 'fa-crown' : b.status === 'verified' ? 'fa-shield-check' : 'fa-check';

                return `
                  <tr class="buyer-row" data-search="${(b.name + ' ' + b.email + ' ' + b.phone).toLowerCase()}">
                    <td>
                      <strong style="color:var(--primary);">${b.name}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">Member Since: ${b.memberSince || '2025'}</div>
                    </td>
                    <td><code>${b.email}</code></td>
                    <td>${b.phone}</td>
                    <td><strong style="color:var(--text-main);">${b.totalOrders || (b.id === 'usr-501' ? 12 : 3)} Orders</strong></td>
                    <td>${addrs.length} Saved</td>
                    <td>
                      <span class="badge ${statusBadge}" style="display:inline-flex; align-items:center; gap:4px;">
                        <i class="fas ${statusIcon}"></i> ${b.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-secondary" onclick="window.MediKartAdmin.inspectBuyerDetails('${b.id}')">
                        <i class="fas fa-eye"></i> Details
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  filterBuyersTable(query) {
    const q = (query || '').toLowerCase();
    document.querySelectorAll('#buyersDirectoryTable .buyer-row').forEach(row => {
      const text = row.getAttribute('data-search') || '';
      row.style.display = text.includes(q) ? '' : 'none';
    });
  }

  inspectBuyerDetails(buyerId) {
    const buyers = window.MediKartData.getBuyers();
    const b = buyers.find(x => x.id === buyerId) || buyers[0];
    const addrs = b.addresses || [];

    window.MediKartApp.showModal({
      title: `Buyer Profile Inspection – ${b.name}`,
      content: `
        <div style="display:flex; align-items:center; gap:14px; border-bottom:1px solid var(--border-color); padding-bottom:14px; margin-bottom:16px;">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem;">
            ${b.name.charAt(0)}
          </div>
          <div>
            <h3 style="margin:0; font-weight:800;">${b.name}</h3>
            <div style="font-size:0.85rem; color:var(--text-muted);">${b.email} • ${b.phone}</div>
          </div>
        </div>

        <h4 style="font-weight:800; font-size:0.95rem; margin-bottom:10px;"><i class="fas fa-location-dot" style="color:var(--primary);"></i> Registered Delivery Addresses (${addrs.length})</h4>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
          ${addrs.length === 0 ? '<div style="color:var(--text-muted); font-size:0.85rem;">No saved addresses.</div>' : addrs.map(a => `
            <div class="card" style="padding:10px; font-size:0.85rem; background:var(--bg-input);">
              <strong>${a.tag || 'Address'} (${a.name}):</strong> ${a.line}, ${a.city}, ${a.state} - ${a.pincode}
            </div>
          `).join('')}
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>
      `
    });
  }

  handleAdminOrdersSearchInput(el) {
    const val = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    this.adminOrdersSearch = val;
    this.adminOrdersPage = 1;
    this.renderOrders(document.querySelector('#admin-root #main-content'));
    const newInput = document.getElementById('adminOrdersSearchInput');
    if (newInput) {
      newInput.focus();
      try { newInput.setSelectionRange(start, end); } catch(e) {}
    }
  }

  clearAdminOrdersSearch() {
    this.adminOrdersSearch = '';
    this.adminOrdersPage = 1;
    this.renderOrders(document.querySelector('#admin-root #main-content'));
  }

  renderOrders(container) {
    let orders = window.MediKartData.getOrders();

    if (this.adminOrdersSearch) {
      const q = this.adminOrdersSearch.trim().toLowerCase();
      orders = orders.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
        (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
        (o.buyerEmail && o.buyerEmail.toLowerCase().includes(q)) ||
        (o.dealerName && o.dealerName.toLowerCase().includes(q)) ||
        (o.transactionRef && o.transactionRef.toLowerCase().includes(q)) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q)) ||
        (o.paymentStatus && o.paymentStatus.toLowerCase().includes(q)) ||
        (o.status && o.status.toLowerCase().includes(q)) ||
        (o.rxStatus && o.rxStatus.toLowerCase().includes(q)) ||
        (o.orderDate && o.orderDate.toLowerCase().includes(q)) ||
        (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q)) ||
        (o.items && o.items.some(i => 
          (i.medicineName && i.medicineName.toLowerCase().includes(q)) ||
          (i.genericName && i.genericName.toLowerCase().includes(q)) ||
          (i.therapeuticCategory && i.therapeuticCategory.toLowerCase().includes(q)) ||
          (i.packaging && i.packaging.toLowerCase().includes(q))
        ))
      );
    }

    if (this.adminOrdersFilterStatus && this.adminOrdersFilterStatus !== 'all') {
      orders = orders.filter(o => o.status === this.adminOrdersFilterStatus);
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main); margin:0;"><i class="fas fa-box" style="color:var(--primary);"></i> Marketplace Order Logistics Oversight</h1>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-top:2px;">Inspect order stages, payment status, and delivery timelines across all buyers and pharmacies.</p>
        </div>
      </div>

      <!-- FILTER & SEARCH TOOLBAR -->
      <div class="card" style="margin-bottom:20px; padding:16px;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Search Marketplace Orders (${orders.length})</label>
            <div style="position:relative; display:flex; align-items:center;">
              <i class="fas fa-search" style="position:absolute; left:12px; color:var(--text-muted); font-size:0.9rem;"></i>
              <input type="text" id="adminOrdersSearchInput" class="form-control" style="padding-left:36px; padding-right:${this.adminOrdersSearch ? '36px' : '12px'};" placeholder="Search order #, buyer, dealer, invoice, medicine, payment..." value="${this.adminOrdersSearch || ''}" oninput="window.MediKartAdmin.handleAdminOrdersSearchInput(this)">
              ${this.adminOrdersSearch ? `<i class="fas fa-circle-xmark" style="position:absolute; right:12px; cursor:pointer; color:var(--text-muted);" onclick="window.MediKartAdmin.clearAdminOrdersSearch()"></i>` : ''}
            </div>
          </div>

          <div>
            <label style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Filter Order Stage</label>
            <select class="form-control" onchange="window.MediKartAdmin.adminOrdersFilterStatus = this.value; window.MediKartAdmin.renderOrders(document.querySelector('#admin-root #main-content'))">
              <option value="all">All Order Stages</option>
              <option value="Placed" ${(this.adminOrdersFilterStatus === 'Placed') ? 'selected' : ''}>Placed (New Order)</option>
              <option value="Accepted" ${(this.adminOrdersFilterStatus === 'Accepted') ? 'selected' : ''}>Accepted</option>
              <option value="Packed" ${(this.adminOrdersFilterStatus === 'Packed') ? 'selected' : ''}>Packed</option>
              <option value="Shipped" ${(this.adminOrdersFilterStatus === 'Shipped') ? 'selected' : ''}>Shipped</option>
              <option value="Out for Delivery" ${(this.adminOrdersFilterStatus === 'Out for Delivery') ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${(this.adminOrdersFilterStatus === 'Delivered') ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${(this.adminOrdersFilterStatus === 'Cancelled') ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      ${orders.length === 0 ? `
        <div class="card text-center" style="padding:40px; color:var(--text-muted);">
          <i class="fas fa-box-open" style="font-size:2.5rem; margin-bottom:12px;"></i>
          <h3>No Marketplace Orders Found</h3>
          <p style="font-size:0.88rem;">No order records match your active search or stage filter criteria.</p>
        </div>
      ` : orders.slice(0, 20).map(ord => window.MediKartTimeline.renderTimelineHTML(ord, 'admin')).join('')}
    `;
  }

  /* --------------------------------------------------------------------------
     5. PLATFORM SYSTEM SETTINGS & COMMISSION CONTROL
     -------------------------------------------------------------------------- */
  renderSettings(container) {
    const settings = window.MediKartData.getSettings();

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);"><i class="fas fa-sliders-h" style="color:var(--primary);"></i> Platform System Settings & Compliance Rules</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Configure marketplace commission rates, GST tax rules, statutory pharmacy compliance, and delivery SLAs.</p>
        </div>

        <div style="display:flex; gap:10px;">
          <span class="badge badge-success" style="padding:10px 16px; font-size:0.85rem;"><i class="fas fa-circle-check"></i> System Operational</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
        <!-- LEFT COLUMN: SYSTEM CONFIGURATION FORM -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- 1. FINANCIAL & MARKETPLACE CONTROLS -->
          <div class="card">
            <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:14px; color:var(--primary);">
              <i class="fas fa-wallet" style="margin-right:6px;"></i> Financial & Marketplace Revenue Controls
            </h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Marketplace Commission Rate (%)</label>
                <input type="number" id="settingCommission" class="form-control" value="${settings.commissionRate || 8}" min="1" max="30">
                <small style="color:var(--text-muted); font-size:0.75rem;">Percentage deducted by MediKart on every sale.</small>
              </div>

              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">GST Tax Rate (%)</label>
                <input type="number" id="settingGst" class="form-control" value="${settings.gstRate || 12}">
                <small style="color:var(--text-muted); font-size:0.75rem;">Standard pharmaceutical GST tax tier.</small>
              </div>

              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Standard Delivery Fee (₹)</label>
                <input type="number" id="settingDeliveryFee" class="form-control" value="${settings.deliveryFee || 45}">
              </div>

              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Free Delivery Order Threshold (₹)</label>
                <input type="number" id="settingFreeDeliveryThreshold" class="form-control" value="${settings.freeDeliveryThreshold || 500}">
              </div>
            </div>
          </div>

          <!-- 2. PHARMACEUTICAL & STATUTORY COMPLIANCE -->
          <div class="card">
            <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:14px; color:var(--secondary);">
              <i class="fas fa-prescription-bottle-medical" style="margin-right:6px;"></i> Statutory Pharmaceutical Compliance Rules
            </h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Mandatory Rx Prescription Upload</label>
                <select id="settingRxMandatory" class="form-control">
                  <option value="enabled" selected>Strict Mandatory (Schedule H/H1 Drugs)</option>
                  <option value="optional">Optional / Pharmacist Call Verification</option>
                </select>
                <small style="color:var(--text-muted); font-size:0.75rem;">Requires doctor's prescription for Rx items.</small>
              </div>

              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Drug License Expiry Warning (Days)</label>
                <input type="number" id="settingLicenseWarning" class="form-control" value="${settings.licenseWarningDays || 30}">
                <small style="color:var(--text-muted); font-size:0.75rem;">Days before Form 20B/21B expiry to alert Admin.</small>
              </div>

              <div class="form-group" style="grid-column: span 2;">
                <label style="font-weight:700; font-size:0.84rem;">Max Purchase Quantity Limit per Order</label>
                <input type="number" id="settingMaxQuantity" class="form-control" value="${settings.maxQuantityPerOrder || 15}">
                <small style="color:var(--text-muted); font-size:0.75rem;">Prevents illicit bulk hoarding of controlled medicines.</small>
              </div>
            </div>
          </div>

          <!-- 3. LOGISTICS & PAYOUT SETTLEMENT SLA -->
          <div class="card">
            <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:14px; color:var(--accent);">
              <i class="fas fa-truck-fast" style="margin-right:6px;"></i> Logistics & Bank Settlement SLA Rules
            </h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Express Priority Delivery Fee (₹)</label>
                <input type="number" id="settingExpressFee" class="form-control" value="${settings.expressDeliveryFee || 99}">
              </div>

              <div class="form-group">
                <label style="font-weight:700; font-size:0.84rem;">Order Grace Cancellation Window (Mins)</label>
                <input type="number" id="settingCancellationWindow" class="form-control" value="${settings.cancellationWindow || 15}">
              </div>
            </div>
          </div>

          <!-- SAVE ACTION BUTTON -->
          <div>
            <button class="btn btn-primary btn-lg" style="padding:14px 28px; font-weight:800;" onclick="window.MediKartAdmin.saveSystemSettings()">
              <i class="fas fa-save"></i> Save All Platform Configurations
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN: SYSTEM HEALTH & OPERATIONAL AUDIT -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card">
            <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:14px;"><i class="fas fa-heart-pulse" style="color:var(--success);"></i> System Health & Audit</h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px dashed var(--border-color);">
                <span>Marketplace Status:</span><span class="badge badge-success">🟢 Live & Operational</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px dashed var(--border-color);">
                <span>Commission Engine:</span><span style="font-weight:700; color:var(--primary);">${settings.commissionRate || 8}% Auto-Deduct</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px dashed var(--border-color);">
                <span>Rx Compliance Check:</span><span style="font-weight:700; color:var(--success);">Active (Strict)</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px dashed var(--border-color);">
                <span>Auto-Settlement Cron:</span><span style="font-weight:700; color:var(--secondary);">Every Friday 00:00</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Last System Backup:</span><span style="color:var(--text-muted);">Today, 23:00 IST</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="font-weight:800; font-size:1.05rem; margin-bottom:12px;"><i class="fas fa-headset" style="color:var(--secondary);"></i> Support Contacts</h3>
            <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <div><strong>Helpline:</strong> +91 1800-123-MEDIKART</div>
              <div><strong>Escalations:</strong> admin@medikart.com</div>
              <div><strong>Compliance Officer:</strong> compliance@medikart.com</div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  saveSystemSettings() {
    const comm = Number(document.getElementById('settingCommission').value);
    const gst = Number(document.getElementById('settingGst').value);
    const delFee = Number(document.getElementById('settingDeliveryFee').value);
    const freeDel = Number(document.getElementById('settingFreeDeliveryThreshold').value);
    const licenseDays = Number(document.getElementById('settingLicenseWarning').value);
    const maxQty = Number(document.getElementById('settingMaxQuantity').value);
    const expressFee = Number(document.getElementById('settingExpressFee').value);
    const cancelWindow = Number(document.getElementById('settingCancellationWindow').value);

    const settings = {
      commissionRate: comm,
      gstRate: gst,
      deliveryFee: delFee,
      freeDeliveryThreshold: freeDel,
      licenseWarningDays: licenseDays,
      maxQuantityPerOrder: maxQty,
      expressDeliveryFee: expressFee,
      cancellationWindow: cancelWindow
    };

    window.MediKartData.saveSettings(settings);
    window.MediKartData.logAudit('Platform Settings Updated', 'Settings', 'global', `Commission: ${comm}%, Delivery Fee: ₹${delFee}`);
    window.MediKartApp.toast(`Platform Configurations & Statutory Compliance Rules Saved Successfully!`, 'success');
    this.renderSettings(document.querySelector('#admin-root #main-content'));
  }

  /* --------------------------------------------------------------------------
     DEALER MODERATION ACTIONS WITH REASON RECORDING

     NOTE: a second approveDealer() used to live here and silently overrode the
     one defined above, discarding its compliance-history write. The single
     implementation now lives with the other moderation actions.
     -------------------------------------------------------------------------- */
  rejectDealerModal(dealerId) {
    window.MediKartApp.showModal({
      title: `Reject Dealer Application — ID ${dealerId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Rejection Reason (Mandatory Record) *</label>
          <textarea id="dealerRejectReasonInput" class="form-control" rows="3" placeholder="e.g. Drug License expired, GSTIN mismatch, or store proof invalid." required></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="window.MediKartAdmin.saveRejectDealer('${dealerId}')">Confirm Rejection</button>
      `
    });
  }

  saveRejectDealer(dealerId) {
    const reason = document.getElementById('dealerRejectReasonInput').value;
    if (!reason || !reason.trim()) {
      window.MediKartApp.toast('Please enter a rejection reason.', 'error');
      return;
    }
    const res = window.MediKartData.updateDealerStatus(dealerId, 'rejected', reason.trim());
    if (res.success) {
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Dealer ${res.dealer.businessName} rejected. Reason logged in Audit trail.`, 'warning');
      this.navigate(this.currentView);
    }
  }

  suspendDealerModal(dealerId) {
    window.MediKartApp.showModal({
      title: `Suspend Dealer Account — ID ${dealerId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Suspension Reason (Mandatory Audit Record) *</label>
          <textarea id="dealerSuspendReasonInput" class="form-control" rows="3" placeholder="e.g. Counterfeit medication complaint, price gouging, or regulatory investigation." required></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="window.MediKartAdmin.saveSuspendDealer('${dealerId}')">Suspend Account</button>
      `
    });
  }

  saveSuspendDealer(dealerId) {
    const reason = document.getElementById('dealerSuspendReasonInput').value;
    if (!reason || !reason.trim()) {
      window.MediKartApp.toast('Please enter a suspension reason.', 'error');
      return;
    }
    const res = window.MediKartData.updateDealerStatus(dealerId, 'suspended', reason.trim());
    if (res.success) {
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Dealer ${res.dealer.businessName} suspended. Seller operations disabled.`, 'error');
      this.navigate(this.currentView);
    }
  }

  reactivateDealer(dealerId) {
    const res = window.MediKartData.updateDealerStatus(dealerId, 'approved', 'Reactivated by Admin');
    if (res.success) {
      window.MediKartApp.toast(`Dealer ${res.dealer.businessName} reactivated! Seller operations restored.`, 'success');
      this.navigate(this.currentView);
    }
  }

  /* --------------------------------------------------------------------------
     PROMPT 3: ADMIN MEDICINE MODERATION (DISABLE / REMOVE)
     -------------------------------------------------------------------------- */
  disableMedicine(medId) {
    const meds = window.MediKartData.getMedicines();
    const m = meds.find(x => x.id === medId);
    if (m) {
      m.status = 'inactive';
      window.MediKartData.saveMedicines(meds);
      window.MediKartData.logAudit('Medicine Listing Disabled', 'Medicine', medId, `Disabled ${m.name}`);
      window.MediKartApp.toast(`Medicine ${m.name} disabled from marketplace storefront.`, 'info');
      this.renderMedicines(document.querySelector('#admin-root #main-content'));
    }
  }

  reEnableMedicine(medId) {
    const meds = window.MediKartData.getMedicines();
    const m = meds.find(x => x.id === medId);
    if (m) {
      m.status = 'active';
      window.MediKartData.saveMedicines(meds);
      window.MediKartData.logAudit('Medicine Listing Re-enabled', 'Medicine', medId, `Re-enabled ${m.name}`);
      window.MediKartApp.toast(`Medicine ${m.name} re-enabled on marketplace storefront.`, 'success');
      this.renderMedicines(document.querySelector('#admin-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     PROMPT 3: ADMIN REFUND CLAIMS MANAGEMENT
     -------------------------------------------------------------------------- */
  renderRefunds(container) {
    const refunds = window.MediKartData.getRefunds();

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-rotate-left" style="color:var(--warning);"></i> Refund Claims & Return Management</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Review buyer refund applications, approve refunds, or log rejection reasons.</p>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Order Reference</th>
                <th>Buyer</th>
                <th>Dealer Pharmacy</th>
                <th>Claim Amount</th>
                <th>Reason & Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${refunds.length === 0 ? `
                <tr><td colspan="8" class="text-center" style="padding:32px;">No refund requests submitted yet.</td></tr>
              ` : refunds.map(r => `
                <tr>
                  <td><code>${r.id}</code></td>
                  <td><strong>${r.orderId}</strong></td>
                  <td>${r.buyerId}</td>
                  <td>${r.dealerName || r.dealerId}</td>
                  <td><strong>₹${(r.amount || 0).toFixed(2)}</strong></td>
                  <td>
                    <div><strong>${r.reason}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${r.notes || 'No notes'}</div>
                  </td>
                  <td>
                    <span class="badge ${r.status === 'Refunded' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}">
                      ${r.status}
                    </span>
                  </td>
                  <td>
                    ${r.status === 'Requested' ? `
                      <button class="btn btn-xs btn-success" onclick="window.MediKartAdmin.updateRefundStatusAction('${r.id}', 'Refunded')">
                        <i class="fas fa-check"></i> Approve Refund
                      </button>
                      <button class="btn btn-xs btn-danger" onclick="window.MediKartAdmin.openRejectRefundModal('${r.id}')">
                        <i class="fas fa-xmark"></i> Reject
                      </button>
                    ` : `
                      <span style="font-size:0.8rem; color:var(--text-muted);">Ref: <code>${r.settlementRef || 'DEMO-REF-8812'}</code></span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  updateRefundStatusAction(refundId, status) {
    const res = window.MediKartData.updateRefundStatus(refundId, status);
    if (res.success) {
      window.MediKartApp.toast(`Refund request #${refundId} marked as ${status}! (Ref: ${res.refund.settlementRef || 'DEMO-REF-8812'})`, 'success');
      this.renderRefunds(document.querySelector('#admin-root #main-content'));
    }
  }

  openRejectRefundModal(refundId) {
    window.MediKartApp.showModal({
      title: `Reject Refund Request — ${refundId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Rejection Reason (Audit Log Record) *</label>
          <textarea id="refundRejectReasonInput" class="form-control" rows="3" placeholder="e.g. Return window expired, or item damaged due to buyer misuse." required></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="window.MediKartAdmin.saveRejectRefund('${refundId}')">Confirm Rejection</button>
      `
    });
  }

  saveRejectRefund(refundId) {
    const reason = document.getElementById('refundRejectReasonInput').value;
    if (!reason || !reason.trim()) {
      window.MediKartApp.toast('Please enter a rejection reason.', 'error');
      return;
    }
    const res = window.MediKartData.updateRefundStatus(refundId, 'Rejected', reason.trim());
    if (res.success) {
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Refund request #${refundId} rejected.`, 'warning');
      this.renderRefunds(document.querySelector('#admin-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     PROMPT 3: ADMIN SUPPORT DESK & TICKETS
     -------------------------------------------------------------------------- */
  renderTickets(container) {
    const tickets = window.MediKartData.getTickets();

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-headset" style="color:var(--secondary);"></i> Patient & Dealer Support Desk</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Manage patient support tickets, respond to delivery queries, and mark issues resolved.</p>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Subject & Description</th>
                <th>Order Ref</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.length === 0 ? `
                <tr><td colspan="6" class="text-center" style="padding:32px;">No support tickets submitted yet.</td></tr>
              ` : tickets.map(t => `
                <tr>
                  <td><code>${t.id}</code></td>
                  <td><span class="badge badge-info">${t.category}</span></td>
                  <td>
                    <strong>${t.subject}</strong>
                    <div style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">${t.description}</div>
                  </td>
                  <td>${t.orderId ? `<code>${t.orderId}</code>` : 'N/A'}</td>
                  <td><span class="badge ${t.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
                  <td>
                    ${t.status !== 'Resolved' ? `
                      <button class="btn btn-xs btn-success" onclick="window.MediKartAdmin.resolveTicketModal('${t.id}')">
                        <i class="fas fa-check"></i> Respond & Resolve
                      </button>
                    ` : '<span style="color:var(--success); font-weight:700;"><i class="fas fa-circle-check"></i> Resolved</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  resolveTicketModal(ticketId) {
    window.MediKartApp.showModal({
      title: `Respond & Resolve Ticket — ${ticketId}`,
      content: `
        <div class="form-group">
          <label style="font-weight:700;">Official Support Desk Response *</label>
          <textarea id="ticketResponseText" class="form-control" rows="3" placeholder="Provide clear resolution instructions or delivery status update for patient..."></textarea>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Cancel</button>
        <button class="btn btn-success" onclick="window.MediKartAdmin.saveResolveTicket('${ticketId}')">Submit & Resolve</button>
      `
    });
  }

  saveResolveTicket(ticketId) {
    const text = document.getElementById('ticketResponseText').value;
    const res = window.MediKartData.updateTicketStatus(ticketId, 'Resolved', text);
    if (res.success) {
      window.MediKartApp.closeModal();
      window.MediKartApp.toast(`Support Ticket #${ticketId} marked as Resolved! Response sent to buyer.`, 'success');
      this.renderTickets(document.querySelector('#admin-root #main-content'));
    }
  }

  /* --------------------------------------------------------------------------
     PROMPT 3: SYSTEM AUDIT TRAIL LOG
     -------------------------------------------------------------------------- */
  renderAuditLogs(container) {
    const logs = window.MediKartData.getAuditLogs();

    container.innerHTML = `
      <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;"><i class="fas fa-file-shield" style="color:var(--primary);"></i> Platform Governance Audit Trail</h1>
      <p style="color:var(--text-muted); margin-bottom:24px;">Immutable ledger of all administrative moderation actions, dealer status changes, and settings updates.</p>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Event</th>
                <th>Entity Type</th>
                <th>Target ID</th>
                <th>Admin Operator</th>
                <th>Notes / Reason</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? `
                <tr><td colspan="6" class="text-center" style="padding:32px;">No audit events recorded yet. Perform admin actions to generate audit logs.</td></tr>
              ` : logs.map(l => `
                <tr>
                  <td><strong>${new Date(l.timestamp).toLocaleString()}</strong></td>
                  <td><span class="badge badge-info">${l.action}</span></td>
                  <td>${l.entity}</td>
                  <td><code>${l.targetId}</code></td>
                  <td><code>${l.adminId}</code></td>
                  <td style="color:var(--text-muted); font-size:0.85rem;">${l.reason || 'Standard Operations'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

window.MediKartAdmin = new AdminController();
