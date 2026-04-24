import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT:  8080
//   PORT: process.env.PORT || 8080
};


//  "dev": "nodemon --exec ts-node src/server.ts",
//     "build": "tsc",
//     "start": "node dist/server.js",
//     "prisma_studio": "npx prisma studio",
//     "start:worker": "node dist/queue/notifiation.worker.js",
//     "start:all": "node dist/server.js & node dist/queue/notification.worker.js",
//     "worker:dev": "ts-node src/queue/notifiation.worker.ts",
//     "worker_local": "nodemon src/queue/notifiation.worker.ts",
//     "worker": "node dist/queue/notifiation.worker.js",
//     "view:docker_DB":"docker compose run --rm -p 5556:5556 app npx prisma studio --port 5555 --hostname 0.0.0.0",
//     "run_docker":"docker compose up"