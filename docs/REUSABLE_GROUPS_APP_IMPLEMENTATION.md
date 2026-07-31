# Reusable Groups — App implementation guide

**Status:** UI + mocks landed on `feature/trip-group-change` (`63cfbf9`). This file is a **wiring/reference** checklist.  
**Stakeholder review / production remaining work:** [`REUSABLE_GROUPS_APP_PLAN.md`](./REUSABLE_GROUPS_APP_PLAN.md)  
**Backend review:** `Worldener-Api/docs/REUSABLE_GROUPS_BACKEND_PLAN.md`  
**Backend:** APIs not started — app uses mock data until APIs land. **Late joiner onboarding is MVP** (not Phase 2).

---

## Enable mocks

Create `src/config/reusableGroupsMock.js`:

```js
export const REUSABLE_GROUPS_MOCK_ENABLED = true;
```

Set to `false` when backend is ready.

---

## Files to create

| File | Purpose |
|------|---------|
| `src/mocks/reusableGroups/seedData.js` | Dummy crews, trips, participations |
| `src/mocks/reusableGroups/mockStore.js` | In-memory store + opt-in/out mutations |
| `src/api/services/crewGroupsService.js` | Facade: mock vs real API |
| `src/screens/Main/CreateGroup.jsx` | "Create your crew" screen |
| `src/screens/Main/TripBrief.jsx` | "You're invited" trip summary |
| `src/screens/Main/GroupTripsOnboarding.jsx` | Late joiner trip picker |
| `src/components/crew/CrewTripCard.jsx` | Trip row in Group Details Trips tab |
| `src/screens/Main/tripDetails/TripCompareTab.jsx` | Compare tab (from GroupDetails) |
| `src/screens/Main/tripDetails/TripWishlistTab.jsx` | Wishlist tab (from GroupDetails) |

Full source for `seedData.js`, `mockStore.js`, and `crewGroupsService.js` is in the agent session transcript — copy when switching to Agent mode.

---

## Navigation changes

### `navigationStrings.js` — add:

```js
CREATE_GROUP: "CreateGroup",
TRIP_BRIEF: "TripBrief",
GROUP_TRIPS_ONBOARDING: "GroupTripsOnboarding",
```

### `rootStackScreens.js` — add:

```js
{ name: navigationStrings.CREATE_GROUP, component: CreateGroup },
```

### `sharedStackScreens.js` — add:

```js
{ name: navigationStrings.TRIP_BRIEF, component: TripBrief },
{ name: navigationStrings.GROUP_TRIPS_ONBOARDING, component: GroupTripsOnboarding },
```

### `screens/index.js` — export new screens

---

## Screen changes

### `Group.jsx` → My Crews

- Use `fetchCrews()` from `crewGroupsService`
- Card: `groupName`, `activeTripCount`, `cityChips`, member count
- Header `+` → `CREATE_GROUP`
- `subscribeReusableGroupsMock` + `useFocusEffect` refresh

### `GroupDetails.jsx`

- When mock enabled: tabs `["Trips", "Members"]` only
- **Trips tab:** `fetchCrewTrips`, Active/Past segment, Create Trip CTA, `CrewTripCard` list
  - joined → `TRIP_DETAILS` with `memberTripId`
  - not_joined / opted_out → `TRIP_BRIEF`
- **Members tab:** existing members UI (invite, leave, chat)
- Remove Compare/Wishlist tabs when mock enabled

### `TripDetails.jsx`

- Use `fetchTripDetailsWithMock`
- If `groupId`: TopTab `Itinerary | Compare | Wishlist`
- Wire `handleViewGroup` → `GROUP_DETAILS`
- Participation banner + Opt out / Rejoin via `optOutOfTrip` / `optInToTrip`
- Solo trips: itinerary only (no Compare/Wishlist)

### `Trips.jsx`

- When mock: `fetchMyTripsWithMock` instead of Redux-only
- `TripCard`: pass `groupName`, `participationStatus`, `dimmed={opted_out}`, `onRejoinPress`

### `TripCard.jsx` — add props:

- `groupName`, `participationStatus`, `dimmed`, `onRejoinPress`, `showCrewButton`

### `CreateTrip.jsx`

- `route.params.groupId` → **crew mode**: hide Who?, show locked crew name, call `createTripForCrew`
- No `groupId` → **solo mode**: no Who?, call `createSoloTripMock` (mock) or `createTrip` without group (real)

### `NotificationScreen.jsx`

- Merge `fetchCrewTripNotifications()` when mock enabled
- Tap `trip_created_in_group` → `TRIP_BRIEF` with `canonicalTripId`

### `CreateGroup.jsx`

- Form: group name, optional photo placeholder, invite CTA
- Submit → `createCrew` → navigate `GROUP_DETAILS`

### `TripBrief.jsx`

- Load `fetchTripBrief(canonicalTripId)`
- Join Trip → `optInToTrip` → `TRIP_DETAILS`
- Not this time → `optOutOfTrip` → goBack

### `GroupTripsOnboarding.jsx`

- **MVP:** after accept invite → navigate here with `groupId` + `activeTrips`
- List active trips, Join/Skip per row → `GROUP_DETAILS`

---

## Manual test checklist (mock mode)

Run with `REUSABLE_GROUPS_MOCK_ENABLED = true` and a logged-in user.

| # | Flow | Steps | Expected |
|---|------|-------|----------|
| 1 | My Crews list | Open Group tab | 2 crews: Weekend Crew, College Friends; chips Tokyo/Paris |
| 2 | Crew details Trips | Tap Weekend Crew → Trips tab | Tokyo joined, Paris not joined, Bali opted out (Past tab) |
| 3 | Create crew | My Crews → + → name → Create | New crew at top, 0 trips |
| 4 | Create crew trip | Group → Create Trip → city/dates | New trip in list; notification in Updates tab |
| 5 | Trip brief | Tap Paris (not joined) | You're invited screen; Join / Not this time |
| 6 | Opt in | Join Trip on Paris | Trip Details opens; status joined |
| 7 | Opt out | Trip Details → Not this time | Back to group; Paris opted out |
| 8 | My Trips greyed | My Trips tab | Bali greyed with Rejoin |
| 9 | Rejoin | Tap Rejoin on Bali | Status joined; full itinerary |
| 10 | Solo trip | My Trips → + → create (no group) | London solo; no Crew button |
| 11 | Trip tabs | Open Tokyo trip | Itinerary, Compare, Wishlist tabs |
| 12 | View Group | Trip Details → View Group | Group Details for Weekend Crew |
| 13 | Members + chat | Members tab, Chat button | Member list; chat opens |
| 14 | Notification | Notifications → trip card | Opens Trip Brief |

---

## Switching to real API

1. Implement endpoints per `BACKEND_REUSABLE_GROUPS.md`
2. Extend `crewGroupsService.js` branches for each function
3. Set `REUSABLE_GROUPS_MOCK_ENABLED = false`
4. Re-run manual test checklist against UAT

---

## Agent mode required

To apply code to the repo, switch to **Agent mode** and ask:

> Implement reusable groups per REUSABLE_GROUPS_APP_IMPLEMENTATION.md
