import { Alert, StyleSheet, Text, View } from "react-native";
import React from "react";
import MainContainer from "@components/container/MainContainer";
import { removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { useDispatch } from "react-redux";
import { logout } from "@redux/slices/authSlice";

const Account = () => {
  const dispatch = useDispatch();
  const logoutt = async () => {
    // Alert.alert("logout");
    dispatch(logout());
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
  };
  return (
    <MainContainer>
      <Text onPress={logoutt}>Account</Text>
    </MainContainer>
  );
};

export default Account;

const styles = StyleSheet.create({});
