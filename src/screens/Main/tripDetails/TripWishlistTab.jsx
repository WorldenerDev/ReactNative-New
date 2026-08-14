import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { fetchTripWishlist } from "@api/services/crewGroupsService";
import { getImageUrl } from "@api/apiClient";
import navigationStrings from "@navigation/navigationStrings";

/** Presentational wishlist grid — no nested FlatList (parent scrolls). */
const TripWishlistTab = ({
  canonicalTripId,
  groupId,
  cityId,
  selectedTrip,
  personal = false,
}) => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        if (!canonicalTripId && !cityId) {
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const res = await fetchTripWishlist(canonicalTripId, groupId, cityId);
          if (!cancelled && res?.success) {
            setItems(res.data?.wishlisted_items || []);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [canonicalTripId, groupId, cityId])
  );

  const openActivity = (item) => {
    const activityId = item?.activity_id || item?.id;
    if (!activityId) return;

    const image = item?.image;
    const processedImage =
      image && String(image).startsWith("/")
        ? getImageUrl(image)
        : image || undefined;

    navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
      eventData: {
        ...item,
        id: activityId,
        activity_id: activityId,
        name: item?.name || "Activity",
        image: processedImage,
        isLiked: item?.is_liked_by_current_user || false,
      },
      selectedTrip: selectedTrip || null,
    });
  };

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

  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.list}>
      {rows.map((pair, rowIndex) => (
        <View style={styles.row} key={`wishlist-row-${rowIndex}`}>
          {pair.map((item) => {
            const image = item?.image;
            const processedImage =
              image && String(image).startsWith("/")
                ? getImageUrl(image)
                : image || undefined;

            return (
              <TouchableOpacity
                style={styles.card}
                key={String(item.activity_id || item.id)}
                activeOpacity={0.8}
                onPress={() => openActivity(item)}
                accessibilityRole="button"
                accessibilityLabel={item?.name || "Open activity"}
              >
                <OptimizedImage
                  source={{ uri: processedImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                {!personal ? (
                  <Text style={styles.likes}>
                    {item.like_count} liked
                    {item.liked_by_members?.length
                      ? ` · ${item.liked_by_members.map((m) => m.name).join(", ")}`
                      : ""}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
          {pair.length === 1 ? <View style={styles.cardSpacer} /> : null}
        </View>
      ))}
    </View>
  );
};

export default TripWishlistTab;

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: getWidth(24),
    minHeight: getHeight(160),
  },
  empty: {
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  list: {
    padding: getWidth(12),
  },
  row: {
    flexDirection: "row",
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
  cardSpacer: {
    width: "48%",
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
