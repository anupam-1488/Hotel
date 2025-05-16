// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase } from './database/setupDatabase.js';
import logger from './config/logger.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js'; // Import protected routes


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const requestLogger = logger.child({
    requestId: Math.random().toString(36).substring(2, 15),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  req.logger = requestLogger;
  requestLogger.info('Request received');
  res.on('finish', () => {
    requestLogger.info('Response sent', {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    });
  });
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', protectedRoutes); // Mount the protected routes


// Catch-all route for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Database setup and server start
setupDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`, { port: PORT });
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/*`);
    console.log(`Auth endpoints available at http://localhost:${PORT}/auth/*`);
  });
});
