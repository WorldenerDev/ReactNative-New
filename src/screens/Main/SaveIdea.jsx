import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { getImageUrl } from "@api/apiClient";
import {
  createSavedIdea,
  getTrip,
  previewSavedIdea,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import navigationStrings from "@navigation/navigationStrings";
import { navigateToTripDetails } from "@navigation/helpers/nestedTabNavigation";
import {
  extractHttpsUrl,
  formatTripShareTitle,
  memberCountLabel,
} from "@utils/shareLink";

const NOTE_LIMIT = 150;
const BLUE = "#2F6BFF";

const coverUri = (value) => {
  if (!value) return undefined;
  if (String(value).startsWith("http")) return value;
  return getImageUrl(value);
};

const SaveIdea = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const sharedText = route?.params?.url || "";
  const fromShare = Boolean(route?.params?.fromShare);
  const url = useMemo(() => extractHttpsUrl(sharedText), [sharedText]);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(Boolean(url));
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [selectedId, setSelectedId] = useState(route?.params?.selectedTripId || null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (!url) {
      setPreviewing(false);
      return;
    }
    let cancelled = false;
    previewSavedIdea(url)
      .then((res) => {
        if (!cancelled && res?.success) setPreview(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setPreview({
            url,
            title: url,
            host: "",
            description: "",
            metadata_status: "fallback",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    getTrip()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.trips || [];
        setTrips(list);
        setSelectedId((current) => {
          if (current && list.some((trip) => trip._id === current || trip.canonicalTripId === current)) {
            return current;
          }
          return list[0]?._id || null;
        });
      })
      .catch((error) => showToast("error", error?.message || "Could not load trips"))
      .finally(() => {
        if (!cancelled) setLoadingTrips(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const leave = () => {
    if (fromShare) {
      BackHandler.exitApp();
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
  };

  const selectedTrip = trips.find(
    (trip) => trip._id === selectedId || trip.canonicalTripId === selectedId
  );

  const onSave = async () => {
    if (!url || !selectedTrip || saving) return;
    try {
      setSaving(true);
      const res = await createSavedIdea({
        url,
        trip_id: selectedTrip._id,
        note,
      });
      if (!res?.success) {
        showToast("error", res?.message || "Could not save this link");
        return;
      }
      setSaved({
        tripId: res.data?.canonical_trip_id || selectedTrip.canonicalTripId || selectedTrip._id,
        tripName: res.data?.trip_name || selectedTrip.name || "your trip",
      });
    } catch (error) {
      showToast("error", error?.message || "Could not save this link");
    } finally {
      setSaving(false);
    }
  };

  const viewInApp = () => {
    setSaved(null);
    navigateToTripDetails(navigation, {
      tripId: saved.tripId,
      initialTab: "Wishlist",
    });
  };

  const title = preview?.title || url;
  const host = preview?.host || "";
  const image = coverUri(preview?.image);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={leave} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Save to Worldener</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!url ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No link found</Text>
          <Text style={styles.emptyBody}>
            Share an HTTPS link from Instagram, TikTok, Google Maps, Booking, or Safari.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.preview}>
            {image ? (
              <OptimizedImage source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={[styles.previewImage, styles.previewFallback]} />
            )}
            {previewing ? <ActivityIndicator style={styles.previewSpinner} color={BLUE} /> : null}
            <Text style={styles.previewTitle}>{title}</Text>
            {host ? <Text style={styles.previewHost}>{host}</Text> : null}
            {preview?.description ? (
              <Text style={styles.previewBody}>{preview.description}</Text>
            ) : null}
          </View>

          <Text style={styles.section}>Save to trip</Text>
          {loadingTrips ? (
            <ActivityIndicator color={BLUE} />
          ) : trips.length === 0 ? (
            <Text style={styles.emptyBody}>Create a trip to save this link.</Text>
          ) : (
            trips.map((trip) => {
              const selected = trip._id === selectedTrip?._id;
              const tripImage = coverUri(trip.image || trip.city?.image);
              return (
                <TouchableOpacity
                  key={trip._id}
                  style={[styles.tripRow, selected && styles.tripRowSelected]}
                  onPress={() => setSelectedId(trip._id)}
                >
                  {tripImage ? (
                    <OptimizedImage source={{ uri: tripImage }} style={styles.tripImage} />
                  ) : (
                    <View style={[styles.tripImage, styles.previewFallback]} />
                  )}
                  <View style={styles.tripCopy}>
                    <Text style={styles.tripName}>{formatTripShareTitle(trip)}</Text>
                    <Text style={styles.tripMeta}>{memberCountLabel(trip.memberCount)}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={styles.createTrip}
            onPress={() =>
              navigation.navigate(navigationStrings.CREATE_TRIP, {
                pendingShareUrl: url,
              })
            }
          >
            <Text style={styles.createTripText}>+ Create a new trip</Text>
          </TouchableOpacity>

          <Text style={styles.section}>Add a note (optional)</Text>
          <TextInput
            style={styles.note}
            placeholder="e.g. We should definitely do this!"
            placeholderTextColor={colors.lightText}
            value={note}
            onChangeText={(value) => setNote(value.slice(0, NOTE_LIMIT))}
            multiline
            maxLength={NOTE_LIMIT}
          />
          <Text style={styles.count}>
            {note.length}/{NOTE_LIMIT}
          </Text>
        </ScrollView>
      )}

      {url ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={[styles.saveButton, (!selectedTrip || saving) && styles.saveButtonDisabled]}
            disabled={!selectedTrip || saving}
            onPress={onSave}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveLabel}>Save idea</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={Boolean(saved)} transparent animationType="fade" onRequestClose={leave}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.check}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Saved to {saved?.tripName}</Text>
            <Text style={styles.modalBody}>
              Your crew can now react to it in the Wishlist.
            </Text>
            <TouchableOpacity style={styles.viewButton} onPress={viewInApp}>
              <Text style={styles.saveLabel}>View in Worldener</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={leave}>
              <Text style={styles.dismiss}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SaveIdea;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(12),
  },
  cancel: {
    fontFamily: fonts.RobotoMedium,
    color: BLUE,
    fontSize: getHeight(16),
    width: getWidth(70),
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.RobotoMedium,
    fontSize: getHeight(17),
    color: colors.black,
  },
  headerSpacer: { width: getWidth(70) },
  content: { padding: getWidth(16), paddingBottom: getHeight(24) },
  preview: { marginBottom: getHeight(18) },
  previewImage: {
    width: "100%",
    height: getHeight(180),
    borderRadius: getRadius(16),
    backgroundColor: colors.border,
  },
  previewFallback: { backgroundColor: "#E8EEF5" },
  previewSpinner: { marginTop: getHeight(12) },
  previewTitle: {
    marginTop: getHeight(12),
    fontFamily: fonts.RobotoBold,
    fontSize: getHeight(22),
    color: colors.black,
  },
  previewHost: {
    marginTop: getHeight(4),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  previewBody: {
    marginTop: getHeight(8),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    lineHeight: getHeight(20),
  },
  section: {
    marginTop: getHeight(8),
    marginBottom: getHeight(8),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getRadius(14),
    padding: getWidth(10),
    marginBottom: getHeight(8),
  },
  tripRowSelected: {
    borderColor: BLUE,
    backgroundColor: "#F3F7FF",
  },
  tripImage: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getRadius(10),
  },
  tripCopy: { flex: 1, marginLeft: getWidth(10) },
  tripName: { fontFamily: fonts.RobotoMedium, color: colors.black },
  tripMeta: { fontFamily: fonts.RobotoRegular, color: colors.lightText, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: BLUE, backgroundColor: BLUE },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  createTrip: { paddingVertical: getHeight(10) },
  createTripText: { fontFamily: fonts.RobotoMedium, color: colors.black },
  note: {
    minHeight: getHeight(72),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getRadius(12),
    padding: getWidth(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    textAlignVertical: "top",
  },
  count: {
    alignSelf: "flex-end",
    marginTop: 4,
    color: colors.lightText,
    fontFamily: fonts.RobotoRegular,
  },
  footer: { paddingHorizontal: getWidth(16), paddingTop: getHeight(8) },
  saveButton: {
    backgroundColor: BLUE,
    borderRadius: getRadius(28),
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeight(52),
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveLabel: { color: colors.white, fontFamily: fonts.RobotoMedium, fontSize: getHeight(16) },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: getWidth(24) },
  emptyTitle: { fontFamily: fonts.RobotoBold, fontSize: getHeight(18), color: colors.black },
  emptyBody: {
    marginTop: getHeight(8),
    textAlign: "center",
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: getWidth(24),
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: getRadius(20),
    padding: getWidth(24),
    alignItems: "center",
  },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeight(16),
  },
  checkMark: { color: colors.white, fontSize: 32, fontFamily: fonts.RobotoBold },
  modalTitle: {
    fontFamily: fonts.RobotoBold,
    fontSize: getHeight(22),
    color: colors.black,
    textAlign: "center",
  },
  modalBody: {
    marginTop: getHeight(8),
    marginBottom: getHeight(16),
    textAlign: "center",
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  viewButton: {
    alignSelf: "stretch",
    backgroundColor: BLUE,
    borderRadius: getRadius(24),
    minHeight: getHeight(48),
    alignItems: "center",
    justifyContent: "center",
  },
  dismiss: {
    marginTop: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: BLUE,
  },
});
