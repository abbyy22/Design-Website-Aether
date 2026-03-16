let passVisible = false;

function togglePwd() {
  passVisible = !passVisible;
  const input = document.getElementById('regPass');
  const icon  = document.getElementById('eyeIcon');

  input.type         = passVisible ? 'text' : 'password';
  icon.style.opacity = passVisible ? '0.5' : '1';
}

function setError(wrapId, errId, show) {
  document.getElementById(wrapId).classList.toggle('has-error', show);
  document.getElementById(errId).style.display = show ? 'block' : 'none';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function handleRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value.trim();
  let isValid = true;

  setError('wrapName',  'errName',  !name);
  if (!name) isValid = false;

  setError('wrapEmail', 'errEmail', !isValidEmail(email));
  if (!isValidEmail(email)) isValid = false;

  setError('wrapPass',  'errPass',  pass.length < 6);
  if (pass.length < 6) isValid = false;

  if (isValid) {
    showToast('✓ Account created! Welcome, ' + name + '.');
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handleRegister();
});