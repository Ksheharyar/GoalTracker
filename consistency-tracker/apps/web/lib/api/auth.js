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

export { signup, login, logout, fetchMe };