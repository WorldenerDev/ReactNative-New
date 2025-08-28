import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import {
    getFontSize,
    getHeight,
    getRadius,
    getHoriPadding,
    getVertiPadding,
} from '@utils/responsive';
import imagePath from '@assets/icons';

const UploadButton = ({
    label = 'Upload Attachments',
    placeholder = 'Choose file',
    onPress,
    fileName = '',
    containerStyle = {},
    iconSource = imagePath.PIN_ICON,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {!!label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={styles.uploadWrapper}
                activeOpacity={0.7}
                onPress={onPress}
            >
                <Text
                    style={[
                        styles.uploadText,
                        !fileName && { color: colors.placeholderText },
                    ]}
                    numberOfLines={1}
                >
                    {fileName || placeholder}
                </Text>
                <Image
                    source={iconSource}
                    style={styles.iconImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

export default UploadButton;

const styles = StyleSheet.create({
    container: {
        paddingVertical: getVertiPadding(15),
    },
    label: {
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoMedium,
        color: colors.darkText,
        marginBottom: getVertiPadding(12),
    },
    uploadWrapper: {
        backgroundColor: colors.input,
        borderRadius: getRadius(100),
        paddingHorizontal: getHoriPadding(16),
        flexDirection: 'row',
        alignItems: 'center',
        height: getHeight(45),
        justifyContent: 'space-between',
    },
    uploadText: {
        fontSize: getFontSize(14),
        color: colors.bodyText,
        fontFamily: fonts.RobotoRegular,
        flex: 1,
        marginRight: 10,
    },
    iconImage: {
        width: getHeight(13),
        height: getHeight(14),
        tintColor: colors.placeholderText,
    },
});
