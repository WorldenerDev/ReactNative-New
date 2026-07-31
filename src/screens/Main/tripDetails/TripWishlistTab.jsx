import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { fetchTripWishlist } from "@api/services/crewGroupsService";

const TripWishlistTab = ({ canonicalTripId, groupId, cityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!canonicalTripId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchTripWishlist(canonicalTripId, groupId, cityId);
        if (res?.success) {
          setItems(res.data?.wishlisted_items || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canonicalTripId, groupId, cityId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No wishlisted activities yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.activity_id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <OptimizedImage
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.likes}>
            {item.like_count} liked
            {item.liked_by_members?.length
              ? ` · ${item.liked_by_members.map((m) => m.name).join(", ")}`
              : ""}
          </Text>
        </View>
      )}
    />
  );
};

export default TripWishlistTab;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: getWidth(24),
  },
  empty: {
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  list: {
    padding: getWidth(12),
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getHeight(12),
  },
  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: getHeight(100),
  },
  name: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    padding: getWidth(8),
  },
  likes: {
    fontSize: getHeight(10),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    paddingHorizontal: getWidth(8),
    paddingBottom: getHeight(8),
  },
});
