import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "@components/container/MainContainer";
import {
  getWidth,
  getHeight,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
  getRadius,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import { category } from "@redux/slices/authSlice";

const destinations = [
  { id: "1", name: "Paris", image: "https://picsum.photos/id/1011/400/400" },
  { id: "2", name: "London", image: "https://picsum.photos/id/1012/400/400" },
  { id: "3", name: "Dubai", image: "https://picsum.photos/id/1013/400/400" },
];

const categories = [
  {
    id: "1",
    name: "Adventure",
    image: "https://picsum.photos/id/1015/400/400",
  },
  { id: "2", name: "Nature", image: "https://picsum.photos/id/1016/400/400" },
  { id: "3", name: "Culture", image: "https://picsum.photos/id/1016/400/400" },
];

const forYou = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  title: "Rovaniemi",
  subtitle: "Night safari",
  image: "https://picsum.photos/id/1025/600/400",
}));

const Home = ({ navigation }) => {
  const { user, categories } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    getCategory();
  }, [dispatch]);

  const getCategory = async () => {
    try {
      const result = await dispatch(category());
    } catch (err) {
      console.error("Failed to fetch category on home Screen ", err);
    }
  };

  const renderForYou = ({ item }) => (
    <View style={styles.forYouCard}>
      <Image source={{ uri: item.image }} style={styles.forYouImage} />
      <View style={styles.overlay}>
        <Text style={styles.forYouTitle}>{item.title}</Text>
        <Text style={styles.forYouSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{`Hi ${user?.name}!`}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(navigationStrings.SEARCH_CITY)}
        >
          <Text style={styles.search}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Where to next */}
      <Text style={styles.sectionTitle}>Where to next?</Text>
      <FlatList
        data={destinations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
          </View>
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
          <View style={styles.categoryCard}>
            <Image
              source={{ uri: item?.cover_image_url }}
              style={styles.image}
            />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
          </View>
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
      <FlatList
        data={forYou}
        renderItem={renderForYou}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
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
    fontSize: getFontSize(20),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    marginTop: getVertiPadding(30),
    marginBottom: getVertiPadding(10),
    color: colors.black,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(20),
  },
  card: {
    marginRight: getWidth(15),
    borderRadius: getWidth(10),
    overflow: "hidden",
  },
  categoryCard: {
    marginRight: getWidth(15),
    borderRadius: getWidth(10),
    overflow: "hidden",
  },
  image: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(10),
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: getVertiPadding(5),
    alignItems: "center",
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
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
    padding: getHoriPadding(8),
    backgroundColor: colors.light_white,
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
