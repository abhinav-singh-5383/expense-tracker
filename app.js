// State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilter = 'all';

// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const listEl = document.getElementById('transaction-list');
const emptyStateEl = document.getElementById('empty-state');
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const filterType = document.getElementById('filter-type');

// Initialize
function init() {
  updateDOM();
  filterType.value = 'all';
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000).toString();
}

// Format money
// Format money using Indian numbering system and INR symbol
function formatMoney(amount) {
  // Using Intl.NumberFormat with 'en-IN' provides Indian grouping (e.g., 1,23,456.00)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(Math.abs(amount));
}

// Add or Update Transaction
function submitTransaction(e) {
  e.preventDefault();

  const desc = descInput.value.trim();
  const amount = +amountInput.value.trim();
  const editId = editIdInput.value;

  if (!desc || isNaN(amount)) {
    alert('Please provide valid description and amount');
    return;
  }

  if (editId) {
    // Update existing
    transactions = transactions.map(t => 
      t.id === editId ? { ...t, desc, amount } : t
    );
    resetForm();
  } else {
    // Create new
    const transaction = {
      id: generateID(),
      desc,
      amount,
      date: new Date().toLocaleDateString()
    };
    transactions.unshift(transaction); // Add to top
  }

  updateDOM();
}

// Edit Transaction
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  descInput.value = transaction.desc;
  amountInput.value = transaction.amount;
  editIdInput.value = transaction.id;

  formTitle.textContent = 'Edit Transaction';
  submitBtn.textContent = 'Save Changes';
  cancelBtn.style.display = 'block';
  
  descInput.focus();
}

// Delete Transaction
function deleteTransaction(id) {
  if(confirm('Are you sure you want to delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    updateDOM();
  }
}

// Reset Form
function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = 'Add Transaction';
  submitBtn.textContent = 'Add Transaction';
  cancelBtn.style.display = 'none';
}

// Filter Transactions
filterType.addEventListener('change', (e) => {
  currentFilter = e.target.value;
  renderList();
});

cancelBtn.addEventListener('click', resetForm);

// Update DOM (Cards and List)
function updateDOM() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateValues();
  renderList();
}

// Render List based on filter
function renderList() {
  listEl.innerHTML = '';
  
  const filtered = transactions.filter(t => {
    if (currentFilter === 'income') return t.amount > 0;
    if (currentFilter === 'expense') return t.amount < 0;
    return true; // 'all'
  });

  if (filtered.length === 0) {
    listEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
  } else {
    listEl.style.display = 'flex';
    emptyStateEl.style.display = 'none';
    
    filtered.forEach(addTransactionDOM);
  }
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  const type = transaction.amount > 0 ? 'income' : 'expense';
  const sign = transaction.amount > 0 ? '+' : '-';
  const li = document.createElement('li');
  
  li.className = `transaction-item ${type}`;
  li.innerHTML = `
    <div class="item-info">
      <span class="item-desc">${transaction.desc}</span>
      <span class="item-date">${transaction.date}</span>
    </div>
    <div class="item-actions">
      <div class="action-btns">
        <button class="icon-btn edit-btn" onclick="editTransaction('${transaction.id}')">✏️</button>
        <button class="icon-btn delete-btn" onclick="deleteTransaction('${transaction.id}')">🗑️</button>
      </div>
      <span class="item-amount ${type === 'income' ? 'text-success' : 'text-danger'}">
        ${sign}${formatMoney(transaction.amount)}
      </span>
    </div>
  `;
  
  listEl.appendChild(li);
}

// Update balance, income, expense totals
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  
  const total = amounts.reduce((acc, item) => (acc += item), 0);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
  const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0);
  
  balanceEl.textContent = formatMoney(total);
  incomeEl.textContent = `+${formatMoney(income)}`;
  expenseEl.textContent = `-${formatMoney(expense)}`;
  
  // Set total color
  if (total < 0) {
    balanceEl.classList.add('text-danger');
    balanceEl.classList.remove('text-success');
  } else if (total > 0) {
    balanceEl.classList.add('text-success');
    balanceEl.classList.remove('text-danger');
  } else {
    balanceEl.classList.remove('text-danger', 'text-success');
  }
}

// Events
form.addEventListener('submit', submitTransaction);

init();
