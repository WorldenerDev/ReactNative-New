import { isIOS } from '@utils/uiUtils';
import { Alert, Platform } from 'react-native';
import {
    check,
    request,
    requestMultiple,
    checkMultiple,
    PERMISSIONS,
    RESULTS,
    checkNotifications,
    requestNotifications,
} from 'react-native-permissions';

const usePermissions = () => {
    const getPermissionTypes = () => {
        const androidVersion = Number(Platform.Version);

        return {
            camera: isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
            location: isIOS
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            media: isIOS
                ? PERMISSIONS.IOS.PHOTO_LIBRARY
                : androidVersion < 33
                    ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
                    : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
            contacts: isIOS
                ? PERMISSIONS.IOS.CONTACTS
                : PERMISSIONS.ANDROID.READ_CONTACTS,
        };
    };

    /** Generic single check + request */
    const checkAndRequest = async (permission, name) => {
        try {
            const status = await check(permission);

            if (status === RESULTS.GRANTED) {
                return true;
            }

            const result = await request(permission);

            if (result === RESULTS.GRANTED) {
                console.log(`✅ ${name} granted after request`);
                return true;
            }

            Alert.alert(
                `${name} permission denied`,
                `App may not work properly without ${name} access.`,
            );
            console.warn(`❌ ${name} not granted (status: ${result})`);
            return false;
        } catch (error) {
            console.error(`Error requesting ${name} permission:`, error);
            return false;
        }
    };

    /** Individual permissions */
    const requestCameraPermission = async () => {
        const { camera } = getPermissionTypes();
        return camera ? checkAndRequest(camera, 'Camera') : true;
    };

    const requestLocationPermission = async () => {
        const { location } = getPermissionTypes();
        return location ? checkAndRequest(location, 'Location') : true;
    };

    const requestMediaPermission = async () => {
        const { media } = getPermissionTypes();
        return media ? checkAndRequest(media, 'Media') : true;
    };

    const requestContactsPermission = async () => {
        const { contacts } = getPermissionTypes();
        return contacts ? checkAndRequest(contacts, 'Contacts') : true;
    };

    /** Notifications (special handling) */
    const requestNotificationPermission = async (
        options = ['alert', 'badge', 'sound'],
    ) => {
        try {
            const { status } = await checkNotifications();

            if (status === RESULTS.GRANTED) {
                return true;
            }

            const { status: result } = await requestNotifications(options);

            if (result === RESULTS.GRANTED) {
                console.log('✅ Notifications granted after request');
                return true;
            }

            Alert.alert(
                'Notifications denied',
                'You may miss important updates if notifications are disabled.',
            );
            console.warn(`❌ Notifications not granted (status: ${result})`);
            return false;
        } catch (err) {
            console.error('Error during notification permission request:', err);
            return false;
        }
    };

    /** Camera + Location together */
    const requestCameraLocationPermissions = async () => {
        const { camera, location } = getPermissionTypes();
        const permissions = [camera, location].filter(Boolean);

        return handleMultiplePermissions(permissions, 'Camera & Location');
    };

    /** All (Camera + Location + Media) */
    const requestAllPermissions = async () => {
        const { camera, location, media } = getPermissionTypes();
        const permissions = [camera, location, media].filter(Boolean);

        return handleMultiplePermissions(permissions, 'All');
    };

    /** Generic multi-permission handler */
    const handleMultiplePermissions = async (permissions, label) => {
        try {
            const statuses = await checkMultiple(permissions);

            const toRequest = [];
            for (const [perm, status] of Object.entries(statuses)) {
                if (status !== RESULTS.GRANTED) {
                    toRequest.push(perm);
                }
            }

            if (toRequest.length === 0) {
                return true;
            }

            console.log(`🔄 Requesting missing ${label} permissions:`, toRequest);
            const results = await requestMultiple(toRequest);

            const denied = Object.entries(results).filter(
                ([, status]) => status !== RESULTS.GRANTED,
            );
            if (denied.length > 0) {
                Alert.alert(
                    'Some permissions were denied',
                    'App may not function correctly.',
                );
                denied.forEach(([perm, status]) =>
                    console.warn(`❌ ${perm} denied (status: ${status})`),
                );
                return false;
            }

            return true;
        } catch (err) {
            console.error(`Error during ${label} permission request:`, err);
            return false;
        }
    };

    return {
        getPermissionTypes,
        requestCameraPermission,
        requestLocationPermission,
        requestMediaPermission,
        requestContactsPermission,
        requestNotificationPermission,
        requestCameraLocationPermissions,
        requestAllPermissions,
    };
};

export default usePermissions;
