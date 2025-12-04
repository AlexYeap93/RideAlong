import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

interface UserToCreate {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'driver';
  phone?: string;
}

const usersToSeed: UserToCreate[] = [
  {
    email: 'admin@ridealong.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    phone: '+1-403-555-0001'
  },
  {
    email: 'rider@ridealong.com',
    password: 'rider',
    name: 'Rider User',
    role: 'user',
    phone: '+1-403-555-0002'
  },
  {
    email: 'rider1@ridealong.com',
    password: 'rider',
    name: 'Olivia Martin',
    role: 'user',
    phone: '+1-403-555-0101'
  },
  {
    email: 'rider2@ridealong.com',
    password: 'rider',
    name: 'Noah Davis',
    role: 'user',
    phone: '+1-403-555-0102'
  },
  {
    email: 'rider3@ridealong.com',
    password: 'rider',
    name: 'Ava Thompson',
    role: 'user',
    phone: '+1-403-555-0103'
  },
  {
    email: 'rider4@ridealong.com',
    password: 'rider',
    name: 'James Wilson',
    role: 'user',
    phone: '+1-403-555-0104'
  },
  {
    email: 'rider5@ridealong.com',
    password: 'rider',
    name: 'Isabella Moore',
    role: 'user',
    phone: '+1-403-555-0105'
  },
  {
    email: 'rider6@ridealong.com',
    password: 'rider',
    name: 'Lucas Garcia',
    role: 'user',
    phone: '+1-403-555-0106'
  },
  {
    email: 'rider7@ridealong.com',
    password: 'rider',
    name: 'Mia Rodriguez',
    role: 'user',
    phone: '+1-403-555-0107'
  },
  {
    email: 'rider8@ridealong.com',
    password: 'rider',
    name: 'Benjamin Lee',
    role: 'user',
    phone: '+1-403-555-0108'
  },
  {
    email: 'rider9@ridealong.com',
    password: 'rider',
    name: 'Charlotte Kim',
    role: 'user',
    phone: '+1-403-555-0109'
  },
  {
    email: 'rider10@ridealong.com',
    password: 'rider',
    name: 'Henry Patel',
    role: 'user',
    phone: '+1-403-555-0110'
  },
  {
    email: 'driver1@ridealong.com',
    password: 'driver',
    name: 'Alex Johnson',
    role: 'driver',
    phone: '+1-403-555-0201'
  },
  {
    email: 'driver2@ridealong.com',
    password: 'driver',
    name: 'Maya Patel',
    role: 'driver',
    phone: '+1-403-555-0202'
  },
  {
    email: 'driver3@ridealong.com',
    password: 'driver',
    name: 'Liam Smith',
    role: 'driver',
    phone: '+1-403-555-0203'
  },
  {
    email: 'driver4@ridealong.com',
    password: 'driver',
    name: 'Sophia Brown',
    role: 'driver',
    phone: '+1-403-555-0204'
  },
  {
    email: 'driver5@ridealong.com',
    password: 'driver',
    name: 'Ethan Williams',
    role: 'driver',
    phone: '+1-403-555-0205'
  }
];

