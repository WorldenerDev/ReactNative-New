import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHeight,
  getRadius,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
];

const PhoneInput = ({
  label = "",
  placeholder = "",
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  containerStyle = {},
  inputStyle = {},
  ...rest
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find((c) => c.code === countryCode) || countryCodes[0]
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    onCountryCodeChange?.(country.code);
    setIsModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        <TouchableOpacity
          style={styles.countryCodeButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholderText}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          {...rest}
        />
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={countryCodes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.country}</Text>
                  <Text style={styles.countryCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PhoneInput;

const styles = StyleSheet.create({
  container: {
    paddingVertical: getVertiPadding(15),
  },
  label: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
    marginBottom: getVertiPadding(6),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: getHeight(52),
  },
  countryCodeButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getRadius(8),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(8),
    marginRight: getHoriPadding(8),
    minWidth: getWidth(80),
    height: getHeight(36),
  },
  flagText: {
    fontSize: getFontSize(20),
    marginRight: getHoriPadding(4),
  },
  countryCodeText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
  },
  separator: {
    width: getWidth(1),
    height: getHeight(24),
    backgroundColor: colors.border,
    marginHorizontal: getHoriPadding(12),
  },
  input: {
    flex: 1,
    backgroundColor: colors.input,
    borderRadius: getRadius(8),
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(8),
    fontSize: getFontSize(14),
    color: colors.bodyText,
    fontFamily: fonts.RobotoRegular,
    height: getHeight(36),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: getRadius(20),
    borderTopRightRadius: getRadius(20),
    maxHeight: getHeight(400),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: getHoriPadding(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.darkText,
  },
  closeButton: {
    padding: getHoriPadding(8),
  },
  closeButtonText: {
    fontSize: getFontSize(20),
    color: colors.placeholderText,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: getHoriPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryFlag: {
    fontSize: getFontSize(24),
    marginRight: getHoriPadding(12),
  },
  countryName: {
    flex: 1,
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
  },
  countryCode: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.secondary,
  },
});
