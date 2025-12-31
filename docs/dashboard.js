async function loadBoards() {
  // prevent concurrent/rapid repeated calls
  if (window._loadingBoards) {
    console.debug('loadBoards skipped: already running');
    return;
  }

  // prevent repeated automatic reloads: only load once per session unless forced
  if (window._boardsLoaded) {
    console.debug('loadBoards skipped: already loaded for this session');
    return;
  }

  window._loadingBoards = true;
  const token = localStorage.getItem("token");
  const container = document.getElementById("boardsContainer");
  const title = document.getElementById("dashboardTitle");
  const message = document.getElementById("dashboardMessage");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
  const API_BASE = window.__API_BASE__ || 'https://visionboardapp.onrender.com';
    const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/boards/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

  // debug
  console.debug('GET /api/boards/my', res.status, res.statusText);

  // prepare UI for a fresh render
  if (container) container.innerHTML = '';
  const refreshBtn = document.getElementById('refreshBoardsBtn');
  if (refreshBtn) refreshBtn.disabled = true;

    // Attempt to parse JSON, but handle non-JSON responses gracefully
    let boards;
    try {
      boards = await res.json();
    } catch (parseErr) {
      const text = await res.text().catch(() => 'Unable to read response');
      console.error('Failed to parse /api/boards/my response as JSON', parseErr, text);
      message.textContent = `❌ Error loading boards (invalid response).`;
      return;
    }

    if (!res.ok) {
      console.error('Error from API /api/boards/my', res.status, boards);
      message.textContent = `❌ Error loading boards (status ${res.status}): ${boards.message || JSON.stringify(boards)}`;
      return;
    }

    if (!Array.isArray(boards)) {
      console.error('Unexpected /api/boards/my payload', boards);
      message.textContent = `❌ Error loading boards (unexpected payload).`;
      return;
    }

    if (boards.length === 0) {
      message.textContent = "You don’t have any boards yet.";
      window._boardsLoaded = true;
      if (refreshBtn) refreshBtn.disabled = false;
      return;
    }

    boards.forEach(board => {
      const card = document.createElement("div");
      card.className = "board-card";

      card.innerHTML = `
        <h3>${board.year} Vision Board</h3>
        <p>${board.goals.length} goals</p>

        <div class="card-actions">
          <button class="open-btn">Open</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      // OPEN
      card.querySelector(".open-btn").addEventListener("click", () => {
        showCollage(board);
      });

      // DELETE
      card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteBoard(board._id, card.querySelector(".delete-btn"), card);
      });

      container.appendChild(card);
    });

  // mark loaded to prevent repeated auto-fetch
  window._boardsLoaded = true;
  if (refreshBtn) refreshBtn.disabled = false;

  } catch (err) {
    console.error('Network error while loading boards', err);
    message.textContent = "❌ Network error.";
  } finally {
    // allow future reloads after a short delay to avoid tight loop
    setTimeout(() => { window._loadingBoards = false; }, 500);
  }
}

function showCollage(board) {
  const wrapper = document.getElementById("collageWrapper");
  const title = document.getElementById("collageTitle");
  const collage = document.getElementById("collage");

  title.textContent = `${board.year} Vision Board`;
  collage.innerHTML = "";
  wrapper.classList.remove("hidden");

  board.images.forEach(img => {
    const div = document.createElement("div");
    div.className = "collage-item";

    div.innerHTML = `
      <img src="${img.src}">
      <div class="collage-overlay">
        <strong>Goal:</strong> ${img.labels?.[0] || "—"}<br>
        <strong>Plan:</strong> ${board.plansByGoal?.[img.labels?.[0]] || "—"}<br>
        <strong>Notes:</strong> ${img.notes || "—"}
      </div>
    `;

    collage.appendChild(div);
  });

  wrapper.scrollIntoView({ behavior: "smooth" });
}

async function deleteBoard(id, btn, card) {
  const token = localStorage.getItem("token");

  btn.disabled = true;
  btn.textContent = "Deleting…";

  const API_BASE = window.__API_BASE__ || 'https://visionboardapp.onrender.com';
    const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/boards/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    card.remove();
  } else {
    btn.textContent = "Failed";
    btn.disabled = false;
  }
}

loadBoards();