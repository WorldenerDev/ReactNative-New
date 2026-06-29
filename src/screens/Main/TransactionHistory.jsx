import { getTransactions } from "@api/services/mainServices";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { showToast } from "@components/AppToast";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import navigationStrings from "@navigation/navigationStrings";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { formatDisplayDate } from "@utils/formatDate";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_LIMIT = 10;

const getTransactionTitle = (tx) =>
  tx?.tripDetail?.tripName?.trim() ||
  tx?.description?.trim() ||
  "Payment";

const getTransactionSubtitle = (tx) => {
  const city = tx?.tripDetail?.destinationCity?.trim();
  if (city) return city;
  const orderUuid = tx?.orderUuid?.trim();
  if (orderUuid) return `Order #${orderUuid}`;
  return "";
};

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

const TransactionHistory = ({ navigation }) => {
  const bottomInset = useStickyBottomInset();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const fetchTransactions = useCallback(async (page = 1, append = false) => {
    if (append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else if (page === 1 && !append) {
      setLoading(true);
    }

    try {
      const response = await getTransactions({ page, limit: PAGE_LIMIT });
      const data = response?.data;
      const nextTransactions = data?.transactions || [];
      const nextPagination = data?.pagination || null;

      setTransactions((prev) =>
        append ? [...prev, ...nextTransactions] : nextTransactions
      );
      setPagination(nextPagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (!append) {
        setTransactions([]);
        setPagination(null);
      }
      showToast("error", error?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions(1, false);
  };

  const handleLoadMore = () => {
    if (
      loading ||
      refreshing ||
      loadingMore ||
      !pagination ||
      pagination.page >= pagination.totalPages
    ) {
      return;
    }
    fetchTransactions(pagination.page + 1, true);
  };

  const handlePressTransaction = (transaction) => {
    navigation.navigate(navigationStrings.TRANSACTION_DETAIL, { transaction });
  };

  const renderTransactionCard = ({ item }) => {
    const statusStyle = getStatusStyle(item?.paymentStatus);
    const subtitle = getTransactionSubtitle(item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => handlePressTransaction(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {getTransactionTitle(item)}
            </Text>
            {subtitle ? (
              <Text style={styles.cardSub} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Text style={styles.amount}>{item?.amountDisplay || "—"}</Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.date}>
            {formatDisplayDate(item?.transactionDate || item?.createdAt)}
          </Text>
          <View
            style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}
          >
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>
              {item?.paymentStatus || "Unknown"}
            </Text>
          </View>
        </View>

        <Text style={styles.payment}>
          {item?.paymentMethod?.display || "—"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptyText}>
          Your payment history will appear here after you complete a booking.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.lightText} />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    );
  };

  return (
    <MainContainer loader={loading && !refreshing && transactions.length === 0}>
      <Header title="Transaction History" />

      <View style={styles.screen}>
        {pagination?.total > 0 ? (
          <Text style={styles.summary}>
            {pagination.total} transaction{pagination.total === 1 ? "" : "s"}
          </Text>
        ) : null}

        <FlatList
          data={transactions}
          keyExtractor={(item, index) =>
            item?.transactionId || `transaction-${index}`
          }
          renderItem={renderTransactionCard}
          contentContainerStyle={{
            paddingBottom: bottomInset + getHeight(24),
            flexGrow: transactions.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.lightText}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </MainContainer>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(16),
  },
  summary: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getVertiPadding(16),
  },
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getHeight(14),
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: getHoriPadding(12),
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    color: colors.black,
  },
  cardSub: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(4),
  },
  amount: {
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
    fontWeight: "700",
    color: colors.black,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: getVertiPadding(10),
  },
  date: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: getHoriPadding(8),
    paddingVertical: getVertiPadding(3),
  },
  badgeText: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  payment: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(8),
  },
  separator: {
    height: getHeight(12),
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(24),
    paddingVertical: getVertiPadding(48),
  },
  emptyTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  emptyText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    lineHeight: getFontSize(20),
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: getHoriPadding(8),
    paddingVertical: getVertiPadding(16),
  },
  footerText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
});
