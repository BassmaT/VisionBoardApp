// frontend/components/imageLabeler.js

export function showImageLabeler(container, boardData) {
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