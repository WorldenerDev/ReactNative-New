# Backend specification: Reusable Groups (Crews)

**Audience:** Worldener API developers  
**App status:** React Native UI implemented with **mock data** (`REUSABLE_GROUPS_MOCK_ENABLED = true`) until these APIs exist.  
**Repo:** `Worldener-Api`

**Stakeholder review (locked decisions, checklists):**  
`Worldener-Api/docs/REUSABLE_GROUPS_BACKEND_PLAN.md` · App: [`REUSABLE_GROUPS_APP_PLAN.md`](./REUSABLE_GROUPS_APP_PLAN.md) · Admin: `Worldener-Api/docs/REUSABLE_GROUPS_ADMIN_FEATURES.md`

This file remains the **field-level API contract**. Product sign-off lives in the review plans above.

---

## Summary

Shift from **1 trip = 1 group** to **1 persistent crew = many trips**, with **per-trip participation** (join / opt-out) while crew membership stays fixed.

### Locked product decisions

| Decision | Choice |
|----------|--------|
| Solo trips | **No group** — `createTrip` without `groupId` creates Trip only |
| Trip storage | **Canonical trip + per-user member trip on opt-in** |
| Who creates crew trips | **Any crew member** |
| Leave a trip (opt-out) | **Allowed** — stay in crew; rejoin later; My Trips shows greyed + Rejoin |
| Leave a crew | Removes user from **all** that crew’s trips |
| Late joiner onboarding | **MVP** (accept-invite returns `activeTrips`) |
| Booked status | Per-user trip only; do not set Group Booked on one member’s payment |
| Data migration | **Skip** (dummy/test data) |
| Cart isolation | Abandon trip A checkout → trip B cart must not include A items |
| Opted-out on My Trips | **Greyed + Rejoin** (still returned by API) |

---

## Current backend behavior (baseline)

| Area | Today |
|------|--------|
| `POST /createTrip` | Always creates Trip **and** Group |
| `Group.tripId` | Single ref to creator's trip |
| `POST /accept-invite` | Adds to group + **clones** Trip per member |
| `GET /getGroups` | Filters `allInvite != []` |
| `POST /compare-users-in-group` | `Trip.findOne({ groupId })` — breaks with multiple trips |
| Wishlist reads | Group-aggregated, not trip-scoped |

**Relevant files:** `v1/controller/Trip.js`, `v1/controller/Group.js`, `models/Group.js`, `models/Trip.js`

---

## Target data model

### Group (crew)

Persistent social container. Fields (existing + new):

```js
{
  _id,
  groupName,
  groupImage?,
  createdBy,
  addedUsers[],        // crew roster
  // deprecate or stop relying on:
  tripId               // single trip — replace with trips query
}
```

### Trip

```js
{
  _id,
  user_id,              // owner of this trip document
  groupId?,             // null for solo
  parentTripId?,        // member trip → canonical trip
  isCanonical: boolean, // true = crew trip plan created by a member
  city_id, start_at, end_at,
  // ... existing fields
}
```

### TripParticipation (new collection)

```js
{
  userId: ObjectId,
  canonicalTripId: ObjectId,
  memberTripId: ObjectId | null,
  groupId: ObjectId,
  status: "invited" | "joined" | "opted_out",
  invitedAt: Date,
  respondedAt: Date?
}
```

**Rules:**
- **Crew membership** (`addedUsers`) ≠ **trip participation**
- Solo trip: `groupId: null`, no `TripParticipation`
- Crew trip create: one **canonical** Trip + participation row per crew member (`invited`; creator `joined`)
- Opt-in: `status: joined`, create `memberTripId` (clone city/dates/optional activities from canonical)
- Opt-out: `status: opted_out`, keep `memberTripId`, user stays in crew
- Rejoin: `status: joined`, reuse `memberTripId` if exists

---

## New APIs

### `POST /createGroup`

Create crew without a trip.

**Body:**
```json
{
  "groupName": "Weekend Crew",
  "groupImage": "optional-url",
  "phoneNumbers": ["+1..."]
}
```

**Response:** `{ success, data: { _id, groupName, createdBy, addedUsers } }`

**Side effects:** Optional `sendInvitation` per phone; push not required for trip.

---

### `GET /groups/:groupId/trips`

List trips for a crew.

