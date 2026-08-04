/* ==========================================================================
   MEDIKART 4.0 - FINANCIAL REPORTS & ANALYTICS MODULE
   Strictly separates Platform Revenue vs Dealer Gross Sales Revenue.

   All figures derive from MediKartData.summarizeOrderFinancials(), so the
   headline cards and the per-dealer ledger below them always reconcile.
   ========================================================================== */

class ReportsModule {
  constructor() {
    this.chartInstances = {};
  }

  esc(value) {
    return window.MediKartApp ? window.MediKartApp.escapeHtml(value) : String(value == null ? '' : value);
  }

  /* Chart.js throws "Canvas is already in use" if a canvas is re-bound without
     destroying the previous instance. Always tear down before re-rendering. */
  destroyCharts() {
    Object.keys(this.chartInstances).forEach(key => {
      try { this.chartInstances[key].destroy(); } catch (e) {}
    });
    this.chartInstances = {};
  }

  renderReportsView(container) {
    if (!container) return;
    this.destroyCharts();

    const data = window.MediKartData;
    const orders = data.getOrders();
    const dealers = data.getDealers();
    const commRate = data.getCommissionRate();

    // Single source of truth for every figure on this page.
    const fin = data.summarizeOrderFinancials(orders, commRate);

    // Per-dealer ledger built from the SAME order set as the totals above.
    const ordersByDealer = {};
    orders.forEach(o => {
      const s = (o.status || '').toLowerCase();
      if (s === 'cancelled' || s === 'refunded') return;
      if (!ordersByDealer[o.dealerId]) ordersByDealer[o.dealerId] = [];
      ordersByDealer[o.dealerId].push(o);
    });

    const ledger = dealers
      .map(d => {
        const dOrders = ordersByDealer[d.id] || [];
        const dFin = data.summarizeOrderFinancials(dOrders, commRate);
        return {
          businessName: d.businessName,
          name: d.name,
          drugLicense: d.drugLicense || '—',
          payoutStatus: d.payoutStatus || 'Pending',
          orderCount: dFin.orderCount,
          grossSales: dFin.netProductValue,
          commission: dFin.platformCommission,
          netPayout: dFin.dealerPayout
        };
      })
      .filter(r => r.orderCount > 0)
      .sort((a, b) => b.grossSales - a.grossSales);

    const ledgerTotals = ledger.reduce(
      (acc, r) => ({
        grossSales: acc.grossSales + r.grossSales,
        commission: acc.commission + r.commission,
        netPayout: acc.netPayout + r.netPayout
      }),
      { grossSales: 0, commission: 0, netPayout: 0 }
    );

    const money = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    container.innerHTML = `
      <div class="page-head">
        <div>
          <h1 class="page-title"><i class="fas fa-chart-line" aria-hidden="true"></i> Financial Reports &amp; Platform Earnings</h1>
          <p class="page-subtitle">Platform commission earnings shown separately from individual pharmacy revenues.</p>
        </div>
        <button class="btn btn-outline-primary" onclick="window.print()">
          <i class="fas fa-print" aria-hidden="true"></i> Print Financial Statement
        </button>
      </div>

      <!-- COMMISSION BASIS NOTE -->
      <div class="info-note">
        <i class="fas fa-circle-info" aria-hidden="true"></i>
        <div>
          Commission is charged on <strong>net product value</strong> (subtotal less discounts) across
          ${fin.orderCount.toLocaleString('en-IN')} billable orders. GST collected (${money(fin.gstCollected)})
          is remitted to the tax authority and delivery fees (${money(fin.deliveryCollected)}) are passed to
          logistics — neither is commissionable platform revenue.
        </div>
      </div>

      <!-- SEPARATED FINANCIAL METRICS CARDS -->
      <div class="dashboard-grid">
        <div class="stat-card stat-card-primary">
          <div>
            <div class="stat-value text-primary">${money(fin.platformCommission)}</div>
            <div class="stat-title">Platform Net Earnings (${commRate}% Commission)</div>
          </div>
          <div class="logo-badge bg-primary"><i class="fas fa-percentage" aria-hidden="true"></i></div>
        </div>

        <div class="stat-card stat-card-secondary">
          <div>
            <div class="stat-value">${money(fin.netProductValue)}</div>
            <div class="stat-title">Net Merchandise Value (commissionable)</div>
          </div>
          <div class="logo-badge bg-secondary"><i class="fas fa-wallet" aria-hidden="true"></i></div>
        </div>

        <div class="stat-card stat-card-success">
          <div>
            <div class="stat-value text-success">${money(fin.dealerPayout)}</div>
            <div class="stat-title">Total Net Payout to Pharmacies</div>
          </div>
          <div class="logo-badge bg-success"><i class="fas fa-hand-holding-dollar" aria-hidden="true"></i></div>
        </div>

        <div class="stat-card stat-card-info">
          <div>
            <div class="stat-value">${money(fin.grossCollected)}</div>
            <div class="stat-title">Gross Collected (incl. GST &amp; delivery)</div>
          </div>
          <div class="logo-badge bg-info"><i class="fas fa-receipt" aria-hidden="true"></i></div>
        </div>
      </div>

      <!-- ANALYTICS CHARTS -->
      <div class="reports-chart-grid">
        <div class="card">
          <h3 class="card-heading"><i class="fas fa-chart-area" aria-hidden="true"></i> Monthly Platform Commission</h3>
          <div class="chart-holder"><canvas id="revenueChart"></canvas></div>
        </div>

        <div class="card">
          <h3 class="card-heading"><i class="fas fa-chart-pie" aria-hidden="true"></i> Category Revenue Breakdown</h3>
          <div class="chart-holder"><canvas id="categoryChart"></canvas></div>
        </div>
      </div>

      <!-- INDIVIDUAL DEALER REVENUE LEDGER TABLE -->
      <div class="card">
        <h3 class="card-heading">
          <i class="fas fa-table-list" aria-hidden="true"></i>
          Pharmacy Revenue &amp; Commission Breakdown
          <span class="card-heading-note">${ledger.length} pharmacies with billable orders</span>
        </h3>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Pharmacy Business</th>
                <th scope="col">Owner / Pharmacist</th>
                <th scope="col">Drug License (20B/21B)</th>
                <th scope="col" class="text-right">Orders</th>
                <th scope="col" class="text-right">Net Sales</th>
                <th scope="col" class="text-right">Platform Comm (${commRate}%)</th>
                <th scope="col" class="text-right">Net Payout</th>
                <th scope="col">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              ${ledger.length === 0 ? `
                <tr><td colspan="8" class="table-empty">No billable orders recorded yet.</td></tr>
              ` : ledger.map(r => `
                  <tr>
                    <td><strong>${this.esc(r.businessName)}</strong></td>
                    <td>${this.esc(r.name)}</td>
                    <td><code>${this.esc(r.drugLicense)}</code></td>
                    <td class="text-right">${r.orderCount}</td>
                    <td class="text-right"><strong>${money(r.grossSales)}</strong></td>
                    <td class="text-right"><strong class="text-success">${money(r.commission)}</strong></td>
                    <td class="text-right"><strong class="text-primary">${money(r.netPayout)}</strong></td>
                    <td><span class="badge ${r.payoutStatus === 'Settled' ? 'badge-success' : 'badge-warning'}">${this.esc(r.payoutStatus)}</span></td>
                  </tr>
                `).join('')}
            </tbody>
            ${ledger.length === 0 ? '' : `
              <tfoot>
                <tr class="table-total-row">
                  <td colspan="4"><strong>Total across all pharmacies</strong></td>
                  <td class="text-right"><strong>${money(ledgerTotals.grossSales)}</strong></td>
                  <td class="text-right"><strong>${money(ledgerTotals.commission)}</strong></td>
                  <td class="text-right"><strong>${money(ledgerTotals.netPayout)}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            `}
          </table>
        </div>
      </div>
    `;

    this.initCharts(orders, commRate);
  }

