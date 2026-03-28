const authService = require('./auth.service');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await authService.register({ email, password, firstName, lastName, role });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login({ email, password });

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// GET /api/auth/me  (requires token — we'll protect this next)
const getMe = async (req, res) => {
  try {
    // req.userId is set by the auth middleware (built below)
    const user = await authService.getUserById(req.userId);
    res.status(200).json({ user });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = { register, login, getMe };