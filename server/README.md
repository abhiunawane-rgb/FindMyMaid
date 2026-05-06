# FindMyMaid API

PostgreSQL + Fastify. Syncs helper listings for the mobile app.

## Local setup

1. Start Postgres (from repo root):

   `docker compose up -d`

2. Configure env:

   `copy .env.example .env` (Windows) or `cp .env.example .env`

3. Install and migrate:

   `npm install`
   `npx prisma migrate deploy`
   `npm run dev`

API listens on `http://localhost:3000`. Health: `GET /health`.

## Mobile app

Set `EXPO_PUBLIC_API_URL` in the **repo root** `.env` to your machine’s LAN IP and port (e.g. `http://192.168.1.5:3000`). Android emulator: `http://10.0.2.2:3000`. Then `npx expo start --clear`.

**Step-by-step local test:** see `docs/TESTING_WITH_BACKEND.md`.

Build with EAS using the same env for production.

## Deploy (e.g. Railway, Render, Fly.io)

- Set `DATABASE_URL` (managed Postgres), `JWT_SECRET` (long random string), and `PORT` if required.
- Build: `npm install && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && npm start`
## SMS OTP (Twilio)

1. Create a [Twilio Verify](https://www.twilio.com/docs/verify) service and copy the **Service SID**.
2. Set on the server: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.
3. Optional `PHONE_DEFAULT_CC` (e.g. `91`) when users type numbers without `+country`.
4. **`OTP_DEV_BYPASS=true`** — no SMS; `/v1/auth/otp/send` succeeds and `/v1/auth/verify` accepts any **6+** digit code (development only; matches the app’s minimum).

Without Twilio and without bypass, `POST /v1/auth/otp/send` returns **503** `sms_not_configured`.

## Endpoints

- `POST /v1/auth/otp/send` — body `{ phone }` (E.164 or local digits; sends SMS via Verify when configured)
- `POST /v1/auth/verify` — body `{ phone, code, role: "maid" | "user" }` (checks code with Verify, or bypass in dev)
- `GET /v1/maids` — optional `lat`, `lng`, `radiusKm`
- `GET /v1/maids/:id`
- `PUT /v1/maids/me` — Bearer JWT, maid role; full profile body
