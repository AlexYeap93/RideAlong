# --- Multi-stage Dockerfile for RideAlong ---
# This Dockerfile is for the frontend only. Use docker-compose.yml for full stack deployment.

# --- Stage 1: Build the Vite frontend app ---
FROM node:18 AS build-frontend

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the frontend for production
RUN npm run build

# --- Stage 2: Serve the built frontend files using nginx ---
FROM nginx:alpine

# Copy built frontend files from previous stage
COPY --from=build-frontend /app/dist /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default command to run nginx
CMD ["nginx", "-g", "daemon off;"]
