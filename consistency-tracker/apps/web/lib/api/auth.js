import { apiFetch } from './client';

function signup(payload) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function login(payload) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function logout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

function fetchMe() {
  return apiFetch('/auth/me');
}

function requestEmailVerification(email) {
  return apiFetch('/auth/verify-email/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

function confirmEmailVerification(token) {
  return apiFetch('/auth/verify-email/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

function requestPasswordReset(email) {
  return apiFetch('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

function confirmPasswordReset(token, password, passwordConfirm) {
  return apiFetch('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password, passwordConfirm }),
  });
}

export {
  signup,
  login,
  logout,
  fetchMe,
  requestEmailVerification,
  confirmEmailVerification,
  requestPasswordReset,
  confirmPasswordReset,
};