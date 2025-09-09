import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import colors from "@assets/colors";

const OptimizedImage = ({
  source,
  style,
  placeholder = null,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  cache = FastImage.cacheControl.immutable,
  onLoadStart,
  onLoadEnd,
  onError,
  showLoader = true,
  loaderColor = colors.primary,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  // If there's an error, show placeholder or fallback
  if (error && placeholder) {
    return placeholder;
  }

  return (
    <View style={[style, styles.container]}>
      <FastImage
        source={{
          uri: source?.uri,
          priority,
          cache,
        }}
        style={[style, styles.image]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />

      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

export default OptimizedImage;
