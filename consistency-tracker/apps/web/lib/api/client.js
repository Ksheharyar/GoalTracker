function normalizeApiBase(rawBase) {
  const base = (rawBase || '').trim();

  if (!base) {
    return 'http://localhost:4000/api';
  }

  const withoutTrailingSlash = base.replace(/\/+$/, '');
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);

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