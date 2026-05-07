# FindMyMaid — Google Play Store Ready (Step-by-Step)

This is your **non-technical, do-this-in-order** guide to publish on Google Play.

**App ID:** `com.findmymaid.app`  · **Version:** `1.0.0`  · **versionCode:** `1`
**Production API:** `https://findmymaid-production.up.railway.app`

> What's already done in code (no action needed from you):
> - `eas.json` has a `production` profile that builds an **AAB** (Play requires this).
> - `EXPO_PUBLIC_API_URL` is hardcoded in the production build to your Railway URL.
> - `android.versionCode = 1` is set in `app.json`.
> - Submit profile points to Play **internal testing** track.
> - Permissions, package name, and icons are all configured.

---

## Step 1 — Make sure backend is healthy

Before building, the production API must respond.

1. Open: `https://findmymaid-production.up.railway.app/health`
2. You should see something like: `{"ok":true,"service":"findmymaid-api"}`

If you still get **502**:
- Railway → service → **Settings → Networking → Public domain** → set **Target Port** to `8080`.
- Make sure `OTP_DEV_BYPASS` is **NOT** set on Railway (or set to `false`).
- Make sure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` are all filled.

---

## Step 2 — Pay & open Google Play Console

1. Go to https://play.google.com/console
2. Pay the **one-time** developer registration fee (~$25).
3. Accept developer agreements.
4. Click **Create app** and fill:
   - App name: `FindMyMaid`
   - Default language: English (or your choice)
   - App or game: **App**
   - Free / Paid: **Free**
   - Declarations: tick all required boxes truthfully.

---

## Step 3 — Install EAS CLI on your PC (one-time)

Open **PowerShell** in your project folder and run:

```bash
npm install -g eas-cli
eas login
eas whoami
```

`eas whoami` should print your Expo username. If it doesn't, run `eas login` again.

---

## Step 4 — Link the project to EAS (one-time)

In the project folder:

```bash
eas init
```

Follow prompts. This links your local code to your Expo account.

---

## Step 5 — Build the production AAB

```bash
eas build --platform android --profile production
```

- Takes ~10–20 minutes on EAS servers.
- When finished, EAS shows a **download link** — that's your **`.aab`** file. Save it.

---

## Step 6 — Fill required Play Console pages

In Play Console, on the left sidebar, complete each item that has a red exclamation mark.

| Section | What to do |
|---------|-----------|
| **App content → Privacy policy** | Paste: `https://www.findmymaid.online/privacy.html` (must be a real, working URL). |
| **App content → App access** | "All functionality available without restrictions" OR provide test sign-in (see Step 9). |
| **App content → Ads** | Choose **No** (if your app has no ads). |
| **App content → Content rating** | Fill the questionnaire. |
| **App content → Target audience** | Adults (18+) is simplest. |
| **App content → Data safety** | Declare: phone number, location, photos. Mark each as collected for "App functionality". |
| **App content → Government apps** | Select **No**. |
| **App content → News apps** | Select **No**. |
| **Store listing** | App name, short description (≤80 chars), full description, app icon (512×512), feature graphic (1024×500), at least 2 phone screenshots. |

---

## Step 7 — Upload AAB to Internal Testing first

1. Play Console → **Testing → Internal testing**.
2. Click **Create new release**.
3. **Upload** the `.aab` you got from EAS in Step 5.
4. **Release name:** `1.0.0 (1)`.
5. **Release notes** (English):
   ```
   First release of FindMyMaid — find verified domestic helpers nearby.
   ```
6. Click **Save → Review release → Start rollout to Internal testing**.
7. Add yourself as a tester (Testers tab → create email list with your email).
8. Use the **opt-in URL** Google gives you on your phone, install, and **test sign-in with real OTP**.

---

## Step 8 — Move to Production

When internal testing works:

1. Play Console → **Production → Create new release**.
2. Promote the same AAB (or upload again) → fill release notes → **Save → Review → Roll out**.
3. Submit for review.

Reviews typically take **a few hours to a few days**.

---

## Step 9 — Reviewer sign-in notes (paste in Play Console)

Play Console → **App content → App access** → **Add instructions**. Paste:

```
This app uses phone + SMS OTP. There is no email/password.

1) Open the app, choose Family or Helper, enter a display name (2+ characters).
2) Enter a real mobile number that can receive SMS.
3) Tap "Send verification code" — an SMS arrives via Twilio Verify.
4) Enter the 6-digit code on the next screen.
5) Continue to the main app.

If a test number is needed, please contact: support@findmymaid.online
```

---

## Step 10 — When you ship updates later

Each new build needs a **new versionCode** in `app.json`:

```json
"android": {
  "versionCode": 2   // increment by 1 every release
}
```

Or just leave it — `eas.json` has `autoIncrement: true` so EAS bumps it for you. Then:

```bash
eas build --platform android --profile production
```

Upload the new AAB to Play Console → new release → roll out.

---

## Quick checklist

- [ ] `https://findmymaid-production.up.railway.app/health` returns OK
- [ ] Google Play Console account paid & created
- [ ] `eas login` works on your PC
- [ ] `eas build --platform android --profile production` succeeds
- [ ] AAB uploaded to **Internal testing**
- [ ] Privacy policy URL live at `https://www.findmymaid.online/privacy.html`
- [ ] Data safety, content rating, store listing all green in Play Console
- [ ] Real OTP sign-in works on installed test build
- [ ] Promoted to **Production** and submitted

---

## What I CANNOT do for you (you must do these in browser/PC)

1. Pay Google Play fee.
2. Run `eas build` (only you have your Expo login).
3. Upload AAB and fill forms in Play Console.
4. Host privacy policy/terms on `findmymaid.online`.
5. Click "Submit for review".

Everything in code is ready. Once Step 1's `/health` passes, you can run Step 5 today.
