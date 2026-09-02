import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
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
  searchHome,
} from "@api/services/mainServices";
import imagePath from "@assets/icons";
import useAuth from "@hooks/useAuth";
import { formatCompactDateRange } from "@utils/formatDate";

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

const TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "city", label: "Cities" },
  { id: "trip", label: "Trips" },
  { id: "crew", label: "Crews" },
  { id: "experience", label: "Experiences" },
];

const STATUS_OPTIONS = [
  { id: "", label: "Any status" },
  { id: "Planning", label: "Planning" },
  { id: "Booked", label: "Booked" },
  { id: "Expired", label: "Expired" },
];

const SearchCity = ({ navigation, route }) => {
  const { requireAuth, isGuest } = useAuth();
  const [query, setQuery] = useState(route?.params?.initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [defaultCities, setDefaultCities] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [tripsData, setTripsData] = useState([]);
  const [crewsData, setCrewsData] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(
    Boolean(route?.params?.openFilters)
  );
  const [selectedTypes, setSelectedTypes] = useState(["all"]);
  const [tripStatus, setTripStatus] = useState("");
  const mode = route?.params?.mode;
  const fromScreen = route?.params?.fromScreen;
  const cityId = route?.params?.cityId;
  const unifiedMode = !mode;

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
        const filtered = DEFAULT_CITY_NAMES.flatMap((name) =>
          list.filter(
            (c) =>
              (c?.name || "").trim().toLowerCase() === name.trim().toLowerCase()
          )
        );
        if (!cancelled) setDefaultCities(filtered);
      } catch (_) {
        if (!cancelled) setDefaultCities([]);
      }
    };
    fetchDefault();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setCitiesData([]);
      setEventsData([]);
      setTripsData([]);
      setCrewsData([]);
    }
  }, [query]);

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
          setTripsData([]);
          setCrewsData([]);
        } else if (mode === "eventOnly") {
          const eventsRes = await getEventForYou({
            search: searchText,
            ...(cityId ? { city: cityId } : {}),
          });
          const nextEvents = eventsRes?.data || eventsRes || [];
          setCitiesData([]);
          setEventsData(Array.isArray(nextEvents) ? nextEvents : []);
          setTripsData([]);
          setCrewsData([]);
        } else {
          const types = selectedTypes.includes("all")
            ? "city,trip,crew,experience"
            : selectedTypes.join(",");
          const params = { q: searchText, types };
          if (tripStatus) params.status = tripStatus;
          const res = await searchHome(params);
          const data = res?.data || {};
          setCitiesData(Array.isArray(data.cities) ? data.cities : []);
          setEventsData(
            Array.isArray(data.experiences) ? data.experiences : []
          );
          setTripsData(Array.isArray(data.trips) ? data.trips : []);
          setCrewsData(Array.isArray(data.crews) ? data.crews : []);
        }
      } catch (err) {
        setCitiesData([]);
        setEventsData([]);
        setTripsData([]);
        setCrewsData([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, mode, cityId, selectedTypes, tripStatus]);

  const toggleType = (id) => {
    if (id === "all") {
      setSelectedTypes(["all"]);
      return;
    }
    setSelectedTypes((prev) => {
      const withoutAll = prev.filter((item) => item !== "all");
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter((item) => item !== id);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, id];
    });
  };

  const handleCityPress = (item) => {
    if (mode === "cityOnly") {
      const isTripCreationPick = fromScreen === "CreateTrip" || !fromScreen;
      if (isTripCreationPick && !requireAuth()) {
        return;
      }
      if (fromScreen === "CreateTrip") {
        navigation.navigate({
          name: navigationStrings.CREATE_TRIP,
          params: {
            cityData: item,
            selectedBuddyPhones: route?.params?.selectedBuddyPhones || [],
            fromDate: route?.params?.fromDate,
            toDate: route?.params?.toDate,
            groupId: route?.params?.groupId,
            groupName: route?.params?.groupName,
          },
          merge: true,
        });
      } else if (fromScreen === "CityDetail") {
        navigation.navigate(navigationStrings.CITY_DETAIL, {
          cityData: item,
        });
      } else {
        navigation.navigate({
          name: navigationStrings.CREATE_TRIP,
          params: {
            cityData: item,
            selectedBuddyPhones: route?.params?.selectedBuddyPhones || [],
            fromDate: route?.params?.fromDate,
            toDate: route?.params?.toDate,
            groupId: route?.params?.groupId,
            groupName: route?.params?.groupName,
          },
          merge: true,
        });
      }
      return;
    }
    navigation.navigate(navigationStrings.CITY_DETAIL, {
      cityData: item,
    });
  };

  const renderItem = ({ item, section }) => {
    if (section?.title === "Cities") {
      return (
        <TouchableOpacity
          onPress={() => handleCityPress(item)}
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

    if (section?.title === "Trips") {
      return (
        <TouchableOpacity
          onPress={() => {
            if (!requireAuth("Sign in to open this trip")) return;
            navigation.navigate(navigationStrings.TRIP_DETAILS, {
              tripId: item._id,
              trip: item,
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
            <Text style={styles.city}>{item?.name || item?.city}</Text>
            <Text style={styles.country}>
              {[item?.groupName, formatCompactDateRange(item.start_at, item.end_at)]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (section?.title === "Crews") {
      return (
        <TouchableOpacity
          onPress={() => {
            if (!requireAuth("Sign in to open this crew")) return;
            navigation.navigate(navigationStrings.GROUP_DETAILS, {
              groupId: item._id,
            });
          }}
          activeOpacity={0.7}
          style={styles.row}
        >
          <OptimizedImage
            source={{ uri: item?.groupImage || item?.image }}
            style={styles.image}
            placeholder={
              <ImagePlaceholder style={styles.image} text="Loading..." />
            }
          />
          <View style={styles.textContainer}>
            <Text style={styles.city}>{item?.groupName}</Text>
            <Text style={styles.country}>
              {item?.activeTripCount || 0} active trips
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
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
          {!!(item?.city_name || item?.city_data?.name) && (
            <Text style={styles.country}>
              {item?.city_name || item?.city_data?.name}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const hasQuery = !!query.trim();
  const citiesToList = hasQuery ? citiesData : defaultCities;
  const eventsToList = hasQuery ? eventsData : [];
  const tripsToList = hasQuery ? tripsData : [];
  const crewsToList = hasQuery ? crewsData : [];

  const shouldShowNoResults =
    hasQuery &&
    ((mode === "cityOnly" && citiesData.length === 0) ||
      (mode === "eventOnly" && eventsData.length === 0) ||
      (!mode &&
        citiesData.length === 0 &&
        eventsData.length === 0 &&
        tripsData.length === 0 &&
        crewsData.length === 0));

  const sections = [];
  if (mode !== "eventOnly" && citiesToList.length > 0) {
    sections.push({ title: "Cities", data: citiesToList });
  }
  if (unifiedMode && tripsToList.length > 0) {
    sections.push({ title: "Trips", data: tripsToList });
  }
  if (unifiedMode && crewsToList.length > 0) {
    sections.push({ title: "Crews", data: crewsToList });
  }
  if (mode !== "cityOnly" && eventsToList.length > 0) {
    sections.push({
      title: unifiedMode ? "Experiences" : "Events",
      data: eventsToList,
    });
  }

  return (
    <MainContainer>
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
            placeholder="Search cities, trips or experiences..."
            style={styles.searchBar}
            placeholderTextColor={"grey"}
            value={query}
            onChangeText={setQuery}
          />
          <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
        </View>
        {unifiedMode ? (
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFiltersVisible(true)}
          >
            <View style={styles.filterGlyph}>
              <View style={[styles.filterLine, { width: 12 }]} />
              <View style={[styles.filterLine, { width: 9 }]} />
              <View style={[styles.filterLine, { width: 6 }]} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Text style={styles.loading}>Searching...</Text>
      ) : shouldShowNoResults ? (
        <Text style={styles.empty}>No results</Text>
      ) : sections.length === 0 ? null : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item?._id || item?.id || index}`}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Text style={styles.modalLabel}>Show</Text>
            <View style={styles.chipRow}>
              {TYPE_OPTIONS.filter(
                (option) =>
                  !isGuest ||
                  option.id === "all" ||
                  option.id === "city" ||
                  option.id === "experience"
              ).map((option) => {
                const active =
                  selectedTypes.includes(option.id) ||
                  (option.id === "all" && selectedTypes.includes("all"));
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleType(option.id)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!isGuest ? (
              <>
                <Text style={styles.modalLabel}>Trip status</Text>
                <View style={styles.chipRow}>
                  {STATUS_OPTIONS.map((option) => {
                    const active = tripStatus === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id || "any"}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setTripStatus(option.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setFiltersVisible(false)}
            >
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterBtn: {
    width: getWidth(36),
    height: getWidth(36),
    borderRadius: getWidth(18),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterGlyph: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  filterLine: {
    height: 1.5,
    backgroundColor: colors.black,
    borderRadius: 1,
    marginVertical: 1.5,
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
    color: colors.lightText,
  },
  loading: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    marginTop: getVertiPadding(20),
  },
  empty: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    marginTop: getVertiPadding(20),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: getRadius(20),
    borderTopRightRadius: getRadius(20),
    padding: getHoriPadding(20),
    paddingBottom: getVertiPadding(32),
  },
  modalTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(16),
  },
  modalLabel: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    marginBottom: getVertiPadding(8),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getWidth(8),
    marginBottom: getVertiPadding(16),
  },
  chip: {
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
    borderRadius: getRadius(16),
    backgroundColor: colors.input,
  },
  chipActive: {
    backgroundColor: colors.black,
  },
  chipText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  chipTextActive: {
    color: colors.white,
  },
  applyBtn: {
    backgroundColor: colors.black,
    borderRadius: getRadius(12),
    alignItems: "center",
    paddingVertical: getVertiPadding(12),
  },
  applyText: {
    color: colors.white,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(14),
  },
});
