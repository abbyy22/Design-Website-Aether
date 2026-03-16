let passVisible = false;

function togglePwd() {
  passVisible = !passVisible;
  const input = document.getElementById('loginPass');
  const icon  = document.getElementById('eyeIcon');

  input.type        = passVisible ? 'text' : 'password';
  icon.style.opacity = passVisible ? '0.5' : '1';
}

function setError(wrapId, errId, show) {
  document.getElementById(wrapId).classList.toggle('has-error', show);
  document.getElementById(errId).style.display = show ? 'block' : 'none';
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function handleLogin() {
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  let isValid = true;

  setError('wrapName', 'errName', !name);
  if (!name) isValid = false;

  setError('wrapPass', 'errPass', !pass);
  if (!pass) isValid = false;

  if (isValid) {
    showToast('✓ Login successful! Welcome back, ' + name + '.');
    window.location.href = '../aetherWeb/home.html';
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handleLogin();
});