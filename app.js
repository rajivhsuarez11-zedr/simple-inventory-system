const STORAGE_KEY = 'inventory-manager-demo';

const demoInventory = [
  { id: crypto.randomUUID(), name: 'Laptop', sku: 'LAP-1001', category: 'Electronics', quantity: 12, price: 899.99 },
  { id: crypto.randomUUID(), name: 'Office Chair', sku: 'OFF-2004', category: 'Furniture', quantity: 5, price: 149.5 },
  { id: crypto.randomUUID(), name: 'Notebook', sku: 'STN-3007', category: 'Stationery', quantity: 2, price: 4.25 },
  { id: crypto.randomUUID(), name: 'Printer Ink', sku: 'INK-4001', category: 'Supplies', quantity: 1, price: 24.99 }
];

const inventoryForm = document.getElementById('inventoryForm');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const totalItemsEl = document.getElementById('totalItems');
const totalUnitsEl = document.getElementById('totalUnits');
const lowStockCountEl = document.getElementById('lowStockCount');
const inventoryValueEl = document.getElementById('inventoryValue');
const resetDataBtn = document.getElementById('resetDataBtn');

let inventory = loadInventory();

function loadInventory() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoInventory));
    return [...demoInventory];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...demoInventory];
  } catch (error) {
    return [...demoInventory];
  }
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getFilteredInventory() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    return inventory;
  }

  return inventory.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.sku.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  });
}

function updateStats() {
  const totalItems = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + Number(item.quantity), 0);
  const lowStockItems = inventory.filter((item) => item.quantity <= 3).length;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);

  totalItemsEl.textContent = totalItems;
  totalUnitsEl.textContent = totalUnits;
  lowStockCountEl.textContent = lowStockItems;
  inventoryValueEl.textContent = formatCurrency(inventoryValue);
}

function renderInventory() {
  const filtered = getFilteredInventory();

  inventoryTableBody.innerHTML = '';

  if (!filtered.length) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">No products found.</td>
      </tr>
    `;
    return;
  }

  const template = document.getElementById('inventoryRowTemplate');

  filtered.forEach((item) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const nameCell = row.querySelector('.product-name');
    const skuCell = row.querySelector('.sku-cell');
    const categoryCell = row.querySelector('.category-cell');
    const qtyCell = row.querySelector('.qty-cell');
    const priceCell = row.querySelector('.price-cell');
    const valueCell = row.querySelector('.value-cell');
    const decreaseBtn = row.querySelector('.decrease-btn');
    const increaseBtn = row.querySelector('.increase-btn');
    const deleteBtn = row.querySelector('.delete-btn');

    nameCell.textContent = item.name;
    skuCell.textContent = item.sku;
    categoryCell.textContent = item.category;
    qtyCell.textContent = item.quantity;
    priceCell.textContent = formatCurrency(item.price);
    valueCell.textContent = formatCurrency(item.quantity * item.price);

    if (item.quantity <= 3) {
      qtyCell.classList.add('qty-low');
    }

    decreaseBtn.addEventListener('click', () => adjustQuantity(item.id, -1));
    increaseBtn.addEventListener('click', () => adjustQuantity(item.id, 1));
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    inventoryTableBody.appendChild(row);
  });
}

function adjustQuantity(id, delta) {
  inventory = inventory.map((item) => {
    if (item.id !== id) return item;

    const updatedQty = Math.max(0, Number(item.quantity) + delta);
    return { ...item, quantity: updatedQty };
  });

  saveInventory();
  updateStats();
  renderInventory();
}

function deleteItem(id) {
  inventory = inventory.filter((item) => item.id !== id);
  saveInventory();
  updateStats();
  renderInventory();
}

inventoryForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(inventoryForm);
  const name = (formData.get('name') || document.getElementById('name').value).trim();
  const sku = (formData.get('sku') || document.getElementById('sku').value).trim();
  const category = (formData.get('category') || document.getElementById('category').value).trim();
  const quantity = Number(document.getElementById('quantity').value || 0);
  const price = Number(document.getElementById('price').value || 0);

  if (!name || !sku || !category) {
    return;
  }

  const duplicate = inventory.some((item) => item.sku.toLowerCase() === sku.toLowerCase());
  if (duplicate) {
    alert('A product with this SKU already exists.');
    return;
  }

  inventory.unshift({
    id: crypto.randomUUID(),
    name,
    sku,
    category,
    quantity,
    price
  });

  saveInventory();
  inventoryForm.reset();
  document.getElementById('quantity').value = 0;
  document.getElementById('price').value = 0;
  updateStats();
  renderInventory();
});

searchInput.addEventListener('input', renderInventory);

resetDataBtn.addEventListener('click', () => {
  inventory = [...demoInventory];
  saveInventory();
  updateStats();
  renderInventory();
});

updateStats();
renderInventory();

inventoryForm.elements.name.setAttribute('name', 'name');
inventoryForm.elements.sku.setAttribute('name', 'sku');
inventoryForm.elements.category.setAttribute('name', 'category');
