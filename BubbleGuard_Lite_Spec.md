  
🫧

**BubbleGuard**

Complete Technical Specification & Product Plan

*Version 1.0  |  iOS  |  Ad-Supported  |  No Server Required*

# **1\. Product Overview**

BubbleGuard is a mindfulness iOS app that rewards users for staying off their phone. A cluster of connected bubbles grows on screen while the app is open. The moment the user switches away, bubbles begin popping. Staying present keeps the cluster alive and growing.

The app is free to download and runs entirely on the user's device — no account, no server, no subscriptions. A banner ad at the top of the screen is the only source of revenue. The user's all-time highest bubble count is saved locally so they always have a personal best to beat.

Operating cost after launch is effectively zero — the only recurring expense is the $99/year Apple Developer Program membership required to distribute on the App Store.

| Property | Value |
| :---- | :---- |
| Platform | iOS (iPhone first; iPad compatible) |
| Download price | Free |
| Monetization | Google AdMob banner ads |
| Data storage | On-device only (AsyncStorage) |
| Monthly cost | \~$0 (excluding $99/yr Apple Developer fee) |

# **2\. Full Tech Stack**

The stack is intentionally minimal. No backend, no auth library, no ORM, no networking layer beyond the AdMob SDK.

## **2.1 Mobile (Frontend — the entire app)**

| Layer | Technology | Notes |
| :---- | :---- | :---- |
| Framework | React Native (Expo SDK 51+) | Managed workflow — no ejecting needed |
| Language | TypeScript | Strict mode enabled |
| Navigation | expo-router (tab layout) | 2 tabs: Bubble canvas, Stats |
| Animations | react-native-reanimated 3 | Spring physics for bubble grow/pop |
| Graphics | react-native-svg | SVG canvas for bubble rendering (no connecting lines) |
| State | Zustand | In-memory app state |
| Local Storage | AsyncStorage (@react-native-async-storage/async-storage) | Stores all-time best count — unencrypted, non-sensitive |
| App State | AppState (React Native core) | Foreground/background detection |
| Haptics | expo-haptics | Feedback on bubble pop/spawn |
| Audio | expo-av | Grow sound on spawn, pop sound on pop — bundled .mp3 assets, no network required |
| Ads | react-native-google-mobile-ads | AdMob banner integration |
| Build | EAS Build (Expo Application Services) | Free tier sufficient for Lite |
| OTA Updates | EAS Update | Push JS bundle updates without App Store review |

## **2.2 Third-Party Services**

| Service | Purpose | Cost |
| :---- | :---- | :---- |
| Google AdMob | Banner ad serving & revenue | Free (revenue share) |
| EAS Build | Cloud build for .ipa files | Free tier: 30 builds/month |
| EAS Update | Over-the-air JS bundle updates | Free tier: 1,000 updates/month |
| Apple Developer Program | App Store distribution | $99/year — only recurring cost |

# **3\. Project Structure**

BubbleGuardLite/  
├── app/  
│   ├── (tabs)/  
│   │   ├── index.tsx           \# Bubble canvas screen (main)  
│   │   └── stats.tsx           \# All-time best \+ session info  
│   ├── \_layout.tsx             \# Root layout — tab config  
│   └── \+not-found.tsx  
├── components/  
│   ├── BubbleCanvas.tsx        \# SVG canvas \+ node orchestrator  
│   ├── BubbleNode.tsx          \# Single animated bubble (Reanimated)  
│   ├── BubbleCount.tsx         \# Live count badge  
│   └── BannerAd.tsx            \# AdMob banner wrapper  
├── hooks/  
│   ├── useBubbleEngine.ts      \# Grow/pop interval logic  
│   ├── useAppState.ts          \# Foreground/background listener  
│   ├── useBestScore.ts         \# AsyncStorage read/write for all-time best  
│   └── useSound.ts             \# expo-av sound playback for grow/pop  
├── store/  
│   └── useBubbleStore.ts       \# Zustand: bubbles\[\], currentCount, allTimeBest  
├── constants/  
│   └── config.ts               \# ADMOB\_BANNER\_ID, GROW\_INTERVAL\_MS, POP\_INTERVAL\_MS  
├── assets/  
│   ├── sounds/  
│   │   ├── bubble\_grow.mp3     \# Played on each bubble spawn  
│   │   └── bubble\_pop.mp3      \# Played on each bubble pop  
│   └── (icons, splash screen)  
├── app.json                    \# Expo config — bundle ID, permissions, AdMob App ID  
├── eas.json                    \# EAS Build & Update config  
└── .env                        \# EXPO\_PUBLIC\_ADMOB\_BANNER\_ID

