import { state, saveData } from './main.js';
import { generateProductID, formatDateTime } from './utils.js';
import { exportTXT } from './data.js';

export function addToHistory(type, productName, details, user = 'System') {
  state.history.unshift({
    id: generateProductID(),
    timestamp: new Date().toISOString(),
    type,
    productName,
    details,
    user,
  });
  saveData();
}

export function initHistoryEvents() {
  document
    .getElementById('search-history')
    .addEventListener('input', renderHistoryTable);
  document
    .getElementById('filter-movement-type')
    .addEventListener('change', renderHistoryTable);

  document.getElementById('export-history').addEventListener('click', () => {
    const filtered = getFilteredHistory();
    if (filtered.length > 0) {
      exportTXT(filtered, 'history');
    } else {
      alert('No history found to export.');
      return;
    }
  });
}

export function renderHistoryTable() {
  const filtered = getFilteredHistory();

  const tbody = document.getElementById('history-table-body');

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-table">No records found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .slice(0, 100)
    .map((h) => {
      let typeBadge;
      switch (h.type) {
        case 'sale':
          typeBadge = '<span class="badge badge-success">Sale</span>';
          break;
        case 'add':
          typeBadge = '<span class="badge badge-add">Add</span>';
          break;
        case 'edit':
          typeBadge = '<span class="badge badge-warning">Edit</span>';
          break;
        case 'delete':
          typeBadge = '<span class="badge badge-danger">Delete</span>';
          break;
        default:
          typeBadge = '<span class="badge">Other</span>';
      }

      return `
          <tr>
            <td><small>${formatDateTime(h.timestamp)}</small></td>
            <td>${typeBadge}</td>
            <td>${h.productName}</td>
            <td>${h.details}</td>
            <td>${h.user}</td>
          </tr>
        `;
    })
    .join('');
}

export function getFilteredHistory() {
  const searchTerm = document
    .getElementById('search-history')
    .value.toLowerCase();
  const typeFilter = document.getElementById('filter-movement-type').value;

  return state.history.filter((h) => {
    const matchesSearch =
      h.productName.toLowerCase().includes(searchTerm) ||
      h.details.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    return matchesSearch && matchesType;
  });
}
