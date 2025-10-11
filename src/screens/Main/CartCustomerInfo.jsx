import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import CustomInput from "@components/CustomInput";
import CustomDropdown from "@components/CustomDropdown";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getFontSize, getVertiPadding } from "@utils/responsive";
import { getCartSchema } from "@api/services/mainServices";

const CartCustomerInfo = ({ navigation, route }) => {
  // Get user data from Redux store
  const { user } = useSelector((state) => state.auth);
  const { cart_id } = route.params;
  const [userData, setUserData] = useState({});
  const [formFields, setFormFields] = useState([]);

  // Update local state when Redux user data changes
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user?.name || "",
        lastName: user?.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const processCartSchema = (schema) => {
    if (!schema?.properties?.extra_customer_data?.properties) return [];

    const fields = [];
    const extraCustomerData = schema.properties.extra_customer_data;

    Object.keys(extraCustomerData.properties).forEach((extraKey) => {
      const extraProperty = extraCustomerData.properties[extraKey];

      if (extraProperty.type && extraProperty.type !== "object") {
        fields.push({
          key: `extra_customer_data.${extraKey}`,
          title:
            (extraProperty.title || extraKey).charAt(0).toUpperCase() +
            (extraProperty.title || extraKey).slice(1),
          type: extraProperty.type,
          propertyOrder: extraProperty.propertyOrder || 999,
          format: extraProperty.format,
          enum: extraProperty.enum,
          enum_titles: extraProperty.enum_titles,
        });
      }

      if (extraProperty.properties) {
        Object.keys(extraProperty.properties).forEach((nestedKey) => {
          const nestedProperty = extraProperty.properties[nestedKey];

          fields.push({
            key: `extra_customer_data.${extraKey}.${nestedKey}`,
            title:
              (nestedProperty.title || nestedKey).charAt(0).toUpperCase() +
              (nestedProperty.title || nestedKey).slice(1),
            type: nestedProperty.type,
            propertyOrder: nestedProperty.propertyOrder || 999,
            format: nestedProperty.format,
            enum: nestedProperty.enum,
            enum_titles: nestedProperty.enum_titles,
          });
        });
      }
    });

    return fields.sort((a, b) => a.propertyOrder - b.propertyOrder);
  };

  useEffect(() => {
    const fetchCartSchema = async () => {
      try {
        const response = await getCartSchema({ cart_id });
        if (response?.data?.cartSchema) {
          const processedFields = processCartSchema(response.data.cartSchema);

          setFormFields(processedFields);
          const initialData = {};
          processedFields.forEach((field) => {
            initialData[field.key] = "";
          });
          setUserData((prev) => ({ ...prev, ...initialData }));
        }
      } catch (error) {
        console.error("Cart Schema API Error:", error);
      }
    };

    if (cart_id) fetchCartSchema();
  }, [cart_id]);

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderFormField = (field) => {
    const { key, title, type, format, enum: enumValues, enum_titles } = field;
    const value = userData[key] || "";

    if (enumValues?.length > 0) {
      const options = enumValues.map((val, index) => ({
        label: enum_titles?.[index] || val,
        value: val,
      }));

      return (
        <CustomDropdown
          key={key}
          placeholder={`Select ${title}`}
          options={options}
          selectedValue={value}
          onValueChange={(selectedValue) =>
            handleInputChange(key, selectedValue)
          }
          containerStyle={styles.inputContainer}
        />
      );
    }

    const inputProps = {
      placeholder: title,
      value: value,
      onChangeText: (text) => handleInputChange(key, text),
      containerStyle: styles.inputContainer,
    };

    if (type === "number") {
      inputProps.keyboardType = "numeric";
    } else if (format === "email") {
      inputProps.keyboardType = "email-address";
      inputProps.autoCapitalize = "none";
    }

    return <CustomInput key={key} {...inputProps} />;
  };

  return (
    <ResponsiveContainer>
      <Header title="Cart Customer Info" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <CustomInput
                placeholder="First Name"
                value={userData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                containerStyle={styles.inputContainer}
              />
            </View>
            <View style={styles.inputHalf}>
              <CustomInput
                placeholder="Last Name"
                value={userData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>
          <CustomInput
            placeholder="Email"
            value={userData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />
          {formFields.map((field) => renderFormField(field))}
        </View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

export default CartCustomerInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  formContainer: {
    paddingTop: getVertiPadding(20),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(10),
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: getVertiPadding(10),
  },
  inputHalf: {
    width: "48%",
  },
  inputContainer: {
    paddingVertical: getVertiPadding(10),
  },
});
