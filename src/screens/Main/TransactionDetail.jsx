import colors from "@assets/colors";
import fonts from "@assets/fonts";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { formatDateRange, formatDisplayDate } from "@utils/formatDate";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
      return { backgroundColor: "#d4edda", color: colors.green };
    case "Pending":
      return { backgroundColor: "#fff3cd", color: "#856404" };
    case "Failed":
      return { backgroundColor: "#f8d7da", color: colors.red };
    case "Refunded":
      return { backgroundColor: "#d1ecf1", color: colors.teal };
    default:
      return { backgroundColor: colors.border, color: colors.lightText };
  }
};

const formatTransactionDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const datePart = formatDisplayDate(dateString);
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} at ${timePart}`;
};

const DetailRow = ({ label, value }) => {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
};

const TransactionDetail = ({ route }) => {
  const bottomInset = useStickyBottomInset();
  const transaction = route?.params?.transaction || {};
  const statusStyle = getStatusStyle(transaction?.paymentStatus);

  const tripName = transaction?.tripDetail?.tripName?.trim();
  const destinationCity = transaction?.tripDetail?.destinationCity?.trim();
  const tripDates = formatDateRange(
    transaction?.tripDetail?.startDate,
    transaction?.tripDetail?.endDate
  );
  const hasTripSection = Boolean(tripName || destinationCity || tripDates);

  return (
    <MainContainer>
      <Header title="Transaction Detail" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: bottomInset + getHeight(24) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroAmount}>
            {transaction?.amountDisplay || "—"}
          </Text>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.heroBadgeText, { color: statusStyle.color }]}>
              {(transaction?.paymentStatus || "Unknown").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroDate}>
            {formatTransactionDateTime(
              transaction?.transactionDate || transaction?.createdAt
            )}
          </Text>
        </View>

        {hasTripSection ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip</Text>
            <DetailRow label="Trip name" value={tripName} />
            <DetailRow label="Destination" value={destinationCity} />
            <DetailRow label="Dates" value={tripDates} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <DetailRow
            label="Payment method"
            value={transaction?.paymentMethod?.display}
          />
          <DetailRow label="Order reference" value={transaction?.orderUuid} />
          <DetailRow
            label="Transaction ID"
            value={transaction?.transactionId}
          />
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default TransactionDetail;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(24),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroAmount: {
    fontSize: getFontSize(28),
    fontFamily: fonts.RobotoBold,
    fontWeight: "700",
    color: colors.black,
  },
  heroBadge: {
    marginTop: getVertiPadding(8),
    borderRadius: 999,
    paddingHorizontal: getHoriPadding(10),
    paddingVertical: getVertiPadding(4),
  },
  heroBadgeText: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  heroDate: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(8),
  },
  section: {
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    color: colors.lightText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: getVertiPadding(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: getVertiPadding(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: getHoriPadding(12),
  },
  rowLabel: {
    flex: 1,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  rowValue: {
    flex: 1,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "500",
    color: colors.black,
    textAlign: "right",
  },
});
