# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root dependencies and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the frontend (outputs to /app/dist)
RUN npm run build

# Stage 2: Setup the production server
FROM node:20-alpine AS runner

WORKDIR /app

# Copy backend dependencies
COPY backend/package.json ./

# Install only production dependencies
RUN npm install --production

# Copy backend source
COPY backend/index.js ./

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./public

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
