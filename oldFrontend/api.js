// frontend/api.js

const API_BASE = 'http://localhost:5000/api/boards';

export async function createBoard(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function getBoard(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  return await res.json();
}

export async function addImage(boardId, imageData) {
  const res = await fetch(`${API_BASE}/${boardId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageData)
  });
  return await res.json();
}
export async function fetchPinterestImages(url) {
  const res = await fetch(`http://localhost:5000/api/pinterest?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch Pinterest images');
  const data = await res.json();
  return data.images;
}