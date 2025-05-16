import express from 'express';
import db from '../config/db.js';
import adminAuth from '../middleware/adminMiddleware.js';
import { logActivity } from '../services/activityLogger.js';
import cache from '../cache.mjs';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  const logger = req.logger;
  const cacheKey = 'admin_all_users';

  try {
    // Try to get data from cache
    const cachedUsers = await cache.get(cacheKey);
    if (cachedUsers) {
      logger.info('Cache hit for /api/admin/users');
      return res.json({ users: JSON.parse(cachedUsers) });
    }

    // If cache miss, fetch from database
    const users = await db('users')
      .select('id', 'name', 'email', 'role', 'created_at')
      .orderBy('created_at', 'desc');

    // Store the result in cache
    await cache.set(cacheKey, JSON.stringify(users), { ttl: 300 }); // 5 minutes

    logger.info('Fetched users from database');
    await logActivity(req.user.userId, 'admin_view_all_users');
    res.json({ users });
  } catch (error) {
    logger.error('Error fetching users', { error });
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get activity logs (admin only)
router.get('/logs', auth, adminAuth, async (req, res) => {
  const logger = req.logger;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 200;
  const offset = (page - 1) * limit;

  try {
    // Get logs with user details
    const logs = await db('activity_logs')
      .join('users', 'activity_logs.user_id', 'users.id')
      .select(
        'activity_logs.id',
        'activity_logs.action',
        'activity_logs.details',
        'activity_logs.created_at',
        'users.id as user_id',
        'users.name as user_name',
        'users.email as user_email'
      )
      .orderBy('activity_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db('activity_logs').count('id as count');

    logger.info('Admin fetched activity logs', {
      adminId: req.user.userId,
      page,
      limit,
      totalCount: count,
    });

    await logActivity(req.user.userId, 'admin_view_logs');

    res.json({
      logs,
      pagination: {
        page,
        limit,
        totalCount: parseInt(count),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching activity logs', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

export default router;
