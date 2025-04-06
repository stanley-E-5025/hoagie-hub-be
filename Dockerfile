FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Expose the application port
EXPOSE 3000

# Start the application with seed
CMD ["/app/entrypoint.sh"] 