import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useMemo, useEffect, useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import OptimizedImage from "@components/OptimizedImage";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { getCartList, cartCheckout, removeItemFromCart } from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import navigationStrings from "@navigation/navigationStrings";
import {
  getHeight,
  getWidth,
  getRadius,
  getFontSize,
  getVertiPadding,
} from "@utils/responsive";
import { formattedDate, isoDurationToHours } from "@utils/uiUtils";

const Cart = ({ navigation }) => {
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch cart list from API
  const fetchCartList = async () => {
    try {
      setLoading(true);
      const response = await getCartList();
      console.log("Cart list response:", response);
      setCartList(response?.data?.carts || []);
    } catch (error) {
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle cart checkout
  const handleCheckout = async () => {
    if (cartList.length === 0) {
      showToast("error", "Cart is empty");
      return;
    }

    try {
      setLoading(true);
      const tripIds = cartList
        .map((item) => item._id || item.id)
        .filter(Boolean);
      if (tripIds.length === 0) {
        showToast("error", "No valid trip IDs found");
        return;
      }
      console.log("tripIds", tripIds);
      const response = await cartCheckout({ trip_ids: tripIds });
      console.log("Checkout response:", response);
      showToast("success", "Checkout successful!");
      navigation.navigate(navigationStrings.CART_CUSTOMER_INFO, {
        cart_id: response?.data?.cart_id,
        trip_id: tripIds[0], // Pass the first trip_id from the array
      });
    } catch (error) {
      showToast("error", error?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle remove item from cart
  const handleRemoveItem = async (item) => {
    try {
      setLoading(true);
      const tripId = item._id || item.id;
      if (!tripId) {
        showToast("error", "Invalid item ID");
        return;
      }
      const response = await removeItemFromCart({ trip_id: tripId });
      await fetchCartList();
    } catch (error) {
      showToast("error", error?.message || "Failed to remove item from cart");
    } finally {
      setLoading(false);
    }
  };

  // Call API when component mounts
  useEffect(() => {
    fetchCartList();
  }, []);

  // Function to format tickets display like "1x Adult (12+), 1x Child (4-12)"
  const formatTicketsDisplay = (activities) => {
    if (!activities || activities.length === 0) return "";

    return activities
      .map((activity) => {
        const quantity = activity?.quantity || 0;
        const productName = activity?.product_name || "";
        return `${quantity}x ${productName}`;
      })
      .join(", ");
  };

  const renderItem = ({ item }) => {
    const firstActivity = item?.activities?.[0];
    const ticketsDisplay = formatTicketsDisplay(item?.activities);
    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <OptimizedImage
            source={{
              uri: item?.event?.image,
            }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.infoWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item?.event?.name}
            </Text>
            <Text style={styles.cityText} numberOfLines={1}>
              {item?.city?.name}, {item?.city?.country_name}
            </Text>
          </View>
        </View>

        <View style={styles.detailsWrap}>
          {!!item?.start_at && (
            <Text style={styles.meta}>{`Date: ${formattedDate(
              item?.start_at
            )}`}</Text>
          )}

          {!!ticketsDisplay && (
            <Text style={styles.meta}>{`Tickets: ${ticketsDisplay}`}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.perksRow}>
          {item?.free_cancellation && (
            <View style={styles.perkItem}>
              <Image source={imagePath.CHECK_ICON} style={styles.perkIcon} />
              <Text style={styles.perkText}>Free Cancellation</Text>
            </View>
          )}
          {item?.duration && (
            <View style={styles.perkItem}>
              <Image source={imagePath.DURATION_ICON} style={styles.perkIcon} />
              <Text style={styles.perkText}>
                {" "}
                Duration: {isoDurationToHours(item?.duration || 0)} hours
              </Text>
            </View>
          )}
          {item?.instant_confirmation && (
            <View style={styles.perkItem}>
              <Image source={imagePath.INSTANT_ICON} style={styles.perkIcon} />
              <Text style={styles.perkText}>Instant Confirmation</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                const eventData = {
                  activityUuid: item?.event_id,
                  cityId: item?.city?.city_id,
                  activityName: item?.event?.name,
                  instant_confirmation: item?.instant_confirmation,
                  free_cancellation: item?.free_cancellation,
                  duration: item?.duration,
                  pickupPointId: item?.pickup_point_id,
                  selectedDate: item?.activities?.[0]?.date
                };

                navigation.navigate(navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY, {
                  eventData,
                  from: "cart",
                });
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveItem(item)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.priceText}>{`$${Number(item?.totalPrice).toFixed(
            2
          )}`}</Text>
        </View>
      </View>
    );
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Cart" />
      <FlatList
        data={cartList}
        keyExtractor={(item, index) => `${item?.id || item?._id || index}`}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No items in cart</Text>
          </View>
        }
      />
      <View style={styles.floatingButtonContainer}>
        <ButtonComp
          title="Next"
          disabled={loading || cartList.length === 0}
          onPress={handleCheckout}
          loading={loading}
        />
      </View>
    </MainContainer>
  );
};

export default Cart;

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: getVertiPadding(20),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: getRadius(8),
    marginTop: getVertiPadding(12),
    padding: getVertiPadding(12),
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: {
    flexDirection: "row",
  },
  thumb: {
    width: getWidth(70),
    height: getWidth(70),
    borderRadius: getRadius(6),
    marginRight: getWidth(12),
  },
  infoWrap: {
    flex: 1,
    justifyContent: "center",
  },
  detailsWrap: {
    marginTop: getVertiPadding(10),
  },
  title: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(4),
    lineHeight: getFontSize(20),
  },
  cityText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: 0,
    lineHeight: getFontSize(16),
  },
  meta: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    marginBottom: getVertiPadding(4),
    lineHeight: getFontSize(16),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: getVertiPadding(12),
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: getWidth(12),
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  perkIcon: {
    width: getWidth(16),
    height: getWidth(16),
    marginRight: getWidth(6),
    tintColor: colors.green,
    resizeMode: "contain",
  },
  perkText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: getVertiPadding(14),
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(12),
  },
  editBtn: {
    backgroundColor: colors.input,
    borderRadius: getRadius(24),
    paddingVertical: getVertiPadding(8),
    paddingHorizontal: getWidth(16),
  },
  editText: {
    fontSize: getFontSize(14),
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: getRadius(24),
    paddingVertical: getVertiPadding(8),
    paddingHorizontal: getWidth(16),
  },
  removeText: {
    fontSize: getFontSize(14),
    color: colors.red,
    fontFamily: fonts.RobotoMedium,
  },
  priceText: {
    fontSize: getFontSize(22),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  emptyWrap: {
    paddingVertical: getVertiPadding(80),
    alignItems: "center",
  },
  emptyText: {
    fontSize: getFontSize(16),
    color: colors.lightText,
    fontFamily: fonts.RobotoMedium,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: getHeight(20),
    paddingHorizontal: getWidth(20),
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
