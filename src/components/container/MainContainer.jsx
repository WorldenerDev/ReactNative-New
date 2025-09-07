import colors from "@assets/colors";
import Loader from "@components/Loader";
import {
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import React from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const MainContainer = React.memo(({ children, loader = false }) => {
  const { loading: reduxLoading } = useSelector((state) => state.auth);
  const showLoader = loader || reduxLoading;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.innerContainer}>
          {children}
          {showLoader && <Loader />}
        </View>
      </SafeAreaView>
    </View>
  );
});

export default MainContainer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(15),
  },
});
