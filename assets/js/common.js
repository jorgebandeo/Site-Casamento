const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const menuToggle = $('.menu-toggle');
const navLinks = $('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

const yearEl = $('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

window.showToast = function(message) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
