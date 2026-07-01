import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import React, { useState, useEffect } from "react";
import MainContainer from "@components/container/MainContainer";
import {
  getFontSize,
  getHeight,
  getWidth,
  getVertiPadding,
  getHoriPadding,
  getRadius,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import {
  searchCityByName,
  getEventForYou,
  getAllCity,
} from "@api/services/mainServices";
import imagePath from "@assets/icons";
import useAuth from "@hooks/useAuth";

// Default cities to show when search is empty (only these 9)
const DEFAULT_CITY_NAMES = [
  "Dubai",
  "Bangkok",
  "Singapore",
  "Paris",
  "London",
  "Bali",
  "New York",
  "Istanbul",
  "Rome",
];

const SearchCity = ({ navigation, route }) => {
  const { requireAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultCities, setDefaultCities] = useState([]); // All cities when search is empty
  const [citiesData, setCitiesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const mode = route?.params?.mode; // 'cityOnly', 'eventOnly', or undefined (both)
  const fromScreen = route?.params?.fromScreen; // Track which screen we came from

  // Fetch all cities on mount, then keep only the 9 default cities for empty search
  useEffect(() => {
    let cancelled = false;
    const fetchDefault = async () => {
      try {
        const res = await getAllCity();
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        if (!Array.isArray(list)) {
          if (!cancelled) setDefaultCities([]);
          return;
        }
        // Filter to only allowed cities, in DEFAULT_CITY_NAMES order
        const filtered = DEFAULT_CITY_NAMES.flatMap((name) =>
          list.filter(
            (c) => (c?.name || "").trim().toLowerCase() === name.trim().toLowerCase()
          )
        );
        if (!cancelled) setDefaultCities(filtered);
      } catch (_) {
        if (!cancelled) setDefaultCities([]);
      }
    };
    fetchDefault();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setCitiesData([]);
      setEventsData([]);
    }
  }, [query]);

  // Debounced server search (cities + events, cities-only, or events-only based on mode)
  useEffect(() => {
    const searchText = query.trim();
    if (!searchText) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        if (mode === "cityOnly") {
          const citiesRes = await searchCityByName({ search: searchText });
          const nextCities = citiesRes?.data || citiesRes || [];
          setCitiesData(Array.isArray(nextCities) ? nextCities : []);
          setEventsData([]);
        } else if (mode === "eventOnly") {
          const eventsRes = await getEventForYou({ search: searchText });
          const nextEvents = eventsRes?.data || eventsRes || [];
          setCitiesData([]);
          setEventsData(Array.isArray(nextEvents) ? nextEvents : []);
        } else {
          // Default mode: search both cities and events
          const [citiesRes, eventsRes] = await Promise.all([
            searchCityByName({ search: searchText }),
            getEventForYou({ search: searchText }),
          ]);
          const nextCities = citiesRes?.data || citiesRes || [];
          const nextEvents = eventsRes?.data || eventsRes || [];
          setCitiesData(Array.isArray(nextCities) ? nextCities : []);
          setEventsData(Array.isArray(nextEvents) ? nextEvents : []);
        }
      } catch (err) {
        setCitiesData([]);
        setEventsData([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, mode]);

  const renderItem = ({ item, section }) => {
    if (section?.title === "Cities") {
      return (
        <TouchableOpacity
          onPress={() => {
            if (mode === "cityOnly") {
              const isTripCreationPick =
                fromScreen === "CreateTrip" || !fromScreen;
              if (isTripCreationPick && !requireAuth()) {
                return;
              }
              // If in cityOnly mode, navigate back to the screen we came from
              if (fromScreen === "CreateTrip") {
                navigation.navigate(navigationStrings.CREATE_TRIP, {
                  cityData: item,
                  selectedBuddyPhones: route?.params?.selectedBuddyPhones || [],
                  fromDate: route?.params?.fromDate,
                  toDate: route?.params?.toDate,
                });
              } else if (fromScreen === "CityDetail") {
                navigation.navigate(navigationStrings.CITY_DETAIL, {
                  cityData: item,
                });
              } else {
                // Default fallback - go back to CreateTrip
                navigation.navigate(navigationStrings.CREATE_TRIP, {
                  cityData: item,
                  selectedBuddyPhones: route?.params?.selectedBuddyPhones || [],
                  fromDate: route?.params?.fromDate,
                  toDate: route?.params?.toDate,
                });
              }
            } else {
              // Normal flow - navigate to city detail
              navigation.navigate(navigationStrings.CITY_DETAIL, {
                cityData: item,
              });
            }
          }}
          activeOpacity={0.7}
          style={styles.row}
        >
          <OptimizedImage
            source={{ uri: item?.image }}
            style={styles.image}
            placeholder={
              <ImagePlaceholder style={styles.image} text="Loading..." />
            }
          />
          <View style={styles.textContainer}>
            <Text style={styles.city}>{item?.name}</Text>
            <Text style={styles.country}>{item?.country_name}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // event item
    return (
      <TouchableOpacity
        onPress={() => {
          // Navigate to ActivityDetails with event data
          navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
            eventData: item,
          });
        }}
        activeOpacity={0.7}
        style={styles.row}
      >
        <OptimizedImage
          source={{ uri: item?.image }}
          style={styles.image}
          placeholder={
            <ImagePlaceholder style={styles.image} text="Loading..." />
          }
        />
        <View style={styles.textContainer}>
          <Text style={styles.city}>{item?.name || item?.title}</Text>
          {!!item?.city_name && (
            <Text style={styles.country}>{item?.city_name}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainContainer>
      {/* Back Icon and Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={imagePath.BACK_ICON}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Where are you going?"
          style={styles.searchBar}
          placeholderTextColor={"grey"}
          value={query}
          onChangeText={setQuery}
        />
          <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
        </View>
      </View>

      {/* List: default = all cities, with search = search results */}
      {loading ? (
        <Text style={styles.loading}>Searching...</Text>
      ) : (() => {
        const hasQuery = !!query.trim();
        // When search is empty: show default cities (same format as search results)
        const citiesToList = hasQuery ? citiesData : defaultCities;
        const eventsToList = hasQuery ? eventsData : [];

        const shouldShowNoResults =
          hasQuery &&
          ((mode === "cityOnly" && citiesData.length === 0) ||
            (mode === "eventOnly" && eventsData.length === 0) ||
            (!mode && citiesData.length === 0 && eventsData.length === 0));

        if (shouldShowNoResults) {
          return <Text style={styles.empty}>No results</Text>;
        }

        const sections = [];
        if (mode !== "eventOnly" && citiesToList.length > 0) {
          sections.push({ title: "Cities", data: citiesToList });
        }
        if (mode !== "cityOnly" && eventsToList.length > 0) {
          sections.push({ title: "Events", data: eventsToList });
        }

        if (sections.length === 0) return null;

        return (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) =>
              `${item?._id || item?.id || index}`
            }
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionTitle}>{title}</Text>
            )}
            showsVerticalScrollIndicator={false}
          />
        );
      })()}
    </MainContainer>
  );
};

export default SearchCity;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: getVertiPadding(15),
    gap: getWidth(12),
  },
  backButton: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  backIcon: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.black,
  },
  searchWrapper: {
    flex: 1,
    height: getHeight(44),
    borderRadius: getRadius(8),
    backgroundColor: colors.input,
    paddingHorizontal: getHoriPadding(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBar: {
    flex: 1,
    marginRight: getWidth(12),
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  searchIcon: {
    resizeMode: "contain",
    height: getHeight(15),
    width: getWidth(15),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    marginBottom: getVertiPadding(10),
    color: colors.black,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getVertiPadding(15),
  },
  image: {
    width: getWidth(50),
    height: getWidth(50),
    borderRadius: getWidth(8),
    marginRight: getWidth(12),
  },
  textContainer: {
    flex: 1,
  },
  city: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  country: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.grey,
  },
  loading: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.grey,
    textAlign: "center",
    marginTop: getVertiPadding(20),
  },
  empty: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.grey,
    textAlign: "center",
    marginTop: getVertiPadding(20),
  },
});
