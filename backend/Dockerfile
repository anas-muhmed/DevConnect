# 1. Base image
FROM node:18-alpine

# 2. Set working directory inside container
WORKDIR /usr/src/app

# 3. Copy package files first (layer caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy rest of the source code
COPY . .

# 6. Expose app port (informational)
EXPOSE 5000

# 7. Start the app

CMD ["node", "server.js"]
