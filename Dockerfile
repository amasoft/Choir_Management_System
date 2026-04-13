# FROM node:18

# WORKDIR /app

# RUN corepack enable
# RUN corepack prepare yarn@4.9.1 --activate

# COPY package.json yarn.lock ./

# RUN yarn install

# COPY . .

# CMD ["yarn", "start"]


# Use Node
# FROM node:20

# # Set working dir
# WORKDIR /app

# # Copy files
# COPY package.json yarn.lock ./

# # Install deps
# RUN yarn install

# # Copy rest
# COPY . .

# # Build TS
# RUN yarn build

# # Expose port
# EXPOSE 3000

# # Start app
# CMD ["yarn", "start"]



FROM node:18

# install chrome dependencies
RUN apt-get update && apt-get install -y \
  libnss3 libatk1.0-0 libcups2 libx11-xcb1 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libgtk-3-0 libasound2

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/worker.js"]