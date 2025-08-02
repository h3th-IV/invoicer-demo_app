# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Serve with a simple server (e.g., serve)
RUN npm install -g serve
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]