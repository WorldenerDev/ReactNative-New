import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  getFontSize,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import CustomInput from "./CustomInput";

const ParticipantAccordion = ({
  participant,
  participantIndex,
  participantData,
  participantErrors,
  onParticipantDataChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const getParticipantTitle = () => {
    return participant.product.name;
  };

  const renderParticipantForm = () => {
    const schema = participant.participantSchema;
    if (!schema?.properties?.participants?.items?.properties) return null;

    const participantFields = schema.properties.participants.items.properties;
    const requiredFields = schema.properties.participants.items.required || [];

    return (
      <View style={styles.participantForm}>
        {Object.keys(participantFields).map((fieldKey) => {
          const field = participantFields[fieldKey];
          const isRequired = requiredFields.includes(fieldKey);
          const fieldPath = `${participant.uuid}.${participantIndex}.${fieldKey}`;

          return (
            <CustomInput
              key={fieldKey}
              placeholder={field.title || fieldKey}
              value={participantData[fieldPath] || ""}
              onChangeText={(value) =>
                onParticipantDataChange(fieldPath, value)
              }
              containerStyle={styles.inputContainer}
              error={participantErrors?.[fieldPath] || ""}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <Text style={styles.participantTitle}>{getParticipantTitle()}</Text>
        <Text
          style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}
        >
          {isExpanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>{renderParticipantForm()}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: getVertiPadding(4),
    borderWidth: 1,
    borderColor: colors.lightGray || "#e0e0e0",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: getHoriPadding(16),
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  participantTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    flex: 1,
  },
  expandIcon: {
    fontSize: getFontSize(14),
    color: colors.gray || "#666",
    marginLeft: getHoriPadding(10),
  },
  expandIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  accordionContent: {
    paddingHorizontal: getHoriPadding(16),
    paddingBottom: getVertiPadding(16),
    backgroundColor: colors.white,
  },
  participantForm: {
    paddingTop: getVertiPadding(8),
  },
  inputContainer: {
    paddingVertical: getVertiPadding(8),
  },
});

export default ParticipantAccordion;
