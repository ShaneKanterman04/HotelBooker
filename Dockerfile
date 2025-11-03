# Minimal Dockerfile for HotelBooker
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files first to take advantage of layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Expose port used by app
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
