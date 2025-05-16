import express from 'express';
import { hashPassword, comparePassword, generateToken } from '@voilajs/appkit/auth';
import db from '../config/db.js';
import { logActivity } from '../services/activityLogger.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  const logger = req.logger;

  try {
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await hashPassword(password);
    const [userId] = await db('users').insert({
      name, email, password: hashed, role,
    }).returning('id');

    const token = generateToken({ userId, email, role }, { secret: process.env.JWT_SECRET });
    await logActivity(userId, 'user_registered', { email, role });

    res.status(201).json({ token, user: { id: userId, name, email, role } });
  } catch (error) {
    logger.error('Registration failed', { error });
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const logger = req.logger;

  try {
    const user = await db('users').where({ email }).first();
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role }, { secret: process.env.JWT_SECRET });
    await logActivity(user.id, 'user_login', { email });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Login failed', { error });
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/profile', auth, async (req, res) => {
  const logger = req.logger;
  try {
    const user = await db('users').where({ id: req.user.userId }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    logger.error('Profile fetch failed', { error });
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

export default router;
