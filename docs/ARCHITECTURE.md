# WApp (Worldener) — Architecture Guide

Developer/agent map for changing code safely. For product features and user flows, see [`APP_FEATURES.md`](../APP_FEATURES.md). For the REST client and services, see [`API.md`](./API.md). For reusable groups (crews/trips), see [`REUSABLE_GROUPS_APP_IMPLEMENTATION.md`](./REUSABLE_GROUPS_APP_IMPLEMENTATION.md) and [`BACKEND_REUSABLE_GROUPS.md`](./BACKEND_REUSABLE_GROUPS.md).

---

## Stack

| Layer | Choice |
|--------|--------|
| Framework | React Native **0.81**, React **19** (mostly `.js` / `.jsx`) |
| App name | `WApp` (`app.json`); Android `com.worldener`; iOS prod `live.worldener.app` / UAT `com.worldener.app.uat` |
| Navigation | React Navigation 7 (`native-stack` + custom bottom tabs) |
| State | Redux Toolkit (`auth`, `cityTrip`, `chat`, `onlineStatus`, `payment`) |
| API | Axios → `{URL}/api/v1/user` |
| Payments | `@stripe/stripe-react-native` |
| Auth extras | Phone OTP, Google Sign-In, Apple Sign-In, guest mode |
| Push | Firebase Cloud Messaging |
| Chat | Socket.IO + `react-native-gifted-chat` |

---

## Entry & provider tree

```
index.js
  → messaging().setBackgroundMessageHandler(...)
  → AppRegistry.registerComponent("WApp", () => App)

App.js
  → <Provider store>
      <StripeAppBridge>
        <SafeAreaProvider>
          <PushNotificationHandler />
          <AppStateHandler />
          <Routes />          ← Auth vs Main switch
          <AppToast />
```

| File | Role |
|------|------|
| [`index.js`](../index.js) | App registry + FCM background handler |
| [`App.js`](../App.js) | Redux, Stripe, safe area, push, routes, toast |
| [`src/navigation/Routes.jsx`](../src/navigation/Routes.jsx) | Bootstrap user from AsyncStorage; guest route guard |

---

## Directory map (`src/`)

| Folder | Role |
|--------|------|
| `api/` | Axios client, endpoints, service modules |
| `assets/` | Colors, icons, fonts, Lottie |
| `components/` | Shared UI + app handlers (`AppStateHandler`, `PushNotificationHandler`, `StripeAppBridge`) |
| `config/` | API base URL, Stripe keys, feature flags |
| `context/` | Stripe bridge context |
| `hooks/` | `useAuth`, payments, permissions, guest guard |
| `mocks/` | In-memory mock store (reusable groups) |
| `navigation/` | Navigators, route names, helpers |
| `redux/` | Store + slices |
| `screens/` | Auth + Main feature screens |
| `services/` | Push façade, payment API façade |
| `utils/` | Storage, session, auth helpers, theme, responsive |

Path aliases (see [`babel.config.js`](../babel.config.js)): `@api`, `@assets`, `@components`, `@config`, `@context`, `@hooks`, `@mocks`, `@navigation`, `@redux`, `@screens`, `@services`, `@utils`. Prefer these over deep relative imports.

---

## Navigation

```
NavigationContainer (navigationRef)
├── AuthNavigator (!user.accessToken)
│   Splash → Onboarding → EnableNotification → SignIn/SignUp → OTP → Interests → PrivacyTerms
└── MainNavigator (user.accessToken)
    MainStack
    ├── BottomTab (custom SVG tab bar)
    │   ├── HomeStack
    │   ├── GroupStack
    │   ├── TripsStack
    │   ├── BookingStack
    │   └── AccountStack
    └── root-only screens (Chat, CreateTrip/Group, Payment*, Cart*, etc.)
```

### Key files

| File | Role |
|------|------|
| `navigationStrings.js` | All route name constants |
| `navigationRef.js` | Imperative navigation ref |
| `NavigationContainer/AuthNavigator.jsx` | Auth stack |
| `NavigationContainer/MainNavigator.jsx` | Main stack shell |
| `NavigationContainer/BottomTabNavigator.jsx` | Custom 5-tab bar |
| `NavigationContainer/sharedStackScreens.js` | Screens registered in **each tab stack** |
| `NavigationContainer/rootStackScreens.js` | Screens **above** tabs (full-screen) |
| `helpers/nestedTabNavigation.js` | `navigateToTripDetails` / `resetToTripDetails` |

### Patterns

- Shared screens (city detail, trip details, etc.) live in `sharedStackScreens` so they can show **with** the tab bar.
- Flows that should hide the tab bar (chat, create trip, payment, cart) go on `rootStackScreens`.
- Prefer `nestedTabNavigation` helpers when opening TripDetails so the custom tab bar stays visible.
- There is **no** React Navigation linking config. `Linking` is used only for OS settings, external URLs, and Google Sign-In callbacks.

