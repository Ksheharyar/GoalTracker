const app = require('./app');
const { connectDb } = require('./config/db');
const { port, nodeEnv } = require('./config/env');

async function startServer() {
  await connectDb();

  app.listen(port, () => {
    console.log(`GoalTracker API running on http://localhost:${port} (${nodeEnv})`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});