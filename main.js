let products = [];
let orders = [];

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const orderForm = document.getElementById('order-form');
const orderList = document.getElementById('order-list');
const productSelect = document.getElementById('order-product');
const orderQuantityInput = document.getElementById('order-quantity');

loadProducts();
loadOrders();
renderProducts();
renderProductSelect();
renderOrders();

productSelect.dispatchEvent(new Event('change'));

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products = JSON.parse(storedProducts);
  }
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrders() {
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) {
    orders = JSON.parse(storedOrders);
  }
}

function renderProductSelect() {
  const select = document.getElementById('order-product');
  select.innerHTML = '';

  const availableProducts = products.filter((p) => p.quantity > 0);

  if (availableProducts.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'No products available';
    option.disabled = true;
    option.selected = true;
    select.appendChild(option);
    return;
  }

  availableProducts.forEach((product) => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} (Stock: ${product.quantity})`;
    select.appendChild(option);
  });
}

function renderOrders() {
  orderList.innerHTML = '';

  if (orders.length === 0) {
    orderList.innerHTML = '<li>No orders yet</li>';
    return;
  }

  orders.forEach((order) => {
    const li = document.createElement('li');
    if (!order.productName) {
      li.textContent = 'Unknown product';
    }
    li.textContent = `${order.productName} x ${order.quantity} - $${order.total}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      orders = orders.filter((o) => o.id !== order.id);
      saveOrders();
      renderOrders();
    });
    li.appendChild(deleteBtn);
    orderList.appendChild(li);
  });
}

function renderProducts() {
  productList.innerHTML = '';

  if (products.length === 0) {
    productList.innerHTML = '<li>No products available</li>';
    return;
  }

  products.forEach((product) => {
    const li = document.createElement('li');

    li.textContent = `${product.name} - $${product.price} (${product.category}) stock: ${product.quantity}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      deleteProduct(product.id);
    });

    li.appendChild(deleteBtn);
    productList.appendChild(li);
  });
}

function deleteProduct(id) {
  products = products.filter((product) => product.id !== id);
  saveProducts();
  renderProducts();
  renderProductSelect();
}

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const price = Number(document.getElementById('price').value);
  const category = document.getElementById('category').value.trim();
  const quantity = Number(document.getElementById('quantity').value);

  //Temporary validation
  if (!name || price < 0 || !category || quantity <= 0) {
    alert('Please fill all fields correctly');
    return;
  }

  const product = {
    id: Date.now(),
    name,
    price,
    category,
    quantity,
  };

  products.push(product);
  saveProducts();
  renderProducts();
  renderProductSelect();
  form.reset();
});

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const productId = Number(document.getElementById('order-product').value);
  const orderQuantity = Number(document.getElementById('order-quantity').value);

  const orderProduct = products.find((p) => p.id === Number(productId));

  if (!orderProduct) {
    alert('Product not found');
    return;
  }

  if (orderQuantity <= 0 || orderQuantity > orderProduct.quantity) {
    alert('Invalid quantity');
    return;
  }

  const order = {
    id: Date.now(),
    productId,
    productName: orderProduct.name,
    quantity: orderQuantity,
    total: orderProduct.price * orderQuantity,
  };

  orders.push(order);

  orderProduct.quantity -= orderQuantity;
  saveProducts();
  saveOrders();
  renderProducts();
  renderOrders();
  renderProductSelect();
  orderForm.reset();
});

productSelect.addEventListener('change', () => {
  const selectedId = Number(productSelect.value);
  const selectedProduct = products.find((p) => p.id === selectedId);
  if (selectedProduct) {
    orderQuantityInput.max = selectedProduct.quantity;
    orderQuantityInput.value = 1;
  }
});
