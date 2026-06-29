import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import imagePath from "@assets/icons";

const SHEET_HEADER_HEIGHT = 72;
const SHEET_ITEM_HEIGHT = 56;
const SHEET_HANDLE_HEIGHT = 20;

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
    modalVariant = "default",
    modalTitle = "",
    modalSubtitle = "",
    emptyMessage = "No options available",
  }) => {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);

    const isSheet = modalVariant === "sheet";
    const sheetTitle = modalTitle || label || placeholder || "Select an option";

    const sheetHeight = useMemo(() => {
      const screenHeight = Dimensions.get("window").height;
      const optionCount = Math.max(options.length, 1);
      const calculated =
        SHEET_HANDLE_HEIGHT +
        SHEET_HEADER_HEIGHT +
        optionCount * SHEET_ITEM_HEIGHT +
        insets.bottom;
      const minHeight = screenHeight * 0.28;
      const maxHeight = screenHeight * 0.55;
      return Math.min(Math.max(calculated, minHeight), maxHeight);
    }, [options.length, insets.bottom]);

    const handleOpen = () => {
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

    const isSelected = (item) => {
      if (!selectedValue) return false;
      if (selectedValue.value !== undefined && item.value !== undefined) {
        return selectedValue.value === item.value;
      }
      return selectedValue.label === (item.label || item);
    };

    const renderDefaultModal = () => (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item, index) =>
                item.value?.toString() || index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    isSelected(item) && styles.optionSelected,
                  ]}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected(item) && styles.optionTextSelected,
                    ]}
                  >
                    {item.label || item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );

    const renderSheetModal = () => (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.sheetContainer,
              { height: sheetHeight, paddingBottom: insets.bottom },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>{sheetTitle}</Text>
                {!!modalSubtitle && (
                  <Text style={styles.sheetSubtitle}>{modalSubtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {options.length === 0 ? (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>{emptyMessage}</Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item, index) =>
                  item.value?.toString() || index.toString()
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetListContent}
                renderItem={({ item }) => {
                  const selected = isSelected(item);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.sheetOption,
                        selected && styles.sheetOptionSelected,
                      ]}
                      onPress={() => onSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sheetOptionText,
                          selected && styles.sheetOptionTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {item.label || item}
                      </Text>
                      {selected ? (
                        <View style={styles.sheetCheckBadge}>
                          <Text style={styles.sheetCheckMark}>✓</Text>
                        </View>
                      ) : (
                        <View style={styles.sheetCheckPlaceholder} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    );

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
              !selectedValue && styles.placeholderText,
            ]}
            numberOfLines={1}
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

        {isSheet ? renderSheetModal() : renderDefaultModal()}
      </View>
    );
  },
);

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    paddingVertical: getVertiPadding(15),
  },
  label: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
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
    color: colors.black,
    fontFamily: fonts.RobotoRegular,
    flex: 1,
  },
  placeholderText: {
    color: colors.lightText,
  },
  iconImage: {
    width: getHeight(13),
    height: getHeight(7),
    tintColor: colors.lightText,
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
    paddingHorizontal: getHoriPadding(30),
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    maxHeight: "50%",
    paddingVertical: getVertiPadding(10),
    overflow: "hidden",
  },
  option: {
    paddingVertical: getVertiPadding(12),
    paddingHorizontal: getHoriPadding(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: "#F0F8FF",
  },
  optionText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  optionTextSelected: {
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  disabledWrapper: {
    opacity: 0.5,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: getRadius(20),
    borderTopRightRadius: getRadius(20),
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: getWidth(40),
    height: getHeight(4),
    borderRadius: getRadius(2),
    backgroundColor: colors.lightGray,
    marginTop: getVertiPadding(10),
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: getHoriPadding(20),
    paddingTop: getVertiPadding(12),
    paddingBottom: getVertiPadding(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sheetHeaderText: {
    flex: 1,
    paddingRight: getHoriPadding(12),
  },
  sheetTitle: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    letterSpacing: 0.3,
  },
  sheetSubtitle: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(4),
    lineHeight: getFontSize(18),
  },
  sheetCloseButton: {
    width: getWidth(32),
    height: getWidth(32),
    borderRadius: getRadius(16),
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetCloseText: {
    fontSize: getFontSize(18),
    color: colors.black,
    fontWeight: "300",
  },
  sheetListContent: {
    paddingVertical: getVertiPadding(8),
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  sheetOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  sheetOptionText: {
    flex: 1,
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    marginRight: getHoriPadding(12),
  },
  sheetOptionTextSelected: {
    fontFamily: fonts.RobotoMedium,
  },
  sheetCheckBadge: {
    width: getWidth(24),
    height: getHeight(24),
    borderRadius: getRadius(12),
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetCheckMark: {
    color: colors.black,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
    lineHeight: getFontSize(16),
    marginTop: -1,
  },
  sheetCheckPlaceholder: {
    width: getWidth(22),
    height: getHeight(22),
  },
  sheetEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(24),
  },
  sheetEmptyText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
  },
});
