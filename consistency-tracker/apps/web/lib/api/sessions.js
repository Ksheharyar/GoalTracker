import { API_BASE, apiFetch } from './client';

function fetchSessions(params = '') {
  const query = params ? `?${params}` : '';
  return apiFetch(`/sessions${query}`);
}

function saveSession(payload) {
  return apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function autoSaveSession(payload) {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to auto-save session.');
  }

  return data;
}

export { fetchSessions, saveSession, autoSaveSession };