---

## State (Redux)

| Slice | File | Responsibility |
|-------|------|----------------|
| `auth` | `redux/slices/authSlice.js` | User/token, login/signup/OTP/social/guest/logout, categories, pending auth redirect |
| `cityTrip` | `redux/slices/cityTripSlice.js` | Cities, For You / popular events, user trips |
| `chat` | `redux/slices/chatSlice.js` | Group messages by `groupId`; `addMessage` for sockets |
| `onlineStatus` | `redux/slices/onlineStatusSlice.js` | Presence + FCM token on go-online |
| `payment` | `redux/slices/paymentSlice.js` | Saved cards, checkout context, Stripe client secrets |

Store: [`src/redux/store.js`](../src/redux/store.js). Middleware marks the user online when a token first appears.

Stripe: [`src/context/PaymentStripeContext.js`](../src/context/PaymentStripeContext.js) + `StripeAppBridge` expose `useStripe()` under the Redux tree.

**Known footgun:** `cityTripSlice.js` still imports `@api/services/cityTripService`, which does **not** exist. Live API calls go through `mainServices`. Do not revive that import path; use `mainServices` / `endpoints`.

---

## API / networking

Full guide: [`API.md`](./API.md). Cursor rules: `.cursor/rules/api-layer.mdc`, `api-redux.mdc`.

| File | Role |
|------|------|
| `config/api.js` | `API_ENV` → `URL` (production vs UAT) |
| `api/apiClient.js` | Axios instance; Bearer token; unwraps `response.data`; 401 → session expiry |
| `api/apiHelpers.js` | `apiGet` / `apiPost` / `apiPut` / `apiDelete` |
| `api/endpoints.js` | Path constants (`auth`, `main`) |
| `api/services/mainServices.js` | Primary product endpoints |
| `api/services/authService.js` | Auth endpoints |
| `api/services/crewGroupsService.js` | Facade: mock vs real for reusable groups |
| `api/services/onlineStatusService.js` | Presence |

### Token & session

1. Request interceptor: Redux `auth.user.accessToken`, else AsyncStorage `STORAGE_KEYS.TOKEN`.
2. Response success: returns **body** (`response.data`), not the Axios response.
3. **401** or `isSessionExpired` → toast + `handleSessionExpired()` (unless `skipSessionExpiry` / logout URL).
4. Images: `getImageUrl()` prefixes relative paths with `URL`.
5. Socket.IO chat connects to host `URL` (not `/api/v1/user`) from Chat screens.

Do not create a second HTTP client. Extend `endpoints.js` → service → thunk/screen.

---

## Auth, session, guest

### Cold start

1. `Routes` loads `STORAGE_KEYS.USER_DATA` from AsyncStorage.
2. If `accessToken` → `MainNavigator`; else → `AuthNavigator` (Splash unless `pendingAuthRedirect`).

### Login paths

- Phone → OTP → Interests (if needed) → Main
- Google / Apple → `socialLoginAndSignUp` → persist → Main
- Guest → `guestLogin` (`isGuest: true`) → Main with restrictions

### Guest mode

Guests have a token (Main mounts) but cannot open screens in `GUEST_RESTRICTED_SCREENS` ([`src/utils/authHelpers.js`](../src/utils/authHelpers.js)). Guards:

- Global: `Routes` `onStateChange` → `exitGuestForSignIn`
- Actions: `requireAuth()` / `useAuth().requireAuth()`
- Screens: `useGuestScreenGuard`

Keep `GUEST_RESTRICTED_SCREENS` in sync when adding gated screens.

### Logout / expiry

- `logoutUser`: offline status → DELETE logout → clear storage
- `expireSession` / guest exit: clear storage → Auth SignIn

Storage keys: [`src/utils/storageKeys.js`](../src/utils/storageKeys.js).

---

## Feature areas (screens)

Barrel: [`src/screens/index.js`](../src/screens/index.js).

| Area | Location | Notes |
|------|----------|--------|
| Auth | `screens/Auth/*` | Splash, onboarding, OTP, interests |
| Home / discovery | `screens/Main/Home`, city/activity screens | Musement-backed activities |
| Trips | `Trips`, `CreateTrip`, `TripDetails`, … | Itineraries |
| Groups / crew | `Group`, `GroupDetails`, `Chat`, … | Socket.IO chat |
| Booking / cart | `Booking`, `Cart`, … | Orders + checkout |
| Payments | `Payment*`, `SavedCards`, `AddCard`, … | Stripe |
| Account | `Account`, `EditProfile`, … | Profile + settings |
| AI | `AiChat`, `ViewAiChat` | Chatbot history APIs |

