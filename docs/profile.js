document.addEventListener('DOMContentLoaded', () => {
  // Only run this script when the profile page DOM exists.
  const nameInput = document.getElementById('name');
  const avatarInput = document.getElementById('avatar');
  const preview = document.getElementById('avatarPreview');
  const msg = document.getElementById('msg');
  const saveBtn = document.getElementById('saveProfile');

  // If essential elements are missing, do nothing (prevents errors when script is loaded on other pages)
  if (!nameInput || !avatarInput || !preview || !msg || !saveBtn) {
    return;
  }

  const API_BASE = window.__API_BASE__ || 'http://127.0.0.1:5050';

  // Ensure user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    msg.textContent = 'Please login first';
    msg.style.color = '#d94f8c';
    return;
  }

  (async function loadProfile(){
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { msg.textContent = 'Failed to load profile'; msg.style.color = '#d94f8c'; return; }
      const user = await res.json();
      nameInput.value = user.name || '';
      avatarInput.value = user.avatar || '';
      preview.src = user.avatar || '';
    } catch (err) {
      console.error('Failed to load profile', err);
      msg.textContent = 'Error loading profile';
      msg.style.color = '#d94f8c';
    }
  })();

  avatarInput.addEventListener('input', () => { preview.src = avatarInput.value || 'https://www.gravatar.com/avatar/?d=mp&f=y'; });

  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => window.history.back());

  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const avatar = avatarInput.value.trim();
    saveBtn.disabled = true;
    msg.textContent = 'Saving...';
    msg.style.color = '';
    try {
      // read token at the moment of saving in case it changed
      const tkn = localStorage.getItem('token');
      if (!tkn) {
        msg.textContent = 'Not authenticated';
        msg.style.color = '#d94f8c';
        return;
      }
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/auth/me`, {
        method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${tkn}` },
        body: JSON.stringify({ name, avatar })
      });
      if (res.ok) {
        const u = await res.json();
        localStorage.setItem('user', JSON.stringify(u));
        msg.textContent = 'Saved';
        msg.style.color = '#4CAF50';
        // update navbar if present
        if (window.updateNavbarProfile) window.updateNavbarProfile();
      } else {
        let body = {};
        try { body = await res.json(); } catch (e) { body = { message: 'Save failed' }; }
        msg.textContent = `${res.status}: ${body.message || 'Save failed'}`;
        msg.style.color = '#d94f8c';
      }
    } catch (err) {
      console.error('Save profile request failed', err);
      msg.textContent = 'Save failed (network)';
      msg.style.color = '#d94f8c';
    } finally {
      saveBtn.disabled = false;
    }
  });

});
