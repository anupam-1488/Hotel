import db from '../config/db.js';
import logger from '../config/logger.js';

export async function logActivity(userId, action, details = {}) {
  try {
    await db('activity_logs').insert({
      user_id: userId,
      action,
      details: JSON.stringify(details),
    });
    logger.info('Activity logged', { userId, action, details });
  } catch (error) {
    logger.error('Failed to log activity', { error: error.message, userId, action });
  }
}
