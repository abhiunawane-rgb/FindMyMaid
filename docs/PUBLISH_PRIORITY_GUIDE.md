# FindMyMaid — Publish priority (iOS + Android)

**Generated for:** Find My Maid · Bundle / package: `com.findmymaid.app` · Website: https://www.findmymaid.online

**How to get a PDF:** Open this file in VS Code / any Markdown preview → Print → Save as PDF — **or** use the generated `PUBLISH_PRIORITY_GUIDE.pdf` in this folder if present.

---

## Tier 1 — Must do first (nothing ships without these)

| # | What | Why |
|---|------|-----|
| 1 | **Paid accounts** — Apple Developer Program + Google Play Console | Both stores require enrolment before you can submit. |
| 2 | **Expo / EAS** — `eas login`, link project (`eas init` or first `eas build`), confirm `eas whoami` | All release builds go through EAS from Windows (or any OS). |
| 3 | **Public backend** — HTTPS API on the internet (e.g. AWS EC2 + Postgres + TLS), `DATABASE_URL`, `JWT_SECRET`, `npx prisma migrate deploy`, Twilio `TWILIO_*` live, **no `OTP_DEV_BYPASS`** in prod | Reviewers and users need real SMS OTP and sync; LAN-only is not enough. |
| 4 | **Set `EXPO_PUBLIC_API_URL`** on EAS for **production** profile | Store builds won’t talk to your API without this. |

**Until Tier 1 is done, “publish” isn’t real.**

---

## Tier 2 — Required to submit builds to each store

| # | What | Why |
|---|------|-----|
| 5 | **Production builds** — `eas build --platform android --profile production` (AAB) and `eas build --platform ios --profile production` | Store-ready binaries. |
| 6 | **Play Console** — App created, package `com.findmymaid.app`, Privacy policy URL, listings, Data safety, content rating, upload AAB to internal/closed test first | Android submission gate. |
| 7 | **App Store Connect** — App created, bundle `com.findmymaid.app`, Privacy policy URL, app info, encryption/export, screenshots, App Privacy | iOS submission gate. |
| 8 | **Submit** — `eas submit -p android` / `eas submit -p ios` (or manual upload) | Gets builds into Play / TestFlight / review. |
| 9 | **Reviewer sign-in notes** — Phone + real SMS OTP (Twilio); verify test numbers on Twilio trial | Apple/Google must complete sign-in. |

---

## Tier 3 — Strongly recommended before “production”

| # | What | Why |
|---|------|-----|
| 10 | **Website live** — privacy, terms, support, pricing, contact on https://www.findmymaid.online | Policy URLs; no 404s. |
| 11 | **Subscriptions** — Real IAP per `docs/STORE_MONETIZATION.md`, or hide paid flows, or clear v1 scope | Demo billing can raise review flags. |
| 12 | **End-to-end test** on devices — both roles, OTP, profile, Find + API | Catches URL / TLS / Twilio before review. |

---

## Tier 4 — Quality (can follow v1 if you accept tradeoffs)

| # | What | Why |
|---|------|-----|
| 13 | **Profile photos** — HTTPS URLs (not `file://`) for cross-device listings | Others won’t see local file paths. |
| 14 | Trim **“Demo”** copy in premium/settings if you claim production | Cleaner review. |
| 15 | **Versioning** — bump version / build per release | Store hygiene. |

---

## One-line order of attack

**Accounts → EAS login + project → deploy API + Twilio + prod env → `EXPO_PUBLIC_API_URL` → production EAS builds → Play + App Store Connect → internal testing → submit + reviewer OTP notes → Tier 3–4.**

---

## Quick commands (project folder)

```bash
eas login
eas whoami
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit -p android
eas submit -p ios
```

---

## Full printable checklist

See also: `APP_PUBLISH_CHECKLIST.md` in this folder.

---

*Expo SDK 54 · April 2026*
