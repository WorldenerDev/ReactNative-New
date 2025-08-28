import { useCallback } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import usePermissions from './usePermissions';
import { isIOS } from '@utils/uiUtils';

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

        const fileName = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        const extension = fileName.split('.').pop()?.toLowerCase();
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        return {
            uri: asset.uri,
            type: asset.type || mimeType,
            name: fileName,
        };
    };

    /**
     * Opens the gallery to pick an image.
     */
    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            cropping: true,
            width: 800,
            height: 600,
            cropperCircleOverlay: true,
            smartAlbums: isIOS
                ? ['UserLibrary', 'PhotoStream', 'Bursts', 'Screenshots']
                : undefined,
        };

        try {
            const result = await launchImageLibrary(options);

            if (result.didCancel) {
                return null;
            }

            const asset = result.assets?.[0];
            if (!asset?.uri) {
                return null;
            }

            const fileName = asset.uri.split('/').pop();
            const name =
                fileName && /\.(jpe?g|png)$/i.test(fileName)
                    ? fileName
                    : `image_${Date.now()}.jpg`;

            return {
                uri: asset.uri,
                type: asset.type ?? 'image/jpeg',
                name,
            };
        } catch (error) {
            throw error;
        }
    };

    /**
     * Opens the camera to capture a new photo.
     */
    const takePhoto = useCallback(async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            throw new Error('Camera permissions not granted. Check console for details.');
        }

        return new Promise((resolve, reject) => {
            const options = {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1580,
                maxHeight: 2000,
                includeBase64: false,
                saveToPhotos: false,
                cameraType: 'back',
            };

            launchCamera(options, (response) => {
                if (response.didCancel) {
                    resolve(null);
                } else if (response.errorMessage) {
                    reject(new Error(response.errorMessage));
                } else {
                    resolve(formatImageData(response.assets?.[0]) || null);
                }
            });
        });
    }, []);

    return { pickImage, takePhoto };
};

export default useImagePicker;
