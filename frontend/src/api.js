// API utility for backend communication
// Uses environment variable in production, localhost for development

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function chatAPI(message, history) {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function vivaAPI() {
  const res = await fetch(`${BACKEND_URL}/api/viva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function simplifyAPI(notes) {
  const res = await fetch(`${BACKEND_URL}/api/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function simplifyFileAPI(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BACKEND_URL}/api/simplify-file`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function studyGuideAPI(notes) {
  const res = await fetch(`${BACKEND_URL}/api/study-guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function studyGuideFileAPI(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BACKEND_URL}/api/study-guide-file`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
