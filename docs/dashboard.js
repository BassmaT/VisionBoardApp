async function loadBoards() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch("https://visionboardapp.onrender.com/api/boards/my", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const boards = await res.json();
  const container = document.getElementById("boardsContainer");

  if (!boards.length) {
    container.innerHTML = "<p>You have no boards yet.</p>";
    return;
  }

  boards.forEach(board => {
    const div = document.createElement("div");
    div.classList.add("board-card");

    div.innerHTML = `
      <h3>${board.ownerName}'s ${board.year} Board</h3>
      <p>${board.goals.length} goals</p>
      <button onclick="openBoard('${board._id}')">Open</button>
    `;

    container.appendChild(div);
  });
}

function openBoard(id) {
  window.location.href = `board.html?id=${id}`;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

loadBoards();