# **4\. Local Data Storage**

All persistent data lives in AsyncStorage — React Native's built-in key-value store, backed by iOS's NSUserDefaults-layer storage. Data survives app restarts and phone reboots. It is lost if the user deletes the app.

## **4.1 Stored Keys**

| AsyncStorage Key | Type | Value | Notes |
| :---- | :---- | :---- | :---- |
| @bubbleguard/all\_time\_best | number | Highest bubble count ever reached | Written whenever current session count exceeds it; read on app launch |
| @bubbleguard/last\_session\_count | number | Peak count from the most recent session | Written at session end; shown on Stats tab |
| @bubbleguard/last\_session\_date | string | ISO date string of the last session | Displayed on Stats tab |
| @bubbleguard/total\_sessions | number | Lifetime number of completed sessions | Incremented at each session end |
| @bubbleguard/total\_focus\_mins | number | Cumulative foreground minutes across all sessions | Incremented at each session end |

*That is the complete data model. No other state is persisted. No user PII is collected or stored anywhere.*

# **5\. Screens & UX**

Two tabs only. No auth screens, no store, no settings beyond what iOS provides natively.

## **6.1 Bubble Canvas (Tab 1 — Main)**

* On first launch: one bubble appears at center with a soft spring scale-in animation. No onboarding flow — the app explains itself.

* Banner ad is pinned to the top of the screen, above the bubble canvas. A small safe-area inset ensures bubbles never render behind the ad.

* Bubble count badge displayed in the corner. If current count exceeds the all-time best, a small 'New Best\!' indicator pulses beside it.

* Every 5 seconds: a new bubble spawns touching the cluster. Its position is calculated so it sits flush against the nearest existing bubble with zero gap and zero overlap — no connecting lines are drawn between bubbles. A grow sound plays and a light haptic fires on each spawn.

* When user leaves the app (AppState → background): pop timer starts — one bubble removed every 2 seconds, oldest-first. A pop sound plays and a haptic fires on each pop.

* When user returns (AppState → active): pop timer stops, grow timer resumes from zero.

* Session ends when: all bubbles pop, or user taps the reset button. On end, peak count is compared to all-time best and AsyncStorage is updated if exceeded. Stats keys are also updated.

* As the cluster grows, the SVG viewBox expands continuously to keep all bubbles visible — the canvas zooms out smoothly so the full cluster always fits on screen. The zoom is recalculated on every spawn based on the bounding box of all bubble centers plus a fixed padding margin.

## **6.2 Stats (Tab 2\)**

* All-time best bubble count — displayed prominently.

* Last session: peak count \+ date.

* Total sessions completed (lifetime).

* Total focus time in hours and minutes (lifetime foreground time).

* A simple reset button to clear all stored data (with a confirmation prompt).

* A clean, minimal layout showing exactly the five values from AsyncStorage — nothing more.

# **6\. Bubble Engine Logic**

All timers are managed client-side via setInterval. There is no server involvement. The engine has three responsibilities: placement (no overlap), timing (grow every 5s, pop every 2s), and viewport scaling (zoom out as cluster grows).

## **6.1 Grow Logic**

* On mount: a single bubble is created at the canvas center with id=1, position={cx, cy}, radius=28. The grow interval starts immediately at 5,000ms (5 seconds).

* Placement algorithm — no overlap, flush contact: to place each new bubble, a candidate angle is sampled around the perimeter of the existing cluster. The candidate center is set at distance (existingRadius \+ newRadius) from the nearest bubble center — exactly touching with zero gap. The candidate is then checked against every other existing bubble; if it overlaps any (distance \< r1 \+ r2), the angle is incremented and retried. This continues until a valid non-overlapping position is found.

* No connecting lines are drawn. Bubbles are rendered as plain SVG \<Circle\> elements only — the touching geometry implies the cluster relationship visually without explicit lines.

* On each successful placement: the new bubble is added to the Zustand array. The grow sound (bubble\_grow.mp3) is played via expo-av. A light haptic fires. The viewBox is recalculated (see 7.3).

* If current count \> allTimeBest in Zustand, AsyncStorage is updated immediately.

