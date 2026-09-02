# HTC Choir Management & Notification System

A production-ready backend system for managing church choir members, scheduling liturgical task assignments, and delivering automated notifications via **WhatsApp** and **SMS** ahead of Sunday performances.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Background Worker](#background-worker)
- [Notification Flow](#notification-flow)
- [Scripts Reference](#scripts-reference)

---

## Overview

This system was built for **HTC St. John's Choir** to eliminate manual WhatsApp reminders before Sunday Mass. Choir coordinators can:

1. Import the full membership list from a structured Excel sheet
2. Assign liturgical roles (Communion Solo, Responsorial Psalm) to members for specific Sundays
3. Let the system automatically compose and dispatch personalized WhatsApp and SMS reminders to each assigned member before their performance date

The backend is decoupled into an **API server** and a **background notification worker**, both sharing a Redis-backed BullMQ queue.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Server                           │
│  Express REST API  ──►  PostgreSQL (via Prisma)             │
│                    ──►  BullMQ Queue (enqueue jobs)         │
└─────────────────────────┬───────────────────────────────────┘
                          │  Redis
┌─────────────────────────▼───────────────────────────────────┐
│                   Notification Worker                        │
│  BullMQ Worker  ──►  WhatsApp Web JS (direct + group msg)   │
│                 ──►  Termii SMS API                          │
└─────────────────────────────────────────────────────────────┘
                          ▲
              Cron Scheduler (BullMQ Repeatable Job)
              Fires every Sunday at 9AM (Africa/Lagos)
              Fetches next-Sunday tasks → enqueues notification jobs
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Language | TypeScript 5 |
| Framework | Express.js v5 |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Queue / Worker | BullMQ + IORedis |
| WhatsApp | whatsapp-web.js (Puppeteer) |
| SMS | Termii API |
| File Upload | Multer (in-memory) |
| Excel Parsing | xlsx (SheetJS) |
| Image Storage | Cloudinary |
| Validation | Joi |
| Package Manager | Yarn 4 (Berry) |
| Containerization | Docker (Node 22 Bullseye) |

---

## Features

### Member Management
- **Bulk import** from `.xlsx` Excel files — parses surname, first name, birthday, phone number, gender, and voice part
- **Auto-generate emails** from member data during import
- **Cloudinary photo upload** — if a Google Drive photo link is in the spreadsheet, the image is fetched and re-uploaded to Cloudinary automatically
- **List all members** with count

### Task Scheduling
- Assign members to liturgical roles for a specific performance date
- Supported roles: `COMMUNION_SOLO`, `RESPNSORIAL_PASALM`
- Middleware guards prevent assigning non-existent members or duplicate tasks
- Query tasks for **next Sunday** specifically

### Notification Engine
- **WhatsApp direct messages** to each assigned member's phone number
- **WhatsApp group message** broadcast to the choir group
- **SMS fallback** via Termii API for non-WhatsApp numbers
- Automatic number registration check before sending WhatsApp messages
- Messages are **composed dynamically** — single or multiple members per role are handled with appropriate greeting copy

### Job Queue
- Notifications are dispatched **asynchronously** via BullMQ
- Each job retries up to **3 times** with exponential backoff (2s base delay)
- Completed jobs are auto-removed; failed jobs are retained for inspection

### Scheduler
- A **repeatable BullMQ job** fires on a cron schedule (default: `*/5 * * * *` for testing; set to `0 9 * * 0` for production — Sunday 9AM WAT)
- Fetches all unprocessed tasks for the upcoming Sunday and dispatches notification jobs automatically — zero manual intervention needed

---

## Project Structure

```
src/
├── app.ts                          # Express app setup, route mounting, scheduler bootstrap
├── server.ts                       # HTTP server entry point
├── util.ts                         # messageLogger utility
│
├── config/
│   ├── DBConnection.ts             # Database connection check
│   └── env.ts                      # Environment config
│
├── modules/
│   ├── index.ts                    # Central API router
│   ├── members/
│   │   ├── Members.controller.ts   # Upload & list members
│   │   ├── Members.service.ts      # Business logic
│   │   ├── Member.repository.ts    # Prisma queries
│   │   └── Members.route.ts        # /api/v1/members routes
│   ├── Tasks/
│   │   ├── Tasks.controller.ts     # Create & list tasks
│   │   ├── Tasks.service.ts        # Business logic
│   │   ├── Tasks.repository.ts     # Prisma queries
│   │   └── Tasks.route.ts          # /api/v1/tasks routes
│   └── NOtifications/
│       └── Notification.controller.ts  # processTask — composes & enqueues jobs
│
├── queue/
│   ├── notification.queue.ts       # BullMQ Queue definition + addNotificationJob()
│   ├── notification.worker.ts      # BullMQ Worker — sends WhatsApp & SMS
│   └── schedular/
│       └── schedular.ts            # Registers Mon/Wed/Sat repeatable reminder jobs
│
├── whatsapp/
│   └── whatsapp.client.ts          # WhatsAppClient singleton (Puppeteer-based)
│
├── middlewares/
│   ├── tasks.middleware.ts         # checkMemberExist, checkTasksExist guards
│   └── upload.ts                   # Multer memory-storage config
│
├── Utils/
│   ├── Helpers.ts                  # convertDOB, getNextSundayRange, composeMessage
│   ├── autoSMS.ts                  # Termii SMS sender
│   ├── fileutils.ts                # Excel parser + Cloudinary uploader
│   └── Constants/
│       └── statusCodes.ts          # HTTP status code constants
│
├── validators/
│   └── task.validator.ts           # Joi schema for task creation
│
├── prisma_connection/
│   └── prisma.ts                   # Prisma client singleton
│
└── types/
    └── qrcode-terminal.d.ts        # Type declaration for qrcode-terminal
```

---

## Database Schema

### `Member`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `surname` | String | |
| `firstname` | String | |
| `phoneNumber` | String | Unique |
| `email` | String | Unique, auto-generated on import |
| `voicePart` | String? | e.g. Soprano, Bass |
| `gender` | String | |
| `dateOfBirth` | DateTime? | |
| `isActive` | Boolean | Default: `true` |
| `profile_pic` | String? | Cloudinary URL |
| `createdAt` | DateTime | Auto |

### `Task`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `memberId` | String | FK → Member (cascade delete) |
| `role` | Enum | `COMMUNION_SOLO` \| `RESPNSORIAL_PASALM` |
| `notes` | String | |
| `performanceDate` | DateTime | Indexed |
| `isTaskDone` | Boolean | Default: `false` |
| `reminderSent` | Boolean | Default: `false` |
| `createdAt` | DateTime | Auto |

---

## API Reference

All routes are prefixed with `/api/v1`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Returns `{ success: true, message: "welcome to HTC Notification system" }` |

---

### Members — `/api/v1/members`

#### `GET /api/v1/members`
Returns all choir members.

**Response**
```json
{
  "count": 42,
  "users": [
    {
      "id": "c8f1a...",
      "surname": "Okafor",
      "firstname": "Chidi",
      "phoneNumber": "2348012345678",
      "voicePart": "Bass",
      "isActive": true
    }
  ]
}
```

---

#### `POST /api/v1/members/upload_members_data`
Bulk-import members from an Excel file.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `.xlsx` | Yes | Excel sheet with member data |

**Expected Excel columns:**

| Column | Description |
|---|---|
| `Surname` | Member's surname |
| `Othernames` | First / other names |
| `Birthday` | Format: `DD/MM` |
| `PhoneNumber` | e.g. `08012345678` |
| `Gender` | `Male` / `Female` |
| `Part` | Voice part e.g. `Soprano` |
| `Photograph` | *(Optional)* Google Drive share link |

**Response**
```json
{
  "users": {
    "success": true,
    "processed": [{ "surname": "Eze", "email": "eze06@gmail.com", "mobileNumber": "08012345678" }],
    "failed": 0
  }
}
```

---

### Tasks — `/api/v1/tasks`

#### `POST /api/v1/tasks`
Create a new task assignment for a member.

**Request Body**
```json
{
  "memberId": "c8f1a2b3-...",
  "role": "COMMUNION_SOLO",
  "performanceDate": "2025-08-10T00:00:00.000Z",
  "notes": "First Sunday of the month"
}
```

| Field | Type | Required |
|---|---|---|
| `memberId` | UUID string | Yes |
| `role` | `COMMUNION_SOLO` \| `RESPNSORIAL_PASALM` | Yes |
| `performanceDate` | ISO 8601 DateTime | Yes |
| `notes` | String | Yes |

**Response**
```json
{
  "message": "Task created Successfully!!!",
  "data": { "users": { ... } }
}
```

---

#### `GET /api/v1/tasks/listtasks`
Returns all tasks across all dates.

**Response**
```json
{
  "data": {
    "count": 5,
    "tasks": [
      {
        "id": "...",
        "role": "COMMUNION_SOLO",
        "performanceDate": "2025-08-10T00:00:00.000Z",
        "member": { "surname": "Okafor", "phoneNumber": "2348012345678" }
      }
    ]
  }
}
```

---

#### `GET /api/v1/tasks/nexttasks`
Fetches all tasks for the **upcoming Sunday**, immediately composes and enqueues WhatsApp/SMS notification jobs, and returns the task list.

**Response — tasks found**
```json
{
  "success": true,
  "data": {
    "task": [{ "id": "...", "role": "COMMUNION_SOLO", "member": { ... } }]
  }
}
```

**Response — no tasks**
```json
{
  "success": false,
  "message": "No Pending Tasks!!!"
}
```

---

### Test Endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/v1/send-test` | `{ phone, message }` | Manual WhatsApp send test |
| `GET` | `/sms` | — | Fires a hardcoded test SMS via Termii |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=8080

# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

# Redis
REDIS_URL="redis://127.0.0.1:6379"
# Railway example:
# REDIS_URL="redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}"

# SMS — Termii
TERMII_API_KEY="your_termii_api_key"
TERMII_SENDER_ID="HTCSTJOHN"

# Cloudinary (profile picture uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Puppeteer (Docker only — path to system Chromium)
PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
```

---

## Getting Started

### Prerequisites

- Node.js >= 22
- Yarn 4 (`corepack enable`)
- PostgreSQL database
- Redis server running locally or via cloud (Railway, Upstash, etc.)
- A WhatsApp account to authenticate the notification bot

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd Choir_Management_System

# 2. Install dependencies
yarn install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database, Redis, Termii, and Cloudinary credentials

# 4. Run database migrations
npx prisma migrate dev

# 5. Start Redis (in a separate terminal)
yarn redis:start

# 6. Start the API server (in a separate terminal)
yarn dev

# 7. Start the notification worker (in a separate terminal)
yarn worker_dev
```

> **WhatsApp QR Code**: On first startup the worker will print a QR code in the terminal. Scan it with the WhatsApp account you want to use as the message sender. The session is persisted under `.wwebjs_auth/` and does not require re-scanning on subsequent restarts.

### Docker Deployment

```bash
# Build the image
docker build -t htc-choir-system .

# Run the container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e TERMII_API_KEY="..." \
  -e TERMII_SENDER_ID="HTCSTJOHN" \
  -e CLOUDINARY_CLOUD_NAME="..." \
  -e CLOUDINARY_API_KEY="..." \
  -e CLOUDINARY_API_SECRET="..." \
  -e PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium" \
  htc-choir-system
```

The Dockerfile installs Chromium and all required system libraries (`libnss3`, `libgtk-3-0`, `libgbm1`, etc.) so Puppeteer/WhatsApp Web runs fully headless inside the container without any additional setup.

For **Railway** deployments, set these environment variables in the Railway project dashboard and deploy. The `postinstall` script automatically runs `prisma generate` after `yarn install`.

---

## Background Worker

The notification worker (`src/queue/notification.worker.ts`) runs as a **separate process** from the API server. Both must be running for end-to-end notification delivery.

**In production**, run both processes simultaneously:
```bash
node dist/server.js &
node dist/queue/notification.worker.js
```

Or use a process manager like [PM2](https://pm2.keymetrics.io/):
```bash
pm2 start dist/server.js --name api
pm2 start dist/queue/notification.worker.js --name worker
```

### Job Types

| Job Name | Triggered By | Behaviour |
|---|---|---|
| `send-sunday-notification` | Scheduler (cron) | Fetches next-Sunday tasks, calls `Notification.processTask()` to fan out individual jobs |
| `send-notification` | `Notification.processTask()` | Checks WhatsApp registration; sends direct message + group message + SMS |

### Job Configuration

```
attempts:      3 (retry 3 times on failure)
backoff:       exponential, 2000ms base delay
removeOnComplete: true
removeOnFail:  false  (retained for debugging)
```

---

## Notification Flow

```
Scheduler fires (cron: every Sunday 9AM WAT)
  └─► Enqueues "send-sunday-notification" job
        └─► Worker picks up job
              └─► TasksService.fetchNextTasks()
                    └─► Notification.processTask(tasks)
                          ├─► Groups tasks by role
                          │     - COMMUNION_SOLO tasks
                          │     - RESPNSORIAL_PASALM tasks
                          └─► Per role group:
                                ├─► composeMessage(tasks)
                                │     → Personalized message text
                                │     → Array of phone numbers
                                └─► For each phone number:
                                      └─► addNotificationJob({ message, userNumber })
                                            └─► Worker picks up job
                                                  ├─► isNumberRegistered(number)?
                                                  ├─► sendMessage(number, message)    [WhatsApp DM]
                                                  ├─► sendMessageToGroup(message)     [WhatsApp Group]
                                                  └─► sendSMS({ to: number, message }) [Termii SMS]
```

### Message Templates

**Single member:**
```
Dear Okafor, kindly note that you have a Liturgical function with the following details:

Date: Sun Aug 10 2025
Function: COMMUNION_SOLO

We wish you the best!
```

**Multiple members:**
```
Dear Okafor and Eze, kindly note that you have a Liturgical function with the following details:

Date: Sun Aug 10 2025
Function: RESPNSORIAL_PASALM

We wish you all the best!
```

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| `dev` | `nodemon --exec ts-node src/server.ts` | API server with hot reload |
| `worker_dev` | `nodemon --exec ts-node src/queue/notification.worker.ts` | Worker with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/server.js` | Run compiled API server (production) |
| `worker` | `node dist/queue/notification.worker.js` | Run compiled worker (production) |
| `redis:start` | `redis-server` | Start local Redis instance |
| `postinstall` | `prisma generate` | Auto-generates Prisma client after `yarn install` |

---

## To-Do / Future Improvements

- [ ] Switch scheduler cron pattern from `*/5 * * * *` (test) to `0 9 * * 0` (Sunday 9AM WAT) for production
- [ ] Update `reminderSent` flag on `Task` after successful dispatch to prevent duplicate sends on re-runs
- [ ] REST endpoint for WhatsApp QR code re-scan / session status
- [ ] Authentication middleware (JWT) to protect admin-only routes
- [ ] Birthday auto-notification module using `dateOfBirth` field
- [ ] Admin dashboard frontend for non-technical coordinators
