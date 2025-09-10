import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { getEventBrowserByCategory } from "@api/services/mainServices";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BrouseByCategory = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const dateRange = useMemo(() => {
    const availableFrom = new Date();
    const availableTo = new Date();
    availableTo.setFullYear(availableTo.getFullYear() + 1);
    return {
      availableFrom: formatDate(availableFrom),
      availableTo: formatDate(availableTo),
    };
  }, []);

  const fetchData = useCallback(
    async (query) => {
      try {
        setLoading(true);
        const params = {
          availableFrom: dateRange.availableFrom,
          availableTo: dateRange.availableTo,
          categoryIn: "new-activities",
          limit: 100,
          sortBy: "rating",
          offset: 0,
          search: query || undefined,
        };
        const resp = await getEventBrowserByCategory(params);
        // API client returns response.data directly per interceptor
        const list = Array.isArray(resp?.data)
          ? resp?.data
          : resp?.items || resp || [];
        setResults(list);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [dateRange]
  );

  // initial load
  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      fetchData(search?.trim());
    }, 400);
    return () => clearTimeout(id);
  }, [search, fetchData]);

  return (
    <MainContainer loader={loading}>
      <Header title="Cruise Activities" />
      <View style={styles.container}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search activities and experiences"
          placeholderTextColor={colors.lightText}
          style={styles.searchInput}
          returnKeyType="search"
        />
        <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
      </View>
      <FlatList
        data={results}
        renderItem={({ item }) => <ForYouCard item={item} />}
        keyExtractor={(item, index) => String(item?.id ?? item?._id ?? index)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.lightText, textAlign: "center" }}>
              No activities found
            </Text>
          ) : null
        }
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
