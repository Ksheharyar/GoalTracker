const routes = require('./constants/routes');
const date = require('./utils/date');
const analytics = require('./utils/analytics');

module.exports = {
  ...routes,
  ...date,
  ...analytics,
};