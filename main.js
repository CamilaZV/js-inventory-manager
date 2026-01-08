let products = [];

const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');

loadProducts();
renderProducts();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const price = Number(document.getElementById('price').value);
  const category = document.getElementById('category').value.trim();

  //Temporary validation
  if (!name || price < 0 || !category) {
    alert('Please fill all fields correctly');
    return;
  }

  const product = {
    id: Date.now(),
    name,
    price,
    category,
  };

  products.push(product);
  saveProducts();
  renderProducts();
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
    console.log('entra al foreach');
    const li = document.createElement('li');

    li.textContent = `${product.name} - $${product.price} (${product.category})`;

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
}
