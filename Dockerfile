FROM node:18.19.1-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Build TypeScript files
RUN npm test && npm run build

# Start the application
ENTRYPOINT ["node", "/usr/src/app/dist/src/index.js"]