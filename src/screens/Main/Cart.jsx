import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useMemo } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import OptimizedImage from "@components/OptimizedImage";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import {
  getHeight,
  getWidth,
  getRadius,
  getFontSize,
  getVertiPadding,
} from "@utils/responsive";

// Dummy data matching the image design
const DUMMY_ACTIVITIES = [
  {
    _id: "demo-1",
    title: "Tokyo Tower Visit with all the description that can be added",
    date_text: "28 April, 2026",
    option_text: "Semi-private Tour - 10:30 AM",
    tickets_text: "Tickets: 1x Adult (19-99), 1x Child (7-18), 5x Infant (0-6)",
    total_price: 256,
    image: "https://picsum.photos/seed/tokyo-tower/300/300",
  },
  {
    _id: "demo-2",
    title: "Tokyo Tower Visit with all the description that can be added",
    date_text: "28 April, 2026",
    option_text: "Semi-private Tour - 10:30 AM",
    tickets_text: "Tickets: 1x Adult (19-99), 1x Child (7-18), 5x Infant (0-6)",
    total_price: 256,
    image: "https://picsum.photos/seed/tokyo-2/300/300",
  },
];

const Cart = ({ navigation }) => {
  const activities = DUMMY_ACTIVITIES;

  const renderItem = ({ item }) => {
    const price = item?.total_price || item?.price || item?.retail_price || 0;

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <OptimizedImage
            source={{
              uri:
                item?.image ||
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=60",
            }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.infoWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item?.title || item?.name || item?.product_name || "Activity"}
            </Text>
          </View>
        </View>

        <View style={styles.detailsWrap}>
          {!!(item?.date_text || item?.date || item?.time) && (
            <Text style={styles.meta}>{`Date: ${
              item?.date_text || item?.date || item?.time
            }`}</Text>
          )}
          {!!(item?.option || item?.option_name || item?.option_text) && (
            <Text style={styles.meta}>{`Options: ${
              item?.option || item?.option_name || item?.option_text
            }`}</Text>
          )}
          {!!(item?.tickets_text || item?.tickets) && (
            <Text style={styles.meta}>
              {item?.tickets_text || item?.tickets}
            </Text>
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
          <Text style={styles.priceText}>{`$${Number(price).toFixed(2)}`}</Text>
        </View>
      </View>
    );
  };

  return (
    <MainContainer>
      <Header title="Cart" />
      <FlatList
        data={activities}
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
        <ButtonComp title="Next" disabled={false} onPress={() => {}} />
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
    marginBottom: 0,
    lineHeight: getFontSize(20),
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
