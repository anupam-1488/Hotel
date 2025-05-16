import db from '../config/db.js';
import logger from '../config/logger.js';
import { hashPassword } from '@voilajs/appkit/auth';

export async function setupDatabase() {
  try {
    if (!(await db.schema.hasTable('users'))) {
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('customer');
        table.timestamps(true, true);
      });

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashed = await hashPassword(adminPassword);

      await db('users').insert({ name: 'Admin User', email: adminEmail, password: hashed, role: 'admin' });
    }

    if (!(await db.schema.hasTable('activity_logs'))) {
      await db.schema.createTable('activity_logs', (table) => {
        table.increments('id').primary();
        table.integer('user_id');
        table.string('action');
        table.text('details');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      });
    }

    logger.info('Database setup complete.');
  } catch (error) {
    logger.error('Database setup error', { error });
  }
}
