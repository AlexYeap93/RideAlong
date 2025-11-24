import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();
console.log('Loaded env:', {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});

const runMigration = async () => {
  try {
    console.log('Running database migration...');
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('Database migration completed successfully!');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection verified:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();










