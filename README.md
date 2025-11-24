# RideAlong

A carpooling app built for university students and commuters. Think of it like Uber, but for people who are already going the same way. Drivers can list their rides and make some money, riders can find affordable transportation to campus or wherever they need to go.

## What's This Built With?

- **Frontend:** React with TypeScript, styled with Tailwind CSS and Bootstrap
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL
- **Build Tool:** Vite

## Quick Start

Want to get this running right now? Here's the fastest path:

1. **Install everything:**

   ```bash
   npm run install:all
   ```

2. **Set up the database:**

   - Make sure PostgreSQL is running
   - Create a database called `ridealong`
   - Create `backend/.env` with your database credentials (see SETUP.md for details)
   - Run `npm run migrate` to set up the tables
   - Run `npm run seed` (from `backend/` directory) to create default users (admin, rider, driver)

3. **Configure environment variables:**

   - Backend: `backend/.env` (database connection, port, etc.)
   - Frontend: `frontend/.env` (just needs the API URL)

4. **Run it:**

   ```bash
   npm run dev
   ```

   This starts both the backend (port 5000) and frontend (port 5173). Open http://localhost:5173 and you're good to go!

For more detailed setup instructions, check out [SETUP.md](./SETUP.md).

## Available Commands

### From the Root Directory

- `npm run dev` - Start both frontend and backend (development mode)
- `npm run build` - Build both for production
- `npm run install:all` - Install all dependencies at once
- `npm run migrate` - Run database migrations
- `npm start` - Start both in production mode (after building)

### Frontend Commands (from `frontend/`)

- `npm run dev` - Start the Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

### Backend Commands (from `backend/`)

- `npm run dev` - Start the dev server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed default users (admin, rider, driver)

## Development Info

**Frontend:**

- Runs on http://localhost:5173
- Built with React 19 and Vite
- Uses Bootstrap and Tailwind CSS for styling
- Components from shadcn/ui

**Backend:**

- Runs on http://localhost:5000
- Express.js server
- PostgreSQL database
- Written in TypeScript

## API Overview

The backend exposes a REST API. Here are all the endpoints:

### Authentication

- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user info (requires auth)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `GET /api/users/:id/rides` - Get user's booked rides
- `POST /api/users/:id/suspend` - Suspend user (admin only)
- `POST /api/users/:id/unsuspend` - Unsuspend user (admin only)

### Drivers

- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/me` - Get your driver profile
- `POST /api/drivers` - Create a driver profile
- `GET /api/drivers/:id` - Get driver by ID
- `PUT /api/drivers/:id` - Update driver profile (driver or admin)
- `DELETE /api/drivers/:id` - Delete driver (admin only)
- `GET /api/drivers/:id/rides` - Get driver's rides
- `POST /api/drivers/:id/approve` - Approve a driver (admin only)

### Rides

- `GET /api/rides` - Get all rides (with optional filters: destination, date, driverId)
- `GET /api/rides/available` - Get rides with available seats
- `GET /api/rides/destination/:destination` - Get rides by destination
- `GET /api/rides/driver/:driverId` - Get rides by driver
- `GET /api/rides/:id` - Get ride by ID
- `POST /api/rides` - Create a new ride (drivers only)
- `PUT /api/rides/:id` - Update a ride (driver only)
- `DELETE /api/rides/:id` - Delete a ride (driver only)

### Bookings

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/user/:userId` - Get bookings by user
- `GET /api/bookings/ride/:rideId` - Get bookings for a ride
- `GET /api/bookings/ride/:rideId/seats` - Get booked seat numbers for a ride
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a booking
- `PUT /api/bookings/pickup-times` - Update pickup times for multiple bookings (driver only)
- `PUT /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Delete a booking
- `POST /api/bookings/:id/cancel` - Cancel a booking
- `POST /api/bookings/:bookingId/request-additional-amount` - Driver requests additional payment
- `POST /api/bookings/:bookingId/respond-additional-amount` - User accepts/declines additional amount

### Payments

- `GET /api/payments` - Get all payments
- `GET /api/payments/user/:userId` - Get payments for a user
- `GET /api/payments/booking/:bookingId` - Get payments for a booking
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create a payment
- `PUT /api/payments/:id` - Update payment (admin only)

### Payment Methods

- `GET /api/payment-methods` - Get all payment methods for current user
- `GET /api/payment-methods/:id` - Get payment method by ID
- `POST /api/payment-methods` - Add a payment method
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method

### Ratings

- `POST /api/ratings` - Create a rating for a driver
- `GET /api/ratings/driver/:driverId` - Get all ratings for a driver
- `GET /api/ratings/booking/:bookingId` - Get rating for a specific booking

### Issues

- `POST /api/issues` - Report an issue/complaint
- `GET /api/issues` - Get all issues (admin only, with optional filters: status, priority)
- `GET /api/issues/:id` - Get issue by ID (admin or issue owner)
- `PUT /api/issues/:id` - Update issue status/priority/notes (admin only)

The API follows REST conventions and most endpoints require authentication. Check the route files in `backend/src/routes/` for more details on permissions and usage.

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** - Deep dive into how the app works (architecture, database schema, authentication, etc.)
