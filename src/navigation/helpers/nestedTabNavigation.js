import navigationStrings from "@navigation/navigationStrings";

/** Reset root stack to Trips tab → TripDetails (clears full-screen flows above tabs). */
export const resetToTripDetails = (navigation, params) => {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: navigationStrings.BOTTOM_TAB,
        state: {
          routes: [
            {
              name: navigationStrings.TRIPS,
              state: {
                routes: [
                  { name: navigationStrings.TRIPS },
                  {
                    name: navigationStrings.TRIP_DETAILS,
                    params,
                  },
                ],
                index: 1,
              },
            },
          ],
          index: 0,
        },
      },
    ],
  });
};

/** Open TripDetails inside the Trips tab while keeping the tab bar visible. */
export const navigateToTripDetails = (navigation, params) => {
  navigation.navigate(navigationStrings.BOTTOM_TAB, {
    screen: navigationStrings.TRIPS,
    params: {
      screen: navigationStrings.TRIP_DETAILS,
      params,
    },
  });
};

/** Reset root stack to Crews tab → GroupDetails (clears Create Crew above tabs). */
export const resetToGroupDetails = (navigation, params) => {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: navigationStrings.BOTTOM_TAB,
        state: {
          routes: [
            { name: navigationStrings.HOME },
            {
              name: navigationStrings.GROUP,
              state: {
                routes: [
                  { name: navigationStrings.GROUP },
                  {
                    name: navigationStrings.GROUP_DETAILS,
                    params,
                  },
                ],
                index: 1,
              },
            },
          ],
          index: 1,
        },
      },
    ],
  });
};

/** Open GroupDetails inside the Crews tab while keeping the tab bar visible. */
export const navigateToGroupDetails = (navigation, params) => {
  navigation.navigate(navigationStrings.BOTTOM_TAB, {
    screen: navigationStrings.GROUP,
    params: {
      screen: navigationStrings.GROUP_DETAILS,
      params,
    },
  });
};