**Reusable groups:** mock-first via `REUSABLE_GROUPS_MOCK_ENABLED` in [`src/config/reusableGroupsMock.js`](../src/config/reusableGroupsMock.js) (currently `true`). Call through `crewGroupsService` — do not import mocks from screens.

---

## UI / styling

No separate design-system package.

| Layer | Path |
|-------|------|
| Colors | `src/assets/colors.js` |
| Fonts | `src/assets/fonts/` (Roboto; linked via `react-native.config.js`) |
| Theme tokens | `src/utils/theme.js` |
| Responsive | `src/utils/responsive.js` (base 375×812) |
| Layout shells | `MainContainer`, `ScreenWapper`, `ResponsiveContainer` |

Use local `StyleSheet`s. Prefer shared colors/theme/responsive helpers over hard-coded one-offs.

---

## Payments

| Piece | Path |
|-------|------|
| Publishable keys | `src/config/stripe.js` (follows `API_ENV`) |
| Bridge | `StripeAppBridge` + `PaymentStripeContext` |
| API façade | `src/services/payment/` (`paymentApi`, contracts) |
| State | `paymentSlice` |

Use publishable keys from env only. Prefer the payment service + slice; do not hardcode secret keys in JS.

Optional local intents: `npm run stripe-server` + `STRIPE_PAYMENT_BACKEND_URL` in `.env`.

---

## Push, presence, chat

- **FCM:** `PushNotificationHandler`; background handler in `index.js`; token synced with online status.
- **Presence:** `AppStateHandler` + `onlineStatusSlice` on foreground/background.
- **Chat:** Socket.IO to `URL`; messages in `chatSlice`; UI via Gifted Chat.

---

## Env & config

| Mechanism | Behavior |
|-----------|----------|
| `.env` (gitignored) | `API_ENV`, `API_BASE_URL_*`, `STRIPE_PUBLISHABLE_KEY_*`, optional Stripe test URLs |
| `babel-plugin-inline-dotenv` | Inlines `.env` into the JS bundle at transform time |
| `API_ENV=uat` | UAT API + Stripe test key; else production |
| `REUSABLE_GROUPS_MOCK_ENABLED` | Toggle mock crews/trips |

Changing `.env` requires a **Metro restart** (inline-dotenv). API target is not driven by `__DEV__`.

---

## Native notes

- **iOS:** `automaticPodsInstallation: false` — after adding native deps, run `pod install` in `ios/` manually.
- **Patches:** `patches/` applied via `postinstall` → `patch-package`.
- **iOS app code:** Firebase, APNs → FCM, Google Sign-In URL handling in `AppDelegate.swift`.
- **Android:** package `com.worldener`; Google Services plugin in app `build.gradle`.

---

## Change checklists

### New screen

1. Implement under `src/screens/` (Auth or Main).
2. Export from `src/screens/index.js`.
3. Add constant in `navigationStrings.js`.
4. Register in `sharedStackScreens` and/or `rootStackScreens` (or Auth navigator).
5. If guests must not open it, add to `GUEST_RESTRICTED_SCREENS`.

### New API

See also [`API.md`](./API.md) checklists.

1. Add path in `api/endpoints.js`.
2. Add function in `mainServices` / `authService` / dedicated service.
3. Wire thunk in the right slice (or call service from screen).
4. Rely on `apiClient` for auth headers and error/session handling.

### Auth-gated action

1. Use `useAuth().requireAuth()` or `requireAuth(dispatch, isGuest)`.
2. Or mount `useGuestScreenGuard` on the screen.
3. Keep guest restricted set updated for navigable screens.

### Switch API / Stripe env

1. Set `API_ENV=uat` or `production` in `.env`.
2. Restart Metro.
3. Rebuild native app if bundle ID / Firebase flavor differs (iOS UAT vs prod).

### Reusable groups

1. Extend `crewGroupsService` façade (not screens calling mocks).
2. Flip `REUSABLE_GROUPS_MOCK_ENABLED` when backend is ready.
3. See docs under `docs/REUSABLE_GROUPS_*`.

---

## Scripts (common)

| Script | Purpose |
|--------|---------|
| `npm start` | Metro |
| `npm run ios` / `android` | Run app |
| `npm run androidapk` | Release APK |
| `npm run stripe-server` | Local Stripe helper |
| `postinstall` | `patch-package` |

---

## Related docs

- [`API.md`](./API.md) — `src/api/` client, endpoints, services
- [`APP_FEATURES.md`](../APP_FEATURES.md) — product features & flows
- [`PRODUCTION_READINESS_PROMPT.md`](../PRODUCTION_READINESS_PROMPT.md) — hardening checklist prompt
- [`STRIPE_PAYMENT_REIMPLEMENTATION_PROMPT.md`](../STRIPE_PAYMENT_REIMPLEMENTATION_PROMPT.md) — Stripe rework notes
- [`.cursor/rules/`](../.cursor/rules/) — agent rules derived from this guide
