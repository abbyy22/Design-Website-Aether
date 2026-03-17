/* ============================================================
   AETHER — chat.js
   Handles: contact list, filter/search, send/receive messages,
            typing indicator, favorite toggle, clear chat
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const chatState = {
  contacts: [
    {
      id: 1, name: 'Julius', initial: 'J', color: '#7a8e9e',
      online: true, unread: true, favorit: false,
      messages: [
        { from: 'them', text: 'Hallo ?',      time: '12.00', date: 'Kamis' },
        { from: 'me',   text: 'Hallo Juga ?', time: '12.00', date: 'Kamis' },
      ],
    },
    {
      id: 2, name: 'Ernet', initial: 'E', color: '#7a9e80',
      online: false, unread: false, favorit: false,
      messages: [
        { from: 'them', text: 'Mau Meet Kapan?', time: '11.30', date: 'Kamis' },
      ],
    },
    {
      id: 3, name: 'Maya R.', initial: 'M', color: '#9e7a76',
      online: true, unread: false, favorit: false,
      messages: [
        { from: 'them', text: 'Materinya sudah saya kirim ya!', time: '10.00', date: 'Rabu' },
        { from: 'me',   text: 'Siap, terima kasih Kak!',       time: '10.05', date: 'Rabu' },
      ],
    },
  ],
  activeId    : null,
  filter      : 'all',    // 'all' | 'unread' | 'favorit'
  searchQuery : '',
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const $  = id  => document.getElementById(id);
const getNow = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
};
const getContact = id => chatState.contacts.find(c => c.id === id);

/* ─────────────────────────────────────────
   RENDER CONTACT LIST
───────────────────────────────────────── */
function renderContactList() {
  const { contacts, filter, searchQuery, activeId } = chatState;

  let list = contacts.filter(c => {
    if (filter === 'unread')  return c.unread;
    if (filter === 'favorit') return c.favorit;
    return true;
  });

  if (searchQuery) {
    list = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const container = $('ae-contact-list');

  if (list.length === 0) {
    container.innerHTML = `<div class="ae-no-results">Tidak ada kontak ditemukan.</div>`;
    return;
  }

  container.innerHTML = list.map(c => {
    const last    = c.messages.at(-1);
    const preview = last
      ? (last.from === 'me' ? `Kamu: ${last.text}` : `${c.name}: ${last.text}`)
      : 'Belum ada pesan';

    return `
      <div class="ae-contact-item ${c.id === activeId ? 'active' : ''}"
           onclick="selectContact(${c.id})">
        <div class="ae-contact-item__avatar" style="background:${c.color}">${c.initial}</div>
        <div class="ae-contact-item__info">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="ae-contact-item__name">${c.name}</span>
            <span class="ae-contact-item__time">${last?.date ?? ''}</span>
          </div>
          <div class="ae-contact-item__preview">${preview}</div>
        </div>
        ${c.unread ? '<div class="ae-contact-item__unread"></div>' : ''}
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   RENDER MESSAGES
───────────────────────────────────────── */
function renderMessages(contactId) {
  const c    = getContact(contactId);
  const area = $('ae-chat-messages');

  if (!c) {
    area.innerHTML = `
      <div class="ae-chat-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>Pilih kontak untuk memulai percakapan.</p>
      </div>`;
    return;
  }

  // Group messages by date
  const byDate = c.messages.reduce((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});

  area.innerHTML = Object.entries(byDate).map(([date, msgs]) => `
    <div class="ae-chat-date"><span>${date}</span></div>
    ${msgs.map(m => `
      <div class="ae-msg ${m.from === 'me' ? 'ae-msg--mine' : ''}">
        <div class="ae-msg__avatar" style="background:${m.from === 'me' ? '#c4a8a4' : c.color}">
          ${m.from === 'me' ? 'AN' : c.initial}
        </div>
        <div class="ae-msg__wrap">
          <div class="ae-msg__bubble">${m.text}</div>
          <div class="ae-msg__meta">✓ ${m.time}</div>
        </div>
      </div>`).join('')}
  `).join('');

  area.scrollTop = area.scrollHeight;
}

/* ─────────────────────────────────────────
   SELECT CONTACT
───────────────────────────────────────── */
function selectContact(id) {
  chatState.activeId = id;
  const c = getContact(id);
  if (!c) return;

  c.unread = false;
  renderContactList();

  $('ae-chat-contact-name').textContent   = c.name;
  $('ae-chat-contact-status').textContent = c.online ? 'Online' : 'Offline';
  $('ae-chat-contact-status').style.color = c.online ? '#5cb85c' : '#bbb';
  $('ae-chat-window-avatar').textContent        = c.initial;
  $('ae-chat-window-avatar').style.background   = c.color;

  updateStarBtn(c);
  renderMessages(id);
  $('ae-chat-input')?.focus();
}

/* ─────────────────────────────────────────
   SEND MESSAGE
───────────────────────────────────────── */
function sendMessage() {
  const input = $('ae-chat-input');
  const text  = input.value.trim();

  if (!chatState.activeId) { showToast('Pilih kontak terlebih dahulu!', 'error'); return; }
  if (!text) return;

  const c   = getContact(chatState.activeId);
  const now = getNow();
  c.messages.push({ from: 'me', text, time: now, date: 'Hari ini' });

  input.value = '';
  renderMessages(chatState.activeId);
  renderContactList();
  simulateReply(c);
}

/* ─────────────────────────────────────────
   AUTO REPLY SIMULATION
───────────────────────────────────────── */
function simulateReply(contact) {
  const REPLIES = [
    'Oke, siap!', 'Baik, terima kasih!', 'Nanti saya cek ya.',
    'Mantap 👍', 'Sudah saya terima.', 'Boleh, kapan bisa?',
  ];
  const area = $('ae-chat-messages');

  // Show typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'ae-msg';
  typingEl.id        = 'ae-typing-indicator';
  typingEl.innerHTML = `
    <div class="ae-msg__avatar" style="background:${contact.color}">${contact.initial}</div>
    <div class="ae-msg__wrap">
      <div class="ae-msg__bubble">
        <div class="ae-typing">
          <div class="ae-typing__dot"></div>
          <div class="ae-typing__dot"></div>
          <div class="ae-typing__dot"></div>
        </div>
      </div>
    </div>`;
  area.appendChild(typingEl);
  area.scrollTop = area.scrollHeight;

  setTimeout(() => {
    $('ae-typing-indicator')?.remove();
    contact.messages.push({
      from: 'them',
      text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      time: getNow(),
      date: 'Hari ini',
    });
    renderMessages(contact.id);
    renderContactList();
  }, 1500);
}

/* ─────────────────────────────────────────
   FAVORIT TOGGLE
───────────────────────────────────────── */
function toggleFavorit() {
  if (!chatState.activeId) return;
  const c   = getContact(chatState.activeId);
  c.favorit = !c.favorit;
  updateStarBtn(c);
  renderContactList();
  showToast(
    c.favorit ? `${c.name} ditambahkan ke favorit ★` : `${c.name} dihapus dari favorit`,
    'info'
  );
}

function updateStarBtn(c) {
  const svg = $('ae-btn-favorit')?.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('fill',   c.favorit ? '#f0a830' : 'none');
  svg.setAttribute('stroke', c.favorit ? '#f0a830' : 'currentColor');
}

/* ─────────────────────────────────────────
   FILTER TABS
───────────────────────────────────────── */
function handleChatTab(btn, filter) {
  document.querySelectorAll('.ae-chat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  chatState.filter = filter;
  renderContactList();
}

/* ─────────────────────────────────────────
   SEARCH
───────────────────────────────────────── */
function handleChatSearch(value) {
  chatState.searchQuery = value;
  renderContactList();
}

/* ─────────────────────────────────────────
   CLEAR CHAT
───────────────────────────────────────── */
function clearChat() {
  if (!chatState.activeId) return;
  const c = getContact(chatState.activeId);
  $('ae-confirm-delete-text').textContent = `Hapus semua pesan dengan "${c.name}"?`;
  $('ae-confirm-delete-btn').onclick = () => {
    c.messages = [];
    renderMessages(chatState.activeId);
    renderContactList();
    closeModal('ae-modal-confirm-delete');
    showToast('Riwayat chat dihapus.', 'success');
  };
  openModal('ae-modal-confirm-delete');
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderContactList();

  $('ae-chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // Auto-open contact from query param (?kontak=Nama)
  const params     = new URLSearchParams(window.location.search);
  const namaKontak = params.get('kontak');
  if (namaKontak) {
    const decoded = decodeURIComponent(namaKontak);
    let target    = chatState.contacts.find(
      c => c.name.toLowerCase() === decoded.toLowerCase()
    );

    if (!target) {
      // Create new contact on the fly (e.g. mentor redirect)
      const COLORS  = ['#9e7a76','#7a8e9e','#7a9e80','#9e9a7a','#7a7a9e','#9e8a7a'];
      const initial = decoded.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
      target = {
        id      : Date.now(),
        name    : decoded,
        initial,
        color   : COLORS[Math.floor(Math.random() * COLORS.length)],
        online  : true,
        unread  : false,
        favorit : false,
        messages: [],
      };
      chatState.contacts.push(target);
      renderContactList();
    }

    selectContact(target.id);
    showToast(`Memulai chat dengan ${decoded}`, 'success');

    // Clean URL without reload
    window.history.replaceState({}, '', 'chat.html');
  }
});
