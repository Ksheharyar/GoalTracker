const WEB_ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  analytics: '/analytics',
  goals: '/goals',
};

const API_ROUTES = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  goals: '/api/goals',
  sessions: '/api/sessions',
  dashboard: {
    summary: '/api/dashboard/summary',
    grid: '/api/dashboard/grid',
    analytics: '/api/dashboard/analytics',
    reminder: '/api/dashboard/reminder',
  },
};

module.exports = {
  WEB_ROUTES,
  API_ROUTES,
};