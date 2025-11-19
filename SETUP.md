# Setting Up RideAlong

This guide will walk you through everything step by step.

## What You're Working With

The project is split into two main parts:

- **Frontend** - The React app that users interact with
- **Backend** - The Express server that handles all the API stuff

Both live in separate folders, but we've got some handy scripts to run them together.

## Getting Started

### Step 1: Install Everything

First things first, you need to install all the dependencies. You've got two options:

**The easy way (recommended):**

```bash
npm run install:all
```

This installs everything in one go - root, frontend, and backend dependencies.

**Or if you prefer to do it manually:**

```bash
# Start with the root
npm install

# Then the frontend
cd frontend
npm install

# And finally the backend
cd ../backend
npm install
```

Either way works, just pick what feels right to you.

### Step 2: Set Up the Database

You'll need PostgreSQL running for this. If you don't have it installed, go grab it first.

1. **Start PostgreSQL** (make sure it's actually running)

2. **Create the database:**
   Open up your PostgreSQL client (psql, pgAdmin, whatever you use) and run:

   ```sql
   CREATE DATABASE ridealong;
   ```

   Simple enough, right?

3. **Create the backend environment file:**
   Navigate to the backend folder:

   ```bash
   cd backend
   ```

   Create a new file called `.env` (yes, with the dot at the start). Put this stuff in it:

   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ridealong
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here
   ```

   **Important:** Replace `your_actual_password_here` with your actual PostgreSQL password. Don't forget this step or nothing will work!

4. **Run the database migrations:**
   This creates all the tables and sets up the schema. From the root directory:

   ```bash
   npm run migrate
   ```

   Or if you're in the backend folder:

   ```bash
   npm run migrate
   ```

   You should see some success messages if everything went well.

5. **Seed default users:**
   After running migrations, seed the database with default users (admin, rider, driver). From the backend directory:

   ```bash
   cd backend
   npm run seed
   ```

   This creates three test users:

   - **Admin:** `admin@ridealong.com` / `admin123`
   - **Rider:** `rider@ridealong.com` / `rider`
   - **Driver:** `driver@ridealong.com` / `driver`

   You can use these accounts to test different user roles in the app.

### Step 3: Configure the Frontend

The frontend needs to know where to find the backend API.

1. **Create the frontend environment file:**

   ```bash
   cd frontend
   ```

   Create another `.env` file here with:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   That's it! Just tells the frontend where the backend lives.

## Running the App

Now for the fun part - actually running it!

### Option 1: Run Everything Together

From the root directory:

```bash
npm run dev
```

This fires up both the backend (on port 5000) and frontend (on port 5173) at the same time. Super convenient for development.

### Option 2: Run Them Separately

Sometimes you want separate terminal windows. That's cool too:

**Terminal 1 - Backend:**

```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
```

**From the root directory:**

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build everything for production
- `npm run install:all` - Install all dependencies at once
- `npm run migrate` - Run database migrations
- `npm start` - Start in production mode (after building)

**From the frontend directory:**

- `npm run dev` - Just the frontend dev server
- `npm run build` - Build the frontend
- `npm run preview` - Preview the production build locally

**From the backend directory:**

- `npm run dev` - Just the backend with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run the compiled production server
- `npm run migrate` - Run migrations (same as from root)
- `npm run seed` - Seed default users (admin, rider, driver)
