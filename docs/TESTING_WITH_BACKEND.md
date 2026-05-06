# Test the app with backend + sync

Use this when you want the **latest app build** to talk to the **API** so helpers and families sync across devices.

---

## 1. One-time: API + database

**Repo root** (where `docker-compose.yml` is):

```powershell
docker compose up -d
```

**Server folder** — install, env, migrate, run:

```powershell
cd server
copy .env.example .env
```

Edit `server\.env`: keep `DATABASE_URL` pointing at Postgres (default in `.env.example` matches Docker). Set a long random `JWT_SECRET` (16+ characters).

```powershell
npm install
npx prisma migrate deploy
npm run dev
```

Leave this terminal open. You should see the server listening on port **3000**.

**Quick API check** (browser or another terminal):

```text
http://localhost:3000/health
```

Expect JSON like: `{ "ok": true, "service": "findmymaid-api" }`

---

## 2. Point the Expo app at your PC

The phone or emulator must reach **your computer’s IP**, not `localhost` (except iOS Simulator on the same Mac).

### Windows — find your LAN IP

```powershell
ipconfig
```

Use the **IPv4 Address** of your active Wi‑Fi or Ethernet adapter (example: `192.168.1.105`).

### App env

**Repo root**: copy env and set the URL (**no trailing slash**).

```powershell
copy .env.example .env
```

Edit **root** `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.105:3000
```

Replace `192.168.1.105` with **your** IP.

**Android emulator** (API on the same PC):

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

**iOS Simulator** (Mac, API on same machine):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Restart Metro after changing `.env`:

```powershell
cd ..   # back to repo root if you were in server
npx expo start --clear
```

Sync is **off** if `EXPO_PUBLIC_API_URL` is empty; **on** when it’s set and non-empty.

---

## 3. End-to-end test (two accounts)

1. **Device A (or emulator)** — sign up as **Helper**, complete profile (photo, rates, services, location if you can).
2. **Device B** — same Wi‑Fi if using LAN IP — sign up as **Family** (`user`), allow location, open **Find**, pull to refresh.
3. You should see the helper from the API (cloud hint banner at top of Find when sync is on).

**OTP:** With **Twilio** on the server, you get a real SMS. With **`OTP_DEV_BYPASS=true`**, skip SMS and enter any **6-digit** code on the OTP screen (e.g. `123456`).

---

## 4. Share this setup with someone else

Send them:

| Item | What to share |
|------|----------------|
| Repo / branch | Your git URL or zip |
| API | Public URL when deployed (HTTPS), **or** your PC IP + port `3000` for same-network testing only |
| App env | `EXPO_PUBLIC_API_URL=<that base URL>` in `.env` or EAS **Environment variables** for release builds |
| Server env | `DATABASE_URL`, `JWT_SECRET` on the host (never commit real secrets) |

For **store builds** (EAS), set `EXPO_PUBLIC_API_URL` in the Expo dashboard for the **production** profile so installs use your hosted API.

---

## 5. Shortcut commands (from repo root)

```powershell
npm run api:install
npm run api:migrate
npm run api:dev
```

Run those in order the first time; then usually only `npm run api:dev` after Docker is already up.

---

## 6. Installable testing build (real OTP + real API data)

Use this when you want a **normal app install** (APK / device build) that talks to your **deployed** API with **Twilio OTP** — not Expo Go, not LAN IP.

### Prereqs

1. **API live** on **HTTPS** (e.g. Railway, Render, Fly) with Postgres migrated, `JWT_SECRET`, and **Twilio** (`TWILIO_*`, no `OTP_DEV_BYPASS` unless you intentionally want fake OTP).
2. **Expo account** and project linked to this repo (`eas login`, `eas init` / project already on [expo.dev](https://expo.dev) if needed).
3. **EAS CLI:** `npm i -g eas-cli`

### Point the build at your API

1. Open your project on **expo.dev** → **Environment variables**.
2. Under the **Preview** environment, add:
   - **Name:** `EXPO_PUBLIC_API_URL`
   - **Value:** your public API base URL, e.g. `https://your-api.example.com` (**no trailing slash**)

The **`testing`** and **`preview`** profiles in `eas.json` use `environment: "preview"`, so this variable is embedded at build time.

*(Alternative: set the same variable locally in a root `.env` only if your EAS workflow is configured to pass it; the dashboard Preview env is the recommended approach for cloud builds.)*

### Run the build (from repo root)

**Android** (installable **APK** for side-load / internal testers):

```powershell
npm run build:testing:android
```

**iOS** (device build; needs Apple Developer account / certificates via EAS):

```powershell
npm run build:testing:ios
```

Or: `eas build --profile testing --platform android` (or `ios`).

### After the build

1. Download the artifact from the EAS build page.
2. **Android:** install the `.apk` on two phones (or one phone + emulator with network access to your API).
3. **iOS:** follow EAS instructions (internal distribution / TestFlight if you use a store profile instead).

### What to verify

- **Helper** device: sign up → SMS OTP → finish profile → listing synced (`GET /v1/maids` on server or **Find** on another device).
- **Family** device: sign up → OTP → **Find** → pull to refresh → see the helper from the API.

If OTP never arrives: confirm **Live** Twilio credentials on the server, **trial verified** destination numbers, and correct `PHONE_DEFAULT_CC` / E.164.

---

## Troubleshooting

| Symptom | Try |
|--------|-----|
| Sign-in failed / could not reach server | Firewall: allow port 3000 inbound on PC; phone and PC on same Wi‑Fi; correct `EXPO_PUBLIC_API_URL`; restart Expo with `--clear` |
| DB error on start | `docker compose up -d`; check `DATABASE_URL` in `server\.env` |
| Find list empty | Helper finished setup? `GET http://<pc-ip>:3000/v1/maids` in browser; allow location on family device; pull to refresh on Find |