## **6.2 Pop Logic**

* On AppState change to 'background': grow interval is cleared. Pop interval starts at 2,000ms (2 seconds).

* On each pop tick: the oldest bubble (lowest id) is removed from the Zustand array. The pop sound (bubble\_pop.mp3) plays via expo-av. A medium haptic fires. The viewBox is recalculated.

* On AppState change to 'active': pop interval is cleared. Grow interval restarts at 5,000ms.

* If the bubbles array reaches length 0: session end is triggered. Stats are written to AsyncStorage. The canvas resets to a single bubble after a 1-second delay.

## **7.3 Zoom / ViewBox Scaling**

* The SVG element fills the full screen (minus the ad banner height). Its viewBox is not fixed — it is derived from the current bubble positions on every render.

* On each spawn or pop, the engine computes the bounding box of all bubble centers: minX, maxX, minY, maxY. A padding of 2× the bubble radius is added on all sides.

* The viewBox is set to: viewBox=\`${minX \- pad} ${minY \- pad} ${width} ${height}\` where width/height are the padded bounding box dimensions.

* As more bubbles are added and the cluster spreads, the viewBox grows, making all bubbles appear to shrink — a natural zoom-out effect. The transition is animated with a short duration (150ms) using react-native-reanimated's shared value driving the SVG viewBox props, so the zoom feels smooth rather than a hard jump.

* On pop, the viewBox shrinks back slightly — the cluster appears to zoom in a little as it contracts.

## **6.4 Sound**

* expo-av is used for audio playback. Both sounds are bundled as local .mp3 assets (assets/sounds/) — no network requests, no streaming.

* On app mount, both Audio.Sound objects are loaded and kept in memory (useSound hook) so playback is instantaneous with no load delay on each event.

* If the device is on silent/mute (iOS ringer switch off), sounds are suppressed automatically by the OS — no special handling needed.

* Audio.Sound.replayAsync() is used for rapid sequential plays (e.g. if a large batch of bubbles pops quickly) so each pop triggers its own sound without the previous one needing to finish.

# **7\. Advertising (Google AdMob)**

## **7.1 Ad Format**

| Property | Value |
| :---- | :---- |
| Ad network | Google AdMob |
| Format | Banner (adaptive banner — fills device width) |
| Position | Top of screen, below the iOS status bar / notch safe area |
| Refresh rate | AdMob default (every 30–60 seconds, managed by the SDK) |
| Ad unit | One banner unit ID per platform (iOS) |

Adaptive banner is preferred over fixed-size banner because it automatically sizes to the device width, looks better on all iPhone models, and typically earns higher eCPM than fixed 320x50.

## **7.2 Integration**

* Package: react-native-google-mobile-ads (the community successor to the deprecated expo-ads-admob).

* AdMob App ID is registered in app.json under expo.plugins configuration — required for iOS builds.

* The banner ad unit ID is stored in .env as EXPO\_PUBLIC\_ADMOB\_BANNER\_ID and referenced in constants/config.ts.

* During development and TestFlight testing, the AdMob test banner unit ID is used (ca-app-pub-3940256099942544/6300978111) to avoid invalid traffic penalties.

* The BannerAd component wraps the SDK's \<BannerAd\> with a fixed-height container matching the adaptive banner height, so the bubble canvas always knows how much vertical space is available and never renders bubbles behind the ad.

## **7.3 Privacy & ATT**

* Apple's App Tracking Transparency (ATT) framework requires a permission prompt before AdMob can serve personalized ads on iOS 14.5+.

* react-native-google-mobile-ads includes the UMP (User Messaging Platform) SDK which handles the ATT prompt and consent flow automatically on first launch.

* If the user declines tracking, AdMob falls back to non-personalized ads. Revenue is lower but the app still functions and earns.

* A NSUserTrackingUsageDescription string is added to Info.plist (via app.json) explaining why tracking is requested: shown in the ATT prompt.

* No additional privacy policy or data collection disclosures are required beyond what AdMob's UMP consent screen covers — since the app itself collects zero user data.

## **7.4 Revenue Expectations**

Banner ads on a mindfulness/focus app will earn modest revenue. Rough benchmarks for context (not guarantees):

| Metric | Estimate |
| :---- | :---- |
| iOS banner eCPM | $0.50 – $2.00 (varies heavily by region, season, and fill rate) |
| DAU needed for $100/mo | \~2,000–5,000 daily active users at average eCPM |
| Primary value of ads | Zero operating cost — the app earns something even with modest installs |

# **8\. Security & Privacy**

Because there is no server, no network traffic (except AdMob), and no PII collected, the security surface is extremely small.

## **8.1 Data Collection**

| Data Type | Collected? | Notes |
| :---- | :---- | :---- |
| Name, email, or any PII | No | No account system — never requested |
| Location | No | Not requested; no location permission in Info.plist |
| Device ID / IDFA | No (app-level) | AdMob may use IDFA for ad targeting if user consents via ATT prompt — managed by AdMob SDK, not the app |
| Usage analytics | No | No analytics SDK included in Lite |
| Crash reports | No | Sentry not included — keep it simple |
| Bubble count / session data | Yes | Stored locally on device only; never transmitted |

## **9.2 AsyncStorage Security**

* AsyncStorage is unencrypted by default on iOS (backed by NSUserDefaults-level storage). This is acceptable here because the only data stored is bubble counts — not credentials, tokens, or PII.

* No sensitive data ever touches AsyncStorage. If sensitive data were needed in future, expo-secure-store (iOS Keychain) would be used instead.

## **9.3 App Transport Security**

* ATS is fully enabled. No NSAllowsArbitraryLoads exceptions.

* AdMob's SDK is ATS-compliant and uses HTTPS for all ad requests — no exceptions needed.

## **8.4 App Store Privacy Manifest**

* Apple requires a PrivacyInfo.xcprivacy file for apps using certain APIs. AsyncStorage accesses NSUserDefaults which is a required-reason API.

* The privacy manifest declares: NSUserDefaults access with reason 'CA92.1' (app functionality — storing user preferences).

* No other required-reason APIs are used. AdMob's SDK ships its own privacy manifest.

# **9\. Cost Analysis**

Full operating cost breakdown after launch:

| Item | Cost | Frequency | Notes |
| :---- | :---- | :---- | :---- |
| Apple Developer Program | $99 | Per year | Required for App Store distribution — only recurring cost |
| EAS Build | $0 | Per month | Free tier: 30 builds/month — more than enough |
| EAS Update | $0 | Per month | Free tier: 1,000 updates/month — enough for most apps |
| Backend server | $0 | Per month | None |
| Database | $0 | Per month | None |
| AdMob | $0 | Per month | Free to use; AdMob pays you |
| Domain / SSL | $0 | Per month | Not needed — no web backend |
| Total | $8.25 | Per month | ($99 / 12 months) |

# **10\. Phased Build Order**

A single developer can ship this in 2–3 weeks.

| Phase | Deliverable | Key Tasks |
| :---- | :---- | :---- |
| 1 — Scaffolding | Running Expo project | expo-router setup, 2-tab layout (Bubble, Stats), TypeScript config, Zustand store, EAS project linked |
| 2 — Bubble Engine | Core gameplay loop | useBubbleEngine (5s grow / 2s pop intervals), useAppState hook, BubbleCanvas SVG rendering with dynamic viewBox zoom-out, non-overlapping placement algorithm, BubbleCount badge, grow/pop sounds via expo-av, haptics |
| 3 — Local Persistence | Stats saved across launches | useBestScore hook, AsyncStorage read/write, Stats tab UI showing all 5 metrics, reset confirmation flow |
| 4 — AdMob | Ads live | react-native-google-mobile-ads setup, AdMob account \+ ad unit created, BannerAd component, ATT consent prompt via UMP, test vs production ad unit IDs |
| 5 — Polish & Submit | App Store submission | App icon \+ splash screen, Privacy manifest, App Store listing copy \+ screenshots, TestFlight beta, App Store review submission |

# **11\. Environment Variables**

There are very few — just the AdMob IDs:

\# AdMob  
EXPO\_PUBLIC\_ADMOB\_APP\_ID=ca-app-pub-XXXXXXXXXXXXXXXX\~XXXXXXXXXX  
EXPO\_PUBLIC\_ADMOB\_BANNER\_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX  
   
\# During development / TestFlight — swap for real IDs in production  
\# EXPO\_PUBLIC\_ADMOB\_BANNER\_ID=ca-app-pub-3940256099942544/6300978111

*The AdMob App ID also needs to be declared in app.json under the expo-ads-admob plugin config so it's embedded in the iOS binary at build time — the SDK will crash at startup without it.*

# **12\. App Store Launch Requirements**

Everything required to submit BubbleGuard to the Apple App Store and pass review. Each item must be completed before submission.

## **12.1 Apple Developer Account Setup**

| Task | Details | Status |
| :---- | :---- | :---- |
| Enroll in Apple Developer Program | $99/year at developer.apple.com. Requires Apple ID \+ payment. | Required before any builds |
| Accept latest Apple Developer Agreement | Check for pending agreements in App Store Connect under Agreements. | Required before submission |
| Create App ID (Bundle ID) | Format: com.yourcompany.bubbleguard — must match app.json and AdMob config exactly. | Required before first build |
| Create App Store Connect record | Log in to appstoreconnect.apple.com, click '+' under My Apps, fill in name, bundle ID, SKU, language. | Required before submission |
| Configure Xcode signing | EAS Build handles provisioning profiles automatically — link your Apple account in eas.json credentials. | Required for EAS Build |

## **12.2 App Store Connect Listing**

All fields must be filled before submission. Apple rejects submissions with placeholder content.

| Field | Requirement | Notes |
| :---- | :---- | :---- |
| App Name | Max 30 characters | 'BubbleGuard' — 11 characters, no issues |
| Subtitle | Max 30 characters | e.g. 'Stay Off Your Phone' or 'Grow Your Bubble Streak' |
| Description | Max 4,000 characters | Full app description — what it does, how it works, key features. No mention of unimplemented features. |
| Promotional Text | Max 170 characters | Displayed above description. Can be updated without a new build. Good for announcements. |
| Keywords | Max 100 characters total, comma-separated | e.g. focus,mindfulness,screen time,bubble,productivity,phone addiction,digital wellness |
| Support URL | Must be a live, accessible URL | A simple landing page or GitHub page is fine. Must respond with 200\. |
| Marketing URL | Optional | Can be same as support URL for v1 |
| Privacy Policy URL | Required — Apple mandates this for all apps | Must be hosted and publicly accessible before submission. See Section 12.5. |
| Copyright | e.g. '© 2025 Your Name or Company' |  |
| Category | Primary: Health & Fitness. Secondary: Productivity |  |
| Age Rating | Complete the questionnaire in App Store Connect | BubbleGuard should rate 4+ (no objectionable content) |
| Price | Free | Set in Pricing and Availability tab |
| Availability | All territories (default) | Or restrict as needed |

## **12.3 App Store Screenshots & Assets**

All screenshots must be taken from a real device or Simulator. No placeholder images. Apple rejects screenshots containing the iOS status bar with anything other than 9:41 AM.

| Asset | Specification | Quantity |
| :---- | :---- | :---- |
| iPhone 6.9" screenshots | 1320 × 2868 px (iPhone 16 Pro Max size) — REQUIRED | 3–10 screenshots |
| iPhone 6.5" screenshots | 1242 × 2688 px (iPhone 11 Pro Max size) — REQUIRED for older devices | 3–10 screenshots |
| App Icon (1024×1024) | PNG, no alpha channel, no rounded corners (Apple applies the mask) | 1 file |
| App Icon (all sizes) | Managed via Expo — define once in app.json as a 1024×1024 source, EAS generates all required sizes | Auto-generated |

* Screenshots must show the actual app UI — bubble canvas with bubbles growing, stats screen. A simple caption overlay ('Stay off your phone. Watch your bubbles grow.') helps conversion.

* A preview video (15–30 seconds) is optional but strongly recommended for a visually animated app like this — significantly improves conversion rate on the listing page.

## **12.4 App Info.plist Requirements**

These keys must be present in Info.plist (managed via app.json in Expo) before submission:

| Plist Key | Value / Purpose | Required By |
| :---- | :---- | :---- |
| NSUserTrackingUsageDescription | String explaining why tracking is requested — shown in ATT prompt. e.g. 'BubbleGuard uses this to show relevant ads.' | Apple \+ AdMob ATT |
| NSPrivacyAccessedAPITypes | Array declaring NSUserDefaults access with reason CA92.1 (app functionality) | Apple Privacy Manifest (required since May 2024\) |
| GADApplicationIdentifier | Your AdMob App ID (ca-app-pub-...) | AdMob SDK — crashes without this |
| SKAdNetworkItems | AdMob's list of SKAdNetwork IDs for attribution | AdMob — causes App Store rejection if missing |
| CFBundleDisplayName | BubbleGuard | App name shown on home screen |
| LSMinimumSystemVersion / MinimumOSVersion | iOS 16.0 minimum recommended | Defines device eligibility |
| UIRequiresFullScreen | true | Prevents split-screen on iPad if not supported |

* The GADApplicationIdentifier and SKAdNetworkItems are configured via the expo-ads-admob plugin in app.json — Expo injects them into Info.plist at build time automatically.

* Privacy Manifest (PrivacyInfo.xcprivacy) must be included for NSUserDefaults access. Expo handles this via the bare workflow or via a config plugin. Verify it appears in the built .ipa before submission.

## **12.5 Privacy Policy**

Apple requires every app to have a publicly accessible Privacy Policy URL, regardless of whether the app collects user data. This cannot be skipped.

**What the Privacy Policy Must Cover**

* What data is collected — for BubbleGuard: none by the app itself. State this explicitly.

* What data AdMob may collect — device identifiers (IDFA if ATT consent granted), IP address, ad interaction data. Reference Google's AdMob Privacy Policy (policies.google.com/privacy) as the processor.

* How data is used — ad personalization (only if ATT consent granted), otherwise non-personalized ads.

* How users can opt out — iOS Settings \> Privacy \> Tracking to revoke ATT consent at any time.

* Contact information — an email address for privacy inquiries.

* Effective date and jurisdiction.

**How to Host It**

* Simplest option: a single-page GitHub Pages site (free). Create a repo, enable Pages, add a privacy\_policy.md. URL format: yourusername.github.io/bubbleguard-privacy

* Alternative: Notion public page, Carrd.co free tier, or any static hosting. Must be HTTPS and load without login.

* The URL must be live before you submit the app. Apple checks it.

## **12.6 Terms of Service**

A Terms of Service (ToS) / End User License Agreement (EULA) is not strictly required by Apple for free apps with no accounts, but is strongly recommended to limit liability. Apple provides a standard EULA that applies by default — you may optionally provide your own.

**Apple's Standard EULA (Default)**

* If you do not provide a custom EULA, Apple's standard Licensed Application End User License Agreement automatically applies. This covers most basic scenarios for a free app with no accounts.

* To use the default: simply leave the 'License Agreement' field blank in App Store Connect.

**Custom EULA (Recommended Additions)**

* Disclaimer of warranties — the app is provided 'as is'; no guarantee of uptime, accuracy, or fitness for purpose.

* Limitation of liability — you are not liable for any damages arising from use of the app.

* Acceptable use — users may not reverse-engineer or misuse the app.

* Ad disclosure — the app displays third-party advertisements served by Google AdMob.

* Governing law — specify your jurisdiction (e.g. State of Oregon, USA).

* Contact — an email address for legal inquiries.

*A custom EULA can be hosted at the same URL as the privacy policy (separate page) and entered in the 'License Agreement' field in App Store Connect under your app's General Information.*

## **12.7 App Store Review Guidelines — Key Rules to Follow**

Apple's review team will check the app against these guidelines. Common rejection reasons for apps like BubbleGuard:

| Guideline | Rule | BubbleGuard Status |
| :---- | :---- | :---- |
| 2.1 — App Completeness | App must be fully functional at submission. No placeholder screens, test content, or broken flows. | Ensure bubble engine, stats, and ads are all live and working on a real device before submitting. |
| 2.3.3 — Accurate Metadata | Screenshots must reflect the actual current UI. No misleading claims in description. | Use real screenshots. Description must not mention features not in the build. |
| 3.1.1 — Payments | If collecting payments, must use StoreKit. BubbleGuard collects no payments. | N/A — app is free with no IAP. |
| 3.2.1 — Acceptable Business Models | Ad-supported apps are permitted. AdMob is an approved network. | Compliant — AdMob banner only. |
| 4.0 — Design | App must be designed for iOS and follow Human Interface Guidelines. | Ensure the bubble canvas fills the screen properly, respects safe areas, and the ad does not cover interactive UI. |
| 4.2 — Minimum Functionality | App must have sufficient utility. Single-purpose apps are acceptable if they do it well. | The bubble mechanic must feel polished. A broken or janky engine will get rejected here. |
| 5.1.1 — Data Collection | Apps must have a privacy policy. Must not collect more data than declared. | Privacy policy required (Section 12.5). AdMob ATT prompt must appear before any tracking. |
| 5.1.2 — Data Use & Sharing | Must be transparent about third-party data sharing (AdMob). | Reference AdMob in the privacy policy. |

## **12.8 TestFlight Beta Testing**

TestFlight testing is required before App Store submission. It catches device-specific issues that the Simulator misses — ad rendering, haptics, audio, AppState transitions on real hardware.

* Build a TestFlight binary via EAS: eas build \--platform ios \--profile production

* Upload to App Store Connect via eas submit or Transporter.

* Invite internal testers (up to 100 Apple IDs on your developer account) immediately — no review needed.

* External TestFlight (up to 10,000 testers) requires a brief Beta App Review by Apple — usually 1–2 days.

* Test checklist on real device: bubbles spawn every 5s, pop every 2s when backgrounded, sounds play, haptics fire, ad banner loads, stats persist across kills, ATT prompt appears on first launch, all safe areas respected on notched and Dynamic Island devices.

* Fix all crashes and ANRs before submitting to App Store review. Apple's review uses real devices — crashes cause immediate rejection.

## **12.9 App Store Submission Checklist**

Complete every item before clicking 'Submit for Review' in App Store Connect:

| \# | Item | Done? |
| :---- | :---- | :---- |
| 1 | Apple Developer Program membership active ($99/yr paid) | ☐ |
| 2 | App ID created in developer.apple.com with correct bundle ID | ☐ |
| 3 | App record created in App Store Connect | ☐ |
| 4 | All App Store Connect listing fields filled (name, subtitle, description, keywords, URLs) | ☐ |
| 5 | Privacy Policy URL live and accessible over HTTPS | ☐ |
| 6 | Support URL live and accessible | ☐ |
| 7 | App icon 1024×1024 PNG uploaded (no alpha, no transparency) | ☐ |
| 8 | Screenshots uploaded for 6.9" and 6.5" iPhone sizes | ☐ |
| 9 | Age rating questionnaire completed (expect 4+) | ☐ |
| 10 | Price set to Free | ☐ |
| 11 | AdMob App ID in app.json / Info.plist (GADApplicationIdentifier) | ☐ |
| 12 | SKAdNetworkItems in Info.plist (from AdMob documentation) | ☐ |
| 13 | NSUserTrackingUsageDescription string in Info.plist | ☐ |
| 14 | PrivacyInfo.xcprivacy manifest included in build | ☐ |
| 15 | ATT consent prompt tested — appears on first launch, works correctly | ☐ |
| 16 | Production AdMob ad unit IDs active (not test IDs) in production build | ☐ |
| 17 | AdMob account verified and payment info entered at admob.google.com | ☐ |
| 18 | Tested on real iPhone device (not just Simulator) via TestFlight | ☐ |
| 19 | All 5 AsyncStorage values persist correctly across app kills | ☐ |
| 20 | Bubble engine tested: grow on foreground, pop on background, sounds, haptics | ☐ |
| 21 | Safe areas respected on all tested device sizes (iPhone SE through Pro Max) | ☐ |
| 22 | No crashes on TestFlight for at least 24 hours of testing | ☐ |
| 23 | Export Compliance — answer 'No' to encryption question (AdMob uses standard HTTPS, not custom encryption) | ☐ |
| 24 | Terms of Service / EULA in place (Apple default or custom hosted URL) | ☐ |
| 25 | App Store review notes filled in (optional but helpful — explain any non-obvious behavior) | ☐ |

* Apple review typically takes 1–3 business days for a new app. Expedited review can be requested for genuine time-sensitive launches (e.g. holiday seasonal tie-in) via the Resolution Center.

* If rejected, Apple sends a detailed rejection notice. Most rejections are fixable within a day. Common first-submission rejections: missing privacy policy, metadata mismatch with screenshots, ATT prompt issues.

## **12.10 Post-Launch**

* Monitor AdMob dashboard at admob.google.com — first ad revenue appears within 24–48 hours of real user installs.

* Monitor App Store Connect Analytics for downloads, crashes (Xcode Organizer), and ratings.

* Respond to App Store reviews — Apple surfaces developer responses and it builds trust.

* First update: submit within 2–4 weeks to fix any post-launch issues. Updates go through review again (usually faster than the initial review for updates).

* Enable App Store automatic updates in App Store Connect so users always get the latest build.

