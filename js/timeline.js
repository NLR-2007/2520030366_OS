/* ==========================================================================
   MEDIKART 2.0 - SHARED STANDARDIZED ORDER TIMELINE COMPONENT
   Unified workflow component used by Buyer, Dealer, and Admin dashboards
   ========================================================================== */

/* Stage keys MUST match MediKartData.getOrderStages(). They previously did not
   ('Confirmed' here vs 'Accepted' in the data layer), which made every accepted
   order render as if it were still at stage 0. */
const ORDER_TIMELINE_STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: 'fa-file-invoice' },
  { key: 'Accepted', label: 'Accepted', icon: 'fa-check-circle' },
  { key: 'Packed', label: 'Packed', icon: 'fa-box-open' },
  { key: 'Shipped', label: 'Shipped', icon: 'fa-shipping-fast' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: 'fa-truck-pickup' },
  { key: 'Delivered', label: 'Delivered', icon: 'fa-home' }
];

class OrderTimelineEngine {
  /* Returns -1 for statuses outside the fulfilment pipeline (Cancelled,
     Refunded) so callers can render them distinctly instead of silently
     showing "Order Placed". */
  getStepIndex(status) {
    return ORDER_TIMELINE_STEPS.findIndex(s => s.key.toLowerCase() === (status || '').toLowerCase());
  }

  isTerminalNonPipeline(status) {
    const s = (status || '').toLowerCase();
    return s === 'cancelled' || s === 'refunded';
  }

  esc(value) {
    return window.MediKartApp ? window.MediKartApp.escapeHtml(value) : String(value == null ? '' : value);
  }

