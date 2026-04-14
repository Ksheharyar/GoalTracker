const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export { API_BASE, apiFetch };