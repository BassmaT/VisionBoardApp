const data = JSON.parse(localStorage.getItem("visionBoardData"));
const collage = document.getElementById("collage");

if (!data) {
  collage.innerHTML = "<p>No board data found.</p>";
} else {
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
