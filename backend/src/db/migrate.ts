import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool, PoolConfig } from 'pg';
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
  const dbName = process.env.DB_NAME || 'ridealong';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbPassword = process.env.DB_PASSWORD || '';

  // First, connect to the default 'postgres' database to check/create our database
  const adminPoolConfig: PoolConfig = {
    user: dbUser,
    host: dbHost,
    database: 'postgres', // Connect to default postgres database
    password: dbPassword,
    port: dbPort,
  };

  const adminPool = new Pool(adminPoolConfig);

  try {
    console.log('Checking if database exists...');
    
    // Check if database exists
    const dbCheckResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully!`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    // Close admin connection
    await adminPool.end();

    // Now connect to the target database and run migration
    const poolConfig: PoolConfig = {
      user: dbUser,
      host: dbHost,
      database: dbName,
      password: dbPassword,
      port: dbPort,
    };

    const pool = new Pool(poolConfig);

    console.log('Running database migration...');
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified:', result.rows[0]);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await adminPool.end().catch(() => {});
    process.exit(1);
  }
};

runMigration();









