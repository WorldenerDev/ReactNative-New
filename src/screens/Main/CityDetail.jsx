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
} from "@redux/slices/cityTripSlice";
import CategoryCard from "@components/appComponent/CategoryCard";
import ForYouCard from "@components/appComponent/ForYouCard";
import ScreenWapper from "@components/container/ScreenWapper";
import { DUMMY_CITY_DATA } from "@assets/dummyData/CityData";

/** --- screen --- */
const CityDetail = ({ route, navigation }) => {
  const { cityData } = route.params || {};
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.auth);
  const [popularThing, setPopularThings] = useState([]);
  const [eventByCity, setEventByCity] = useState([]);
  //console.log("City Data on city detail screen ", cityData);

  useEffect(() => {
    PopularEvents();
    getEvent_by_city();
  }, [route]);

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
                    navigation.navigate(navigationStrings.BROUSE_BY_CATEGORY)
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
              data={
                cityData?.name === "Amsterdam" ? DUMMY_CITY_DATA : eventByCity
              }
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
});

export default CityDetail;
