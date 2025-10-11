import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import CustomInput from "@components/CustomInput";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getFontSize, getVertiPadding } from "@utils/responsive";
import { getCartSchema } from "@api/services/mainServices";

const CartCustomerInfo = ({ navigation, route }) => {
  // Get user data from Redux store
  const { user } = useSelector((state) => state.auth);
  const { cart_id } = route.params;
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

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

  // Call cart schema API
  useEffect(() => {
    const fetchCartSchema = async () => {
      try {
        await getCartSchema({ cart_id });
      } catch (error) {
        console.error("Cart Schema API Error:", error);
      }
    };

    if (cart_id) {
      fetchCartSchema();
    }
  }, [cart_id]);

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
