import React from "react";
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

/** --- mock data --- */
const POPULAR = [
  {
    id: "1",
    title: "Rovaniemi",
    subtitle: "Night safari",
    image: "https://picsum.photos/seed/p1/600/400",
  },
  {
    id: "2",
    title: "Rovaniemi",
    subtitle: "Night safari",
    image: "https://picsum.photos/seed/p2/600/400",
  },
];
const CATEGORIES = [
  { id: "1", name: "Category", image: "https://picsum.photos/seed/c1/400/400" },
  { id: "2", name: "Category", image: "https://picsum.photos/seed/c2/400/400" },
  { id: "3", name: "Category", image: "https://picsum.photos/seed/c3/400/400" },
];
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
const CityDetail = () => {
  /* Popular card */
  const renderPopularItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay}>
        <Text numberOfLines={2} style={styles.forYouTitle}>
          {item.title}
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
        <Text style={styles.forYouTitle}>{item.title}</Text>
        <Text style={styles.forYouSubtitle}>{item.subtitle}</Text>
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
            <Image
              source={{ uri: "https://picsum.photos/seed/banner/1200/800" }}
              style={styles.banner}
            />

            {/* City name button */}
            <TouchableOpacity style={styles.cityBtn} activeOpacity={0.7}>
              <Text style={styles.cityName}>Paris ⌄</Text>
            </TouchableOpacity>

            {/* Search */}
            <View style={styles.searchWrap}>
              <TextInput
                placeholder="Search activities and experiences"
                placeholderTextColor={colors.lightText}
                style={styles.searchInput}
              />
              <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
            </View>
          </View>

          {/* Popular */}
          <Text style={styles.sectionTitle}>Popular things to do</Text>
          <FlatList
            horizontal
            data={POPULAR}
            renderItem={renderPopularItem}
            keyExtractor={(it) => it.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
          />

          {/* Categories */}
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <FlatList
            horizontal
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(it) => it.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
          />

          {/* For You */}
          <Text style={styles.sectionTitle}>For You</Text>
          <FlatList
            data={FOR_YOU}
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
  cityBtn: {
    position: "absolute",
    top: getVertiPadding(52),
    left: getHoriPadding(16),
    paddingVertical: getVertiPadding(6),
    paddingHorizontal: getHoriPadding(10),
    borderRadius: getRadius(20),
  },
  cityName: {
    color: colors.white,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
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
