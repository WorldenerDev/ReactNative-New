import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getWidth,
  getHeight,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
  getRadius,
} from "@utils/responsive";
import imagePath from "@assets/icons";
import Header from "@components/Header";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventForYouCityID,
  fetchPopularEvent,
  fetchTripByCity,
} from "@redux/slices/cityTripSlice";
import CategoryCard from "@components/appComponent/CategoryCard";
import ForYouCard from "@components/appComponent/ForYouCard";
import ScreenWapper from "@components/container/ScreenWapper";
import CustomDropdown from "@components/CustomDropdown";

// Helper function to get city name only
const getCityName = (trip) => {
  return trip?.city_id?.name || "Trip";
};

// Helper function to format trip label with date (for dropdown options)
const formatTripLabel = (trip) => {
  const cityName = trip?.city_id?.name || "Trip";
  const startDate = trip?.start_at
    ? new Date(trip.start_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : "";
  return cityName + (startDate ? ` - ${startDate}` : "");
};

/** --- screen --- */
const CityDetail = ({ route, navigation }) => {
  const { cityData } = route.params || {};
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.auth);
  const { tripsByCity } = useSelector((state) => state.cityTrip);
  const [popularThing, setPopularThings] = useState([]);
  const [eventByCity, setEventByCity] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Get trips for current city from Redux map
  const currentCityTrips = tripsByCity[cityData?.city_id] || [];
  // console.log("City Data on city detail screen ", cityData);

  useEffect(() => {
    // Reset selected trip when city changes
    setSelectedTrip(null);
    PopularEvents();
    getEvent_by_city();
    getTripsByCity();
  }, [route]);

  // Removed auto-selection - dropdown will show "Trip Name" placeholder by default

  const getTripsByCity = async () => {
    try {
      const result = await dispatch(
        fetchTripByCity(cityData?.city_id)
      );
    } catch (error) {
      console.warn("fetchTripByCity error:", error);
    }
  };

  const PopularEvents = async () => {
    try {
      const result = await dispatch(
        fetchPopularEvent({
          cityId: cityData?.city_id,
          sortBy: "rating",
          limit: 2,
        })
      );
      if (result?.payload?.data) {
        setPopularThings(result?.payload?.data);
      }
      console.log("fetchPopularEvent result:", result);
    } catch (error) {
      console.warn("fetchPopularEvent error:", error);
    }
  };

  const getEvent_by_city = async () => {
    try {
      const result = await dispatch(
        fetchEventForYouCityID({
          city: cityData?.city_id,
        })
      );
      if (result?.payload?.success) {
        setEventByCity(result?.payload?.data);
      }
      console.log("fetchEventForYouCityID result:", result);
    } catch (error) {
      console.warn("fetchEventForYouCityID error:", error);
    }
  };

  const renderPopularItem = ({ item }) => (
    <ForYouCard
      item={item}
      onPress={() =>
        navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
          eventData: item,
          selectedTrip: selectedTrip,
        })
      }
    />
  );

  /* For You card */
  const renderForYouItem = ({ item }) => (
    <ForYouCard
      item={item}
      onPress={() =>
        navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
          eventData: item,
          selectedTrip: selectedTrip,
        })
      }
    />
  );

  return (
    <ScreenWapper>
      <FlatList
        data={[1]} // dummy
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.listContainer}>
            {/* Banner */}
            <View>
              <OptimizedImage
                source={{ uri: cityData?.image }}
                style={styles.banner}
                placeholder={
                  <ImagePlaceholder
                    style={styles.banner}
                    text="Loading city image..."
                  />
                }
              />

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconBtn}
              >
                <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
              </TouchableOpacity>
              {/* City name button */}
              <TouchableOpacity
                style={styles.cityBtn}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(navigationStrings.SEARCH_CITY, {
                    mode: "cityOnly",
                    fromScreen: "CityDetail",
                  })
                }
              >
                <Text style={styles.cityName}>{cityData?.name} ⌄</Text>
              </TouchableOpacity>

              {/* Trip Name Dropdown */}
              <View style={styles.tripDropdownContainer}>
                <CustomDropdown
                  placeholder="Trip Name"
                  options={currentCityTrips.map((trip) => ({
                    label: formatTripLabel(trip), // Show city name + date in options list
                    value: trip._id, // Use trip's _id (e.g., "6906edd4f2b47a7ea572648c")
                    ...trip, // Keep full trip object with _id at root level
                  }))}
                  selectedValue={selectedTrip}
                  onValueChange={(item) => {
                    // When selected, show only city name but keep full trip object with _id
                    const selectedTripObj = {
                      label: getCityName(item), // Display only city name
                      value: item._id, // Ensure _id is at root level for easy access
                    };
                    console.log("Selected Trip Object:", selectedTripObj);
                    setSelectedTrip(selectedTripObj);
                  }}
                  containerStyle={styles.tripDropdownWrapper}
                  dropdownWrapperStyle={styles.tripDropdown}
                  textStyle={styles.tripDropdownText}
                  arrowIconStyle={styles.tripArrowIcon}
                  showIcon={true}
                  disabled={currentCityTrips.length === 0}
                />
              </View>

              {/* Search */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(navigationStrings.SEARCH_CITY, {
                    mode: "eventOnly", // Search only events from CityDetail
                    fromScreen: "CityDetail",
                  })
                }
                activeOpacity={0.9}
                style={styles.searchWrap}
              >
                <View
                  //placeholderTextColor={colors.lightText}
                  style={styles.searchInput}
                >
                  <Text style={{ color: colors.lightText }}>
                    Search activities and experiences
                  </Text>
                </View>
                <Image
                  source={imagePath.SEARCH_ICON}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Popular */}
            <Text style={styles.sectionTitle}>Popular things to do</Text>
            <FlatList
              data={popularThing}
              renderItem={renderPopularItem}
              keyExtractor={(it) => it.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: getHoriPadding(16) }}
            />

            {/* Categories */}
            <Text style={[styles.sectionTitle, styles.categoryTitle]}>
              Browse by Category
            </Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={({ item }) => (
                <CategoryCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(navigationStrings.BROUSE_BY_CATEGORY, {
                      name: item?.name,
                    })
                  }
                />
              )}
              keyExtractor={(it) => it.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hListPad}
            />

            {/* For You */}
            <Text style={styles.sectionTitle}>For You</Text>
            <FlatList
              data={eventByCity}
              renderItem={renderForYouItem}
              keyExtractor={(it) => it.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: getHoriPadding(16) }}
            />
          </View>
        }
      />
    </ScreenWapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },

  banner: {
    width: "100%",
    height: getHeight(230),
  },
  iconBtn: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    position: "absolute",
    top: getVertiPadding(45),
    left: getHoriPadding(16),
    paddingVertical: getVertiPadding(6),
    paddingHorizontal: getHoriPadding(10),
  },
  iconStyle: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
  },
  cityBtn: {
    position: "absolute",
    top: getVertiPadding(48),
    left: getHoriPadding(56),
    paddingVertical: getVertiPadding(6),
    paddingHorizontal: getHoriPadding(10),
    borderRadius: getRadius(20),
  },
  cityName: {
    color: colors.white,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
  },

  searchWrap: {
    position: "absolute",
    left: "5%",
    right: "5%",
    bottom: getVertiPadding(-20),
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
  searchInput: {
    flex: 1,
    marginRight: getWidth(12),
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  searchIcon: {
    resizeMode: "contain",
    height: getHeight(20),
    width: getWidth(20),
  },

  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    marginTop: getVertiPadding(40),
    marginBottom: getVertiPadding(10),
    color: colors.black,
    paddingHorizontal: getHoriPadding(16),
  },
  categoryTitle: {
    marginTop: getVertiPadding(20), // Reduced gap for Browse by Category
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(10),
  },
  hListPad: {
    paddingHorizontal: getHoriPadding(16),
  },
  tripDropdownContainer: {
    position: "absolute",
    top: getVertiPadding(25),
    right: getHoriPadding(16),
    maxWidth: getWidth(150),
  },
  tripDropdownWrapper: {
    backgroundColor: "transparent",
  },
  tripDropdown: {
    backgroundColor: "transparent",
    paddingHorizontal: getHoriPadding(10),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
    height: "auto",
    minHeight: getHeight(32),
  },
  tripDropdownText: {
    color: colors.black,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
  },
  tripArrowIcon: {
    tintColor: colors.black,
  },
});

export default CityDetail;
