/* ============================================================
   AETHER — home.js
   Handles: stat counters, View All modals, mentor navigation
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const HOME_DATA = {
  schedule: [
    { name: 'Basis Data',      date: 'Hari ini', time: '13.00–14.00', mentor: 'Steven A.',  platform: 'Zoom', status: 'ongoing'  },
    { name: 'Cyber Security',  date: 'Besok',    time: '13.00–14.00', mentor: 'Ricard Lee', platform: 'Zoom', status: 'upcoming' },
    { name: 'Data Mining',     date: 'Besok',    time: '15.00–16.00', mentor: 'Dante',      platform: 'Zoom', status: 'upcoming' },
    { name: 'AI Fundamentals', date: 'Lusa',     time: '10.00–11.00', mentor: 'Maya R.',    platform: 'Meet', status: 'upcoming' },
  ],
  activity: [
    { text: 'Zoom With Steven A. : Topic "Basis Data"',     time: '12.00',    done: true  },
    { text: 'Zoom With Ricard Lee : Topic "Cyber Security"', time: '13.00',   done: false },
    { text: 'Zoom with Dante : Topic "Data Mining"',         time: 'Besok',   done: false },
    { text: 'Zoom with Maya R. : Topic "AI Fundamentals"',   time: 'Lusa',    done: false },
    { text: 'Quiz Basis Data submitted',                      time: 'Kemarin', done: true  },
  ],
  mentors: [
    { name: 'Jessica',   rating: 4.9, subject: 'Mentor Mata Kuliah Basis Data',     helped: '200++', initial: 'J', color: '#9e7a76' },
    { name: 'Raymond',   rating: 4.8, subject: 'Mentor Mata Kuliah Cyber Security', helped: '180++', initial: 'R', color: '#7a8e9e' },
    { name: 'Maya R.',   rating: 4.7, subject: 'Mentor AI Fundamentals',            helped: '150++', initial: 'M', color: '#7a9e80' },
    { name: 'Dante',     rating: 4.6, subject: 'Mentor Data Mining',                helped: '120++', initial: 'D', color: '#9e9a7a' },
    { name: 'Steven A.', rating: 4.9, subject: 'Mentor Basis Data & SQL',           helped: '220++', initial: 'S', color: '#7a7a9e' },
  ],
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function statusBadge(status) {
  const map = {
    ongoing:  'ae-badge--ongoing',
    upcoming: 'ae-badge--upcoming',
    done:     'ae-badge--done',
  };
  const labels = { ongoing: 'Ongoing', upcoming: 'Upcoming', done: 'Selesai' };
  const cls = map[status] ?? 'ae-badge--upcoming';
  return `<span class="ae-badge ${cls}">${labels[status] ?? status}</span>`;
}

/* ─────────────────────────────────────────
   VIEW ALL — SCHEDULE
───────────────────────────────────────── */
function viewAllSchedule() {
  const tbody = document.getElementById('ae-schedule-tbody');
  tbody.innerHTML = HOME_DATA.schedule.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.date}</td>
      <td>${s.time}</td>
      <td>${s.mentor}</td>
      <td>${s.platform}</td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <button class="ae-btn ae-btn--secondary" style="padding:5px 10px;font-size:11px"
          onclick="joinSession('${s.name}')">Join</button>
      </td>
    </tr>`).join('');
  openModal('ae-modal-schedule');
}

function joinSession(name) {
  closeModal('ae-modal-schedule');
  showToast(`Bergabung ke sesi "${name}"...`, 'success');
}

/* ─────────────────────────────────────────
   VIEW ALL — ACTIVITY
───────────────────────────────────────── */
function viewAllActivity() {
  const tbody = document.getElementById('ae-activity-tbody');
  tbody.innerHTML = HOME_DATA.activity.map(a => `
    <tr>
      <td>
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;
          background:${a.done ? '#5cb85c' : '#bbb'};margin-right:8px;vertical-align:middle"></span>
        ${a.text}
      </td>
      <td>${a.time}</td>
      <td>${statusBadge(a.done ? 'done' : 'upcoming')}</td>
    </tr>`).join('');
  openModal('ae-modal-activity');
}

/* ─────────────────────────────────────────
   VIEW ALL — MENTOR
───────────────────────────────────────── */
function viewAllMentor() {
  const list = document.getElementById('ae-mentor-modal-list');
  list.innerHTML = HOME_DATA.mentors.map(m => `
    <div class="ae-mentor-item" style="background:var(--ae-bg)">
      <div class="ae-mentor-item__avatar" style="background:${m.color}">${m.initial}</div>
      <div class="ae-mentor-item__info">
        <div class="ae-mentor-item__name">
          ${m.name}
          <span class="ae-mentor-item__star">★</span>
          <span class="ae-mentor-item__rating">${m.rating}</span>
        </div>
        <div class="ae-mentor-item__sub">${m.subject}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <span class="ae-mentor-item__helped">${m.helped} dibantu</span>
        <button class="ae-btn ae-btn--primary" style="padding:5px 12px;font-size:11px"
          onclick="hubungiMentor('${m.name}')">Hubungi</button>
      </div>
    </div>`).join('');
  openModal('ae-modal-mentor');
}

function hubungiMentor(name) {
  closeModal('ae-modal-mentor');
  showToast(`Membuka chat dengan ${name}...`, 'success');
  setTimeout(() => {
    window.location.href = `chat.html?kontak=${encodeURIComponent(name)}`;
  }, 600);
}

/* ─────────────────────────────────────────
   STAT COUNTER ANIMATION
───────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-ae-target]').forEach(el => {
    const target    = parseInt(el.dataset.aeTarget, 10);
    const isDecimal = !!el.dataset.aeDecimal;    // stored as x10, e.g. 45 = 4.5
    const steps     = 40;
    const stepVal   = target / steps;
    let   current   = 0;

    const tick = setInterval(() => {
      current = Math.min(current + stepVal, target);
      el.textContent = isDecimal
        ? (current / 10).toFixed(1).replace('.', ',')
        : Math.round(current);
      if (current >= target) {
        el.textContent = isDecimal
          ? (target / 10).toFixed(1).replace('.', ',')
          : target;
        clearInterval(tick);
      }
    }, 30);
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', animateCounters);
