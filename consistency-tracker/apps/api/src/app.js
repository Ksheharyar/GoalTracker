const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { allowedOrigins } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GoalTracker API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;