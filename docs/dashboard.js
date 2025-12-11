async function loadBoards() {
  const token = localStorage.getItem("token");

  // Fetch boards
  const res = await fetch("https://visionboardapp.onrender.com/api/boards/my", {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const boards = await res.json();

  // DOM elements
  const container = document.getElementById("boardsContainer");
  const title = document.getElementById("dashboardTitle");
  const message = document.getElementById("dashboardMessage");
  const createBtn = document.getElementById("createBoardBtn");
  const viewBtn = document.getElementById("viewBoardsBtn");

  // Create button ALWAYS works
  createBtn.onclick = () => window.location.href = "create.html";

  // Username greeting
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    title.textContent = `Hi ${user.username} 👋`;
  }

  // ✅ EMPTY STATE
  if (!boards.length) {
    message.textContent = "You don’t have any boards yet.";

    // View button disabled
    viewBtn.disabled = true;
    viewBtn.style.opacity = "0.5";
    viewBtn.style.cursor = "not-allowed";
    viewBtn.title = "No boards to view yet.";

    return; // stop here
  }

  // ✅ If boards exist → enable View button
  message.textContent = "Here are your saved boards:";

  viewBtn.disabled = false;
  viewBtn.style.opacity = "1";
  viewBtn.style.cursor = "pointer";
  viewBtn.title = "View your existing boards";

  viewBtn.onclick = () => {
    document.getElementById("boardsContainer").scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Render boards
  boards.forEach(board => {
    const div = document.createElement("div");
    div.classList.add("board-card");

    div.innerHTML = `
      <h3>${board.year} Vision Board</h3>
      <p>${board.goals.length} goals</p>
      <button onclick="openBoard('${board._id}')">Open</button>
    `;

    container.appendChild(div);
  });
}

function openBoard(id) {
  window.location.href = `board.html?id=${id}`;
}

loadBoards();