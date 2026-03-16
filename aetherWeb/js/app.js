/* ============================================================
   AETHER — app.js
   Shared utilities: Toast, Modal, Nav highlight
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   NAV HIGHLIGHT
   Auto-mark active nav item based on filename
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.ae-nav__item').forEach(el => {
    const href = el.getAttribute('href') || '';
    if (href === currentPage) el.classList.add('active');
  });
});

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
const Toast = (() => {
  const ICONS    = { success: '✓', error: '✕', info: 'ℹ' };
  const DURATION = 3000;

  function show(message, type = 'info', duration = DURATION) {
    const container = document.getElementById('ae-toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `ae-toast ae-toast--${type}`;
    el.innerHTML = `<span>${ICONS[type] ?? 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.cssText = 'opacity:0;transform:translateX(20px);transition:0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  return { show };
})();

// Global shorthand
function showToast(msg, type, dur) { Toast.show(msg, type, dur); }

/* ─────────────────────────────────────────
   MODAL
───────────────────────────────────────── */
const Modal = (() => {
  function open(id)  { document.getElementById(id)?.classList.add('open');    }
  function close(id) { document.getElementById(id)?.classList.remove('open'); }

  // Close on backdrop click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('ae-modal-overlay')) e.target.classList.remove('open');
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      document.querySelectorAll('.ae-modal-overlay.open').forEach(m => m.classList.remove('open'));
  });

  return { open, close };
})();

// Global shorthands
function openModal(id)  { Modal.open(id);  }
function closeModal(id) { Modal.close(id); }
