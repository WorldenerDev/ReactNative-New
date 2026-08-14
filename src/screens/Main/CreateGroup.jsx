import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getWidth } from "@utils/responsive";
import { showToast } from "@components/AppToast";
import { createCrew } from "@api/services/crewGroupsService";
import { resetToGroupDetails } from "@navigation/helpers/nestedTabNavigation";

const CreateGroup = ({ navigation }) => {
  useGuestScreenGuard();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const name = groupName.trim();
    if (!name) {
      showToast("error", "Please enter a crew name");
      return;
    }

    try {
      setLoading(true);
      const response = await createCrew({ groupName: name });
      const groupId =
        response?.data?._id ||
        response?.data?.id ||
        response?.data?.group?._id;
      if (response?.success && groupId) {
        showToast("success", "Crew created!");
        resetToGroupDetails(navigation, { groupId });
      } else {
        showToast("error", response?.message || "Failed to create crew");
      }
    } catch (error) {
      showToast("error", error?.message || "Failed to create crew");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer loader={loading}>
      <Header />
      <StepTitle
        title="Create your crew"
        subtitle="Name your crew and invite friends to plan trips together."
      />

      <View style={styles.section}>
        <Text style={styles.label}>Crew name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Weekend Crew"
          placeholderTextColor={colors.lightText}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
      </View>

      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoText}>Add photo (optional)</Text>
      </View>

      <TouchableOpacity style={styles.inviteHint} activeOpacity={0.7}>
        <Text style={styles.inviteText}>Invite members after creating →</Text>
      </TouchableOpacity>

      <ButtonComp
        title="Create Crew"
        onPress={handleCreate}
        disabled={loading}
        containerStyle={styles.createButton}
      />
    </MainContainer>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  section: {
    marginBottom: getHeight(24),
  },
  label: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  input: {
    backgroundColor: "#D6ECF6",
    borderRadius: 10,
    paddingVertical: getHeight(14),
    paddingHorizontal: getWidth(12),
    fontSize: getHeight(16),
    color: colors.black,
    fontFamily: fonts.RobotoRegular,
  },
  photoPlaceholder: {
    height: getHeight(120),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeight(24),
  },
  photoText: {
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    fontSize: getHeight(14),
  },
  inviteHint: {
    marginBottom: getHeight(32),
  },
  inviteText: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  createButton: {
    width: "100%",
    backgroundColor: colors.black,
  },
});
