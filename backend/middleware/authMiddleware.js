import { createAuthMiddleware } from '@voilajs/appkit/auth';
import dotenv from 'dotenv';

dotenv.config();

const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET',
  onError: (error, req, res, next) => {
    req.logger.error('Authentication error', { error: error.message });

    if (error.message === 'Token has expired') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  },
});

export default auth;
