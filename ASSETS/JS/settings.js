import { state, saveData, renderAll } from './main.js';

export function initSettingsEvents() {
  document.getElementById('clear-history').addEventListener('click', (e) => {
    e.preventDefault();
    if (
      confirm(
        'Are you sure you want to clear all records history? This action cannot be undone.',
      )
    ) {
      state.history = [];
      localStorage.setItem('history', JSON.stringify(state.history));
      alert('Transaction history successfully cleared.');
      saveData();
      renderAll();
    }
  });

  document.getElementById('delete-orders').addEventListener('click', (e) => {
    e.preventDefault();
    if (
      confirm(
        'Are you sure you want to delete all orders from the system? This action cannot be undone.',
      )
    ) {
      state.orders = [];
      localStorage.setItem('orders', JSON.stringify(state.orders));
      alert('Order successfully deleted.');
      saveData();
      renderAll();
    }
  });

  document.getElementById('delete-all').addEventListener('click', (e) => {
    e.preventDefault();
    if (
      confirm(
        'WARNING: You are about to delete ALL products from the database.',
      )
    ) {
      state.products = [];
      state.orders = [];
      state.history = [];
      localStorage.setItem('products', JSON.stringify(state.products));
      localStorage.setItem('orders', JSON.stringify(state.orders));
      localStorage.setItem('history', JSON.stringify(state.history));
      alert('Data successfully deleted');
      saveData();
      renderAll();
    }
  });
}
