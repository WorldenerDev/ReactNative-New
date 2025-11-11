import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Image,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHeight,
  getRadius,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import imagePath from "@assets/icons";

const CustomDropdown = React.memo(
  ({
    label = "",
    placeholder = "",
    options = [],
    selectedValue,
    onValueChange,
    containerStyle = {},
    dropdownWrapperStyle = {},
    showIcon = true,
    customIcon = null,
    iconStyle = {},
    textStyle = {},
    arrowIconStyle = {},
    onOpen = null,
    disabled = false,
  }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpen = () => {
      // Prevent opening if disabled or no options available
      if (disabled || options.length === 0) {
        return;
      }
      if (onOpen) {
        onOpen();
      }
      setModalVisible(true);
    };

    const onSelect = (item) => {
      onValueChange(item);
      setModalVisible(false);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {!!label && <Text style={styles.label}>{label}</Text>}

        <TouchableOpacity
          style={[
            styles.dropdownWrapper,
            dropdownWrapperStyle,
            (disabled || options.length === 0) && styles.disabledWrapper,
          ]}
          activeOpacity={0.7}
          onPress={handleOpen}
          disabled={disabled || options.length === 0}
        >
          {customIcon && (
            <Image
              source={customIcon}
              style={[styles.customIcon, iconStyle]}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.dropdownText,
              textStyle,
              !selectedValue && { color: colors.placeholderText },
            ]}
          >
            {selectedValue ? selectedValue.label || selectedValue : placeholder}
          </Text>
          {showIcon && (
            <Image
              source={imagePath.ARROW_DOWN_ICON}
              style={[styles.iconImage, arrowIconStyle]}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={styles.optionText}>{item.label || item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
);

export default CustomDropdown;

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
  dropdownWrapper: {
    backgroundColor: colors.input,
    borderRadius: getRadius(100),
    paddingHorizontal: getHoriPadding(16),
    flexDirection: "row",
    alignItems: "center",
    height: getHeight(52),
    justifyContent: "space-between",
    top: getVertiPadding(10),
  },
  dropdownText: {
    fontSize: getFontSize(14),
    color: colors.bodyText,
    fontFamily: fonts.RobotoRegular,
  },
  iconImage: {
    width: getHeight(13),
    height: getHeight(7),
    tintColor: colors.placeholderText,
  },
  customIcon: {
    width: getHeight(16),
    height: getHeight(16),
    tintColor: colors.lightText,
    marginRight: getHoriPadding(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: "50%",
    paddingVertical: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkText,
  },
  disabledWrapper: {
    opacity: 0.5,
  },
});