  renderTimelineHTML(order, userRole = 'buyer') {
    const currentIdx = this.getStepIndex(order.status);
    const isCancelled = this.isTerminalNonPipeline(order.status);
    const esc = v => this.esc(v);

    const statusBadgeClass = isCancelled ? 'badge-danger' : currentIdx === ORDER_TIMELINE_STEPS.length - 1 ? 'badge-success' : 'badge-info';

    return `
      <div class="order-timeline-wrapper">
        <div class="timeline-head">
          <div>
            <span class="timeline-head-label">ORDER IDENTIFIER</span>
            <h3 class="timeline-head-id">${esc(order.id)}</h3>
          </div>
          <div class="timeline-head-status">
            <span class="badge ${statusBadgeClass}">
              <i class="fas fa-info-circle" aria-hidden="true"></i> Current Status: ${esc(order.status)}
            </span>
            <div class="timeline-head-eta">
              ${isCancelled ? 'This order is no longer in fulfilment.' : `Expected Delivery: ${esc(order.expectedDelivery || 'To be confirmed')}`}
            </div>
          </div>
        </div>

        ${isCancelled ? `
          <div class="timeline-cancelled-note">
            <i class="fas fa-circle-xmark" aria-hidden="true"></i>
            <div>
              <strong>Order ${esc(order.status)}</strong>
              ${order.cancellationReason ? `<div>${esc(order.cancellationReason)}</div>` : ''}
            </div>
          </div>
        ` : `
        <!-- 6-STEP CONNECTED PIPELINE STEPPER -->
        <div class="connected-timeline-stepper">
          ${ORDER_TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
            const stamp = order.timestamps ? order.timestamps[step.key] : null;

            return `
              <div class="stepper-node ${statusClass}">
                <div class="node-circle">
                  <i class="fas ${isCompleted ? 'fa-check' : step.icon}" aria-hidden="true"></i>
                </div>
                <div class="node-content">
                  <div class="node-label">${step.label}</div>
                  <div class="node-status">
                    ${isCompleted ? '✓ Completed' : isCurrent ? '● In Progress' : 'Pending'}
                  </div>
                  ${(isCompleted || isCurrent) && stamp ? `<div class="node-time">${esc(stamp)}</div>` : ''}
                </div>
                ${idx < ORDER_TIMELINE_STEPS.length - 1 ? `
                  <div class="node-line ${isCompleted ? 'completed-line' : isCurrent ? 'active-line' : ''}"></div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        `}

        <!-- ROLE SPECIFIC ACTION BAR -->
        <div class="timeline-action-bar">
          <div class="timeline-seller-info">
            ${(() => {
              const items = order.items || [];
              const uniqueDealers = [...new Set(items.map(i => i.dealerName).filter(Boolean))];
              if (uniqueDealers.length > 1) {
                return `<i class="fas fa-store" aria-hidden="true"></i> Seller Pharmacies (${uniqueDealers.length}): <strong>${esc(uniqueDealers.join(' • '))}</strong>`;
              } else if (uniqueDealers.length === 1) {
                return `<i class="fas fa-store" aria-hidden="true"></i> Seller Pharmacy: <strong>${esc(uniqueDealers[0])}</strong>`;
              }
              return `<i class="fas fa-store" aria-hidden="true"></i> Seller Pharmacy: <strong>${esc(order.dealerName || 'Partner Pharmacy')}</strong>`;
            })()}
          </div>

          <div>
            ${userRole === 'dealer' && !isCancelled ? `
              <div class="timeline-dealer-actions">
                ${currentIdx >= 0 && currentIdx < ORDER_TIMELINE_STEPS.length - 1 ? `
                  <button class="btn btn-primary btn-sm" onclick="window.MediKartTimeline.advanceOrderStatus('${esc(order.id)}')">
                    <i class="fas fa-arrow-right" aria-hidden="true"></i> Advance to ${ORDER_TIMELINE_STEPS[currentIdx + 1].label}
                  </button>
                ` : `
                  <span class="badge badge-success"><i class="fas fa-check-double" aria-hidden="true"></i> Fully Delivered &amp; Completed</span>
                `}
              </div>
            ` : userRole === 'buyer' ? `
              <button class="btn btn-outline-secondary btn-sm" onclick="window.MediKartBuyer.openInvoice('${esc(order.id)}')">
                <i class="fas fa-file-invoice" aria-hidden="true"></i> View Tax Invoice
              </button>
            ` : `
              <button class="btn btn-outline-primary btn-sm" onclick="window.MediKartTimeline.inspectAdminOrder('${esc(order.id)}')">
                <i class="fas fa-sliders-h" aria-hidden="true"></i> Admin Oversight
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  inspectAdminOrder(orderId) {
    const orders = window.MediKartData.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) {
      window.MediKartApp.toast('Order not found.', 'error');
      return;
    }

    const esc = v => this.esc(v);
    const dealerName = ord.dealerName || (ord.items && ord.items[0] ? ord.items[0].dealerName : 'MediKart Pharmacy');

    window.MediKartApp.showModal({
      title: `Admin Logistics Oversight – Order ${ord.id}`,
      content: `
        <div class="modal-detail-list">
          <div><strong>Order ID:</strong> <code>${esc(ord.id)}</code></div>
          <div><strong>Current Fulfillment Status:</strong> <span class="badge badge-info">${esc(ord.status)}</span></div>
          <div><strong>Customer Name:</strong> ${esc(ord.buyerName || 'Verified Buyer')}</div>
          <div><strong>Seller Pharmacy:</strong> ${esc(dealerName)}</div>
          <div><strong>Grand Total:</strong> ₹${(Number(ord.grandTotal) || 0).toFixed(2)}</div>
          <div class="mt-10"><strong>Delivery Address:</strong> ${esc(ord.shippingAddress || ord.address || 'Standard Delivery Address')}</div>
        </div>
      `,
      footerButtons: `
        <button class="btn btn-outline-secondary" onclick="window.MediKartApp.closeModal()">Close</button>
      `
    });
  }

  advanceOrderStatus(orderId) {
    const orders = window.MediKartData.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) {
      window.MediKartApp.toast('Order not found.', 'error');
      return;
    }

    const nextStatus = window.MediKartData.getNextOrderStage(ord.status);
    if (!nextStatus) {
      window.MediKartApp.toast('This order has already reached its final stage.', 'info');
      return;
    }

    // Route through the data layer so prescription blocking and stage-transition
    // validation are enforced, instead of writing order.status directly.
    const res = window.MediKartData.updateOrderStage(orderId, nextStatus, ord.dealerId);
    if (!res.success) {
      window.MediKartApp.toast(res.error, 'error');
      return;
    }

    if (window.MediKartDealer) window.MediKartDealer.navigate('orders');
    window.MediKartApp.toast(`Order ${orderId} advanced to ${nextStatus}.`, 'success');
  }
}

window.MediKartTimeline = new OrderTimelineEngine();
