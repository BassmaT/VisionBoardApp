async function loadBoard() {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const boardId = params.get("id");

  if (!boardId) {
    document.getElementById("collage").innerHTML = "<p>❌ No board ID provided.</p>";
    return;
  }

  const res = await fetch(`https://visionboardapp.onrender.com/api/boards/${boardId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const board = await res.json();

  renderCollage(board);
}

function renderCollage(board) {
  const collage = document.getElementById("collage");
  collage.innerHTML = "";

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
}

loadBoard();