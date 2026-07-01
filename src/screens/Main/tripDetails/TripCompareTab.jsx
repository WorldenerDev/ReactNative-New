import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { fetchTripCompare } from "@api/services/crewGroupsService";

const TripCompareTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTripCompare();
        if (res?.success) setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No comparison data</Text>
      </View>
    );
  }

  const renderActivity = (item) => (
    <View style={styles.activityRow} key={item._id}>
      <OptimizedImage source={{ uri: item.image }} style={styles.thumb} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityMeta}>
          {item.date} · ${item.price}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          Common ({data.user1?.name} & {data.user2?.name})
        </Text>
        {(data.common_activities || []).map(renderActivity)}

        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Only {data.user1?.name}
        </Text>
        {(data.uncommon_activities?.added_by_user1 || []).map(renderActivity)}

        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Only {data.user2?.name}
        </Text>
        {(data.uncommon_activities?.added_by_user2 || []).map(renderActivity)}
      </View>
    </ScrollView>
  );
};

export default TripCompareTab;

const styles = StyleSheet.create({
  container: {
    padding: getWidth(16),
  },
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
  sectionTitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  sectionGap: {
    marginTop: getHeight(16),
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(10),
    backgroundColor: colors.white,
    borderRadius: getRadius(10),
    borderWidth: 1,
    borderColor: colors.border,
    padding: getWidth(8),
  },
  thumb: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getRadius(8),
    marginRight: getWidth(10),
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  activityMeta: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getHeight(2),
  },
});