  /* Charts are computed from real order data rather than hardcoded arrays. */
  initCharts(orders, commRate) {
    if (typeof Chart === 'undefined') {
      document.querySelectorAll('.chart-holder').forEach(el => {
        el.innerHTML = '<div class="chart-unavailable"><i class="fas fa-chart-simple" aria-hidden="true"></i> Charts unavailable — the charting library could not be loaded.</div>';
      });
      return;
    }

    const data = window.MediKartData;
    const billable = orders.filter(o => {
      const s = (o.status || '').toLowerCase();
      return s !== 'cancelled' && s !== 'refunded';
    });

    // ---- Monthly commission, derived from order dates ----
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyNet = new Array(12).fill(0);

    billable.forEach(o => {
      const parts = String(o.orderDate || '').split('-');
      const monthIdx = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : -1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlyNet[monthIdx] += data.getCommissionableValue(o);
      }
    });

    const activeMonths = monthlyNet.reduce((last, v, i) => (v > 0 ? i : last), -1);
    const sliceEnd = activeMonths >= 0 ? activeMonths + 1 : 12;
    const monthlyCommission = monthlyNet.slice(0, sliceEnd).map(v => Number((v * (commRate / 100)).toFixed(2)));

    const ctx1 = document.getElementById('revenueChart');
    if (ctx1) {
      this.chartInstances.revenue = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: monthLabels.slice(0, sliceEnd),
          datasets: [{
            label: `Platform Commission at ${commRate}% (₹)`,
            data: monthlyCommission,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.15)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // ---- Category split, derived from the medicines actually ordered ----
    const medicines = data.getMedicines();
    const medById = {};
    medicines.forEach(m => { medById[m.id] = m; });

    const byCategory = {};
    billable.forEach(o => {
      (o.items || []).forEach(item => {
        const med = medById[item.medicineId];
        const cat = (med && med.therapeuticCategory) || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + (Number(item.subtotal) || 0);
      });
    });

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const ctx2 = document.getElementById('categoryChart');
    if (ctx2 && topCategories.length > 0) {
      this.chartInstances.category = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: topCategories.map(([cat]) => cat),
          datasets: [{
            data: topCategories.map(([, value]) => Number(value.toFixed(2))),
            backgroundColor: ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#10b981', '#ec4899']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}

window.MediKartReports = new ReportsModule();
