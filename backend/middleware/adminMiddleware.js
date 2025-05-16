export default function adminAuth(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      req.logger.warn('Unauthorized admin access', {
        userId: req.user?.userId,
        role: req.user?.role,
      });
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  }
  