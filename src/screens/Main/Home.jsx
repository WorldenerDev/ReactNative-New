import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MainContainer from "@components/container/MainContainer";
import {
  getHeight,
  getWidth,
  getFontSize,
  getVertiPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesTree } from "@redux/slices/authSlice";
import imagePath from "@assets/icons";
import { fetchAllCity, fetchEventForYou } from "@redux/slices/cityTripSlice";
import ForYouCard from "@components/appComponent/ForYouCard";
import CityCard from "@components/appComponent/CityCard";
import CategoryCard from "@components/appComponent/CategoryCard";

const getTimeOfDayGreeting = (name) => {
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  const displayName = name?.trim() || "there";
  return `${greeting}, ${displayName}!`;
};

const Home = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { user, categories } = useSelector((state) => state.auth);
  const { city, eventForYou, eventForYouPreferencesKey } = useSelector(
    (state) => state.cityTrip
  );
  const dispatch = useDispatch();
  const preferencesKey = JSON.stringify(user?.preferences ?? []);

  const getCity = useCallback(async () => {
    try {
      await dispatch(fetchAllCity());
    } catch (error) {
      console.error("Failed to fetch City on home Screen ", error);
    }
  }, [dispatch]);

  const getCategory = useCallback(async () => {
    try {
      await dispatch(fetchCategoriesTree({ level: 1 }));
    } catch (err) {
      console.error("Failed to fetch category on home Screen ", err);
    }
  }, [dispatch]);

  const getForYou = useCallback(async () => {
    if (
      eventForYou.length > 0 &&
      eventForYouPreferencesKey === preferencesKey
    ) {
      return;
    }

    try {
      await dispatch(fetchEventForYou({ preferencesKey }));
    } catch (error) {
      console.error("Failed to fetch Event For You on home Screen ", error);
    }
  }, [
    dispatch,
    eventForYou.length,
    eventForYouPreferencesKey,
    preferencesKey,
  ]);

  useEffect(() => {
    getCity();
    getCategory();
  }, [getCity, getCategory]);

  useFocusEffect(
    useCallback(() => {
      getForYou();
    }, [getForYou])
  );

  const ListHeader = () => (
    <View>
      {/* Header */}

      {/* Where to next */}
      <Text style={styles.sectionTitle}>Where to next?</Text>
      <FlatList
        data={city.slice(0, 10)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CityCard
            item={item}
            onPress={() =>
              navigation.navigate(navigationStrings.CITY_DETAIL, {
                cityData: item,
              })
            }
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {/* Browse by Category */}
      <Text style={styles.sectionTitle}>Browse by Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            item={item}
            onPress={() =>
              navigation.navigate(navigationStrings.BROUSE_BY_CATEGORY, {
                name: item?.name,
                categoryIn: item?.code,
              })
            }
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {/* For You Title */}
      <Text style={styles.sectionTitle}>For You</Text>
    </View>
  );

  return (
    <MainContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getTimeOfDayGreeting(user?.name)}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(navigationStrings.SEARCH_CITY, {
              mode: undefined, // Search both cities and events
              fromScreen: "Home",
            })
          }
        >
          <Image style={styles.search} source={imagePath.SEARCH_ICON} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={eventForYou}
        renderItem={({ item }) => (
          <ForYouCard
            item={item}
            onPress={() =>
              navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
                eventData: item,
              })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: scrollPadding },
        ]}
      />
    </MainContainer>
  );
};

export default Home;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: getVertiPadding(10),
  },
  greeting: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
  search: {
    resizeMode: "contain",
    height: getHeight(25),
    width: getWidth(25),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    marginTop: getVertiPadding(10),
    marginBottom: getVertiPadding(10),
    color: colors.black,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(10),
  },
});
