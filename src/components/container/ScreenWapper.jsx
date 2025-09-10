import colors from "@assets/colors";
import Loader from "@components/Loader";
import {
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import React from "react";
import { View, StatusBar, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
const ScreenWapper = React.memo(({ children, loader = false, headerImage }) => {
  const { loading: reduxLoading } = useSelector((state) => state.auth);
  const { loading: cityTripLoading } = useSelector((state) => state.cityTrip);
  const showLoader = loader || reduxLoading || cityTripLoading;
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {children}
      {showLoader && <Loader />}
    </View>
  );
});
export default ScreenWapper;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerImage: {
    height: getHeight(250),
    // adjustable height for header
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  safe: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: getRadius(30),
    borderTopRightRadius: getRadius(30),
    marginTop: getHeight(220), // pushes content below image
    paddingTop: getVertiPadding(20),
    paddingHorizontal: getHoriPadding(20),
  },
});
