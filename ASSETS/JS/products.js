import { generateProductID } from './utils.js';
import { saveData, renderAll, state } from './main.js';
import { exportTXT } from './data.js';
import { addToHistory } from './history.js';

export function initFormProduct() {
  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const msgConfirm = document.getElementById('product-confirm');

    const product = {
      id: generateProductID(),
      name: document.getElementById('product-name').value.trim(),
      category: document.getElementById('product-category').value,
      price: Number(document.getElementById('product-price').value),
      quantity: Number(document.getElementById('product-quantity').value),
      description: document.getElementById('product-description').value.trim(),
      createdAt: new Date().toISOString(),
    };

    state.products.push(product);
    addToHistory('add', product.name, `${product.quantity} units added`);
    saveData();

    msgConfirm.textContent = 'Product successfully added.';

    setTimeout(function () {
      msgConfirm.textContent = '';
    }, 2000);

    e.target.reset();
    renderAll();
  });
}

export function renderProductsTable() {
  const filtered = getFilteredProducts();
  const tbody = document.getElementById('products-table-body');

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-table">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>
        <strong>${p.name}</strong>
        ${
          p.description
            ? `<br><small style="color: #6c757d;">${p.description}</small>`
            : ''
        }
      </td>
      <td>${p.category}</td>
      <td>$ ${p.price.toFixed(2)}</td>
      <td>${p.quantity}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-warning btn-small" title="Edit product" onclick="editProduct('${
            p.id
          }')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-small" title="Delete product" onclick="deleteProduct('${
            p.id
          }')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join('');
}

export function initProductEvents() {
  document
    .getElementById('search-products')
    .addEventListener('input', renderProductsTable);
  document
    .getElementById('filter-category')
    .addEventListener('change', renderProductsTable);

  document.getElementById('export-products').addEventListener('click', () => {
    const filtered = getFilteredProducts();
    if (filtered.length > 0) {
      exportTXT(filtered, 'products');
    } else {
      alert('No products found to export.');
      return;
    }
  });

  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('edit-id').value;
      const product = state.products.find((p) => p.id.toString() === id);
      const order = state.orders.find((o) => o.productId === id);

      const msgConfirm = document.getElementById('edit-confirm');

      if (product) {
        const oldQuantity = product.quantity;
        product.name = document.getElementById('edit-name').value.trim();
        product.category = document.getElementById('edit-category').value;
        product.price = Number(document.getElementById('edit-price').value);
        product.quantity = Number(
          document.getElementById('edit-quantity').value,
        );
        product.description = document
          .getElementById('edit-description')
          .value.trim();

        const quantityDiff = product.quantity - oldQuantity;
        let details = 'Modified product';

        if (quantityDiff !== 0) {
          details += `(${quantityDiff > 0 ? '+' : ''}${quantityDiff} units)`;
          if (order?.status === 'pending')
            alert('Attention!, please check pending orders for this product.');
        }

        if (order) {
          if (order.productName !== product.name) {
            order.productName = product.name;
          }
        }

        addToHistory('edit', product.name, details);

        msgConfirm.textContent = 'Product successfully updated.';

        setTimeout(function () {
          msgConfirm.textContent = '';
          closeEditModal();
        }, 1000);

        saveData();
        renderAll();
      }
    });
  }
}

export function updateCategoryFilter() {
  const categories = [...new Set(state.products.map((p) => p.category))].sort();
  const select = document.getElementById('filter-category');
  const currentValue = select.value;

  const options = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join('');

  select.innerHTML = '<option value="">All categories</option>' + options;
  select.value = currentValue;
}

function getFilteredProducts() {
  const searchTerm = document
    .getElementById('search-products')
    .value.trim()
    .toLowerCase();

  const categoryFilter = document.getElementById('filter-category').value;

  return state.products.filter((p) => {
    const productName = (p.name || '').toLowerCase();
    const productId = (p.id || '').toString().toLowerCase();

    const matchesSearch =
      productName.includes(searchTerm) || productId.includes(searchTerm);

    const matchesCategory = !categoryFilter || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });
}

window.editProduct = function (id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return;

  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-category').value = product.category;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-quantity').value = product.quantity;
  document.getElementById('edit-description').value = product.description;

  document.getElementById('edit-modal').classList.add('active');
};

window.closeEditModal = function () {
  document.getElementById('edit-modal').classList.remove('active');
};

window.deleteProduct = function (id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return;

  if (
    !confirm(
      `¿Are you sure you want to delete this product: ${product.name}? \n\nThis action cannot be undone.`,
    )
  ) {
    return;
  }

  state.products = state.products.filter((p) => p.id !== id);
  addToHistory('delete', product.name, 'Deleted product');
  saveData();
  renderAll();

  alert('Product successfully deleted.');
};