async function seedUsers() {
  try {
    console.log('Starting user seed script...\n');

    const createdUsers: UserToCreate[] = [];
    const skippedUsers: UserToCreate[] = [];

    for (const userData of usersToSeed) {
      const { email, password, name, role, phone } = userData;
      
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (existingUser.rows.length > 0) {
        console.log(`User already exists: ${normalizedEmail} (${role})`);
        skippedUsers.push(userData);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users (email, password, name, role, phone) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, role, phone, created_at`,
        [normalizedEmail, hashedPassword, name, role, phone || null]
      );

      const user = result.rows[0];
      createdUsers.push(userData);

      console.log(`Created ${role}: ${user.email} (ID: ${user.id})`);
    }
    // Seed drivers and their rides
    await seedDriverAndRides();

    // Seed bookings for some of the rides
    await seedBookingsForSomeRides();

    // Seed completed bookings and ratings
    await seedCompleteBookingsAndRatings();
  
    // Seed issues reported by riders
    await seedIssuesForBookings();

    process.exit(0);
  } catch (error) {
    console.error('Error running seed script:', error);
    process.exit(1);
  }
}

// Seed bookings for a random subset of rides (1-3 seats taken)
async function seedBookingsForSomeRides() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDec = new Date(today.getFullYear(), 11, 31);
    const todayStr = today.toISOString().split('T')[0];
    const endStr = endOfDec.toISOString().split('T')[0];

    // Ensure we have several rider users to assign bookings to
    const ridersRes = await query("SELECT id, email FROM users WHERE role = 'user' AND email LIKE 'rider%@ridealong.com'");
    const riderEmails = [] as { id: string; email: string }[];

    if (ridersRes.rows.length === 0) {
      const sampleRiders = [
        { email: 'rider1@ridealong.com', name: 'Olivia Martin' },
        { email: 'rider2@ridealong.com', name: 'Noah Davis' },
        { email: 'rider3@ridealong.com', name: 'Ava Thompson' },
        { email: 'rider4@ridealong.com', name: 'James Wilson' },
        { email: 'rider5@ridealong.com', name: 'Isabella Moore' }
      ];

      for (const r of sampleRiders) {
        const normalized = r.email.toLowerCase();
        const hashed = await bcrypt.hash('rider', 10);
        const ins = await query(
          `INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email`,
          [normalized, hashed, r.name, 'user']
        );
        riderEmails.push({ id: ins.rows[0].id, email: ins.rows[0].email });
      }
    } else {
      for (const row of ridersRes.rows) {
        riderEmails.push({ id: row.id, email: row.email });
      }
    }

    if (riderEmails.length === 0) {
      console.warn('No riders available to create bookings.');
      return;
    }

    // Make some riders have a pending driver application (is_approved = false)
    for (const r of riderEmails) {
      // 40% chance to have applied
      if (Math.random() > 0.4) continue;

      // Check if driver record already exists for this user
      const drvExists = await query('SELECT id FROM drivers WHERE user_id = $1', [r.id]);
      if (drvExists.rows.length > 0) continue;

      await query(
        `INSERT INTO drivers (user_id, license_number, insurance_proof, car_photo, available_seats, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.id, `LIC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, 'pending-insurance', 'pending-car.jpg', 4, false]
      );
      console.log(`Created pending driver application for rider ${r.email}`);
    }

    // Select rides between today and end of December
    const ridesRes = await query(
      'SELECT id, driver_id, ride_date, ride_time FROM rides WHERE ride_date >= $1 AND ride_date <= $2',
      [todayStr, endStr]
    );

    let totalBookingsCreated = 0;

    for (const ride of ridesRes.rows) {
      // Randomly choose whether to seed bookings for this ride
      if (Math.random() > 0.25) continue;

      // Decide how many bookings to create for this ride (1-3)
      const bookingsToCreate = 1 + Math.floor(Math.random() * 3);

      for (let i = 0; i < bookingsToCreate; i++) {
        // Pick a random rider
        const rider = riderEmails[Math.floor(Math.random() * riderEmails.length)];

        // Skip if this rider already has a booking on this ride
        const exists = await query('SELECT id FROM bookings WHERE ride_id = $1 AND user_id = $2', [ride.id, rider.id]);
        if (exists.rows.length > 0) continue;

        const seats = 1 + Math.floor(Math.random() * 3); // 1-3 seats per booking

        // Use ride_time as pickup_time
        const pickupTime = ride.ride_time || '12:00:00';

        await query(
          `INSERT INTO bookings (user_id, ride_id, number_of_seats, pickup_location, pickup_time, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [rider.id, ride.id, seats, 'Main Campus Bus Stop', pickupTime, 'confirmed']
        );

        totalBookingsCreated++;
      }
    }

    console.log(`Created ${totalBookingsCreated} bookings across rides.`);
  } catch (error) {
    console.error('Error seeding bookings:', error);
  }
}

//this function seeds drivers and rides
async function seedDriverAndRides() {
  try {
    // Get all drivers
    const res = await query("SELECT id, email FROM users WHERE role = 'driver' AND email LIKE 'driver%@ridealong.com'");
    if (res.rows.length === 0) {
      console.warn('No driver users found, skipping ride seeding. Make sure users are seeded.');
      return;
    }

    // Times to seed rides at for each day (multiple rides per day)
    const rideTimes = ['08:00:00', '10:30:00', '12:00:00', '15:00:00', '18:00:00'];

    // Seed rides for each driver user found
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDec = new Date(today.getFullYear(), 11, 31);

    const seededInfo: Array<{ driverEmail: string; createdRides: number }> = [];

    for (const row of res.rows) {
      const userId = row.id as string;
      const driverEmail = row.email as string;

      // Ensure driver record exists
      let driverId: string;
      const driverRes = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverRes.rows.length === 0) {
        const insertDriver = await query(
          `INSERT INTO drivers (user_id, license_number, insurance_proof, car_photo, available_seats, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [userId, `LIC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, 'seed-insurance', 'seed-car.jpg', 4, true]
        );
        driverId = insertDriver.rows[0].id;
        console.log(`Created driver record for ${driverEmail}: ${driverId}`);
      } else {
        driverId = driverRes.rows[0].id;
        console.log(`Found existing driver record for ${driverEmail}: ${driverId}`);
      }

      let createdRidesCount = 0;

      //seed rides from today to end of December
      for (let d = new Date(today); d <= endOfDec; d.setDate(d.getDate() + 1)) {
        const rideDate = new Date(d);
        const rideDateStr = rideDate.toISOString().split('T')[0];

        // For each time slot, insert a ride if not already present
        for (const timeStr of rideTimes) {
          // Skip if ride exists with same driver, date, and time
          const exists = await query(
            'SELECT id FROM rides WHERE driver_id = $1 AND ride_date = $2 AND ride_time = $3',
            [driverId, rideDateStr, timeStr]
          );
          if (exists.rows.length > 0) continue;

          // Randomize price
          const price = 8 + Math.floor(Math.random() * 8);

          await query(
            `INSERT INTO rides (driver_id, destination, ride_date, ride_time, price, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [driverId, 'University of Calgary', rideDateStr, timeStr, price.toFixed(2), 'active']
          );

          createdRidesCount++;
        }
      }

      seededInfo.push({ driverEmail, createdRides: createdRidesCount });
      console.log(`Seeded ${createdRidesCount} rides for ${driverEmail}`);
    }

    console.log('Seeding summary:', seededInfo);
  } catch (error) {
    console.error('Error seeding driver and rides:', error);
  }
}

seedUsers();

// Convert some confirmed bookings to completed and add payments + ratings
async function seedCompleteBookingsAndRatings() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Find confirmed bookings for rides up to today
    const bookingsRes = await query(
      `SELECT b.id as booking_id, b.user_id, b.ride_id, b.number_of_seats, r.driver_id, r.price
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.status = 'confirmed' AND r.ride_date <= $1`,
      [todayStr]
    );

    let ratingsCreated = 0;
    let paymentsCreated = 0;
    let bookingsCompleted = 0;

    for (const b of bookingsRes.rows) {
      // 40% chance to mark for completion
      if (Math.random() > 0.4) continue;

      const bookingId = b.booking_id;
      const userId = b.user_id;
      const rideId = b.ride_id;
      const driverId = b.driver_id;
      const seats = parseInt(b.number_of_seats) || 1;
      const price = parseFloat(b.price) || 10.0;

      // Update booking to completed
      await query('UPDATE bookings SET status = $1 WHERE id = $2', ['completed', bookingId]);
      bookingsCompleted++;

      // Create payment for the booking if none exists
      const existingPayment = await query('SELECT id FROM payments WHERE booking_id = $1', [bookingId]);
      const amount = (seats * price).toFixed(2);
      if (existingPayment.rows.length === 0) {
        await query(
          `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [bookingId, amount, 'card', 'completed', `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`]
        );
        paymentsCreated++;
      }

      // Add a rating for the driver for this booking (only 80% chance to leave rating)
      if (Math.random() <= 0.8) {
        const ratingValue = 3 + Math.floor(Math.random() * 3); // 3-5
        const commentChoices = [
          'Great ride, thank you!',
          'Driver was on time and friendly.',
          'Smooth trip.',
          'Good experience.',
          'Comfortable and safe.'
        ];
        const comment = commentChoices[Math.floor(Math.random() * commentChoices.length)];

        // Avoid duplicate rating for same booking
        const existingRating = await query('SELECT id FROM ratings WHERE booking_id = $1', [bookingId]);
        if (existingRating.rows.length === 0) {
          await query(
            `INSERT INTO ratings (booking_id, user_id, driver_id, ride_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [bookingId, userId, driverId, rideId, ratingValue, comment]
          );
          ratingsCreated++;
        }
      }
    }

    // Recalculate driver total_earnings from payments
    const driversRes = await query('SELECT id FROM drivers');
    for (const drv of driversRes.rows) {
      const sumRes = await query(
        `SELECT COALESCE(SUM(p.amount),0) as total FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN rides r ON b.ride_id = r.id
         WHERE r.driver_id = $1 AND p.payment_status = 'completed'`,
        [drv.id]
      );
      const total = parseFloat(sumRes.rows[0].total) || 0;
      await query('UPDATE drivers SET total_earnings = $1 WHERE id = $2', [total.toFixed(2), drv.id]);
    }

    console.log(`Completed ${bookingsCompleted} bookings, created ${paymentsCreated} payments and ${ratingsCreated} ratings.`);
  } catch (error) {
    console.error('Error seeding completed bookings and ratings:', error);
  }
}

// Seed issues for some bookings to populate admin issues page
async function seedIssuesForBookings() {
  try {
    // Pick some bookings (both completed and confirmed) to attach issues to
    const bookingsRes = await query(
      `SELECT b.id as booking_id, b.user_id, b.ride_id, r.driver_id, d.user_id as driver_user_id, r.ride_date
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN drivers d ON r.driver_id = d.id
       WHERE r.ride_date <= $1
       ORDER BY random()
       LIMIT 200`,
      [new Date().toISOString().split('T')[0]]
    );

    if (bookingsRes.rows.length === 0) {
      console.log('No bookings found to create issues for.');
      return;
    }

    const issueTypes = ['payment', 'driver', 'safety', 'other'];
    const statuses = ['open', 'resolved'];

    let issuesCreated = 0;

    for (const b of bookingsRes.rows) {
      // 30% chance to create an issue for this booking
      if (Math.random() > 0.3) continue;

      const bookingId = b.booking_id;
      const userId = b.user_id;
      const driverUserId = b.driver_user_id;

      const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
      const subject = issueType === 'payment' ? 'Payment not processed' :
                      issueType === 'driver' ? 'Driver was late' :
                      issueType === 'safety' ? 'Unsafe driving' : 'Other issue';
      const description = `Auto-seeded issue: ${subject} on booking ${bookingId}`;

      // Randomly choose status; make some resolved
      const statusRoll = Math.random();
      let status = 'open';
      let adminNotes = null;
      if (statusRoll > 0.85) {
        status = 'resolved';
        adminNotes = 'Issue investigated and resolved by admin.';
      } else if (statusRoll > 0.65) {
        status = 'under_review';
      } else if (statusRoll > 0.6) {
        status = 'closed';
        adminNotes = 'Closed after follow-up.';
      }

      // Avoid duplicate identical issue for same booking
      const exists = await query('SELECT id FROM issues WHERE booking_id = $1 AND subject = $2', [bookingId, subject]);
      if (exists.rows.length > 0) continue;

      // reported_user_id set to driver for driver-related issues, else null
      const reportedUserId = issueType === 'driver' ? driverUserId : null;

      await query(
        `INSERT INTO issues (user_id, booking_id, issue_type, subject, description, reported_user_id, status, priority, admin_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, bookingId, issueType, subject, description, reportedUserId, status, 'medium', adminNotes]
      );

      issuesCreated++;
    }

    console.log(`Created ${issuesCreated} issues for admin review.`);
  } catch (error) {
    console.error('Error seeding issues:', error);
  }
}

