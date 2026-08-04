import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import {
  fetchCrewDetails,
  fetchTripCompare,
} from "@api/services/crewGroupsService";
import { getImageUrl } from "@api/apiClient";
import { useSelector } from "react-redux";

const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const normalizeUserId = (id) => (id == null ? "" : String(id));

const buildOtherMembers = (groupData, currentUserId) => {
  if (!groupData || !currentUserId) return [];

  const members = [];
  const seen = new Set();

  const pushMember = (raw) => {
    if (!raw) return;
    const id = normalizeUserId(raw._id || raw.id);
    if (!id || id === currentUserId || seen.has(id)) return;
    seen.add(id);
    members.push({
      id,
      name: raw.name || "Unknown",
      avatar: getImageUrl(raw.image || raw.avatar || "") || DUMMY_USER_IMAGE,
    });
  };

  pushMember(groupData.createdBy);
  (groupData.addedUsers || []).forEach(pushMember);

  return members;
};

const TripCompareTab = ({ groupId, tripId }) => {
  const user = useSelector((state) => state.auth?.user);
  const currentUserId = normalizeUserId(user?._id || user?.id);

  const [membersLoading, setMembersLoading] = useState(true);
  const [otherMembers, setOtherMembers] = useState([]);
  const [compareUser, setCompareUser] = useState(null);
  const [data, setData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const currentUserName = useMemo(
    () => user?.name || "You",
    [user?.name]
  );

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      if (!groupId) {
        setOtherMembers([]);
        setMembersLoading(false);
        return;
      }

      try {
        setMembersLoading(true);
        const res = await fetchCrewDetails(groupId);
        if (cancelled) return;
        const roster = res?.data || res;
        setOtherMembers(buildOtherMembers(roster, currentUserId));
      } catch {
        if (!cancelled) setOtherMembers([]);
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [groupId, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    const loadComparison = async () => {
      if (!compareUser || !groupId || !tripId || !currentUserId) {
        setData(null);
        return;
      }

      const compareUserId = normalizeUserId(compareUser.id);
      if (!compareUserId || compareUserId === currentUserId) {
        setData(null);
        return;
      }

      try {
        setComparisonLoading(true);
        const res = await fetchTripCompare({
          groupId,
          tripId,
          userId1: currentUserId,
          userId2: compareUserId,
        });
        if (cancelled) return;
        if (res?.success) setData(res.data);
        else setData(null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setComparisonLoading(false);
      }
    };

    loadComparison();
    return () => {
      cancelled = true;
    };
  }, [compareUser, groupId, tripId, currentUserId]);

  const handleBackToPicker = useCallback(() => {
    setCompareUser(null);
    setData(null);
  }, []);

  const renderActivity = (item, index) => (
    <View
      style={styles.activityRow}
      key={item._id || item.id || `activity-${index}`}
    >
      <OptimizedImage source={{ uri: item.image }} style={styles.thumb} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityMeta}>
          {item.date} · ${item.price}
        </Text>
      </View>
    </View>
  );

  if (membersLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (otherMembers.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>
          No other members to compare with yet
        </Text>
      </View>
    );
  }

  if (!compareUser) {
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.youLabel}>{currentUserName} (You)</Text>
        <Text style={styles.vsHeading}>V/S</Text>
        <Text style={styles.compareHint}>
          Select a user you want to compare your itinerary with.
        </Text>
        <FlatList
          data={otherMembers}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pickerList}
          renderItem={({ item }) => (
            <View style={styles.compareRow}>
              <View style={styles.compareUserLeft}>
                <OptimizedImage
                  source={{ uri: item.avatar || DUMMY_USER_IMAGE }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <Text style={styles.memberName}>{item.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.comparePill}
                activeOpacity={0.8}
                onPress={() => setCompareUser(item)}
              >
                <Text style={styles.comparePillText}>Compare</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }

  if (comparisonLoading) {
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
        <TouchableOpacity onPress={handleBackToPicker} style={styles.backLink}>
          <Text style={styles.backLinkText}>Choose another member</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackToPicker} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Compare someone else</Text>
        </TouchableOpacity>

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
  pickerContainer: {
    flex: 1,
    paddingHorizontal: getWidth(16),
    paddingTop: getHeight(8),
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
    textAlign: "center",
  },
  youLabel: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginTop: getHeight(8),
  },
  vsHeading: {
    fontSize: getHeight(28),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
    marginTop: getHeight(12),
    marginBottom: getHeight(8),
  },
  compareHint: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(16),
  },
  pickerList: {
    paddingBottom: getHeight(40),
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getHeight(12),
  },
  compareUserLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: getWidth(12),
  },
  avatar: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getWidth(20),
    marginRight: getWidth(10),
    backgroundColor: colors.input,
  },
  memberName: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    flexShrink: 1,
  },
  comparePill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(14),
    paddingVertical: getHeight(8),
    borderRadius: getRadius(20),
  },
  comparePillText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  backLink: {
    marginBottom: getHeight(12),
  },
  backLinkText: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    textDecorationLine: "underline",
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
