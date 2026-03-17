/* ============================================================
   AETHER — profile.js
   Handles: avatar change, edit/save profile,
            dirty-check navigation intercept, experiences
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const profileState = {
  data: {
    namaLengkap : 'Anom Nick',
    username    : 'Anom',
    contact     : '123456789',
    email       : 'Anomnick@gmail.com',
    password    : 'password123',
    aboutMe     : 'A Senior Data Scientist at Tesla.',
    avatarSrc   : null,
  },
  experiences: [
    { id: 1, company: 'PT Perkasa', location: 'Papua', address: 'asdasd', mulai: '30/02/2025', akhir: '30/02/2025' },
  ],
  isEditMode  : false,
  isDirty     : false,
  pendingHref : null,
};

/* ─────────────────────────────────────────
   DOM HELPERS
───────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */
function handleAvatarChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_MB  = 5;

  if (!ALLOWED.includes(file.type)) {
    showToast('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.', 'error');
    return;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast(`Ukuran foto maksimal ${MAX_MB}MB.`, 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = ({ target }) => {
    profileState.data.avatarSrc = target.result;
    applyAvatar();

    const lbl = $('ae-avatar-filename');
    if (lbl) { lbl.textContent = '✓ ' + file.name; lbl.style.display = 'block'; }

    showToast('Foto profil berhasil diubah!', 'success');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function applyAvatar() {
  const initials = $('ae-avatar-initials');
  const img      = $('ae-avatar-img');
  if (!img) return;

  if (profileState.data.avatarSrc) {
    img.src          = profileState.data.avatarSrc;
    img.style.display = 'block';
    if (initials) initials.style.display = 'none';
  } else {
    img.style.display  = 'none';
    if (initials) initials.style.display = 'flex';
  }
}

/* ─────────────────────────────────────────
   RENDER PROFILE FORM
───────────────────────────────────────── */
function renderProfile() {
  const d = profileState.data;
  $('ae-input-nama').value     = d.namaLengkap;
  $('ae-input-username').value = d.username;
  $('ae-input-contact').value  = d.contact;
  $('ae-input-email').value    = d.email;
  $('ae-input-password').value = d.password;
  $('ae-input-about').value    = d.aboutMe;

  $('ae-profile-name').textContent   = d.namaLengkap;
  $('ae-profile-handle').textContent = '@' + d.username;
  applyAvatar();
}

/* ─────────────────────────────────────────
   DIRTY FLAG
───────────────────────────────────────── */
function markDirty() {
  if (!profileState.isEditMode) return;
  profileState.isDirty = true;
  const btn = $('ae-btn-save-bottom');
  if (btn) btn.style.display = 'inline-flex';
}

function clearDirty() {
  profileState.isDirty = false;
  const btn = $('ae-btn-save-bottom');
  if (btn) btn.style.display = 'none';
}

/* ─────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────── */
function toggleEditMode() {
  profileState.isEditMode = !profileState.isEditMode;
  const editing = profileState.isEditMode;

  $$('#ae-data-form input, #ae-data-form textarea')
    .forEach(el => { el.readOnly = !editing; });

  $('ae-btn-edit').style.display   = editing ? 'none'        : 'inline-flex';
  $('ae-btn-save').style.display   = editing ? 'inline-flex' : 'none';
  $('ae-btn-cancel').style.display = editing ? 'inline-flex' : 'none';
  $('ae-edit-indicator').classList.toggle('visible', editing);

  if (!editing) clearDirty();
  if (editing)  showToast('Mode edit aktif. Ubah data lalu simpan.', 'info');
}

/* ─────────────────────────────────────────
   VALIDATION
───────────────────────────────────────── */
function validateForm() {
  $$('#ae-data-form input, #ae-data-form textarea')
    .forEach(el => el.classList.remove('ae-error'));

  const nama  = $('ae-input-nama').value.trim();
  const email = $('ae-input-email').value.trim();

  if (!nama) {
    $('ae-input-nama').classList.add('ae-error');
    showToast('Nama lengkap tidak boleh kosong!', 'error');
    return false;
  }
  if (!email.includes('@')) {
    $('ae-input-email').classList.add('ae-error');
    showToast('Format email tidak valid!', 'error');
    return false;
  }
  return true;
}

/* ─────────────────────────────────────────
   SAVE / CANCEL
───────────────────────────────────────── */
function saveProfile() {
  if (!validateForm()) return;

  profileState.data = {
    ...profileState.data,
    namaLengkap : $('ae-input-nama').value.trim(),
    username    : $('ae-input-username').value.trim(),
    contact     : $('ae-input-contact').value.trim(),
    email       : $('ae-input-email').value.trim(),
    password    : $('ae-input-password').value,
    aboutMe     : $('ae-input-about').value.trim(),
  };

  renderProfile();
  if (profileState.isEditMode) toggleEditMode();
  clearDirty();
  showToast('Profil berhasil disimpan!', 'success');
}

function cancelEdit() {
  renderProfile();
  if (profileState.isEditMode) toggleEditMode();
  clearDirty();
  showToast('Perubahan dibatalkan.', 'info');
}

/* ─────────────────────────────────────────
   NAVIGATION INTERCEPT (dirty check)
───────────────────────────────────────── */
function saveProfileAndNavigate() {
  if (!validateForm()) return;
  saveProfile();
  closeModal('ae-modal-unsaved');
  if (profileState.pendingHref) {
    setTimeout(() => { window.location.href = profileState.pendingHref; }, 400);
    profileState.pendingHref = null;
  }
}

function interceptNav(href) {
  if (!profileState.isDirty) return true;

  profileState.pendingHref = href;

  $('ae-btn-unsaved-ignore').onclick = () => {
    closeModal('ae-modal-unsaved');
    clearDirty();
    window.location.href = href;
  };
  openModal('ae-modal-unsaved');
  return false;
}

/* ─────────────────────────────────────────
   EXPERIENCES
───────────────────────────────────────── */
function renderExperiences() {
  const container = $('ae-exp-list');
  const exps = profileState.experiences;

  if (exps.length === 0) {
    container.innerHTML = `
      <div class="ae-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
        <p>Belum ada pengalaman kerja ditambahkan.</p>
      </div>`;
    return;
  }

  container.innerHTML = exps.map(exp => `
    <div class="ae-exp-card" id="ae-exp-${exp.id}">
      <div class="ae-exp-card__avatar">${exp.company.slice(0,2).toUpperCase()}</div>
      <div style="min-width:120px">
        <div class="ae-exp-card__company">${exp.company}</div>
        <div class="ae-exp-card__location">${exp.location}</div>
      </div>
      <div class="ae-exp-card__fields">
        <div class="ae-form-group">
          <label>Alamat Perusahaan</label>
          <input type="text" value="${exp.address}" readonly onchange="updateExp(${exp.id},'address',this.value)"/>
        </div>
        <div class="ae-form-group">
          <label>Tanggal Mulai</label>
          <input type="text" value="${exp.mulai}" readonly onchange="updateExp(${exp.id},'mulai',this.value)"/>
        </div>
        <div class="ae-form-group">
          <label>Tanggal Akhir</label>
          <input type="text" value="${exp.akhir}" readonly onchange="updateExp(${exp.id},'akhir',this.value)"/>
        </div>
      </div>
      <button class="ae-exp-card__delete" onclick="deleteExp(${exp.id})" title="Hapus">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>`).join('');
}

function openAddExp() {
  ['ae-exp-company','ae-exp-location','ae-exp-address','ae-exp-mulai','ae-exp-akhir']
    .forEach(id => { $(`${id}`).value = ''; });
  openModal('ae-modal-add-exp');
}

function submitAddExp() {
  const company  = $('ae-exp-company').value.trim();
  const location = $('ae-exp-location').value.trim();
  if (!company || !location) {
    showToast('Nama perusahaan dan lokasi wajib diisi!', 'error');
    return;
  }
  profileState.experiences.push({
    id      : Date.now(),
    company,
    location,
    address : $('ae-exp-address').value.trim(),
    mulai   : $('ae-exp-mulai').value.trim(),
    akhir   : $('ae-exp-akhir').value.trim(),
  });
  renderExperiences();
  closeModal('ae-modal-add-exp');
  showToast(`Pengalaman di "${company}" berhasil ditambahkan!`, 'success');
}

function updateExp(id, field, value) {
  const exp = profileState.experiences.find(e => e.id === id);
  if (exp) exp[field] = value;
}

function deleteExp(id) {
  const exp = profileState.experiences.find(e => e.id === id);
  if (!exp) return;
  $('ae-confirm-delete-text').textContent = `Hapus pengalaman di "${exp.company}"?`;
  $('ae-confirm-delete-btn').onclick = () => {
    profileState.experiences = profileState.experiences.filter(e => e.id !== id);
    renderExperiences();
    closeModal('ae-modal-confirm-delete');
    showToast('Pengalaman berhasil dihapus.', 'success');
  };
  openModal('ae-modal-confirm-delete');
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderProfile();
  renderExperiences();

  // All inputs start as readonly
  $$('#ae-data-form input, #ae-data-form textarea').forEach(el => {
    el.readOnly = true;
    el.addEventListener('input', markDirty);
  });

  // Intercept nav clicks when dirty
  $$('.ae-nav__item[href]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== 'profil.html' && !interceptNav(href)) e.preventDefault();
    });
  });

  // Intercept browser back/forward
  window.addEventListener('beforeunload', e => {
    if (profileState.isDirty) { e.preventDefault(); e.returnValue = ''; }
  });
});
