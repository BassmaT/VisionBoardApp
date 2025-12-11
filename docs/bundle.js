// frontend/api.js

const API_BASE = 'https://visionboardapp.onrender.com/api/boards';

async function createBoard(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  return await res.json();
}

async function getBoard(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await res.json();
}

async function addImage(boardId, imageData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/${boardId}/images`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(imageData)
  });

  return await res.json();
}

async function fetchPinterestImages(url) {
  const res = await fetch(`https://visionboardapp.onrender.com/api/pinterest?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch Pinterest images');
  const data = await res.json();
  return data.images;
}

// frontend/components/app.js
//import { setupForm } from './components/form.js';

document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('formContainer');
  setupForm(formContainer);

  // Dark mode toggle
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('darkmode');
      toggle.textContent = document.body.classList.contains('darkmode') ? '☀️' : '🌙';
    });
  }
});

// ✅ Load board from backend instead of localStorage
async function loadBoard() {
  const params = new URLSearchParams(window.location.search);
  const boardId = params.get("id");
  const collage = document.getElementById("collage");

  if (!boardId) {
    collage.innerHTML = "<p>No board ID found.</p>";
    return;
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`https://visionboardapp.onrender.com/api/boards/${boardId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!data || !data.images) {
    collage.innerHTML = "<p>Board not found.</p>";
    return;
  }

  // ✅ Render images
  data.images.forEach(img => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("collage-item");

    const image = document.createElement("img");
    image.src = img.src;

    const overlay = document.createElement("div");
    overlay.classList.add("collage-overlay");

    overlay.innerHTML = `
      <strong>Goals:</strong> ${img.labels.join(", ") || "None"}
      <br>
      <strong>Notes:</strong> ${img.notes || "—"}
    `;

    wrapper.appendChild(image);
    wrapper.appendChild(overlay);
    collage.appendChild(wrapper);
  });
}

// ✅ Run loader
loadBoard();

// frontend/components/form.js
//import { createBoard } from '../api.js';
//import { showImageLabeler } from './imageLabeler.js';

function setupForm(container) {
  container.innerHTML = `
    <form id="boardForm">
      <label>
        Name:
        <input type="text" name="ownerName" required>
      </label>

      <label>
        Year:
        <input type="number" name="year" required>
      </label>

      <label>
        Goals (comma separated):
        <input type="text" name="goals" required>
      </label>

      

      <button type="button" id="saveGoalsBtn" class="save-goals-btn">Save Goals</button>

      <div id="goalLabels" class="goal-labels hidden"></div>

      <div id="imageSection" class="hidden">
        <h3 style="margin-top:1rem;">Add Images</h3>

        <label class="custom-file-upload">
          <input type="file" id="imageUpload" accept="image/*" multiple hidden>
          <span>Select Images</span>
        </label>

        <label>
          Paste Image URLs (one per line):
          <textarea id="imageUrls" placeholder="https://example.com/image1.jpg"></textarea>
        </label>

        <button type="button" id="addUrlImagesBtn">Add URL Images</button>

        <div id="imagePreview" class="image-preview"></div>
      </div>

      <button type="submit" id="createBoardBtn" class="hidden">Create Board</button>
    </form>

    <div id="boardResult"></div>
  `;

  // DOM references
  const form = container.querySelector('#boardForm');
  const nameInput = form.querySelector('input[name="ownerName"]');
  const title = document.getElementById('dynamicTitle');

  const saveGoalsBtn = form.querySelector('#saveGoalsBtn');
  const goalLabelsContainer = form.querySelector('#goalLabels');
  const imageSection = form.querySelector('#imageSection');
  const createBoardBtn = form.querySelector('#createBoardBtn');

  const uploadInput = form.querySelector('#imageUpload');
  const customUploadBtn = form.querySelector('.custom-file-upload');
  const urlTextarea = form.querySelector('#imageUrls');
  const addUrlBtn = form.querySelector('#addUrlImagesBtn');
  const imagePreview = form.querySelector('#imagePreview');

  const sidePanel = document.getElementById('sidePanel');
  const closePanelBtn = document.getElementById('closePanel');
  const panelGoals = document.getElementById('panelGoals');
  const saveImageLabelsBtn = document.getElementById('saveImageLabels');
  const plansPopup = document.getElementById('plansPopup');

  const goalPlansPopup = document.getElementById('goalPlansPopup');
const goalPlansTitle = document.getElementById('goalPlansTitle');
const goalPlansInput = document.getElementById('goalPlansInput');
const saveGoalPlansBtn = document.getElementById('saveGoalPlansBtn');

let currentGoalForPlans = null;

function openGoalPlansPopup(goal) {
  currentGoalForPlans = goal;
  goalPlansTitle.textContent = `Plans for: ${goal}`;
  goalPlansInput.value = (plansByGoal[goal] || []).join("\n");
  goalPlansPopup.classList.remove('hidden');
}

saveGoalPlansBtn.addEventListener('click', () => {
  const lines = goalPlansInput.value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  plansByGoal[currentGoalForPlans] = lines;
  goalPlansPopup.classList.add('hidden');
});
  let selectedImages = [];
  let goals = [];
  let plansByGoal = {};
  let imageMeta = {}; // { imageSrc: [labels] }
  let currentImageForLabeling = null;

  // Live update title
  nameInput.addEventListener('input', () => {
    const name = nameInput.value.trim();
    title.textContent = name
      ? `Hi ${name}, create your vision board here`
      : 'Hi … create your vision board here';
  });

  // Save Goals Flow
  saveGoalsBtn.addEventListener('click', () => {
  const formData = new FormData(form);

  const ownerName = formData.get('ownerName').trim();
  const year = formData.get('year').trim();
  const goalsInput = formData.get('goals').trim();

  if (!ownerName || !year || !goalsInput) {
    alert("Please fill all fields before saving goals.");
    return;
  }

  goals = goalsInput.split(',').map(g => g.trim());
  plansByGoal = {}; // empty for now

  // Render goal labels
  goalLabelsContainer.innerHTML = "";
  goals.forEach(goal => {
    const label = document.createElement('span');
    label.classList.add('goal-label');
    label.textContent = goal;

    // ✅ Click to open popup
    label.addEventListener('click', () => openGoalPlansPopup(goal));

    // ✅ Hover to show plans
    label.addEventListener('mouseenter', (e) => {
      const plansList = (plansByGoal[goal] || [])
        .map(p => `<li>${p}</li>`)
        .join('');

      plansPopup.innerHTML = `<ul>${plansList}</ul>`;
      plansPopup.classList.remove('hidden');

      const rect = e.target.getBoundingClientRect();
      plansPopup.style.top = rect.bottom + 8 + "px";
      plansPopup.style.left = rect.left + "px";
    });

    label.addEventListener('mouseleave', () => {
      plansPopup.classList.add('hidden');
    });

    goalLabelsContainer.appendChild(label);
  });

  goalLabelsContainer.classList.remove('hidden');
  imageSection.classList.remove('hidden');
  createBoardBtn.classList.remove('hidden');

  saveGoalsBtn.classList.add('hidden');
});

  // Custom file upload button
  customUploadBtn.addEventListener('click', () => uploadInput.click());

  uploadInput.addEventListener('change', () => {
    const files = Array.from(uploadInput.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target.result;
        selectedImages.push(src);
        imageMeta[src] = [];
        addPreviewImage(src);
      };
      reader.readAsDataURL(file);
    });
  });

  // Handle pasted URLs
  addUrlBtn.addEventListener('click', () => {
    const urls = urlTextarea.value
      .split(/\n|,/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http'));

    urls.forEach(url => {
      selectedImages.push(url);
      imageMeta[url] = [];
      addPreviewImage(url);
    });

    urlTextarea.value = "";
  });

  // Add preview image with Assign Labels button
  function addPreviewImage(src) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('preview-wrapper');

  const img = document.createElement('img');
  img.src = src;
  img.classList.add('preview-image');

  const labelDisplay = document.createElement('div');
  labelDisplay.classList.add('image-labels');
  labelDisplay.textContent = "No labels yet";

  const notesField = document.createElement('textarea');
  notesField.classList.add('image-notes');
  notesField.placeholder = "Add notes about this image...";
  notesField.addEventListener('input', () => {
    if (!imageMeta[src]) imageMeta[src] = { labels: [], notes: "" };
    imageMeta[src].notes = notesField.value;
  });

  const btn = document.createElement('button');
  btn.type = "button";
  btn.textContent = "Assign Labels";
  btn.classList.add('assign-labels-btn');

  // ✅ THIS WAS MISSING
  btn.addEventListener('click', () => openSidePanel(src));

  wrapper.appendChild(img);
  wrapper.appendChild(labelDisplay);
  wrapper.appendChild(notesField);
  wrapper.appendChild(btn);
  imagePreview.appendChild(wrapper);

  wrapper._labelDisplay = labelDisplay;
}

  // Open side panel
  function openSidePanel(imageSrc) {
    currentImageForLabeling = imageSrc;

    panelGoals.innerHTML = goals
      .map(goal => {
        const checked = imageMeta[imageSrc]?.labels?.includes(goal) ? "checked" : "";
        return `
          <label class="panel-goal-item">
            <input type="checkbox" value="${goal}" ${checked}>
            <span>${goal}</span>
            <ul class="panel-plans">
              ${plansByGoal[goal].map(p => `<li>${p}</li>`).join('')}
            </ul>
          </label>
        `;
      })
      .join('');

    sidePanel.classList.remove('hidden');
    sidePanel.classList.add('open');
  }

  // Close panel
  closePanelBtn.addEventListener('click', () => {
    sidePanel.classList.remove('open');
    setTimeout(() => sidePanel.classList.add('hidden'), 300);
  });

  // Save labels for image
 saveImageLabelsBtn.addEventListener('click', () => {
  const checkboxes = panelGoals.querySelectorAll('input[type="checkbox"]');
  const selected = [];

  checkboxes.forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });

  if (!imageMeta[currentImageForLabeling]) {
    imageMeta[currentImageForLabeling] = { labels: [], notes: "" };
  }

  imageMeta[currentImageForLabeling].labels = selected;

  // Update label display
  const wrappers = imagePreview.querySelectorAll('.preview-wrapper');
  wrappers.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (img.src === currentImageForLabeling && wrapper._labelDisplay) {
      wrapper._labelDisplay.textContent = selected.length
        ? `Labels: ${selected.join(', ')}`
        : "No labels yet";
    }
  });

  closePanelBtn.click();
});

  // Create board
  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const boardData = {
    ownerName: formData.get('ownerName'),
    year: parseInt(formData.get('year')),
    goals,
    plansByGoal,
    images: selectedImages.map(src => ({
      src,
      labels: imageMeta[src]?.labels || imageMeta[src] || [],
      notes: imageMeta[src]?.notes || ""
    }))
  };

 // ✅ Save board to backend
const savedBoard = await createBoard(boardData);

// ✅ Redirect to board page with ID
window.location.href = `board.html?id=${savedBoard._id}`;
});
}
// frontend/components/imageLabeler.js

function showImageLabeler(container, boardData) {
  container.innerHTML = `
    <h2>Assign goals & notes to your images</h2>

    <div class="labeler-grid"></div>

    <button id="finishBoard">Finish Board</button>
  `;

  const grid = container.querySelector('.labeler-grid');

  boardData.images.forEach((url, index) => {
    const item = document.createElement('div');
    item.classList.add('labeler-item');

    item.innerHTML = `
      <img src="${url}" class="labeler-img">

      <label>Goal:
        <select data-index="${index}" class="goal-select">
          ${boardData.goals.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
      </label>

      <label>Notes:
        <textarea data-index="${index}" class="note-input"></textarea>
      </label>
    `;

    grid.appendChild(item);
  });

  document.getElementById('finishBoard').addEventListener('click', () => {
    const goalSelects = container.querySelectorAll('.goal-select');
    const noteInputs = container.querySelectorAll('.note-input');

    boardData.imageMeta = boardData.images.map((url, i) => ({
      url,
      goal: goalSelects[i].value,
      notes: noteInputs[i].value
    }));

    console.log("✅ Final board with labels + notes:", boardData);

    container.innerHTML = `<p>✅ Labeling complete! Ready for collage.</p>`;
  });
}