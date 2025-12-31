// Use a configurable API base so login works in local dev and production.
// Default to the local backend so running the docs with a separate static server still calls the API.
const API_BASE = window.__API_BASE__ || 'http://127.0.0.1:5050';
const LOGIN_URL = `${API_BASE.replace(/\/$/, '')}/api/auth/login`;

const form = document.getElementById("loginForm");
const submitBtn = form.querySelector('button[type="submit"]') || null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // disable submit to prevent duplicate clicks
  if (submitBtn) submitBtn.disabled = true;

  try {
    console.log('Attempting login to', LOGIN_URL, { email });

    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', res.status);

    // try to parse JSON safely
    let data = {};
    try { data = await res.json(); } catch (jsonErr) { console.warn('Response not JSON', jsonErr); }
    console.log('Login response body:', data);

    if (!res.ok) {
      alert(data.message || `Login failed (status ${res.status})`);
      return;
    }

    // Save token and user info
    if (data.token) localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  // update navbar if the script is present, then redirect
  if (window.updateNavbarProfile) try { window.updateNavbarProfile(); } catch (e) { /* ignore */ }
  window.location.href = "dashboard.html";

  } catch (err) {
    console.error('Fetch failed:', err);
    alert('Network error — could not reach backend. Ensure backend is running and CORS is enabled.');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});