(() => {
  function parseUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function ensureMenuRemoved() {
    const existing = document.querySelector('.avatar-menu');
    if (existing) existing.remove();
  }

  function updateAvatar() {
    const u = parseUser();
    const token = localStorage.getItem('token');
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    // avatar container (right aligned)
    let container = nav.querySelector('.avatar-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'avatar-container';
      container.style.marginLeft = 'auto';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      container.style.position = 'relative';
      nav.appendChild(container);
    }

    // clean previous
    container.innerHTML = '';
    ensureMenuRemoved();

    if (u && token) {
      const img = document.createElement('img');
      img.id = 'userAvatarBtn';
      img.src = u.avatar || 'https://www.gravatar.com/avatar/?d=mp&f=y';
      img.alt = u.name || u.username || 'avatar';
      img.style.width = '36px';
      img.style.height = '36px';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      img.style.cursor = 'pointer';
      img.onerror = function () { this.src = 'https://www.gravatar.com/avatar/?d=mp&f=y'; };

        const nameSpan = document.createElement('span');
        nameSpan.textContent = u.name || u.username || '';
        // match navbar button color so it's visible on light backgrounds
        nameSpan.style.color = '#d94f8c';
        nameSpan.style.fontSize = '0.9rem';
        nameSpan.style.fontWeight = '600';

      container.appendChild(img);
      container.appendChild(nameSpan);

      // menu
      const menu = document.createElement('div');
      menu.className = 'avatar-menu';
      menu.style.position = 'absolute';
      menu.style.display = 'none';
      menu.style.background = '#fff';
      menu.style.border = '1px solid #ddd';
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
      menu.style.padding = '6px';
      menu.style.zIndex = 2000;

      const edit = document.createElement('div');
      edit.textContent = 'Edit profile';
      edit.style.padding = '8px 12px';
      edit.style.cursor = 'pointer';
      edit.style.whiteSpace = 'nowrap';

      const out = document.createElement('div');
      out.textContent = 'Logout';
      out.style.padding = '8px 12px';
      out.style.cursor = 'pointer';
      out.style.whiteSpace = 'nowrap';

        // attach menu into the container for predictable positioning
        container.appendChild(menu);
        menu.appendChild(edit);
        menu.appendChild(out);

      // Primary action: navigate to profile on click (reliable fallback)
      img.title = 'Edit profile';
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.addEventListener('click', (ev) => {
        ev.stopPropagation();
        window.location.href = 'profile.html';
      });
      // keep keyboard accessibility
      img.addEventListener('keypress', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          window.location.href = 'profile.html';
        }
      });

      // click outside closes
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== img) {
          menu.style.display = 'none';
        }
      });

      edit.addEventListener('click', () => { window.location.href = 'profile.html'; });
      out.addEventListener('click', () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html'; });

    } else {
      // nothing to show when logged out
      container.innerHTML = '';
    }
  }

  // expose helper
  window.updateNavbarProfile = updateAvatar;

  // init on load
  try { updateAvatar(); } catch (e) { /* ignore */ }

  // react to storage changes (other tabs or profile saves)
  window.addEventListener('storage', () => { updateAvatar(); });
})();
