// # services:
// #   app:
// #     build: .
// #     container_name: choir-app
// #     command: yarn start
// #     depends_on:
// #       - redis
// #     environment:
// #       - REDIS_HOST=redis
// #       - REDIS_PORT=6379

// #   worker:
// #     build: .
// #     container_name: choir-worker
// #     command: yarn worker
// #     depends_on:
// #       - redis
// #     environment:
// #       - REDIS_HOST=redis
// #       - REDIS_PORT=6379

// #   redis:
// #     image: redis:7
// #     container_name: choir-redis

// # working now
// # version: "3.8"

// # services:
// #   app:
// #     build: .
// #     container_name: choir_app
// #     ports:
// #       - "3000:3000"
// #     depends_on:
// #       - redis
// #       - postgres
// #     environment:
// #       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
// #       REDIS_URL: redis://redis:6379

// #   worker:
// #     build: .
// #     container_name: choir_worker
// #     command: npm run start:worker
// #     depends_on:
// #       - redis
// #       - postgres
// #     environment:
// #       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
// #       REDIS_URL: redis://redis:6379

// #   redis:
// #     image: redis:7
// #     container_name: choir_redis
// #     ports:
// #       - "6379:6379"

// #   postgres:
// #     image: postgres:15
// #     container_name: choir_postgres
// #     restart: always
// #     environment:
// #       POSTGRES_USER: postgres
// #       POSTGRES_PASSWORD: password
// #       POSTGRES_DB: choir_db
// #     ports:
// #       - "5432:5432"
// #     volumes:
// #       - pgdata:/var/lib/postgresql/data

// # volumes:
// #   pgdata:


// version: "3.8"

// services:
//   app:
//     build: .
//     container_name: choir_app
//     command: yarn dev
//     ports:
//       - "3000:3000"
//       - "5555:5555"
//     depends_on:
//       - redis
//       - postgres
//     environment:
//       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
//       REDIS_URL: redis://redis:6379
//       WHATSAPP_SESSION_PATH: /app/.wwebjs_auth

//   worker:
//     build: .
//     container_name: choir_worker
//     command: node dist/queue/notifiation.worker.js
//     depends_on:
//       - redis
//       - postgres
//     environment:
//       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
//       REDIS_URL: redis://redis:6379
//       WHATSAPP_SESSION_PATH: /app/.wwebjs_auth

//   redis:
//     image: redis:7
//     ports:
//       - "6379:6379"

//   postgres:
//     image: postgres:15
//     restart: always
//     environment:
//       POSTGRES_USER: postgres
//       POSTGRES_PASSWORD: password
//       POSTGRES_DB: choir_db
//     ports:
//       - "5433:5432"
//     volumes:
//       - pgdata:/var/lib/postgresql/data

// volumes:
//   pgdata:


// # version: "3.8"

// # services:
// #   app:
// #     build: .
// #     container_name: choir_app
// #     command: yarn dev
// #     ports:
// #       - "5000:5000"
// #     depends_on:
// #       - redis
// #       - postgres
// #     environment:
// #       PORT: 5000
// #       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
// #       REDIS_URL: redis://redis:6379
// #       PUPPETEER_EXECUTABLE_PATH: /usr/bin/chromium

// #   worker:
// #     build: .
// #     container_name: choir_worker
// #     command: yarn worker
// #     depends_on:
// #       - redis
// #       - postgres
// #     environment:
// #       DATABASE_URL: postgresql://postgres:password@postgres:5432/choir_db
// #       REDIS_URL: redis://redis:6379
// #       PUPPETEER_EXECUTABLE_PATH: /usr/bin/chromium

// #   redis:
// #     image: redis:7

// #   postgres:
// #     image: postgres:15
// #     environment:
// #       POSTGRES_USER: postgres
// #       POSTGRES_PASSWORD: password
// #       POSTGRES_DB: choir_db