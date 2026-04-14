import { apiFetch } from './client';

function withQuery(path, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });

  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function fetchDashboardSummary(goalId) {
  return apiFetch(withQuery('/dashboard/summary', { goalId }));
}

function fetchContributionGrid(goalId) {
  return apiFetch(withQuery('/dashboard/grid', { goalId }));
}

function fetchAnalytics({ goalId, scope } = {}) {
  return apiFetch(withQuery('/dashboard/analytics', { goalId, scope }));
}

function fetchReminder(goalId) {
  return apiFetch(withQuery('/dashboard/reminder', { goalId }));
}

export { fetchDashboardSummary, fetchContributionGrid, fetchAnalytics, fetchReminder };