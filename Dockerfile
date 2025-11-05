# --- Stage 1: Build the Vite app ---
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app for production
RUN npm run build

# --- Stage 2: Serve the built files using a lightweight web server ---
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Default command to run nginx
CMD ["nginx", "-g", "daemon off;"]
