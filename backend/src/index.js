const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticate } = require('./shared/middleware/auth.middleware');
const authRouter = require('./modules/auth/auth.router');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ERP API is running', version: '1.0.0' });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected route example — we'll add real modules here next
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: `Hello user ${req.userId}, role: ${req.userRole}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// HR routes (add this line)
const hrRouter = require('./modules/hr/hr.router');
app.use('/api/hr', hrRouter);

const projectsRouter = require('./modules/projects/projects.router');
app.use('/api/projects', projectsRouter);

const timecardRouter = require('./modules/timecard/timecard.router');
app.use('/api/timecards', timecardRouter);

const leaveRouter = require('./modules/leave/leave.router');
app.use('/api/leave', leaveRouter);

const financeRouter = require('./modules/finance/finance.router');
app.use('/api/finance', financeRouter);