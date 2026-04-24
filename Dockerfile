



FROM node:22-bullseye

WORKDIR /app

# install system deps (for WhatsApp puppeteer)
RUN apt-get update && apt-get install -y \
  chromium \
  ca-certificates \
  fonts-liberation \
  libnss3 \
  libxss1 \
  libasound2 \
  libgtk-3-0 \
  libx11-xcb1 \
  libgbm1 \
  libxshmfence1

# enable corepack (IMPORTANT for Yarn 4)
RUN corepack enable

# copy package files first
COPY package.json yarn.lock ./

RUN yarn install

# copy source
COPY . .

# Prisma fix (IMPORTANT)
RUN yarn prisma generate

# build TS
RUN yarn build

# create WhatsApp session folder (fix EACCES)
RUN mkdir -p /app/.wwebjs_auth && chmod -R 777 /app/.wwebjs_auth

CMD ["node", "dist/server.js"]
# FROM node:22-bullseye

# WORKDIR /app

# RUN apt-get update && apt-get install -y \
#   chromium \
#   ca-certificates \
#   fonts-liberation \
#   libnss3 \
#   libxss1 \
#   libasound2 \
#   libgtk-3-0 \
#   libx11-xcb1 \
#   libgbm1

# # Enable Corepack
# RUN corepack enable

# # Use correct Yarn version
# RUN corepack prepare yarn@4.9.1 --activate

# COPY package.json yarn.lock ./

# RUN yarn install

# COPY . .

# RUN yarn build

# EXPOSE 5000

# CMD ["node", "dist/server.js"]
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


# FROM node:18

# RUN apt-get update && apt-get install -y \
#   libnss3 libatk1.0-0 libcups2 libx11-xcb1 libxcomposite1 \
#   libxdamage1 libxrandr2 libgbm1 libgtk-3-0 libasound2 \
#   libglib2.0-0

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # IMPORTANT: force worker
# CMD ["node", "dist/queue/notifiation.worker.js"]



# working 
# Use Node image
# FROM node:20

# # Set working directory
# WORKDIR /app

# # Copy files
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy all files
# COPY . .

# # Build TypeScript
# RUN npm run build

# # Expose port
# EXPOSE 3000

# # Start app
# CMD ["npm", "run", "start"]