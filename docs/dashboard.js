async function loadBoards() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("boardsContainer");
  const title = document.getElementById("dashboardTitle");
  const message = document.getElementById("dashboardMessage");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://visionboardapp.onrender.com/api/boards/my", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const boards = await res.json();

    if (!res.ok || !Array.isArray(boards)) {
      message.textContent = "❌ Error loading boards.";
      return;
    }

    if (boards.length === 0) {
      message.textContent = "You don’t have any boards yet.";
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

  } catch (err) {
    message.textContent = "❌ Network error.";
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

  const res = await fetch(`https://visionboardapp.onrender.com/api/boards/${id}`, {
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