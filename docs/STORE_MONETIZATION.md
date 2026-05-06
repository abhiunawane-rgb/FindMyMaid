# Monetization setup (iOS & Android)

Store **product IDs** and App Store / Play Console setup are documented here for developers only — they are **not** shown on the public marketing site.

FindMyMaid uses **in-app subscriptions** for:

- **Families (users):** Premium — unlimited contacts per month (`USER_PLANS` in `src/constants/subscriptions.ts`).
- **Helpers (maids):** Maid Pro — unlimited incoming leads per month (`MAID_PLANS`).

The app currently **simulates purchases** locally (demo) so you can test flows. For real money, connect **StoreKit** (iOS) and **Google Play Billing** (Android).

## 1. Apple App Store (iOS)

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/).
2. In [App Store Connect](https://appstoreconnect.apple.com/), create the app record for **FindMyMaid**.
3. Under **Features → In-App Purchases**, create **auto-renewable subscriptions** with product IDs matching:

   - `fmm_user_premium_monthly`
   - `fmm_user_premium_yearly`
   - `fmm_maid_pro_monthly`
   - `fmm_maid_pro_yearly`

4. Create subscription groups (e.g. “User Premium” and “Maid Pro”) and attach monthly/yearly products.
5. Add **Privacy Policy URL** (host the `website/privacy.html` page on your domain).
6. Build with [EAS Build](https://docs.expo.dev/build/introduction/) or Xcode and submit to **TestFlight**, then App Review.

### Recommended libraries

- [`expo-in-app-purchases`](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/) or
- [RevenueCat](https://www.revenuecat.com/) (`react-native-purchases`) for receipt validation and cross-platform product mapping.

Replace calls to `purchaseUserPremium` / `purchaseMaidPro` in `AppContext.tsx` with real purchase flows that update expiry from the store receipt.

## 2. Google Play (Android)

1. Create an app in [Google Play Console](https://play.google.com/console/).
2. Under **Monetize → Subscriptions**, create subscriptions with the **same product IDs** as above (Play allows similar IDs per app).
3. Complete **Data safety** and **Privacy policy** (link to your hosted privacy page).
4. Upload an **AAB** from EAS Build or Gradle, use **internal testing** first, then production.

### Billing library

Use **Google Play Billing Library v6+** via React Native module or RevenueCat.

## 3. Legal & store listing

- Host **Privacy Policy** and **Terms** (see `/website` in this repo).
- Disclose: contact happens **outside the app**; you do not process salary payments for services inside the app.
- India: comply with **Google Play** and **RBI** guidelines for digital goods where applicable.

## 4. Environment

- Set `WEBSITE_BASE_URL` in `src/constants/subscriptions.ts` to your real domain (e.g. `https://www.findmymaid.online`).
- Use **HTTPS** for all policy URLs in store consoles.
