import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
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

const CustomInput = ({
  label = "",
  placeholder = "",
  value,
  onChangeText,
  secure = false,
  variant = "default", // "default" | "textarea"
  containerStyle = {},
  inputStyle = {},
  ...rest
}) => {
  const [isSecure, setIsSecure] = useState(secure);

  const isTextarea = variant === "textarea";

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, isTextarea && styles.textareaWrapper]}>
        <TextInput
          style={[styles.input, isTextarea && styles.textareaInput, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholderText}
          secureTextEntry={secure && !isTextarea && isSecure}
          value={value}
          onChangeText={onChangeText}
          multiline={isTextarea}
          textAlignVertical={isTextarea ? "top" : "center"}
          {...rest}
        />

        {secure && !isTextarea && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Image
              source={isSecure ? imagePath.EYE_OFF : imagePath.EYE}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;

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
    backgroundColor: colors.secondary,
    borderRadius: getRadius(10),
    paddingHorizontal: getHoriPadding(16),
    flexDirection: "row",
    alignItems: "center",
    height: getHeight(48),
    borderWidth: 0,
  },
  textareaWrapper: {
    borderRadius: getRadius(12),
    alignItems: "flex-start",
    height: "auto",
    paddingVertical: getVertiPadding(12),
  },
  input: {
    flex: 1,
    fontSize: getFontSize(14),
    color: colors.bodyText,
    fontFamily: fonts.RobotoRegular,
  },
  textareaInput: {
    minHeight: getHeight(100),
  },
  iconBtn: {
    paddingLeft: getHoriPadding(10),
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});
