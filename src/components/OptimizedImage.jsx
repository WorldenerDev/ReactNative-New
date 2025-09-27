import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Blurhash } from "react-native-blurhash";

const OptimizedImage = ({
  source,
  style,
  resizeMode = "cover",
  blurhash = "LGFFaXYk^6#M@-5c,1J5@[or[Q6.", // Default blurhash
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <View style={[style, styles.container]}>
      {/* Show blurhash while image is loading */}
      {blurhash && !imageLoaded && (
        <View style={styles.blurhash}>
          <Blurhash
            blurhash={blurhash}
            style={styles.blurhashInner}
            resizeMode={resizeMode}
            decodeWidth={16}
            decodeHeight={16}
            decodeAsync={false}
            onLoadStart={() => {
              //  console.log("Blurhash started loading");
            }}
            onLoadEnd={() => {
              //console.log("Blurhash loaded successfully");
            }}
            onLoadError={(error) => {
              //console.log("Blurhash error:", error);
            }}
          />
        </View>
      )}

      {/* Main image */}
      <Image
        source={source}
        style={[styles.image, !imageLoaded && blurhash && styles.hiddenImage]}
        resizeMode={resizeMode}
        onLoadStart={() => {
          //console.log("Image started loading");
        }}
        onLoadEnd={() => {
          //console.log("Image loaded, showing image and hiding blurhash");
          setImageLoaded(true);
        }}
        onError={(error) => {
          //console.log("Image error:", error);
        }}
        {...props}
      />
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
  blurhash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0", // Fallback background
  },
  blurhashInner: {
    width: "100%",
    height: "100%",
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default OptimizedImage;
