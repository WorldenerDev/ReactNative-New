import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Header from "@components/Header";
import MainContainer from "@components/container/MainContainer";

const PrivacyTerms = ({ route }) => {
  const { type } = route.params;
  const [data, setData] = useState(null);
  console.log(type);
  return (
    <MainContainer>
      <Header
        title={
          type === "term-condition" ? "Terms and Conditions" : "Privacy Policy"
        }
      />
    </MainContainer>
  );
};

export default PrivacyTerms;

const styles = StyleSheet.create({});
