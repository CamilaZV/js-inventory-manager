import { generateProductID, formatDate } from './utils.js';
import { state, saveData, renderAll } from './main.js';
import { exportTXT } from './data.js';

export function initFormOrder() {
  const orderQuantityInput = document.getElementById('order-quantity');

  orderQuantityInput.addEventListener('input', updateOrderSummary);

  document.getElementById('order-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const quantity = Number(orderQuantityInput.value);
    const productId = document.getElementById('order-product').value;
    const customer = document.getElementById('order-customer').value.trim();

    const product = state.products.find((p) => p.id === productId);

    if (!product) {
      alert('Product not found!');
      return;
    }

    if (quantity > product.quantity) {
      alert(`Insufficient stock! Only ${product.quantity} units available.`);
      return;
    }

    const order = {
      id: generateProductID(),
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      total: product.price * quantity,
      customer: customer || 'General Customer',
      date: new Date().toISOString(),
      status: 'pending',
    };

    product.quantity -= quantity;
    state.orders.unshift(order);

    saveData();

    e.target.reset();
    document.getElementById('order-summary').style.display = 'none';
    renderAll();

    alert(`Order processed successfully\nTotal: ${order.total}`);
  });
}

export function updateOrderSummary() {
  const productId = document.getElementById('order-product').value;
  const quantity = Number(document.getElementById('order-quantity').value) || 0;
  const summaryDiv = document.getElementById('order-summary');
  const detailsDiv = document.getElementById('order-details');

  if (!productId || quantity <= 0) {
    summaryDiv.style.display = 'none';
    return;
  }

  const product = state.products.find((p) => p.id === productId);
  if (!product) return;

  const total = product.price * quantity;

  detailsDiv.innerHTML = `
        <h4>SUMMARY:</h4>
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>Unit price:</strong> $${product.price}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Total:</strong> $${total}</p>
        ${
          quantity > product.quantity
            ? '<p style="color: #dc3545;"><strong>Insufficient stock!</strong></p>'
            : ''
        }
      `;

  summaryDiv.style.display = 'block';
}

export function getFilteredOrders() {
  const searchTerm = document
    .getElementById('search-orders')
    .value.trim()
    .toLowerCase();
  const dateFilter = document.getElementById('filter-date').value;
  const statusFilter = document.getElementById('filter-status').value;

  return state.orders.filter((o) => {
    const matchesSearch =
      o.productName.toLowerCase().includes(searchTerm) ||
      o.customer.toLowerCase().includes(searchTerm) ||
      o.id.toLowerCase().includes(searchTerm);

    if (!matchesSearch) return false;

    const orderStatus = o.status || 'pending';
    const matchesStatus = !statusFilter || orderStatus === statusFilter;

    if (!matchesStatus) return false;

    const orderDate = new Date(o.date);
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return orderDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      case 'month':
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });
}

export function renderOrdersTable() {
  const filtered = getFilteredOrders();
  const tbody = document.getElementById('orders-table-body');

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 40px;">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (o) => `
    <tr>
      <td><small>${o.id}</small></td>
      <td>${formatDate(o.date)}</td>
      <td>${o.productName}</td>
      <td>${o.customer}</td>
      <td>${o.quantity}</td>
      <td><strong>$ ${o.total}</strong></td>
      <td>
    <div class="action-buttons">
      ${
        o.status === 'completed'
          ? '<span class="badge badge-success">✓ Completed</span>'
          : `
          <button class="btn btn-success btn-small" onclick="completeOrder('${o.id}')" title="Complete Order">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="btn btn-danger btn-small" onclick="deleteOrder('${o.id}')" title="Cancel & Return Stock">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `
      }
    </div>
  </td>
    </tr>
  `
    )
    .join('');
}

export function renderProductSelect() {
  const select = document.getElementById('order-product');
  const availableProducts = state.products.filter((p) => p.quantity > 0);

  select.innerHTML = '<option value="">Select product...</option>';

  if (availableProducts.length === 0) {
    select.innerHTML += '<option disabled>No products available</option>';
    return;
  }

  availableProducts.forEach((p) => {
    select.innerHTML += `<option value="${p.id}">${p.name} (Stock: ${p.quantity})</option>`;
  });
}

export function initOrderEvents() {
  document
    .getElementById('search-orders')
    .addEventListener('input', renderOrdersTable);

  document
    .getElementById('filter-date')
    .addEventListener('change', renderOrdersTable);

  document
    .getElementById('filter-status')
    .addEventListener('change', renderOrdersTable);

  document.getElementById('export-orders').addEventListener('click', () => {
    const filtered = getFilteredOrders();
    if (filtered.length > 0) {
      exportTXT(filtered, 'orders');
    } else {
      alert('No orders found to export.');
      return;
    }
  });
}

window.deleteOrder = function (id) {
  const orderIndex = state.orders.findIndex((o) => o.id === id);
  const order = state.orders[orderIndex];
  if (orderIndex !== -1) {
    if (
      confirm(
        `¿Are you sure you want to cancel this order? - ${order.quantity} units will be returned to stock.`
      )
    ) {
      const product = state.products.find((p) => p.id === order.productId);
      if (product) {
        product.quantity += order.quantity;
      }

      state.orders.splice(orderIndex, 1);

      saveData();
      renderAll();
    }
  }
  alert('Order cancelled and stock restored.');
};

window.completeOrder = function (id) {
  const order = state.orders.find((o) => o.id === id);

  if (order) {
    if (confirm('Are you sure you want to mark this order as completed?')) {
      order.status = 'completed';
      saveData();
      renderAll();
    }
  }
};
