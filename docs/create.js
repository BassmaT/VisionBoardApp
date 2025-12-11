// State
let goals = [];
let plans = {};         // { goal: "plan text" }
let images = [];        // [{ url, note, goal }]
let currentPlanGoal = null;

// DOM refs
const goalsList = document.getElementById("goalsList");
const imageGrid = document.getElementById("imagePreviewGrid");
const planModal = document.getElementById("planModal");
const planModalTitle = document.getElementById("planModalTitle");
const planModalTextarea = document.getElementById("planModalTextarea");
const planModalCancel = document.getElementById("planModalCancel");
const planModalSave = document.getElementById("planModalSave");

// Generate goal labels
document.getElementById("generateGoalsBtn").addEventListener("click", () => {
  goals = document.getElementById("goalsInput").value
    .split(",")
    .map(g => g.trim())
    .filter(g => g.length > 0);

  goalsList.innerHTML = "";

  goals.forEach(goal => {
    const btn = document.createElement("button");
    btn.textContent = goal;
    btn.className = "goal-label";
    btn.onclick = () => openPlanModal(goal);
    goalsList.appendChild(btn);
  });
});

// Open floating plan modal
function openPlanModal(goal) {
  currentPlanGoal = goal;
  planModalTitle.textContent = `Plans for "${goal}"`;
  planModalTextarea.value = plans[goal] || "";
  planModal.classList.remove("hidden");
}

// Close modal (no save)
planModalCancel.addEventListener("click", () => {
  planModal.classList.add("hidden");
  currentPlanGoal = null;
});

// Save plan and close modal
planModalSave.addEventListener("click", () => {
  if (currentPlanGoal) {
    plans[currentPlanGoal] = planModalTextarea.value.trim();
  }
  planModal.classList.add("hidden");
  currentPlanGoal = null;
});

// CLICK OUTSIDE MODAL closes it
planModal.addEventListener("click", (e) => {
  if (e.target === planModal) {
    planModal.classList.add("hidden");
    currentPlanGoal = null;
  }
});

// IMAGE UPLOAD (file)
const imageUploadInput = document.getElementById("imageUpload");
imageUploadInput.addEventListener("change", (e) => {
  [...e.target.files].forEach(file => {
    const url = URL.createObjectURL(file);
    addImagePreview(url);
  });
});

// IMAGE DROPZONE (optional basic support)
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

// IMAGE URLs
document.getElementById("addUrlImages").addEventListener("click", () => {
  const urls = document.getElementById("imageUrls").value
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  urls.forEach(url => addImagePreview(url));
  document.getElementById("imageUrls").value = "";
});

// Create image preview card
function addImagePreview(url) {
  const wrapper = document.createElement("div");
  wrapper.className = "image-card";
  wrapper.innerHTML = `
    <div class="image-hover">
      <img src="${url}" class="thumbnail">
      <div class="overlay">
        <textarea class="image-note" placeholder="Notes for this image"></textarea>
        <select class="image-goal-select">
          <option value="">Assign Goal</option>
          ${goals.map(g => `<option value="${g}">${g}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
  imageGrid.appendChild(wrapper);

  images.push({
    url,
    note: "",
    goal: ""
  });

  const noteTextarea = wrapper.querySelector(".image-note");
  const goalSelect = wrapper.querySelector(".image-goal-select");
  const imgState = images[images.length - 1];

  noteTextarea.addEventListener("input", () => {
    imgState.note = noteTextarea.value;
  });

  goalSelect.addEventListener("change", () => {
    imgState.goal = goalSelect.value;
  });
}

// FINAL BOARD CREATION
document.getElementById("createBoardBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const name = document.getElementById("boardName").value.trim();
  const year = document.getElementById("boardYear").value.trim();
  const msg = document.getElementById("createMessage");

  if (!name || !year || goals.length === 0) {
    msg.textContent = "Please fill name, year and goals before creating.";
    msg.style.color = "#d94f8c";
    return;
  }

  const boardData = {
  year,
  goals,
  plansByGoal: plans,
  images: images.map(img => ({
    src: img.url,
    labels: img.goal ? [img.goal] : [],
    notes: img.note || ""
  }))
};

  try {
    const res = await fetch("https://visionboardapp.onrender.com/api/boards/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(boardData)
    });

    const data = await res.json();

    if (res.ok) {
      msg.textContent = "✅ Board created!";
      msg.style.color = "#4CAF50";
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    } else {
      msg.textContent = "❌ Error: " + (data.message || "Something went wrong.");
      msg.style.color = "#d94f8c";
    }
  } catch (err) {
    msg.textContent = "❌ Network error. Try again.";
    msg.style.color = "#d94f8c";
  }
});