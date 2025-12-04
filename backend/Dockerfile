# Backend Dockerfile
FROM node:20-bullseye

# Install Python for file conversion
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the backend code
COPY . .

# Set env and expose port
ENV PORT=5000
EXPOSE 5000

# Start the app
CMD ["npm", "start"]


