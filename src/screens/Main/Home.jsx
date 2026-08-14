import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MainContainer from "@components/container/MainContainer";
import {
  getHeight,
  getWidth,
  getFontSize,
  getVertiPadding,
  getRadius,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import navigationStrings from "@navigation/navigationStrings";
import useAuth from "@hooks/useAuth";
import imagePath from "@assets/icons";
import { getHomeFeed } from "@api/services/mainServices";
import FeaturedTripCard from "@components/home/FeaturedTripCard";
import HomeCrewCard from "@components/home/HomeCrewCard";
import InspirationCard from "@components/home/InspirationCard";
import {
  getFirstName,
  getTimeOfDayGreeting,
  openInspirationTarget,
} from "@utils/homeHelpers";

const Home = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { user, isGuest, requireAuth } = useAuth();
  const [feed, setFeed] = useState({
    featuredTrip: null,
    crews: [],
    inspiration: [],
    unreadCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const response = await getHomeFeed();
      const data = response?.data || {};
      setFeed({
        featuredTrip: data.featuredTrip || null,
        crews: Array.isArray(data.crews) ? data.crews : [],
        inspiration: Array.isArray(data.inspiration) ? data.inspiration : [],
        unreadCount: data.unreadCount || 0,
      });
    } catch (error) {
      console.error("Failed to fetch Home feed", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  const openSearch = (openFilters = false) => {
    navigation.navigate(navigationStrings.SEARCH_CITY, {
      fromScreen: "Home",
      openFilters,
    });
  };

  const handleFeaturedPress = () => {
    const trip = feed.featuredTrip;
    if (!trip || !requireAuth("Sign in to open this trip")) return;
    navigation.navigate(navigationStrings.TRIP_DETAILS, {
      tripId: trip.tripId || trip.memberTripId || trip._id,
      trip,
    });
  };

  const handleCrewPress = (crew) => {
    if (!requireAuth("Sign in to open this crew")) return;
    navigation.navigate(navigationStrings.GROUP_DETAILS, {
      groupId: crew._id,
    });
  };

  const handleCrewChat = (crew) => {
    if (!requireAuth("Sign in to chat with your crew")) return;
    navigation.navigate(navigationStrings.CHAT, { groupId: crew._id });
  };

  const firstName = getFirstName(isGuest ? "Guest" : user?.name);

  return (
    <MainContainer loader={loading && !refreshing}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: scrollPadding },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadFeed();
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greetingLine}>
              <Text style={styles.greeting}>{getTimeOfDayGreeting()}, </Text>
              <Text style={styles.firstName}>{firstName}</Text>
            </Text>
            <Text style={styles.subtitle}>Where are we going next?</Text>
          </View>
          <TouchableOpacity
            style={styles.bellWrap}
            onPress={() => {
              if (!requireAuth("Sign in to view notifications")) return;
              navigation.navigate(navigationStrings.NOTIFICATION_SCREEN);
            }}
          >
            <Image
              source={imagePath.NOTIFICATION_ICON}
              style={styles.bell}
              resizeMode="contain"
            />
            {feed.unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <TouchableOpacity
            style={styles.searchMain}
            onPress={() => openSearch(false)}
            activeOpacity={0.85}
          >
            <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>
              Search cities, trips or experiences...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => openSearch(true)}
          >
            <View style={styles.filterGlyph}>
              <View style={[styles.filterLine, styles.filterLineWide]} />
              <View style={[styles.filterLine, styles.filterLineMid]} />
              <View style={[styles.filterLine, styles.filterLineShort]} />
            </View>
          </TouchableOpacity>
        </View>

        {feed.featuredTrip ? (
          <View style={styles.section}>
            <FeaturedTripCard
              trip={feed.featuredTrip}
              onPress={handleFeaturedPress}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My crews</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.GROUP)}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {feed.crews.length ? (
            <FlatList
              data={feed.crews}
              keyExtractor={(item) => String(item._id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <HomeCrewCard
                  crew={item}
                  onPress={() => handleCrewPress(item)}
                  onActionPress={() => handleCrewChat(item)}
                />
              )}
            />
          ) : (
            <Text style={styles.emptyCopy}>
              {isGuest
                ? "Sign in to see crews you travel with."
                : "Create a crew to plan trips with friends."}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Get inspired</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(navigationStrings.INSPIRATION_LIST)
              }
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {feed.inspiration[0] ? (
            <InspirationCard
              item={feed.inspiration[0]}
              onPress={() =>
                openInspirationTarget(navigation, feed.inspiration[0])
              }
            />
          ) : (
            <Text style={styles.emptyCopy}>Inspiration is on the way.</Text>
          )}
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default Home;

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: getVertiPadding(20),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: getVertiPadding(8),
    marginBottom: getVertiPadding(16),
  },
  headerText: {
    flex: 1,
    paddingRight: getWidth(12),
  },
  greetingLine: {
    marginBottom: getHeight(4),
  },
  greeting: {
    fontSize: getFontSize(22),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  firstName: {
    fontSize: getFontSize(22),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
  subtitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  bellWrap: {
    width: getWidth(40),
    height: getWidth(40),
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    width: getWidth(28),
    height: getHeight(28),
  },
  unreadDot: {
    position: "absolute",
    top: getHeight(6),
    right: getWidth(6),
    width: getWidth(8),
    height: getWidth(8),
    borderRadius: getWidth(4),
    backgroundColor: "#F97316",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: getRadius(28),
    paddingHorizontal: getWidth(14),
    height: getHeight(48),
    marginBottom: getVertiPadding(18),
  },
  searchMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  searchIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: colors.lightText,
    marginRight: getWidth(10),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  filterBtn: {
    width: getWidth(32),
    height: getWidth(32),
    borderRadius: getWidth(16),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterGlyph: {
    alignItems: "flex-end",
    justifyContent: "center",
    height: getHeight(12),
  },
  filterLine: {
    height: 1.5,
    backgroundColor: colors.black,
    borderRadius: 1,
    marginVertical: 1.5,
  },
  filterLineWide: { width: getWidth(12) },
  filterLineMid: { width: getWidth(9) },
  filterLineShort: { width: getWidth(6) },
  section: {
    marginBottom: getVertiPadding(22),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getVertiPadding(12),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  seeAll: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
  emptyCopy: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
});
