# RideAlong

A carpooling app built for university students and commuters. Think of it like Uber, but for people who are already going the same way. Drivers can list their rides and make some money, riders can find affordable transportation to campus or wherever they need to go.

## What's This Built With?

- **Frontend:** React with TypeScript, styled with Tailwind CSS and Bootstrap
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL
- **Build Tool:** Vite

## Project Structure

Here's how things are organized:

```
RideAlong/
├── frontend/          # The React app
│   ├── src/          # All the React components and logic
│   ├── public/       # Static files
│   └── package.json  # Frontend dependencies
├── backend/          # The Express API server
│   ├── src/          # Controllers, routes, middleware, etc.
│   └── package.json  # Backend dependencies
└── package.json      # Root scripts to run both together
```

Pretty straightforward - frontend and backend are separate, which makes it easier to work on each part independently.

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

## Development Info

**Frontend:**

- Runs on http://localhost:5173
- Built with React 19 and Vite
- Uses Tailwind CSS for styling
- Components from shadcn/ui

**Backend:**

- Runs on http://localhost:5000
- Express.js server
- PostgreSQL database
- Written in TypeScript

## API Overview

The backend exposes a REST API. Here are the main endpoints:

### Authentication

- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user info

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update user profile

### Drivers

- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/me` - Get your driver profile
- `POST /api/drivers/:id/approve` - Approve a driver (admin only)

### Rides

- `GET /api/rides` - Get all rides (with optional filters)
- `GET /api/rides/available` - Get rides with available seats
- `POST /api/rides` - Create a new ride (drivers only)
- `PUT /api/rides/:id` - Update a ride

### Bookings

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a booking
- `PUT /api/bookings/:id` - Update a booking
- `POST /api/bookings/:id/cancel` - Cancel a booking

### Payments

- `POST /api/payments` - Create a payment
- `GET /api/payments/user/:userId` - Get payments for a user

There are more endpoints, but these are the main ones. The API follows REST conventions pretty closely.

## Health Check

Want to make sure the backend is running? Hit this endpoint:

```
GET http://localhost:5000/health
```

You should get back a JSON response saying everything is OK and the database is connected.

## Common Issues

### "Failed to fetch" Error

This usually means the frontend can't reach the backend. Make sure:

1. The backend is actually running (`npm run dev:backend`)
2. The health endpoint works: http://localhost:5000/health
3. Your frontend `.env` has `VITE_API_URL=http://localhost:5000/api`
4. You restarted the frontend after changing `.env`

### Database Connection Error

If the backend can't connect to PostgreSQL:

1. Is PostgreSQL running?
2. Are your credentials in `backend/.env` correct?
3. Does the `ridealong` database exist?
4. Try running migrations again: `npm run migrate`

### Port Already in Use

If port 5000 or 5173 is taken:

- Backend: Change `PORT` in `backend/.env`
- Frontend: Update `vite.config.ts` or use `--port` flag

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** - Deep dive into how the app works (architecture, database schema, authentication, etc.)




