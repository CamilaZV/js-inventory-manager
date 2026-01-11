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

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) products = JSON.parse(storedProducts);
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrders() {
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) orders = JSON.parse(storedOrders);
}

function renderProductSelect() {
  const select = document.getElementById('order-product');
  select.innerHTML = '';

  const optionDefault = document.createElement('option');
  optionDefault.textContent = 'Product';
  select.appendChild(optionDefault);

  const availableProducts = products.filter((p) => p.quantity > 0);

  if (availableProducts.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'No products available';
    optionDefault.hidden = true;
    option.disabled = true;
    option.selected = true;
    orderQuantityInput.disabled = true;
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
    deleteBtn.classList.add('btn-delete');
    li.appendChild(deleteBtn);
    orderList.appendChild(li);

    deleteBtn.addEventListener('click', () => {
      orders = orders.filter((o) => o.id !== order.id);
      saveOrders();
      renderOrders();
      productForm.reset();
    });
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

    li.textContent = `${product.name} (${product.category}) - $${product.price} - Stock: ${product.quantity}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn-delete');
    li.appendChild(deleteBtn);
    productList.appendChild(li);

    deleteBtn.addEventListener('click', () => {
      deleteProduct(product.id);
    });
  });
}

function deleteProduct(id) {
  products = products.filter((product) => product.id !== id);
  saveProducts();
  renderProducts();
  renderProductSelect();
  productForm.name.focus();
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

  if (orderQuantityInput.disabled == true) orderQuantityInput.disabled = false;

  products.push(product);
  productForm.reset();
  productForm.name.focus();
  saveProducts();
  renderProducts();
  renderProductSelect();
});

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const productId = Number(productSelect.value);
  const orderQuantity = Number(orderQuantityInput.value);

  const orderProduct = products.find((p) => p.id === Number(productId));

  if (orderProduct) {
    orderQuantity.max = orderProduct.quantity;
  } else {
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
  orderForm.reset();
  saveProducts();
  saveOrders();
  renderProducts();
  renderOrders();
  renderProductSelect();
  productForm.name.focus();
});
