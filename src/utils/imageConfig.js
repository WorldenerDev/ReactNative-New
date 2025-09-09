import FastImage from "react-native-fast-image";

/**
 * Image optimization configuration
 */
export const IMAGE_CONFIG = {
  // Cache settings
  CACHE: {
    IMMUTABLE: FastImage.cacheControl.immutable,
    WEB: FastImage.cacheControl.web,
    CACHE_ONLY: FastImage.cacheControl.cacheOnly,
  },

  // Priority settings
  PRIORITY: {
    LOW: FastImage.priority.low,
    NORMAL: FastImage.priority.normal,
    HIGH: FastImage.priority.high,
  },

  // Resize modes
  RESIZE_MODE: {
    CONTAIN: FastImage.resizeMode.contain,
    COVER: FastImage.resizeMode.cover,
    STRETCH: FastImage.resizeMode.stretch,
    CENTER: FastImage.resizeMode.center,
  },

  // Default settings for different image types
  DEFAULTS: {
    BANNER: {
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
      resizeMode: FastImage.resizeMode.cover,
    },
    CARD: {
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
      resizeMode: FastImage.resizeMode.cover,
    },
    THUMBNAIL: {
      priority: FastImage.priority.low,
      cache: FastImage.cacheControl.immutable,
      resizeMode: FastImage.resizeMode.cover,
    },
  },
};

/**
 * Get optimized image source configuration
 * @param {string} uri - Image URI
 * @param {string} type - Image type (banner, card, thumbnail)
 * @param {Object} overrides - Override default settings
 */
export const getOptimizedImageSource = (uri, type = "card", overrides = {}) => {
  const defaultConfig =
    IMAGE_CONFIG.DEFAULTS[type.toUpperCase()] || IMAGE_CONFIG.DEFAULTS.CARD;

  return {
    uri,
    ...defaultConfig,
    ...overrides,
  };
};

/**
 * Preload critical images for better UX
 * @param {Array} criticalImages - Array of critical image URIs
 */
export const preloadCriticalImages = async (criticalImages) => {
  try {
    const sources = criticalImages.map((uri) =>
      getOptimizedImageSource(uri, "banner", {
        priority: FastImage.priority.high,
      })
    );

    await FastImage.preload(sources);
    console.log(`Preloaded ${criticalImages.length} critical images`);
  } catch (error) {
    console.warn("Error preloading critical images:", error);
  }
};

/**
 * Batch preload images with different priorities
 * @param {Object} imageBatches - Object with priority levels as keys
 */
export const batchPreloadImages = async (imageBatches) => {
  try {
    const preloadPromises = Object.entries(imageBatches).map(
      ([priority, uris]) => {
        const sources = uris.map((uri) =>
          getOptimizedImageSource(uri, "card", {
            priority: FastImage.priority[priority.toUpperCase()],
          })
        );
        return FastImage.preload(sources);
      }
    );

    await Promise.all(preloadPromises);
    console.log("Batch preload completed");
  } catch (error) {
    console.warn("Error in batch preload:", error);
  }
};
