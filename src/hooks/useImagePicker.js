import { useCallback } from 'react';
import { Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { optimizeImageForUpload } from '@utils/imageOptimizer';
import usePermissions from './usePermissions';

/**
 * Custom hook for picking an image from the gallery or taking a photo using the camera.
 */
const useImagePicker = () => {
    const { requestMediaPermission, requestCameraPermission } = usePermissions();

    /**
     * Extracts the necessary details from the selected/captured image.
     * @param {object} asset - Image asset object.
     * @returns {object|null} - Formatted image data or null if invalid.
     */
    const formatImageData = (asset) => {
        if (!asset?.uri) return null;

        const rawName = asset.fileName || asset.uri.split('/').pop();
        const name =
            rawName && /\.(jpe?g|png|webp)$/i.test(rawName)
                ? rawName.replace(/\.(heic|heif)$/i, '.jpg')
                : `image_${Date.now()}.jpg`;

        const rawType = (asset.type || 'image/jpeg').toLowerCase();
        const type =
            rawType === 'image/heic' || rawType === 'image/heif'
                ? 'image/jpeg'
                : rawType;

        return {
            uri: asset.uri,
            type,
            name,
            fileSize: asset.fileSize,
        };
    };

    const prepareUploadImage = async (asset) => {
        const formatted = formatImageData(asset);
        if (!formatted) {
            return null;
        }

        try {
            return await optimizeImageForUpload(formatted);
        } catch (error) {
            console.error('Image optimize failed:', error);
            throw new Error('Failed to optimize image. Please try another photo.');
        }
    };

    const needsGalleryPermission = () =>
        Platform.OS === 'android' && Number(Platform.Version) < 33;

    /**
     * Opens the gallery to pick an image.
     */
    const pickImage = useCallback(async () => {
        if (needsGalleryPermission()) {
            const hasPermission = await requestMediaPermission();
            if (!hasPermission) {
                throw new Error('Photo library permission is required.');
            }
        }

        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1600,
            selectionLimit: 1,
            assetRepresentationMode: 'compatible',
        };

        const result = await launchImageLibrary(options);

        if (result.didCancel) {
            return null;
        }

        if (result.errorCode) {
            throw new Error(result.errorMessage || result.errorCode);
        }

        return prepareUploadImage(result.assets?.[0]);
    }, [requestMediaPermission]);

    /**
     * Opens the camera to capture a new photo.
     */
    const takePhoto = useCallback(async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            throw new Error('Camera permission is required.');
        }

        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1600,
            maxHeight: 1600,
            includeBase64: false,
            saveToPhotos: false,
            cameraType: 'back',
            assetRepresentationMode: 'compatible',
        };

        const response = await launchCamera(options);

        if (response.didCancel) {
            return null;
        }

        if (response.errorCode) {
            throw new Error(response.errorMessage || response.errorCode);
        }

        return prepareUploadImage(response.assets?.[0]);
    }, [requestCameraPermission]);

    return { pickImage, takePhoto };
};

export default useImagePicker;
