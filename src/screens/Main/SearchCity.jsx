import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Image,
  TextInput,
  TouchableOpacity,
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
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import { searchCityByName, getEventForYou } from "@api/services/mainServices";

const SearchCity = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [citiesData, setCitiesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);

  // When query empty, clear lists (don’t use cached Redux city data)
  useEffect(() => {
    if (!query.trim()) {
      setCitiesData([]);
      setEventsData([]);
    }
  }, [query]);

  // 🔹 Debounced server search (cities + events)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const searchText = query.trim();
      if (!searchText) return; // handled by initial list effect
      try {
        setLoading(true);
        const [citiesRes, eventsRes] = await Promise.all([
          // Backend accepts POST for cities; pass body { search }
          searchCityByName({ search: searchText }),
          // Events supports GET with params { search }
          getEventForYou({ search: searchText }),
        ]);

        const nextCities = citiesRes?.data || citiesRes || [];
        const nextEvents = eventsRes?.data || eventsRes || [];
        setCitiesData(Array.isArray(nextCities) ? nextCities : []);
        setEventsData(Array.isArray(nextEvents) ? nextEvents : []);
      } catch (err) {
        setCitiesData([]);
        setEventsData([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const renderItem = ({ item, section }) => {
    if (section?.title === "Cities") {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(navigationStrings.CITY_DETAIL, {
              cityData: item,
            })
          }
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

    // event item
    return (
      <View style={styles.row}>
        <OptimizedImage
          source={{ uri: item?.image }}
          style={styles.image}
          placeholder={
            <ImagePlaceholder style={styles.image} text="Loading..." />
          }
        />
        <View style={styles.textContainer}>
          <Text style={styles.city}>{item?.name || item?.title}</Text>
          {!!item?.city_name && (
            <Text style={styles.country}>{item?.city_name}</Text>
          )}
        </View>
      </View>
    );
  };

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

      {/* List */}
      {loading ? (
        <Text style={styles.loading}>Searching...</Text>
      ) : !query.trim() ? null : citiesData.length === 0 &&
        eventsData.length === 0 ? (
        <Text style={styles.empty}>No results</Text>
      ) : (
        <SectionList
          sections={[
            ...(citiesData.length
              ? [{ title: "Cities", data: citiesData }]
              : []),
            ...(eventsData.length
              ? [{ title: "Events", data: eventsData }]
              : []),
          ]}
          keyExtractor={(item, index) => `${item?._id || item?.id || index}`}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
