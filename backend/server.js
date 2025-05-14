// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
} from '@voilajs/appkit/auth';
import { createLogger } from '@voilajs/appkit/logging';

// Create a logger 
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  dirname: 'logs',
  filename: 'restaurant-app.log',
  retentionDays: 7,
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET';
console.log("secret",JWT_SECRET)
const DATABASE_URL = process.env.DATABASE_URL;


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


const db = knex({
  client: 'pg', 
  connection: DATABASE_URL,
  pool: { min: 2, max: 10 },
});


async function setupDatabase() {
  try {
    // Check if users table exists
    const usersTableExists = await db.schema.hasTable('users');
    
    if (!usersTableExists) {
      logger.info('Creating users table...');
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('customer');
        table.timestamps(true, true);
      });
      logger.info('Users table created successfully!');
      
      // Create admin user if it doesn't exist
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await hashPassword(adminPassword);
      
      await db('users').insert({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      
      logger.info('Admin user created', { email: adminEmail });
    } else {
      logger.info('Users table already exists.');
    }
    
    // Create logs table if it doesn't exist
    const logsTableExists = await db.schema.hasTable('activity_logs');
    
    if (!logsTableExists) {
      logger.info('Creating activity_logs table...');
      await db.schema.createTable('activity_logs', (table) => {
        table.increments('id').primary();
        table.integer('user_id');
        table.string('action').notNullable();
        table.text('details');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      });
      logger.info('Activity logs table created successfully!');
    } else {
      logger.info('Activity logs table already exists.');
    }
  } catch (error) {
    logger.error('Database setup failed', { error: error.message, stack: error.stack });
  }
}


setupDatabase();


async function logActivity(userId, action, details = {}) {
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


const auth = createAuthMiddleware({
    secret: JWT_SECRET,
    onError: (error, req, res, next) => {
      req.logger.error('Authentication error', { error: error.message });
      
      if (error.message === 'Token has expired') {
        return res.status(401).json({ message: 'Token has expired' });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Authentication failed' });
    },
});

// Admin auth middleware
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    req.logger.warn('Unauthorized admin access attempt', { 
      userId: req.user?.userId,
      role: req.user?.role
    });
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// --- Authentication Routes ---
app.post('/auth/register', async (req, res) => {
    const requestLogger = req.logger;
    const { name, email, password, role = 'customer' } = req.body;
  
    try {
      // Validate role - only allow 'customer' or 'admin'
      if (role !== 'customer' && role !== 'admin') {
        requestLogger.warn('Registration with unsupported role attempted', { email, attemptedRole: role });
        return res.status(400).json({ message: 'Invalid role specified' });
      }
  
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        requestLogger.info('Registration failed - user exists', { email });
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await hashPassword(password);
  
      // 👇 Use the role from the validate input
      const newUser = { name, email, password: hashedPassword, role };
      const [userId] = await db('users').insert(newUser).returning('id');
  
      // 👇 Use the correct role in the token
      const token = generateToken({ userId, email, role }, { secret: JWT_SECRET });
  
      requestLogger.info('User registered successfully', { userId, email, role });
      await logActivity(userId, 'user_registered', { email, role });
      
      res.status(201).json({ token, user: { id: userId, name, email, role } });
    } catch (error) {
      requestLogger.error('Registration error', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
app.post('/auth/login', async (req, res) => {
  const requestLogger = req.logger;
  const { email, password } = req.body;

  try {
    const user = await db('users').where({ email }).first();
    if (!user) {
      requestLogger.info('Login failed - user not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      requestLogger.warn('Login failed - invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, { secret: JWT_SECRET });
    
    requestLogger.info('User logged in successfully', { userId: user.id, email, role: user.role });
    await logActivity(user.id, 'user_login', { email });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    requestLogger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get user profile
app.get('/auth/profile', auth, async (req, res) => {
  const requestLogger = req.logger;
  
  try {
    const user = await db('users')
      .where({ id: req.user.userId })
      .select('id', 'name', 'email', 'role')
      .first();
      
    if (!user) {
      requestLogger.warn('Profile fetch failed - user not found', { userId: req.user.userId });
      return res.status(404).json({ message: 'User not found' });
    }
    
    requestLogger.info('Profile fetched successfully', { userId: user.id });
    res.json({ user });
  } catch (error) {
    requestLogger.error('Profile fetch error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// --- Protected Route Example ---
app.get('/api/protected', auth, (req, res) => {
  const requestLogger = req.logger;
  requestLogger.info('Protected route accessed', { userId: req.user.userId });
  
  res.json({
    message: 'This is a protected route!',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// --- Admin Routes ---
// Get all users (admin only)
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  const requestLogger = req.logger;
  
  try {
    const users = await db('users')
      .select('id', 'name', 'email', 'role', 'created_at')
      .orderBy('created_at', 'desc');
      
    requestLogger.info('Admin fetched all users', { adminId: req.user.userId, count: users.length });
    await logActivity(req.user.userId, 'admin_view_all_users');
    
    res.json({ users });
  } catch (error) {
    requestLogger.error('Error fetching users', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get activity logs (admin only)
app.get('/api/admin/logs', auth, adminAuth, async (req, res) => {
  const requestLogger = req.logger;
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
    
    requestLogger.info('Admin fetched activity logs', { 
      adminId: req.user.userId, 
      page, 
      limit, 
      totalCount: count 
    });
    
    await logActivity(req.user.userId, 'admin_view_logs');
    
    res.json({ 
      logs, 
      pagination: {
        page,
        limit,
        totalCount: parseInt(count),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    requestLogger.error('Error fetching activity logs', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route handler to serve the frontend for any other request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle specific routes that should return the frontend app
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`, { port: PORT });
  logger.warn(`Server running on http://localhost:${PORT}`, { port: PORT });
  logger.error(`Server running on http://localhost:${PORT}`, { port: PORT });
  logger.debug(`Server running on http://localhost:${PORT}`, { port: PORT });
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`Auth endpoints available at http://localhost:${PORT}/auth/*`);
});