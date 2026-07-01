const TOKYO_IMG =
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80";
const PARIS_IMG =
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80";
const BALI_IMG =
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80";

export const MOCK_CURRENT_USER_ID = "user-me";

export const createSeedState = () => ({
  groups: [
    {
      _id: "crew-weekend",
      groupName: "Weekend Crew",
      groupImage: null,
      createdBy: { _id: "user-alex", name: "Alex", image: "" },
      addedUsers: [
        { _id: "user-ben", name: "Ben", image: "" },
        { _id: "user-chris", name: "Chris", image: "" },
        { _id: MOCK_CURRENT_USER_ID, name: "You", image: "" },
      ],
      activeTripCount: 2,
      cityChips: ["Tokyo", "Paris"],
    },
    {
      _id: "crew-college",
      groupName: "College Friends",
      groupImage: null,
      createdBy: { _id: "user-jordan", name: "Jordan", image: "" },
      addedUsers: [
        { _id: "user-sam", name: "Sam", image: "" },
        { _id: MOCK_CURRENT_USER_ID, name: "You", image: "" },
      ],
      activeTripCount: 1,
      cityChips: ["Barcelona"],
    },
  ],
  canonicalTrips: [
    {
      _id: "trip-tokyo-canonical",
      groupId: "crew-weekend",
      groupName: "Weekend Crew",
      city: "Tokyo",
      cityId: "city-tokyo",
      image: TOKYO_IMG,
      start_at: "2026-03-10",
      end_at: "2026-03-15",
      activityCount: 3,
      status: "active",
      isCanonical: true,
      createdBy: { _id: "user-alex", name: "Alex" },
      activities: [
        {
          _id: "act-1",
          title: "Sushi Making Class",
          date: "2026-03-11",
          quantity: 2,
          total_price: 120,
          image:
            "https://images.unsplash.com/photo-1579584425558-c3ce17fd4351?w=200&q=80",
        },
        {
          _id: "act-2",
          title: "Mt. Fuji Day Trip",
          date: "2026-03-13",
          quantity: 4,
          total_price: 380,
          image:
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&q=80",
        },
        {
          _id: "act-3",
          title: "Shibuya Night Tour",
          date: "2026-03-12",
          quantity: 3,
          total_price: 90,
          image: TOKYO_IMG,
        },
      ],
    },
    {
      _id: "trip-paris-canonical",
      groupId: "crew-weekend",
      groupName: "Weekend Crew",
      city: "Paris",
      cityId: "city-paris",
      image: PARIS_IMG,
      start_at: "2026-04-01",
      end_at: "2026-04-07",
      activityCount: 0,
      status: "active",
      isCanonical: true,
      createdBy: { _id: "user-alex", name: "Alex" },
      activities: [],
    },
    {
      _id: "trip-bali-canonical",
      groupId: "crew-weekend",
      groupName: "Weekend Crew",
      city: "Bali",
      cityId: "city-bali",
      image: BALI_IMG,
      start_at: "2026-01-05",
      end_at: "2026-01-12",
      activityCount: 5,
      status: "past",
      isCanonical: true,
      createdBy: { _id: "user-alex", name: "Alex" },
      activities: [],
    },
    {
      _id: "trip-barcelona-canonical",
      groupId: "crew-college",
      groupName: "College Friends",
      city: "Barcelona",
      cityId: "city-barcelona",
      image:
        "https://images.unsplash.com/photo-1583422409516-2895a0ef24ca?w=800&q=80",
      start_at: "2026-05-20",
      end_at: "2026-05-27",
      activityCount: 1,
      status: "active",
      isCanonical: true,
      createdBy: { _id: "user-jordan", name: "Jordan" },
      activities: [],
    },
  ],
  participations: [
    {
      userId: MOCK_CURRENT_USER_ID,
      canonicalTripId: "trip-tokyo-canonical",
      memberTripId: "trip-tokyo-member-me",
      groupId: "crew-weekend",
      status: "joined",
    },
    {
      userId: MOCK_CURRENT_USER_ID,
      canonicalTripId: "trip-paris-canonical",
      memberTripId: null,
      groupId: "crew-weekend",
      status: "not_joined",
    },
    {
      userId: MOCK_CURRENT_USER_ID,
      canonicalTripId: "trip-bali-canonical",
      memberTripId: "trip-bali-member-me",
      groupId: "crew-weekend",
      status: "opted_out",
    },
    {
      userId: MOCK_CURRENT_USER_ID,
      canonicalTripId: "trip-barcelona-canonical",
      memberTripId: "trip-barcelona-member-me",
      groupId: "crew-college",
      status: "joined",
    },
  ],
  soloTrips: [
    {
      _id: "trip-solo-london",
      groupId: null,
      city: "London",
      cityId: "city-london",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      start_at: "2026-06-01",
      end_at: "2026-06-05",
      activityCount: 2,
      status: "active",
      activities: [
        {
          _id: "act-l1",
          title: "Thames River Cruise",
          date: "2026-06-02",
          quantity: 1,
          total_price: 45,
          image:
            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&q=80",
        },
      ],
    },
  ],
  wishlistByTrip: {
    "trip-tokyo-canonical": [
      {
        activity_id: "wl-1",
        name: "TeamLab Planets",
        image:
          "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&q=80",
        like_count: 3,
        liked_by_members: [{ name: "Ben" }, { name: "Chris" }, { name: "Alex" }],
      },
      {
        activity_id: "wl-2",
        name: "Shibuya Sky",
        image: TOKYO_IMG,
        like_count: 2,
        liked_by_members: [{ name: "Ben" }, { name: "Alex" }],
      },
    ],
  },
  compareMock: {
    common_activities: [
      {
        _id: "c1",
        name: "Sushi Making Class",
        date: "2026-03-11",
        price: 120,
        image:
          "https://images.unsplash.com/photo-1579584425558-c3ce17fd4351?w=200&q=80",
      },
    ],
    uncommon_activities: {
      added_by_user1: [
        {
          _id: "u1",
          name: "Shibuya Night Tour",
          date: "2026-03-12",
          price: 90,
          image: TOKYO_IMG,
        },
      ],
      added_by_user2: [
        {
          _id: "u2",
          name: "Akihabara Walk",
          date: "2026-03-14",
          price: 0,
          image: TOKYO_IMG,
        },
      ],
    },
    user1: { name: "You" },
    user2: { name: "Ben" },
  },
  notifications: [
    {
      _id: "notif-1",
      notifictaion_type: "trip_created_in_group",
      title: "New trip in Weekend Crew",
      message: "Alex added Paris to Weekend Crew",
      isRead: false,
      createdAt: new Date().toISOString(),
      groupId: "crew-weekend",
      tripId: "trip-paris-canonical",
      creatorName: "Alex",
      cityName: "Paris",
      groupName: "Weekend Crew",
    },
  ],
});
