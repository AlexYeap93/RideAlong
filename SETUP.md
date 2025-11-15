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

This way you can see the logs from each separately, which is nice when debugging.

## Making Sure Everything Works

Before you start building features, let's verify everything is actually running:

1. **Check the backend:**
   Open http://localhost:5000/health in your browser. You should see something like:

   ```json
   { "status": "OK", "message": "Server is running", "database": "connected" }
   ```

   If you see that, the backend is happy and talking to the database.

2. **Check the frontend:**
   Open http://localhost:5173. You should see the RideAlong app. If you see a blank page or errors, something's not right.

3. **Test registration:**
   Try creating a new account. If you get a "failed to fetch" error, the frontend probably can't reach the backend. Check that both are running and the `.env` files are set up correctly.

## When Things Go Wrong

We've all been there. Here are some common issues and how to fix them:

### "Failed to fetch" Error

This usually means the frontend can't talk to the backend. Check these:

1. Is the backend actually running? Try `npm run dev:backend` if you're not sure.
2. Can you reach the health endpoint? http://localhost:5000/health
3. Does your frontend `.env` file have the right URL? Should be `VITE_API_URL=http://localhost:5000/api`
4. Did you restart the frontend after changing `.env`? Vite needs a restart to pick up env changes.

### Database Connection Issues

If the backend can't connect to PostgreSQL:

1. Is PostgreSQL actually running? Check your services or try connecting with psql.
2. Are your database credentials correct in `backend/.env`? Double-check the password especially.
3. Does the `ridealong` database exist? If not, create it with `CREATE DATABASE ridealong;`
4. Try running the migration again: `npm run migrate`

### Module Not Found Errors

This means some dependencies didn't install properly:

1. Make sure you ran `npm install` in all three places (root, frontend, backend)
2. Try the nuclear option: delete `node_modules` folders and reinstall everything
3. The `npm run install:all` command should handle this, but sometimes npm gets confused

### Port Already in Use

Someone (or something) is already using port 5000 or 5173:

- **Backend (5000):** Change the `PORT` value in `backend/.env` to something else like 5001
- **Frontend (5173):** You can change this in `frontend/vite.config.ts` or use the `--port` flag when running

## Useful Commands

Here's a quick reference for the commands you'll use most:

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

## You're All Set!

If you've made it this far and everything is running, congrats! You should now be able to:

- See the app at http://localhost:5173
- Register a new account
- Log in and explore the app