**Query:** `status=active|past` (default `active`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "canonicalTripId",
      "groupId": "...",
      "city": "Tokyo",
      "cityId": "...",
      "image": "...",
      "start_at": "2026-03-10",
      "end_at": "2026-03-15",
      "activityCount": 3,
      "status": "active",
      "participationStatus": "joined|not_joined|opted_out|invited",
      "memberTripId": "..."
    }
  ]
}
```

---

### `POST /trips/:tripId/opt-in`

`tripId` = **canonical** trip id.

**Auth:** Caller must be in crew `addedUsers` or `createdBy`.

**Behavior:**
1. Upsert participation → `joined`
2. If no `memberTripId`, clone canonical trip for user (`parentTripId`, `groupId`, same city/dates)
3. Return `{ memberTripId }`

---

### `POST /trips/:tripId/opt-out`

**Behavior:** Set participation `opted_out`; do **not** remove from crew.

---

## APIs to modify

### `POST /createTrip`

**Solo** (no `groupId` in body):
- Create Trip only
- **Do not** create Group
- `groupId: null`

**Crew** (`groupId` present):
- Validate requester is crew member
- Create **canonical** Trip (`isCanonical: true`, `groupId`)
- Create `TripParticipation` for each crew member (creator `joined`, others `invited`)
- **Do not** create new Group
- Emit push + in-app notification `trip_created_in_group` to all crew members

**Body (crew):**
```json
{
  "groupId": "...",
  "city_id": "...",
  "start_at": "2026-03-10",
  "end_at": "2026-03-15"
}
```

---

### `GET /getGroups`

Return crews user belongs to (creator or `addedUsers`).

**Response shape (per crew):**
```json
{
  "_id": "...",
  "groupName": "Weekend Crew",
  "activeTripCount": 2,
  "cityChips": ["Tokyo", "Paris"],
  "addedUsers": [...],
  "createdBy": {...}
}
```

**Fix:** Remove or relax `allInvite != []` filter so crews without pending invites still appear.

---

### `GET /getGroupDetails/:groupId`

Keep member list; optionally include `activeTripCount`. Full trip list via `GET /groups/:id/trips`.

---

### `GET /getTrips`

Return:
1. Solo trips owned by user (`groupId` null)
2. Crew trips where user has participation (`joined` or `opted_out` for greyed UI)

**Per item:**
```json
{
  "_id": "memberTripId or canonical if not joined",
  "canonicalTripId": "...",
  "groupId": "...",
  "groupName": "Weekend Crew",
  "participationStatus": "joined|opted_out|not_joined",
  "start_at", "end_at", "city", ...
}
```

---

### `GET /getTripDetails/:tripId`

Include for crew trips:
- `canonicalTripId`, `groupId`, `groupName`
- `participationStatus` for current user
- `participants` = count of `joined` for this canonical trip
- Activities from **member** trip if joined, or read-only canonical preview if not joined (product choice)

---

### `POST /accept-invite`

**Change:** Add to crew only — **stop auto-cloning trip**.

**Response:** Include `activeTrips[]` for onboarding screen:
```json
{
  "success": true,
  "data": {
    "group": {...},
    "activeTrips": [
      { "_id", "city", "start_at", "end_at", "participationStatus": "not_joined" }
    ]
  }
}
```

---

### `POST /compare-users-in-group`

**Require `tripId`** (canonical).

Compare `MusementTripEvent` for each user's **memberTripId** linked to that canonical trip.

**Body:**
```json
{
  "groupId": "...",
  "tripId": "canonicalTripId",
  "userId1": "...",
  "userId2": "..."
}
```

---

### `GET /group/:groupId/wishlisted`

**Add query:** `tripId` or `cityId` from trip context.

Filter `ActivityLike` to users with `participationStatus: joined` for that trip.

---

### Notifications / FCM

New type: `trip_created_in_group`

```json
{
  "notifictaion_type": "trip_created_in_group",
  "title": "New trip in Weekend Crew",
  "message": "Alex added Tokyo to Weekend Crew",
  "groupId": "...",
  "tripId": "canonicalTripId",
  "creatorName": "Alex",
  "cityName": "Tokyo",
  "groupName": "Weekend Crew"
}
```

App opens **Trip Brief** ("You're invited") screen.

---

## Migration

**Skip for this push** (dummy/test data). No backfill script. New code paths only; stale test groups can be deleted/recreated.

When/if production data ever needs conversion: mark creator trip canonical, add `joined` participation for members, stop relying on singular `Group.tripId` for listing.

---

## App mock contract (for parity testing)

Mock IDs in app (`src/mocks/reusableGroups/seedData.js`):

| Entity | ID |
|--------|-----|
| Crew | `crew-weekend`, `crew-college` |
| Canonical trips | `trip-tokyo-canonical`, `trip-paris-canonical`, `trip-bali-canonical` |
| Participation | Tokyo=joined, Paris=not_joined, Bali=opted_out |

When implementing APIs, use the same field names: `participationStatus`, `canonicalTripId`, `memberTripId`, `groupName`, `activeTripCount`, `cityChips`.

---

## Suggested implementation order

1. `TripParticipation` model (no historical migration)  
2. `POST /createGroup`  
3. `POST /createTrip` solo vs crew split  
4. `GET /groups/:id/trips`, opt-in, opt-out  
5. `GET /getTrips` + `GET /getTripDetails` participation fields  
6. `accept-invite` change + `activeTrips` in response (late joiner MVP)  
7. Notifications `trip_created_in_group`  
8. Compare + wishlist trip scoping  
9. Stop Group-level Booked on payment; cart isolation (abandon A → checkout B)  

---

## Turn off app mocks

In React Native, set `REUSABLE_GROUPS_MOCK_ENABLED = false` in `src/config/reusableGroupsMock.js` and wire `crewGroupsService.js` to real endpoints.
