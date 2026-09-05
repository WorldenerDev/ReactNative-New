import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import CustomInput from "@components/CustomInput";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";
import {
  getCartSchema,
  getParticipantSchema,
  cartCustomerInfo,
  updateParticipants,
  createOrder,
} from "@api/services/mainServices";
import {
  validateForm,
  validateLetter,
  validateEmail,
  validateDateOfBirth,
} from "@utils/validators";
import { showToast } from "@components/AppToast";
import ParticipantAccordion from "@components/ParticipantAccordion";
import navigationStrings from "@navigation/navigationStrings";
import { setStripeCustomerId } from "@redux/slices/paymentSlice";
import { setUser } from "@redux/slices/authSlice";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";

const LEAD_BOOKER_FIELD_NAMES = new Set([
  "email",
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "surname",
]);

const normalizeExtraFieldName = (field) =>
  String(field?.fieldName || field?.key || "")
    .split(".")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const isLeadBookerDuplicateField = (field) => {
  const name = normalizeExtraFieldName(field);
  const title = String(field?.title || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return (
    LEAD_BOOKER_FIELD_NAMES.has(name) ||
    ["email", "firstname", "lastname", "surname"].includes(title)
  );
};

const getSharedExtraFieldKey = (field) =>
  `extra_shared.${normalizeExtraFieldName(field)}`;

const getLeadBookerValueForField = (field, userData) => {
  const name = normalizeExtraFieldName(field);
  if (name === "email") return userData?.email;
  if (name === "firstname" || name === "first_name") {
    return userData?.firstName;
  }
  if (name === "lastname" || name === "last_name" || name === "surname") {
    return userData?.lastName;
  }
  return null;
};


const CartCustomerInfo = ({ navigation, route }) => {
  useGuestScreenGuard();
  // Get user data from Redux store
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart_id, trip_id, amount_minor, currency } = route.params || {};
  const [userData, setUserData] = useState({});
  const [formFields, setFormFields] = useState([]);
  const [visibleFormFields, setVisibleFormFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [participantData, setParticipantData] = useState({});
  const [participantErrors, setParticipantErrors] = useState({});
  const [participantSchemaData, setParticipantSchemaData] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [hasExtraCustomerData, setHasExtraCustomerData] = useState(false);
  const [extraCustomerDataKey, setExtraCustomerDataKey] = useState(null);

  // Update local state when Redux user data changes
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user?.name || "",
        lastName: user?.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const processCartSchema = (schema) => {
    const extraCustomerData = schema?.properties?.extra_customer_data;
    if (!extraCustomerData?.properties || Array.isArray(extraCustomerData.properties)) {
      return [];
    }

    const fields = [];
    const activityKeys = [];

    Object.keys(extraCustomerData.properties).forEach((extraKey) => {
      const extraProperty = extraCustomerData.properties[extraKey];
      const looksLikeActivityUuid =
        extraProperty?.type === "object" || extraProperty?.properties;

      if (looksLikeActivityUuid && extraProperty.properties) {
        activityKeys.push(extraKey);
        Object.keys(extraProperty.properties).forEach((nestedKey) => {
          const nestedProperty = extraProperty.properties[nestedKey];
          fields.push({
            key: `extra_customer_data.${extraKey}.${nestedKey}`,
            activityUuid: extraKey,
            fieldName: nestedKey,
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
        return;
      }

      if (extraProperty?.type && extraProperty.type !== "object") {
        fields.push({
          key: `extra_customer_data.${extraKey}`,
          fieldName: extraKey,
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
    });

    if (fields.length > 0) {
      setHasExtraCustomerData(true);
      setExtraCustomerDataKey(
        extraCustomerData.activity_uuid ||
          activityKeys[0] ||
          extraCustomerData.title ||
          null
      );
    }

    return fields.sort((a, b) => a.propertyOrder - b.propertyOrder);
  };

  useEffect(() => {
    const fetchCartSchema = async () => {
      try {
        setLoading(true);
        const response = await getCartSchema({ cart_id });
        if (response?.data?.cartSchema) {
          const processedFields = processCartSchema(response.data.cartSchema);
          const seenFieldNames = new Set();
          const uniqueVisibleFields = [];
          processedFields.forEach((field) => {
            if (isLeadBookerDuplicateField(field)) {
              return;
            }
            const sharedName = normalizeExtraFieldName(field);
            if (!sharedName || seenFieldNames.has(sharedName)) {
              return;
            }
            seenFieldNames.add(sharedName);
            uniqueVisibleFields.push({
              ...field,
              key: getSharedExtraFieldKey(field),
            });
          });

          setFormFields(processedFields);
          setVisibleFormFields(uniqueVisibleFields);
          const initialData = {};
          uniqueVisibleFields.forEach((field) => {
            initialData[field.key] = "";
          });
          setUserData((prev) => ({ ...prev, ...initialData }));

          // Call participant schema API after cart schema success
          try {
            const participantResponse = await getParticipantSchema({
              cart_uuid: cart_id,
            });
            setParticipantSchemaData(participantResponse?.data);
          } catch (participantError) {
            console.error("Participant Schema API Error:", participantError);
          }
        }
      } catch (error) {
        console.error("Cart Schema API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cart_id) fetchCartSchema();
  }, [cart_id]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Helper function to update user data in Redux and AsyncStorage
  const updateUserDataLocally = async (updates) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updates,
    };

    // Update Redux
    dispatch(setUser(updatedUser));

    // Update AsyncStorage
    try {
      await setItem(STORAGE_KEYS.USER_DATA, updatedUser);
    } catch (error) {
      console.error("Error saving user data to AsyncStorage:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle blur event - update Redux and AsyncStorage when user finishes editing lastName or email
  const handleInputBlur = async (field, value) => {
    if (field === "lastName" || field === "email") {
      const updates = {};

      if (field === "lastName") {
        updates.last_name = value;
      } else if (field === "email") {
        updates.email = value;
      }

      // Update locally (Redux + AsyncStorage)
      await updateUserDataLocally(updates);
    }
  };

  const handleParticipantDataChange = (fieldPath, value) => {
    setParticipantData((prev) => ({
      ...prev,
      [fieldPath]: value,
    }));

    // Clear error when user starts typing
    if (participantErrors[fieldPath]) {
      setParticipantErrors((prev) => ({
        ...prev,
        [fieldPath]: "",
      }));
    }
  };

  // Group products by activity_uuid for display
  const groupProductsForDisplay = () => {
    if (!participantSchemaData?.items) return {};

    return participantSchemaData.items.reduce((groups, item) => {
      const activityUuid = item.product?.activity_uuid || item.uuid || "other";
      if (!groups[activityUuid]) {
        groups[activityUuid] = {
          title: item.product?.title,
          coverImage: item.product?.cover_image_url,
          items: [],
        };
      }
      groups[activityUuid].items.push(item);
      return groups;
    }, {});
  };

  // Validation functions for different field types
  const validateField = (field, value) => {
    const { key, title, type, format } = field;

    // Required field validation
    if (!value || value.trim() === "") {
      return `${title} is required`;
    }

    // Type-specific validation
    switch (type) {
      case "string":
        if (format === "email") {
          const emailError = validateEmail(value);
          if (emailError) return emailError;
        } else if (title.toLowerCase().includes("name")) {
          const nameError = validateLetter(value, title, 2);
          if (nameError) return nameError;
        }
        break;
      case "number":
        if (isNaN(value) || value === "") {
          return `${title} must be a valid number`;
        }
        break;
      case "integer":
        if (!Number.isInteger(Number(value)) || value === "") {
          return `${title} must be a valid integer`;
        }
        break;
      default:
        break;
    }

    return null;
  };

  const validateAllFields = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate basic fields
    const basicFields = [
      { key: "firstName", title: "First Name", type: "string" },
      { key: "lastName", title: "Last Name", type: "string" },
      { key: "email", title: "Email", type: "string", format: "email" },
    ];

    basicFields.forEach((field) => {
      const error = validateField(field, userData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    // Validate extra customer data fields that are actually shown
    visibleFormFields.forEach((field) => {
      const error = validateField(field, userData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateParticipantFields = () => {
    const newParticipantErrors = {};
    let hasErrors = false;

    if (!participantSchemaData?.items) return true;

    participantSchemaData.items.forEach((item) => {
      const schema = item.participantSchema;
      if (!schema?.properties?.participants?.items?.properties) return;

      const participantFields = schema.properties.participants.items.properties;
      const requiredFields =
        schema.properties.participants.items.required || [];

      // Validate each participant instance
      for (let i = 0; i < item.quantity; i++) {
        Object.keys(participantFields).forEach((fieldKey) => {
          const field = participantFields[fieldKey];
          const isRequired = requiredFields.includes(fieldKey);
          const fieldPath = `${item.uuid}.${i}.${fieldKey}`;
          const value = participantData[fieldPath];

          if (isRequired && (!value || value.trim() === "")) {
            newParticipantErrors[fieldPath] = `${field.title || fieldKey
              } is required`;
            hasErrors = true;
          } else if (value && fieldKey === "date_of_birth") {
            // Special validation for date_of_birth field
            const dateError = validateDateOfBirth(value);
            if (dateError) {
              newParticipantErrors[fieldPath] = dateError;
              hasErrors = true;
            }
          }
        });
      }
    });

    setParticipantErrors(newParticipantErrors);
    return !hasErrors;
  };

  const handleContinue = async () => {
    // Validate all fields including participants
    const isPersonalDataValid = validateAllFields();
    const isParticipantDataValid = validateParticipantFields();

    if (!isPersonalDataValid || !isParticipantDataValid) {
      if (!isPersonalDataValid) {
        showToast(
          "error",
          "Please fix the validation errors in personal details"
        );
      } else if (!isParticipantDataValid) {
        showToast("error", "Please fill all required participant information");
      }
      return;
    }

    try {
      setLoading(true);

      // Prepare API payload with default values
      const apiPayload = {
        trip_id: trip_id,
        allow_profiling: "NO",
        email: userData.email,
        events_related_newsletter: "NO",
        firstname: String(userData.firstName || "").trim(),
        lastname: String(userData.lastName || "").trim(),
        musement_newsletter: "NO",
        thirdparty_newsletter: "NO",
      };

      if (
        apiPayload.lastname &&
        apiPayload.firstname
          .toLowerCase()
          .endsWith(` ${apiPayload.lastname.toLowerCase()}`)
      ) {
        const stripped = apiPayload.firstname
          .slice(0, apiPayload.firstname.length - apiPayload.lastname.length)
          .trim();
        if (stripped) apiPayload.firstname = stripped;
      }

      // Conditionally add extra_customer_data if it exists
      if (hasExtraCustomerData) {
        const extraCustomerData = {};
        const extraFields = formFields.filter((field) =>
          field.key.startsWith("extra_customer_data.")
        );

        extraFields.forEach((field) => {
          const rawValue = isLeadBookerDuplicateField(field)
            ? getLeadBookerValueForField(field, {
                ...userData,
                firstName: apiPayload.firstname,
                lastName: apiPayload.lastname,
                email: apiPayload.email,
              })
            : userData[getSharedExtraFieldKey(field)] ?? userData[field.key];
          if (rawValue == null || String(rawValue).trim() === "") {
            return;
          }

          let value = String(rawValue).trim();
          if (field.type === "integer") {
            value = Number.parseInt(value, 10);
          } else if (field.type === "number") {
            value = Number(value);
          }

          const activityUuid = field.activityUuid || extraCustomerDataKey;
          const fieldName = field.fieldName || field.key.split(".").pop();
          if (!activityUuid || !fieldName) {
            return;
          }

          extraCustomerData[activityUuid] = extraCustomerData[activityUuid] || {};
          extraCustomerData[activityUuid][fieldName] = value;
        });

        if (Object.keys(extraCustomerData).length > 0) {
          apiPayload.extra_customer_data = extraCustomerData;
        }
      }

      const response = await cartCustomerInfo(apiPayload);

      if (response?.success) {
        const stripeCustomerId = response?.data?.stripeCustomerId;
        if (stripeCustomerId) {
          dispatch(setStripeCustomerId(stripeCustomerId));
        }
        showToast("success", "Customer information submitted successfully!");
        const orderResponse = await createOrder({
          trip_id: trip_id,
          email_notification: "NONE",
        });

        if (!orderResponse?.success || !orderResponse?.data?.order_id) {
          showToast(
            "error",
            orderResponse?.message ||
              orderResponse?.data?.message ||
              "Failed to create order"
          );
          return;
        }
        const orderUuid = orderResponse.data.order_id;
        const orderAmountMajor = Number(orderResponse?.data?.total_amount);
        const orderCurrency = String(
          orderResponse?.data?.currency || "usd"
        ).toLowerCase();
        const orderAmountMinor = Number.isFinite(orderAmountMajor)
          ? Math.round(orderAmountMajor * 100)
          : null;

        if (!orderAmountMinor) {
          showToast("error", "Could not determine order total. Please try again.");
          return;
        }

        // If participant schema exists, call update participants API
        if (
          participantSchemaData?.items &&
          Object.keys(participantData).length > 0
        ) {
          try {
            // Prepare participant info payload
            const participantInfo = [];

            participantSchemaData.items.forEach((item) => {
              const participants = [];

              // Collect data for each participant instance
              for (let i = 0; i < item.quantity; i++) {
                const participantFields = {};
                const schema = item.participantSchema;

                if (schema?.properties?.participants?.items?.properties) {
                  const fields =
                    schema.properties.participants.items.properties;

                  Object.keys(fields).forEach((fieldKey) => {
                    const fieldPath = `${item.uuid}.${i}.${fieldKey}`;
                    const value = participantData[fieldPath];

                    if (value) {
                      participantFields[fieldKey] = value;
                    }
                  });

                  participants.push(participantFields);
                }
              }

              if (participants.length > 0) {
                participantInfo.push({
                  cart_item_uuid: item.uuid,
                  participants: participants,
                });
              }
            });

            // Call update participants API if there's data to send
            if (participantInfo.length > 0) {
              const participantPayload = {
                cart_uuid: cart_id,
                participantInfo: participantInfo,
              };

              const participantResponse = await updateParticipants(
                participantPayload
              );

              if (participantResponse?.success) {
                showToast(
                  "success",
                  "Participant information submitted successfully!"
                );
                navigation.navigate(navigationStrings.PAYMENT, {
                  trip_id,
                  cart_id,
                  orderUuid,
                  amount_minor: orderAmountMinor,
                  currency: orderCurrency,
                });
              } else {
                showToast(
                  "error",
                  participantResponse?.message ||
                  "Failed to submit participant information"
                );
              }
            } else {
              // No participant data to send, navigate to payment
              navigation.navigate(navigationStrings.PAYMENT, {
                trip_id,
                cart_id,
                orderUuid,
                amount_minor: orderAmountMinor,
                currency: orderCurrency,
              });
            }
          } catch (participantError) {
            console.error(
              "Error submitting participant info:",
              participantError
            );
            showToast(
              "error",
              participantError?.message ||
              "Failed to submit participant information"
            );
          }
        } else {
          // No participant schema, navigate directly to payment
          navigation.navigate(navigationStrings.PAYMENT, {
            trip_id,
            cart_id,
            orderUuid,
            amount_minor: orderAmountMinor,
            currency: orderCurrency,
          });
        }
      } else {
        showToast(
          "error",
          response?.message || "Failed to submit customer information"
        );
      }
    } catch (error) {
      console.error("Error submitting customer info:", error);
      showToast(
        "error",
        error?.message || "Failed to submit customer information"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field) => {
    const { key, title, type, format } = field;
    const value = userData[key] || "";
    const error = errors[key];

    const inputProps = {
      placeholder: title,
      value: value,
      onChangeText: (text) => handleInputChange(key, text),
      containerStyle: styles.inputContainer,
      error: error,
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
    <ResponsiveContainer loader={loading}>
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
                inputStyle={{ color: colors.black }}
                error={errors.firstName}
              />
            </View>
            <View style={styles.inputHalf}>
              <CustomInput
                placeholder="Last Name"
                value={userData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                onBlur={() => handleInputBlur("lastName", userData.lastName)}
                containerStyle={styles.inputContainer}
                inputStyle={{ color: colors.black }}
                error={errors.lastName}
              />
            </View>
          </View>
          <CustomInput
            placeholder="Email"
            value={userData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            onBlur={() => handleInputBlur("email", userData.email)}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
            inputStyle={{ color: colors.black }}
            error={errors.email}
          />
          {visibleFormFields.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Additional details</Text>
              {visibleFormFields.map((field) => renderFormField(field))}
            </>
          )}

          {/* Participant Information Section */}
          {participantSchemaData?.items &&
            participantSchemaData.items.length > 0 &&
            participantSchemaData.items.some((item) => item.quantity > 0) && (
              <View style={styles.participantSection}>
                <Text style={styles.sectionTitle}>Participant Information</Text>

                {Object.entries(groupProductsForDisplay()).map(
                  ([activityUuid, productGroup]) => (
                    <View key={activityUuid}>
                      <Text style={styles.requestedByText}>
                        This info is requested by our partner
                      </Text>
                      <View style={styles.productCard}>
                        <Image
                          source={{ uri: productGroup.coverImage }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                        <View style={styles.productInfo}>
                          <Text style={styles.productTitle}>
                            {productGroup.title}
                          </Text>
                        </View>
                      </View>
                      {productGroup.items.map((item) =>
                        Array.from({ length: item.quantity || 0 }, (_, index) => (
                          <ParticipantAccordion
                            key={`${item.uuid}-${index}`}
                            participant={{ ...item, participantIndex: index }}
                            participantIndex={index}
                            title={
                              (item.quantity || 0) > 1
                                ? `${item.product?.name || "Participant"} ${index + 1}`
                                : item.product?.name || "Participant"
                            }
                            participantData={participantData}
                            participantErrors={participantErrors}
                            onParticipantDataChange={handleParticipantDataChange}
                          />
                        ))
                      )}
                    </View>
                  )
                )}
              </View>
            )}
        </View>
      </ScrollView>

      {/* Floating Continue Button */}
      <View style={styles.floatingButtonContainer}>
        <ButtonComp
          title="Continue"
          onPress={handleContinue}
          disabled={false}
          containerStyle={styles.continueButton}
        />
      </View>
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
    paddingBottom: getVertiPadding(100), // Add bottom padding to prevent content from being hidden behind floating button
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
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(15),
    paddingBottom: getVertiPadding(25),
  },
  continueButton: {
    width: "100%",
    marginVertical: 0,
  },
  participantSection: {
    marginTop: getVertiPadding(10),
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 6,
    marginVertical: getVertiPadding(4),
    padding: getHoriPadding(8),
    borderWidth: 1,
    borderColor: colors.lightGray || "#e0e0e0",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: getHoriPadding(8),
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productTitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    lineHeight: getFontSize(14),
  },
  requestedByText: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray || "#666",
    marginBottom: getVertiPadding(4),
    marginTop: getVertiPadding(8),
  },
});
