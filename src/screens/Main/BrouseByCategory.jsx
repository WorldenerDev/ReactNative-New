import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ForYouCard from "@components/appComponent/ForYouCard";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import fonts from "@assets/fonts";

const data = [
  {
    id: 1,
    name: "Tromsø",
    subtitle: "Northern lights",
    image: "https://picsum.photos/400/300?random=3",
  },
  {
    id: 2,
    name: "Lapland",
    subtitle: "Snow adventure",
    image: "https://picsum.photos/400/300?random=4",
  },
  {
    id: 3,
    name: "Tromsø",
    subtitle: "Northern lights",
    image: "https://picsum.photos/400/300?random=3",
  },
  {
    id: 4,
    name: "Lapland",
    subtitle: "Snow adventure",
    image: "https://picsum.photos/400/300?random=4",
  },
];

const BrouseByCategory = () => {
  return (
    <MainContainer>
      <Header title="Cruise Activities" />
      <TouchableOpacity style={styles.container} activeOpacity={0.9}>
        <View style={styles.searchInput}>
          <Text style={{ color: colors.lightText }}>
            Search activities and experiences
          </Text>
        </View>
        <Image source={imagePath.SEARCH_ICON} style={styles.icon} />
      </TouchableOpacity>
      <FlatList
        data={data}
        renderItem={({ item }) => <ForYouCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </MainContainer>
  );
};

export default BrouseByCategory;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(10),
  },
  container: {
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
    flexDirection: "row",
    marginVertical: getVertiPadding(15),
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
    height: getHeight(15),
    width: getWidth(15),
  },
});
