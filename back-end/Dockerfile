# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]