# Relate — full app + publishing guide

Relate now runs on **Supabase** end to end: Postgres database, authentication,
and an Edge Function that talks to Claude. There is no separate server to
host or maintain — the mobile app talks to Supabase directly.

**The Supabase project is already live.** I created it, set up the database
tables with row-level security (each user can only ever see their own data),
deployed the AI Edge Function, and wired the app's `src/supabaseClient.js` to
point at it. Project ref: `ntopftzqsszwxzlgndef`.

⚠️ **Free-tier note:** Supabase pauses free projects after a period of
inactivity, and restoring a paused project can reset the database schema (this
happened once already while building this). If the app ever starts erroring
on login after a quiet period, check the project isn't paused at
https://supabase.com/dashboard/project/ntopftzqsszwxzlgndef — if it needs
restoring, tell me and I'll rebuild the schema again (it takes a minute). For
a real public launch, upgrading to Supabase's paid tier removes this risk
entirely.

```
relate-app/
  mobile/     — the React Native (Expo) app — this is the whole project
```

---

## 1. Add your Anthropic key (only manual step for the AI features)

**Dashboard (no terminal):**
1. Go to https://supabase.com/dashboard/project/ntopftzqsszwxzlgndef/settings/functions
2. Add a new secret named `ANTHROPIC_API_KEY`, value from https://console.anthropic.com/settings/keys
3. Save

**Or CLI:**
```
npm install -g supabase
supabase login
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here --project-ref ntopftzqsszwxzlgndef
```

---

## 2. The paywall — how it actually takes real money

The flow is: sign up → onboarding (collects name, age, situations, goals) →
**paywall** → app. This matches what you asked for — full detail collection
before the pricing screen. Three tiers are wired in exactly as you specified:
Weekly $9.99, Monthly $28.99 ("Most popular"), Lifetime $99.99 ("Best value").

**Important limitation, stated plainly:** I cannot process real payments —
no one but Apple/Google can, and it has to run through their systems tied to
your developer accounts. Right now the app ships in **test mode**: tapping
"Unlock Relate Pro" simulates a purchase by flipping a flag in your own
database, so you can build, test, and demo the entire app immediately with
zero setup. No real money moves in test mode.

**To take real payments, three things need to happen (all outside what I can do):**

1. **Create a RevenueCat account** (revenuecat.com, free up to $2.5k/mo
   tracked revenue). It's the standard bridge between Expo apps and both
   stores' billing — handles receipts, renewals, and cross-platform
   entitlements so you don't write that yourself.
2. **In App Store Connect and Google Play Console**, create three in-app
   purchase products with these exact IDs (already wired into the code):
   - `relate_weekly` — auto-renewing subscription, $9.99/week
   - `relate_monthly` — auto-renewing subscription, $28.99/month
   - `relate_lifetime` — non-consumable, $99.99 one-time
3. **In RevenueCat**, link those products, create an entitlement called
   `premium`, and put your two RevenueCat public SDK keys into
   `mobile/src/purchases.js` (`REVENUECAT_IOS_KEY` / `REVENUECAT_ANDROID_KEY`
   near the top of the file — the only two lines you'd ever need to touch).
   Once both keys are set, test mode turns itself off automatically and real
   purchases start flowing.

One more real constraint: **`react-native-purchases` is a native module — it
does not run inside Expo Go.** Once you've done the three steps above, you'll
need a custom dev build to actually test real purchases:
```
npx expo install expo-dev-client
eas build --profile development --platform ios
```
(same idea for Android). Test mode works fine in plain Expo Go in the
meantime — only real purchases need the custom build.

**Apple/Google review note:** subscription apps must show a "Restore
purchases" option (already in the paywall) and must not misrepresent pricing
or auto-renewal terms — the small print under the button already states
auto-renewal, which both stores require.

---

## 3. Test it live on your phone (no build needed, test-mode purchases)

```
cd mobile
npm install
npx expo start
```
Scan the QR code with **Expo Go**. Sign up, complete onboarding, and you'll
land on the paywall — tap a plan, "purchase" in test mode, and you're into
the full app.

---

## 4. Accounts you need before building for the stores

| What | Cost | Where |
|---|---|---|
| Apple Developer Program | $99/year | developer.apple.com |
| Google Play Console | $25 one-time | play.google.com/console |
| Expo / EAS account | Free | expo.dev |
| RevenueCat | Free up to $2.5k/mo | revenuecat.com |

All of these have to be yours — payouts and legal ownership run through them.

---

## 5. Build

Real app icons are already in `mobile/assets/` — I generated them for you
(the two-curve mark on the indigo-to-violet gradient).

```
npm install -g eas-cli
eas login
cd mobile
eas build:configure
```
Edit `app.json`: change `com.yourcompany.relate` (both `ios.bundleIdentifier`
and `android.package`) to your own identifier, e.g. `com.janesmith.relate`.

```
eas build --platform all --profile production
```
15–30 minutes, no Xcode or Android Studio needed.

---

## 6. Write a privacy policy

Both stores require one. Given this app handles personal relationship data
sent to a third-party AI (Anthropic) *and* processes payments, disclose:
- what's collected (account email, relationship info, journal, chats, purchase status)
- that content is sent to Anthropic's API to generate responses
- that payments are processed by Apple/Google via RevenueCat
- how someone deletes their data (You → Privacy & settings → Delete account)
- that this isn't a therapy or crisis service

A free option: termsfeed.com, hosted on GitHub Pages.

---

## 7. Submit

```
eas submit --platform ios
eas submit --platform android
```
Fill in store listings (screenshots, description, category, privacy policy
link, content rating, and — since this app has subscriptions — Apple's
subscription-specific metadata in App Store Connect). Apple review: 1–3 days.
Google: often faster.

---

## What's already handled vs. what to add later

**Solid as-is:** full signup/login, database with row-level security, per-user
AI rate limiting, the complete product loop (people, facts, decisions,
journal, chat, message lab), a working animated paywall in test mode, and
real app icons.

**Worth adding before a public launch:**
- Real RevenueCat + store product setup (see section 2 — this is the one
  that actually turns on real payments)
- Password reset flow (Supabase supports it natively, not wired to a screen yet)
- Service-role account-deletion Edge Function for full auth-record deletion
- Push notifications for proactive intelligence nudges
- Voice mode, screenshot/OCR analysis (in the original spec, not built)

