import colors from '@assets/colors';
import imagePath from '@assets/icons';
import { getHeight, getRadius, getWidth } from '@utils/responsive';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = ({
    showBack = true,
    currentStep = '',
    totalSteps = '',
    rightLabel = '',
    rightAction,
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {showBack ? (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
                </TouchableOpacity>
            ) : (
                <View style={[styles.iconBtn, { backgroundColor: colors.white }]} />
            )}

            <View style={styles.stepContainer}>
                {Array.from({ length: parseInt(totalSteps) || 0 }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.step,
                            index < parseInt(currentStep)
                                ? styles.activeStep
                                : styles.inactiveStep,
                        ]}
                    />
                ))}
            </View>

            {rightLabel ? (
                <TouchableOpacity onPress={rightAction}>
                    <Text style={styles.rightLabelStyle}>{rightLabel}</Text>
                </TouchableOpacity>
            ) : (
                <View style={[styles.iconBtn, { backgroundColor: colors.white }]} />
            )}
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
    },
    iconBtn: {
        width: getWidth(32),
        height: getHeight(32),
        borderRadius: getRadius(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.border,
    },
    iconStyle: {
        height: getHeight(20),
        width: getWidth(20),
        resizeMode: 'contain',
    },
    stepContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: getWidth(6),
        marginHorizontal: getWidth(12),
    },
    step: {
        height: getHeight(6),
    },
    activeStep: {
        width: getWidth(16),
        borderRadius: getRadius(4),
        backgroundColor: colors.secondary,
    },
    inactiveStep: {
        width: getWidth(6),
        borderRadius: getRadius(3),
        backgroundColor: colors.bodyText,
    },
    rightLabelStyle: {
        color: colors.secondary,
        fontSize: getHeight(14),
        fontWeight: '500',
    },
});
