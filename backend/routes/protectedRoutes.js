// backend/routes/protectedRoutes.js
import express from 'express';
import auth from '../middleware/authMiddleware.js'; // Corrected import path
const router = express.Router();

router.get('/protected', auth, (req, res) => {
  const requestLogger = req.logger;
  requestLogger.info('Protected route accessed', { userId: req.user.userId });
  
  res.json({
    message: 'This is a protected route!',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

export default router;
