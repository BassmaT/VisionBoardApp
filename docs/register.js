const API_URL = "https://visionboardapp.onrender.com/api/auth/register";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Registration failed");
    return;
  }

  // Save token
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  // Redirect to dashboard
  window.location.href = "dashboard.html";
});