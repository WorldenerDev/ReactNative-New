import React from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import animations from "@assets/animations";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";

const Loader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        <LottieView
          source={animations.loader_Animation}
          autoPlay={true}
          loop={true}
          style={styles.animation}
          resizeMode="contain"
          enableMergePathsAndroidForKitKatAndAbove
          onAnimationFailure={(e) => {
            console.warn("Error", { e });
          }}
        />
      </View>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backgroundColor: colors.modalBack,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // iOS overlay
    elevation: 1000, // Android overlay
  },
  loaderContainer: {
    height: getHeight(130),
    width: getWidth(130),
    // borderWidth: 0.5,
    // borderColor: colors.border,
    borderRadius: 10,
    // backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: colors.black,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  animation: {
    width: getWidth(100),
    height: getHeight(100),
  },
});
