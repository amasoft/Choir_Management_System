# Bug Fix Docs

Recap of the reminder-pipeline work: fixes, reliability hardening, and behavior
changes made to the choir notification system.

## Redis / DB connectivity

- Diagnosed the original `ECONNREFUSED 127.0.0.1:6379` — Redis wasn't running
  locally.
- **`src/config/DBConnection.ts`** — `checkDatabaseConnection` now reuses the
  app's shared Prisma client (instead of a disposable throwaway one), returns
  a real `boolean` instead of `void`, and no longer disconnects the shared
  client right after connecting.
- **`src/server.ts`** — logs a clear warning at boot if the DB connection
  check fails, instead of failing silently.
- **`src/app.ts`** — added `GET /health`, returning `200`/`503` based on live
  DB connectivity.

## The reminder pipeline

- **`src/queue/schedular/schedular.ts`** — replaced the single "every 5
  minutes" test job with 3 real repeatable jobs: Monday, Wednesday, and
  Saturday at 9AM (Africa/Lagos), each carrying its own channel config:
  - Monday: WhatsApp DM + WhatsApp group + SMS
  - Wednesday: WhatsApp DM + SMS
  - Saturday: WhatsApp DM + WhatsApp group + SMS

  Registration also now cleans up any stale repeatable jobs from Redis
  automatically, so old schedules (like the 5-minute test job) can't keep
  firing alongside the new ones.

- **`src/queue/notification.queue.ts`** — added a shared `NotificationChannels`
  type; `addNotificationJob` now accepts `channels` and `role` on the job
  payload. Also stripped a large block of commented-out dead code.

- **`src/modules/NOtifications/Notification.controller.ts`** — `processTask`
  now accepts and forwards `channels` (defaulting to all channels when not
  given) and `role`.

- **`src/queue/notification.worker.ts`** — rewritten:
  - Recognizes the 3 new trigger job names (`send-monday-notification`,
    `send-wednesday-notification`, `send-saturday-notification`) instead of
    the old single `send-sunday-notification` name.
  - Cleaned up a duplicated/nested `if` block left over from earlier edits.
  - Only sends the channels a given ticket specifies (`channels.dm`,
    `channels.group`, `channels.sms`), instead of unconditionally sending all
    three every time.
  - Fixed the hardcoded SMS destination number — SMS now goes to
    `job.data.userNumber` (the actual member) instead of one fixed number.

## Reliability fixes

- **`src/app.ts`** — `bootstrap()` now has a `.catch()`, so a scheduler
  registration failure gets logged instead of becoming a silent unhandled
  promise rejection.
- **`src/queue/notification.worker.ts`** — added an `.on("error", ...)`
  listener. Required once the worker shares a process with the server: a
  Node `EventEmitter` throws (crashing the whole process) if an `"error"`
  event fires with no listener attached.
- **`src/server.ts`** — now imports the worker directly
  (`import "./queue/notification.worker"`), so one process / one deploy runs
  both the web server and the notification worker. No Dockerfile changes
  needed.
- **`src/whatsapp/whatsapp.client.ts`** — found live during testing: the
  WhatsApp `disconnected` reconnect handler had no error handling and
  crashed the entire process when `initialize()` failed. Wrapped it in
  try/catch. Verified the fix holds — the server survived a real
  disconnect/reconnect failure instead of dying.
- **`src/server.ts`** — fixed `dotenv.config()` running *after* other
  imports (like `app.ts`, which pulls in `notification.queue.ts` and reads
  `process.env.REDIS_URL`) had already read from `process.env`. It now runs
  first, before any other import.

## Correctness / safety

- **`src/modules/Tasks/Tasks.controller.ts`** — `GET /tasks/nexttasks` no
  longer sends real WhatsApp/SMS notifications as a side effect of a GET
  request. It's read-only now; sending is exclusively the scheduled worker's
  job. (Previously, hitting this endpoint — a refresh, a health check, a
  monitoring bot — could re-send reminders to real members.)
- **role logging** — `role` is now actually passed through the job pipeline
  (`Notification.controller.ts` → `addNotificationJob` → the worker) instead
  of always logging `"Sent for role: undefined"`.

## Housekeeping

- **`.gitignore`** — added `*.rdb` (Redis dump files were untracked but not
  ignored), removed a stray leftover `git filter-branch` shell command that
  was sitting in the file as inert text.

## Verification done live

- Confirmed all 3 reminder jobs register correctly in Redis with no stale
  duplicates, with correct next-run timestamps.
- Confirmed the database connects successfully at boot.
- Confirmed the merged server+worker process survives a real WhatsApp
  disconnect/reconnect failure instead of crashing (previously reproduced
  the crash, then re-tested after the fix).

## Also produced

- ["Three Knocks Before Sunday"](https://claude.ai/code/artifact/5570ab3e-d205-4423-953c-a29bebeab377) —
  a published explainer walking through the scheduler → queue → worker
  pipeline as a story + diagram.

## Known open items (not fixed, by choice or out of scope)

None currently — every issue found during this pass has been addressed. Future
issues discovered should be added here before being fixed, so this doc stays
a running log.
