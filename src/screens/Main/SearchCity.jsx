import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import MainContainer from "@components/container/MainContainer";
import {
  getFontSize,
  getHeight,
  getWidth,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { useSelector } from "react-redux";
import navigationStrings from "@navigation/navigationStrings";

const SearchCity = ({ navigation }) => {
  const { city } = useSelector((state) => state.cityTrip);
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(city);

  // 🔹 Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() === "") {
        setFilteredData(city);
      } else {
        const lowerQuery = query.toLowerCase();
        const results = city.filter(
          (item) =>
            item?.name.toLowerCase().includes(lowerQuery) ||
            item?.country_name.toLowerCase().includes(lowerQuery)
        );
        setFilteredData(results);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(navigationStrings.CITY_DETAIL, {
          cityData: item,
        })
      }
      activeOpacity={0.7}
      style={styles.row}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.city}>{item?.name}</Text>
        <Text style={styles.country}>{item?.country_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainContainer>
      {/* Search Bar with icon on RIGHT */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Where are you going?"
          style={styles.searchBar}
          placeholderTextColor={colors.grey}
          value={query}
          onChangeText={setQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Popular Searches */}
      <Text style={styles.sectionTitle}>Popular searches</Text>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </MainContainer>
  );
};

export default SearchCity;

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input, // White like in screenshot
    borderRadius: getWidth(10),
    paddingHorizontal: getHoriPadding(12),
    marginVertical: getVertiPadding(10),
  },
  searchBar: {
    flex: 1,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    paddingVertical: getVertiPadding(10),
    color: colors.black,
  },
  searchIcon: {
    fontSize: getFontSize(18),
    color: colors.grey, // Softer icon color like screenshot
    marginLeft: getWidth(6),
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
});
