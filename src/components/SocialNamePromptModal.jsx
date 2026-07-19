import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import CustomInput from "@components/CustomInput";
import ButtonComp from "@components/ButtonComp";
import {
  getFontSize,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import { validateLetter } from "@utils/validators";

const SocialNamePromptModal = ({
  visible,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setName("");
      setError("");
    }
  }, [visible]);

  const handleContinue = () => {
    const validationError = validateLetter(name.trim(), "Name", 2);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onSubmit?.(name.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={loading ? undefined : onCancel}
          disabled={loading}
        />
        <View style={styles.card}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>
            We couldn't get your name from your social account. Please enter it
            to continue.
          </Text>

          <CustomInput
            variant="bordered"
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError("");
            }}
            error={error}
            autoFocus
            editable={!loading}
            containerStyle={styles.input}
          />

          <ButtonComp
            title={loading ? "Saving..." : "Continue"}
            disabled={loading || !name.trim()}
            onPress={handleContinue}
            containerStyle={styles.button}
          />

          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.spinner}
            />
          ) : (
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SocialNamePromptModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(24),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: getRadius(16),
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(24),
    zIndex: 1,
  },
  title: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  subtitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    lineHeight: getFontSize(20),
    marginBottom: getVertiPadding(20),
  },
  input: {
    marginBottom: getVertiPadding(8),
  },
  button: {
    width: "100%",
    marginTop: getVertiPadding(8),
  },
  cancel: {
    marginTop: getVertiPadding(16),
    textAlign: "center",
    color: colors.lightText,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
  },
  spinner: {
    marginTop: getVertiPadding(16),
  },
});
