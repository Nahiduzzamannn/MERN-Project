# Use Node.js for development
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Set environment variables for Vite
ENV NODE_ENV=development
ENV VITE_API_BASE_URL=http://localhost:3000

# Expose the development server port
EXPOSE 5173

# Start Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]