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

/** --- mock data --- */
const FOR_YOU = [
  {
    id: "1",
    title: "Aurora Night",
    subtitle: "Finland",
    image: "https://picsum.photos/seed/f1/700/500",
  },
  {
    id: "2",
    title: "City Walk",
    subtitle: "Paris",
    image: "https://picsum.photos/seed/f2/700/500",
  },
  {
    id: "3",
    title: "Beach View",
    subtitle: "Goa",
    image: "https://picsum.photos/seed/f3/700/500",
  },
];

/** --- screen --- */
const CityDetail = ({ route, navigation }) => {
  const { cityData } = route.params || {};
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.auth);
  const [popularThing, setPopularThings] = useState([]);
  const [eventByCity, setEventByCity] = useState([]);
  // console.log("City Data on city detail screen ", cityData);

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
      setPopularThings(result?.payload?.data);
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
      result?.payload?.success && setEventByCity(result?.payload?.data);
      console.log("fetchEventForYouCityID result:", result);
    } catch (error) {
      console.warn("fetchEventForYouCityID error:", error);
    }
  };

  const renderPopularItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item?.city_data?.cover_image_url }}
        style={styles.image}
      />
      <View style={styles.overlay}>
        <Text numberOfLines={2} style={styles.forYouTitle}>
          {item.name}
        </Text>
      </View>
    </View>
  );

  /* Category card */
  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
    </View>
  );

  /* For You card */
  const renderForYouItem = ({ item }) => (
    <View style={styles.forYouCard}>
      <Image source={{ uri: item.image }} style={styles.forYouImage} />
      <View style={styles.overlay}>
        <Text style={styles.forYouTitle}>{item.name}</Text>
        {/* <Text style={styles.forYouSubtitle}>{item.subtitle}</Text> */}
      </View>
    </View>
  );

  return (
    <FlatList
      data={[1]} // dummy
      keyExtractor={(_, i) => String(i)}
      showsVerticalScrollIndicator={false}
      renderItem={null}
      ListHeaderComponent={
        <View style={styles.listContainer}>
          {/* Banner */}
          <View>
            <Image source={{ uri: cityData?.image }} style={styles.banner} />

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
              onPress={() => navigation.navigate(navigationStrings.SEARCH_CITY)}
            >
              <Text style={styles.cityName}>{cityData.name} ⌄</Text>
            </TouchableOpacity>

            {/* Search */}
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.SEARCH_CITY)}
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
              <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>

          {/* Popular */}
          <Text style={styles.sectionTitle}>Popular things to do</Text>
          <FlatList
            horizontal
            data={popularThing}
            renderItem={renderPopularItem}
            keyExtractor={(it) => it.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
          />

          {/* Categories */}
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <FlatList
            horizontal
            data={categories}
            renderItem={({ item }) => <CategoryCard item={item} />}
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
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(10),
  },
  hListPad: {
    paddingHorizontal: getHoriPadding(16),
  },

  /* Popular */
  card: {
    marginRight: getWidth(15),
    borderRadius: getWidth(10),
    overflow: "hidden",
  },
  image: {
    width: getWidth(160),
    height: getWidth(120),
    borderRadius: getWidth(10),
  },
  popularPill: {
    position: "absolute",

    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(30),
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
  },
  popularTitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  popularSub: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },

  /* Categories */
  categoryCard: {
    marginRight: getWidth(15),
    borderRadius: getWidth(10),
    overflow: "hidden",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: getVertiPadding(6),
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "flex-start",
    paddingHorizontal: getHoriPadding(8),
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },

  /* For You */
  forYouCard: {
    flex: 1,
    marginBottom: getVertiPadding(15),
    marginHorizontal: getWidth(5),
    borderRadius: getWidth(12),
    overflow: "hidden",
  },
  forYouImage: {
    width: "100%",
    height: getHeight(150),
    borderRadius: getWidth(12),
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: getHoriPadding(10),
    backgroundColor: "rgba(0,0,0,0.35)",
    borderTopRightRadius: getRadius(20),
    borderTopLeftRadius: getRadius(20),
  },
  forYouTitle: {
    color: colors.white,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
  },
  forYouSubtitle: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
  },
});

export default CityDetail;
