// frontend/components/app.js
import { setupForm } from './components/form.js';

document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('formContainer');
  setupForm(formContainer);

  // Dark mode toggle
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('darkmode');
      toggle.textContent = document.body.classList.contains('darkmode') ? '☀️' : '🌙';
    });
  }
});