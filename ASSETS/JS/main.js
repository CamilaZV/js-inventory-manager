import {
  initFormProduct,
  renderProductsTable,
  updateCategoryFilter,
  initProductEvents,
} from './products.js';

import {
  initFormOrder,
  renderOrdersTable,
  renderProductSelect,
  initOrderEvents,
} from './orders.js';

export const state = {
  products: [],
  orders: [],
};

loadData();
initTabs();
initFormProduct();
initProductEvents();
initFormOrder();
initOrderEvents();

renderAll();

function loadData() {
  state.products = JSON.parse(localStorage.getItem('products') || '[]');
  state.orders = JSON.parse(localStorage.getItem('orders') || '[]');
}

export function saveData() {
  localStorage.setItem('products', JSON.stringify(state.products));
  localStorage.setItem('orders', JSON.stringify(state.orders));
}

function initTabs() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const navItemName = item.dataset.navItem;

      document
        .querySelectorAll('.nav-item')
        .forEach((n) => n.classList.remove('active'));
      document
        .querySelectorAll('.nav-item-content')
        .forEach((c) => c.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(navItemName).classList.add('active');

      if (navItemName === 'dashboard') renderDashboard();
    });
  });
}

export function renderAll() {
  updateCategoryFilter();
  renderProductsTable();
  renderOrdersTable();
  renderProductSelect();
  renderDashboard();
}

function renderDashboard() {
  const totalProducts = state.products.length;
  const inventoryValue = state.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const today = new Date().setHours(0, 0, 0, 0);
  const ordersToday = state.orders.filter(
    (o) => new Date(o.date).setHours(0, 0, 0, 0) === today
  ).length;

  document.getElementById('stat-total-products').textContent = totalProducts;
  document.getElementById(
    'stat-inventory-value'
  ).textContent = `$ ${inventoryValue}`;
  document.getElementById('stat-orders-today').textContent = ordersToday;

  const productSales = {};
  state.orders.forEach((order) => {
    if (!productSales[order.productId]) {
      productSales[order.productId] = {
        name: order.productName,
        category:
          state.products.find((p) => p.id === order.productId)?.category ||
          'N/A',
        units: 0,
        revenue: 0,
      };
    }
    productSales[order.productId].units += order.quantity;
    productSales[order.productId].revenue += order.total;
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductsBody = document.getElementById('top-products-body');

  if (topProducts.length === 0) {
    topProductsBody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 40px;">No sales recorded</td></tr>';
  } else {
    topProductsBody.innerHTML = topProducts
      .map(
        (p) => `<tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.units}</td>
            <td>$ ${p.revenue}</td>
          </tr>`
      )
      .join('');
  }
}
