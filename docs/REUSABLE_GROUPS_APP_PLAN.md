# Reusable Groups (Crews) — App review plan

**Audience:** Product / tech review before production wiring  
**Repo:** `ReactNative-New`  
**Branch reference:** Crew UI landed in `63cfbf9` (“UI changes”) on `feature/trip-group-change` (tip merge `da03cc3` is unrelated June fixes).

**Related:**  
- Stakeholder backend plan: `Worldener-Api/docs/REUSABLE_GROUPS_BACKEND_PLAN.md`  
- API field contract: [`BACKEND_REUSABLE_GROUPS.md`](./BACKEND_REUSABLE_GROUPS.md)  
- Implementer wiring notes: [`REUSABLE_GROUPS_APP_IMPLEMENTATION.md`](./REUSABLE_GROUPS_APP_IMPLEMENTATION.md) (superseded for status — UI already present behind mocks)  
- Admin: `Worldener-Api/docs/REUSABLE_GROUPS_ADMIN_FEATURES.md`

---

## 1. Purpose / current state

App UI for **crew = many trips** already exists behind:

```js
// src/config/reusableGroupsMock.js
REUSABLE_GROUPS_MOCK_ENABLED = true
```

Facade: `src/api/services/crewGroupsService.js` (mock store when flag ON; real API stubs / legacy fallbacks when OFF).

**Production goal:** Wire all MVP flows to real backend APIs, turn mocks off, leave nothing designed-for-MVP unwired. **Do not** change Cart / ActivityDetails / payment / Musement UX.

---

## 2. Locked decisions (app-relevant)

| Topic | Decision |
|-------|----------|
| Leave a **trip** | Opt-out / leave trip while **staying in crew** (rejoin later) — MVP |
| Leave a **crew** | Leaves all that crew’s trips for the user |
| Late joiner | **MVP** — after accept-invite → `GroupTripsOnboarding` |
| Booked UI | Show Booked only from **current user’s trip** status; do not use `group.status` |
| Cart isolation | When checking out trip B after abandoning A, app must request checkout for **B only**; backend isolates cart |
| Mocks in production | `REUSABLE_GROUPS_MOCK_ENABLED = false` once APIs ready |

---

## 3. Non-goals

- No changes to Cart, ActivityDetails, Stripe payment screens, or Musement add-to-trip happy path beyond passing the correct `trip_id`(s) into existing checkout APIs.
- No historical data migration in the app.
- No deep links / analytics / HTML mockup check-in.

---

## 4. Screen map (as built)

| Screen / area | Role | Production gap |
|---------------|------|----------------|
| `Group.jsx` | My Crews — name, trip count, city chips; `+` → Create Group | Real `getGroups` crew shape |
| `CreateGroup.jsx` | Create crew without trip | Real `POST /createGroup` |
| `GroupDetails.jsx` | Tabs **Trips \| Members** (when mock ON); trip list; create trip | Always Trips\|Members when feature live; real trips API |
| `CrewTripCard.jsx` | Trip row + participation pills | — |
| `CreateTrip.jsx` | Crew mode (`groupId`) vs solo (no Who?) | Real solo = no group; real crew attach |
| `TripBrief.jsx` | You're invited — Join / Not this time | Real brief + opt-in/out |
| `TripDetails.jsx` | Opt-out/rejoin; Compare \| Wishlist for joined crew trips | Real participation; Booked from user trip only |
| `Trips.jsx` + `TripCard.jsx` | My Trips; greyed + Rejoin when opted out | Real list + status |
| `NotificationScreen.jsx` | `trip_created_in_group` → Trip Brief | Real notifications; **wire accept-invite → onboarding** |
| `GroupTripsOnboarding.jsx` | Late joiner active trip Join/Skip | Registered but **not** called from accept-invite yet |
| Cart / ActivityDetails / Payment | Unchanged booking | Ensure checkout sends only current trip id(s) |

---

## 5. MVP remaining work (must ship)

### API wiring (`crewGroupsService` + `endpoints.js` / services)

Replace mock-only / stub branches for:

- [ ] `fetchCrews` / create crew  
- [ ] `fetchCrewTrips`  
- [ ] `fetchTripBrief`, `optInToTrip`, `optOutOfTrip`  
- [ ] `createTripForCrew` / `createSoloTripWithMock` → real createTrip solo vs crew  
- [ ] `fetchMyTripsWithMock` / `fetchTripDetailsWithMock`  
- [ ] `fetchCrewTripNotifications`  
- [ ] `fetchTripWishlist` / `fetchTripCompare` with `tripId`  
- [ ] `fetchOnboardingTrips` / accept-invite `activeTrips`

### Flows

- [ ] Set `REUSABLE_GROUPS_MOCK_ENABLED = false` for production  
- [ ] Accept invite success → navigate `GROUP_TRIPS_ONBOARDING` with `groupId` + `activeTrips`  
- [ ] Group Details always Trips \| Members when crew feature is live (not only when mock ON)  
- [ ] Booked badge / copy from current user’s trip fields only  
- [ ] Leave crew → user no longer sees that crew’s trips on My Trips  
- [ ] Checkout: after abandoning trip A, start cart for trip B with **`trip_ids: [B]` only**

---

## 6. Manual test checklist (UAT / production)

| # | Flow | Expected |
|---|------|----------|
| 1 | My Crews | Crew cards (name, chips, counts) — not single-trip city as identity |
| 2 | Create crew | Crew with 0 trips |
| 3 | Create crew trip | Appears under crew; others get Trip Brief path |
| 4 | Trip Brief Join / Not this time | Join → Trip Details; opt-out stays in crew |
| 5 | Opt-out from Trip Details | Still in crew; trip greyed + Rejoin on My Trips |
| 6 | Rejoin | Full itinerary again |
| 7 | Solo trip from My Trips | No group; no Crew button |
| 8 | Late joiner | Accept invite → onboarding → Join/Skip active trips → Group Details |
| 9 | One member books | Payer Booked; other members’ trips still Pending |
| 10 | Cart isolation | Checkout A → abandon → checkout B → only B items |
| 11 | Leave crew | Removed from all that crew’s trips |
| 12 | Compare / Wishlist | On Trip Details for joined crew trip only |

---

## 7. App ↔ Backend sync

| App need | Backend |
|----------|---------|
| Create crew | `POST /createGroup` |
| Crew trip list + status | `GET /groups/:id/trips` |
| Join / leave trip | `POST .../opt-in`, `opt-out` |
| Solo vs crew create | `POST /createTrip` with/without `groupId` |
| My Trips participation | `GET /getTrips` fields |
| Late joiner | `accept-invite` → `activeTrips[]` |
| New trip ping | `trip_created_in_group` |
| Booked UI | Per-user Trip status; no Group Booked |
| Cart A→B | Backend cart isolation + app passes `[B]` only |

---

## 8. Review checklist

- [ ] Late joiner wired in MVP  
- [ ] Leave trip ≠ leave crew (both behaviors verified)  
- [ ] Mocks off; no stub responses for MVP calls  
- [ ] Musement/checkout UX unchanged except correct trip targeting  
- [ ] Cart isolation QA passed  

### Comments

-

---

## 9. Out of scope (app)

- Data migration UI  
- Roster remixing per trip  
- Deep links, analytics, design-mock HTML in repo  
- Admin screens (see Api admin doc)
