// ------------------------------------------------------
// STATE
// ------------------------------------------------------
let goals = [];
let plans = {}; 
let images = []; 
let currentPlanGoal = null;

// ------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------
const goalsList = document.getElementById("goalsList");
const imageGrid = document.getElementById("imagePreviewGrid");

const planModal = document.getElementById("planModal");
const planModalTitle = document.getElementById("planModalTitle");
const planModalTextarea = document.getElementById("planModalTextarea");
const planModalCancel = document.getElementById("planModalCancel");
const planModalSave = document.getElementById("planModalSave");

// ------------------------------------------------------
// GENERATE GOALS
// ------------------------------------------------------
document.getElementById("generateGoalsBtn").addEventListener("click", () => {
  goals = document.getElementById("goalsInput").value
    .split(",")
    .map(g => g.trim())
    .filter(g => g.length > 0);

  goalsList.innerHTML = "";

  goals.forEach((goal, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "goal-label";

    wrapper.innerHTML = `
      ${goal}
      <span class="goal-delete" data-index="${index}">✕</span>
    `;

    wrapper.addEventListener("click", (e) => {
      if (e.target.classList.contains("goal-delete")) return;
      openPlanModal(goal);
    });

    goalsList.appendChild(wrapper);
  });

  // Update goal dropdowns in image cards
  updateGoalDropdowns();
});

// ------------------------------------------------------
// DELETE GOAL
// ------------------------------------------------------
goalsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("goal-delete")) {
    const index = Number(e.target.dataset.index);
    goals.splice(index, 1);
    renderGoals();
    updateGoalDropdowns();
  }
});

function renderGoals() {
  goalsList.innerHTML = "";
  goals.forEach((goal, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "goal-label";
    wrapper.innerHTML = `${goal} <span class="goal-delete" data-index="${index}">✕</span>`;
    goalsList.appendChild(wrapper);
  });
}

// ------------------------------------------------------
// PLAN MODAL
// ------------------------------------------------------
function openPlanModal(goal) {
  currentPlanGoal = goal;
  planModalTitle.textContent = `Plans for "${goal}"`;
  planModalTextarea.value = plans[goal] || "";
  planModal.classList.remove("hidden");
}

planModalCancel.addEventListener("click", () => {
  planModal.classList.add("hidden");
  currentPlanGoal = null;
});

planModalSave.addEventListener("click", () => {
  if (currentPlanGoal) {
    plans[currentPlanGoal] = planModalTextarea.value.trim();
  }
  planModal.classList.add("hidden");
  currentPlanGoal = null;
});

planModal.addEventListener("click", (e) => {
  if (e.target === planModal) {
    planModal.classList.add("hidden");
    currentPlanGoal = null;
  }
});

// ------------------------------------------------------
// IMAGE UPLOAD
// ------------------------------------------------------
document.getElementById("imageUpload").addEventListener("change", (e) => {
  [...e.target.files].forEach(file => {
    const url = URL.createObjectURL(file);
    addImagePreview(url);
  });
});

// ------------------------------------------------------
// DRAG & DROP
// ------------------------------------------------------
const dropzone = document.querySelector(".upload-dropzone");

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("drag-over");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");

  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith("image/"));
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    addImagePreview(url);
  });
});

// ------------------------------------------------------
// ADD IMAGE BY URL
// ------------------------------------------------------
document.getElementById("addUrlImages").addEventListener("click", () => {
  const urls = document.getElementById("imageUrls").value
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  urls.forEach(url => addImagePreview(url));
  document.getElementById("imageUrls").value = "";
});

// ------------------------------------------------------
// IMAGE PREVIEW CARD
// ------------------------------------------------------
function addImagePreview(url) {
  const index = images.length;

  const wrapper = document.createElement("div");
  wrapper.className = "image-card";

  wrapper.innerHTML = `
    <button class="remove-img" data-index="${index}">✕</button>
    <img src="${url}" class="thumbnail">
    <div class="overlay">
      <textarea class="image-note" placeholder="Notes"></textarea>
      <select class="image-goal-select">
        <option value="">Assign Goal</option>
        ${goals.map(g => `<option value="${g}">${g}</option>`).join("")}
      </select>
    </div>
  `;

  imageGrid.appendChild(wrapper);

  const imgState = { url, note: "", goal: "" };
  images.push(imgState);

  wrapper.querySelector(".image-note").addEventListener("input", (e) => {
    imgState.note = e.target.value;
  });

  wrapper.querySelector(".image-goal-select").addEventListener("change", (e) => {
    imgState.goal = e.target.value;
  });

  wrapper.querySelector(".remove-img").addEventListener("click", () => {
    images.splice(index, 1);
    wrapper.remove();
  });
}

function updateGoalDropdowns() {
  document.querySelectorAll(".image-goal-select").forEach(select => {
    select.innerHTML = `
      <option value="">Assign Goal</option>
      ${goals.map(g => `<option value="${g}">${g}</option>`).join("")}
    `;
  });
}

// ------------------------------------------------------
// CREATE BOARD
// ------------------------------------------------------
document.getElementById("createBoardBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const year = document.getElementById("boardYear").value.trim();
  const msg = document.getElementById("createMessage");

  if (!year || goals.length === 0) {
    msg.textContent = "Please fill year and goals before creating.";
    msg.style.color = "#d94f8c";
    return;
  }

  const boardData = {
    year: Number(year),
    goals,
    plansByGoal: plans,
    images: images.map(img => ({
      src: img.url,
      labels: img.goal ? [img.goal] : [],
      notes: img.note || ""
    }))
  };

  msg.innerHTML = `<div class="loader"></div>`;

  try {
    const res = await fetch("https://visionboardapp.onrender.com/api/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(boardData)
    });

    if (res.ok) {
      msg.textContent = "✅ Board created!";
      msg.style.color = "#4CAF50";
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    } else {
      msg.textContent = "❌ Error creating board.";
    }
  } catch {
    msg.textContent = "❌ Network error.";
  }
});