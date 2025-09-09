import FastImage from "react-native-fast-image";

/**
 * Preloads images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {Object} options - Preload options
 */
export const preloadImages = async (imageUrls, options = {}) => {
  try {
    const urls = imageUrls.filter((url) => url && typeof url === "string");

    if (urls.length === 0) return;

    const preloadOptions = {
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
      ...options,
    };

    const preloadPromises = urls.map((url) =>
      FastImage.preload([{ uri: url, ...preloadOptions }])
    );

    await Promise.all(preloadPromises);
    console.log(`Successfully preloaded ${urls.length} images`);
  } catch (error) {
    console.warn("Error preloading images:", error);
  }
};

/**
 * Preloads images for a specific screen
 * @param {Array} data - Array of objects containing image URLs
 * @param {Array} imageKeys - Keys to extract image URLs from objects
 */
export const preloadScreenImages = async (
  data,
  imageKeys = ["image", "cover_image_url"]
) => {
  try {
    const imageUrls = [];

    data.forEach((item) => {
      imageKeys.forEach((key) => {
        if (item[key] && typeof item[key] === "string") {
          imageUrls.push(item[key]);
        }
      });
    });

    await preloadImages(imageUrls);
  } catch (error) {
    console.warn("Error preloading screen images:", error);
  }
};

/**
 * Clears image cache (use sparingly)
 */
export const clearImageCache = () => {
  FastImage.clearMemoryCache();
  FastImage.clearDiskCache();
};

/**
 * Gets cache info
 */
export const getCacheInfo = async () => {
  try {
    const cacheInfo = await FastImage.getCacheSize();
    return cacheInfo;
  } catch (error) {
    console.warn("Error getting cache info:", error);
    return null;
  }
};
