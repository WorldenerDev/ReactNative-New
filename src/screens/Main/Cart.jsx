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
import { getCartList, cartCheckout } from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import {
  getHeight,
  getWidth,
  getRadius,
  getFontSize,
  getVertiPadding,
} from "@utils/responsive";
import { formattedDate } from "@utils/uiUtils";

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

      const response = await cartCheckout({ trip_ids: tripIds });
      console.log("Checkout response:", response);

      showToast("success", "Checkout successful!");
    } catch (error) {
      showToast("error", error?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Call API when component mounts
  useEffect(() => {
    fetchCartList();
  }, []);

  const renderItem = ({ item }) => {
    const firstActivity = item?.activities?.[0];

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <OptimizedImage
            source={{
              uri: firstActivity?.image || item?.city?.image,
            }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.infoWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {firstActivity?.name || item?.city?.name || "Activity"}
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
          {!!(item?.option || item?.option_name || item?.option_text) && (
            <Text style={styles.meta}>{`Options: ${
              item?.option || item?.option_name || item?.option_text
            }`}</Text>
          )}
          {!!firstActivity?.product_name && (
            <Text
              style={styles.meta}
            >{`Ticket Type: ${firstActivity?.product_name}`}</Text>
          )}
          {!!firstActivity?.quantity && (
            <Text
              style={styles.meta}
            >{`Quantity: ${firstActivity?.quantity}`}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.perksRow}>
          <View style={styles.perkItem}>
            <Image source={imagePath.CHECK_ICON} style={styles.perkIcon} />
            <Text style={styles.perkText}>Free Cancellation</Text>
          </View>
          <View style={styles.perkItem}>
            <Image source={imagePath.DURATION_ICON} style={styles.perkIcon} />
            <Text style={styles.perkText}>Duration: 1.5 hours</Text>
          </View>
          <View style={styles.perkItem}>
            <Image source={imagePath.INSTANT_ICON} style={styles.perkIcon} />
            <Text style={styles.perkText}>Instant Confirmation</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => {}}>
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
    <MainContainer loading={loading}>
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
