import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import {
    getFontSize,
    getVertiPadding,
    getHoriPadding,
} from '@utils/responsive';

interface StepTitleProps {
    title?: string;
    subtitle?: string;
    containerStyle?: object;
}

const StepTitle: React.FC<StepTitleProps> = ({ title = '', subtitle = '', containerStyle = {} }) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.title}>{title}</Text>
            {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

export default StepTitle;

const styles = StyleSheet.create({
    container: {
        marginBottom: getVertiPadding(20),
        marginTop: getVertiPadding(20),

    },
    title: {
        fontSize: getFontSize(20),
        fontFamily: fonts.RobotoBold,
        color: colors.secondary,
        marginBottom: getVertiPadding(4),
    },
    subtitle: {
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoRegular,
        color: colors.bodyText,
        marginTop: getVertiPadding(5)
    },
});
