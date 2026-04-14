import { apiFetch } from './client';

function fetchGoals(params = '') {
  const query = params ? `?${params}` : '';
  return apiFetch(`/goals${query}`);
}

function createGoal(payload) {
  return apiFetch('/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateGoal(goalId, payload) {
  return apiFetch(`/goals/${goalId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function archiveGoal(goalId) {
  return apiFetch(`/goals/${goalId}/archive`, {
    method: 'PATCH',
  });
}

function unarchiveGoal(goalId) {
  return apiFetch(`/goals/${goalId}/unarchive`, {
    method: 'PATCH',
  });
}

function activateGoal(goalId) {
  return updateGoal(goalId, { status: 'active' });
}

function deleteGoal(goalId) {
  return apiFetch(`/goals/${goalId}`, {
    method: 'DELETE',
  });
}

export { fetchGoals, createGoal, updateGoal, archiveGoal, unarchiveGoal, activateGoal, deleteGoal };