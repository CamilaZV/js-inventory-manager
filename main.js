let products = [];
let orders = [];

const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const orderForm = document.getElementById('order-form');
const orderList = document.getElementById('order-list');

loadProducts();
loadOrders();
renderProducts();
renderOrders();
renderProductSelect();

//Products
form.addEventListener('submit', (e) => {
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

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products = JSON.parse(storedProducts);
  }
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

//***Orders***
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const productId = Number(document.getElementById('order-product').value);

  const orderQuantity = Number(document.getElementById('order-quantity').value);

  const product = products.find((p) => p.id === Number(productId));
  if (!product) {
    alert('Product not found');
    return;
  }

  if (orderQuantity <= 0 || orderQuantity > product.quantity) {
    alert('Invalid quantity');
    return;
  }

  const order = {
    id: Date.now(),
    productId,
    productName: product.name,
    quantity: orderQuantity,
    total: product.price * orderQuantity,
  };

  orders.push(order);

  product.quantity -= orderQuantity;
  saveProducts();
  saveOrders();
  renderProducts();
  renderOrders();
  renderProductSelect();
  orderForm.reset();
});

function renderProductSelect() {
  const select = document.getElementById('order-product');
  select.innerHTML = '';
  products.forEach((product) => {
    if (product.quantity > 0) {
      const option = document.createElement('option');
      option.textContent = `${product.name} (Stock: ${product.quantity})`;
      option.value = product.id;
      select.appendChild(option);
    }
  });
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

function renderOrders() {
  console.log('entra al render orders');
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

    orderList.appendChild(li);
  });
}
