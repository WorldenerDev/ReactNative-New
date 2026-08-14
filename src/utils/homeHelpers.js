import navigationStrings from "@navigation/navigationStrings";

export const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const getFirstName = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0];
};

export const openInspirationTarget = (navigation, item) => {
  const target = item?.ctaTarget || {};
  const type = target.type || "search";

  if (type === "category") {
    navigation.navigate(navigationStrings.BROUSE_BY_CATEGORY, {
      name: target.categoryName || "Experiences",
      categoryIn: target.categoryIn,
    });
    return;
  }

  if (type === "city") {
    navigation.navigate(navigationStrings.CITY_DETAIL, {
      cityData: {
        city_id: target.cityId,
        name: target.cityName,
      },
    });
    return;
  }

  if (type === "surprises") {
    navigation.navigate(navigationStrings.SURPRISES, {
      cityData: {
        city_id: target.cityId,
        name: target.cityName,
      },
    });
    return;
  }

  navigation.navigate(navigationStrings.SEARCH_CITY, {
    fromScreen: "Home",
    initialQuery: (item?.title || target.query || "").trim(),
  });
};
