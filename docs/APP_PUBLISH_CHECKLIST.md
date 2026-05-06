# FindMyMaid — App Store & Play Store Checklist

**Print this file:** Open in VS Code / browser → Print → **Save as PDF** (or use a Markdown-to-PDF tool).

**App IDs:** iOS bundle `com.findmymaid.app` · Android package `com.findmymaid.app`  
**Website:** `https://www.findmymaid.online`

---

## Before you pay anything

| Task | Done |
|------|------|
| Decide **individual** vs **company** for both stores (same name everywhere) | ☐ |
| Prepare **support email** you will read (for users + reviewers) | ☐ |
| Confirm **www.findmymaid.online** shows **Privacy** and **Terms** (no 404) | ☐ |

**Fees:** Apple Developer ~**$99/year** · Google Play ~**$25 one-time**

---

## Website (required / strongly recommended)

| Page | URL | Done |
|------|-----|------|
| Privacy policy | `https://www.findmymaid.online/privacy.html` | ☐ |
| Terms of use | `https://www.findmymaid.online/terms.html` | ☐ |
| Support / contact | `https://www.findmymaid.online/support.html` (real email or form) | ☐ |
| Optional: pricing | `https://www.findmymaid.online/pricing.html` | ☐ |

| Task | Done |
|------|------|
| Read pages once; remove confusing “demo only” lines if you claim production | ☐ |
| Same **business/app name** on site as in store listings | ☐ |

---

## Accounts & tools

| Task | Done |
|------|------|
| **Apple ID** with two-factor authentication | ☐ |
| Enroll in **Apple Developer Program** (paid) | ☐ |
| **Google** account for Play Console | ☐ |
| Pay **Google Play developer** registration (one-time) | ☐ |
| **Expo** account (expo.dev) — log in | ☐ |
| Install EAS CLI: `npm i -g eas-cli` | ☐ |
| In project folder: `eas login` | ☐ |
| Run `eas whoami` to confirm | ☐ |

---

## Hosted API (multi-device sync)

The app syncs helper listings when **`EXPO_PUBLIC_API_URL`** is set. Local test flow: **`docs/TESTING_WITH_BACKEND.md`**. Deploy reference: **`server/README.md`**.

| Task | Done |
|------|------|
| Deploy Postgres + API (Railway, Render, Fly.io, etc.) | ☐ |
| Set **`DATABASE_URL`**, **`JWT_SECRET`** (long random), run **`npx prisma migrate deploy`** on the server | ☐ |
| EAS / store builds: add **`EXPO_PUBLIC_API_URL`** to production env (your public API base URL, no trailing slash) | ☐ |
| Configure **Twilio Verify** on the API (`TWILIO_*` env vars); use **`OTP_DEV_BYPASS`** only for dev — not for production | ☐ |
| Optional: object storage for profile photos (today: `photoUri` string; `file://` will not work on other devices) | ☐ |

---

## Apple — App Store Connect

| Task | Done |
|------|------|
| Create app in **App Store Connect** (bundle ID `com.findmymaid.app`) | ☐ |
| App name, subtitle, description, keywords | ☐ |
| **Privacy Policy URL** → `https://www.findmymaid.online/privacy.html` | ☐ |
| Screenshots (required sizes for your target iPhones / iPad if tablet) | ☐ |
| App icon (1024×1024 if required by Connect) | ☐ |
| **App Privacy** questionnaire (location, phone, photos, etc. — answer truthfully) | ☐ |
| Encryption / export compliance questionnaire (standard HTTPS-only apps often “no” to custom encryption) | ☐ |
| Build: `eas build --platform ios --profile production` | ☐ |
| Submit: `eas submit -p ios` (or Transporter) | ☐ |
| **TestFlight** internal test (optional but recommended) | ☐ |
| **App Review Information** — paste **sign-in notes** (see below) | ☐ |
| Submit for **App Review** | ☐ |

---

## Google — Play Console

| Task | Done |
|------|------|
| Create app in **Play Console** | ☐ |
| Store listing: title, short/full description | ☐ |
| **Privacy policy URL** | ☐ |
| Screenshots + **feature graphic** (if required) | ☐ |
| **App content** questionnaires (ads, target audience, etc.) | ☐ |
| **Content rating** questionnaire | ☐ |
| Accept **Play App Signing** when prompted | ☐ |
| Build: `eas build --platform android --profile production` (outputs `.aab`) | ☐ |
| Upload **`.aab`** to a **testing** track first (internal/closed) | ☐ |
| Paste **sign-in notes** where testers/reviewers need them | ☐ |
| Promote to **Production** when ready | ☐ |

---

## Reviewers — how to sign in (copy into both stores)

**Your app does not use email + password.** Use this in **App Review Notes** (Apple) and **testing instructions** (Google):

```
SIGN-IN (no email/password):
1) Open the app, choose Family or Helper, enter a display name (2+ characters).
2) Enter a real mobile number you can receive SMS on (or your test number hooked to Twilio Verify).
3) Tap “Send verification code”. Enter the SMS code on the next screen (typically 6 digits).
4) Complete profile setup to reach the main tabs.

If you use a dev API with OTP_DEV_BYPASS, use any 6-digit code (e.g. 123456) instead of SMS.

The app is a discovery/introduction tool; it does not process salary for domestic work in-app.
```

If a form still asks for **username/password**, use:

- **Username:** `N/A — phone + OTP`  
- **Password:** `N/A — OTP e.g. 123456`

---

## In-app purchases (when you go live with real money)

| Task | Done |
|------|------|
| Create products in **App Store Connect** with IDs matching your app code | ☐ |
| Create products in **Play Console** with same IDs | ☐ |
| Until live, mention in review notes: *“IAP may be demo until store products are fully configured.”* | ☐ |

---

## Common rejection avoidances

| Check | Done |
|-------|------|
| Privacy & Terms links work on a **normal phone browser** | ☐ |
| Store description matches what the app does (discovery, not employer-of-record) | ☐ |
| Reviewers can complete sign-in using the notes above | ☐ |
| Permission prompts (location, photos) match real features | ☐ |

---

## After approval

| Task | Done |
|------|------|
| Announce link: App Store + Play Store URLs | ☐ |
| Monitor **support** email | ☐ |
| Plan **updates**: bump `version` / build numbers for each release | ☐ |

---

## Quick command reference (in project folder)

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit -p ios
eas submit -p android
```

---

*Last updated for project: Expo SDK 54 · April 2026*
