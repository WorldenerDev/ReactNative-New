import ImageResizer from "@bam.tech/react-native-image-resizer";

export const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB

const START_MAX_DIMENSION = 1280;
const START_QUALITY = 75;
const MIN_QUALITY = 35;
const MIN_DIMENSION = 640;
const QUALITY_STEP = 15;
const DIMENSION_FACTOR = 0.85;

/**
 * Compress / resize an image so its file size is under maxBytes (default 1 MB).
 * Returns a FormData-ready file object: { uri, type, name }.
 */
export const optimizeImageForUpload = async (
  file,
  maxBytes = MAX_UPLOAD_BYTES
) => {
  if (!file?.uri) {
    return file;
  }

  const originalName =
    file.name && /\.(jpe?g|png|webp)$/i.test(file.name)
      ? file.name.replace(/\.(png|webp|heic|heif)$/i, ".jpg")
      : `image_${Date.now()}.jpg`;

  // Skip work when the picker already returned a small JPEG.
  const alreadySmall =
    typeof file.fileSize === "number" &&
    file.fileSize > 0 &&
    file.fileSize <= maxBytes &&
    /^image\/jpe?g$/i.test(file.type || "");

  if (alreadySmall) {
    return {
      uri: file.uri,
      type: "image/jpeg",
      name: originalName,
    };
  }

  let maxDimension = START_MAX_DIMENSION;
  let quality = START_QUALITY;
  let lastResult = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const resized = await ImageResizer.createResizedImage(
      file.uri,
      maxDimension,
      maxDimension,
      "JPEG",
      quality,
      0,
      undefined,
      false,
      { mode: "contain", onlyScaleDown: true }
    );

    lastResult = resized;
    const size = resized?.size ?? 0;

    if (size > 0 && size <= maxBytes) {
      return {
        uri: resized.uri,
        type: "image/jpeg",
        name: originalName.endsWith(".jpg")
          ? originalName
          : `${originalName}.jpg`,
      };
    }

    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    } else if (maxDimension > MIN_DIMENSION) {
      maxDimension = Math.max(
        MIN_DIMENSION,
        Math.floor(maxDimension * DIMENSION_FACTOR)
      );
      quality = START_QUALITY;
    } else {
      break;
    }
  }

  if (!lastResult?.uri) {
    throw new Error("Failed to optimize image for upload.");
  }

  if (lastResult.size > maxBytes) {
    throw new Error(
      "Image is still too large after compression. Please choose a smaller photo."
    );
  }

  return {
    uri: lastResult.uri,
    type: "image/jpeg",
    name: originalName.endsWith(".jpg") ? originalName : `${originalName}.jpg`,
  };
};
