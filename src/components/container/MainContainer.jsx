import colors from "@assets/colors";
import Loader from "@components/Loader";
import {
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import React from "react";
import { View, StatusBar, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const MainContainer = React.memo(
  ({ children, loader = false, androidbar = 25, iosbar = 55 }) => {
    const { loading: reduxLoading } = useSelector((state) => state.auth);
    const { loading: cityTripLoading } = useSelector((state) => state.cityTrip);
    const showLoader = loader || reduxLoading || cityTripLoading;

    return (
      <View style={styles.root}>
        <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
        <View style={styles.safe}>
          <View
            style={{ height: Platform.OS === "android" ? androidbar : iosbar }}
          />
          <View style={styles.innerContainer}>
            {children}
            {showLoader && <Loader />}
          </View>
        </View>
      </View>
    );
  }
);

export default MainContainer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    // backgroundColor: "red",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(15),
  },
});
