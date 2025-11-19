import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

interface UserToCreate {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'driver';
}

const usersToSeed: UserToCreate[] = [
  {
    email: 'admin@ridealong.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'rider@ridealong.com',
    password: 'rider',
    name: 'Rider User',
    role: 'user'
  },
  {
    email: 'driver@ridealong.com',
    password: 'driver',
    name: 'Driver User',
    role: 'driver'
  }
];

async function seedUsers() {
  try {
    console.log('Starting user seed script...\n');

    const createdUsers: UserToCreate[] = [];
    const skippedUsers: UserToCreate[] = [];

    for (const userData of usersToSeed) {
      const { email, password, name, role } = userData;
      
      // Normalize email (lowercase, trim)
      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (existingUser.rows.length > 0) {
        console.log(`user already exists: ${normalizedEmail} (${role})`);
        skippedUsers.push(userData);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, role, created_at`,
        [normalizedEmail, hashedPassword, name, role]
      );

      const user = result.rows[0];
      createdUsers.push(userData);

      console.log(`Created ${role}: ${user.email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running seed script:', error);
    process.exit(1);
  }
}

seedUsers();

