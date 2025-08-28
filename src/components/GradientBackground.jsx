import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import colors from '@assets/colors';

const GradientBackground = ({ children, style = {} }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, style]}
        >
            {children}
        </LinearGradient>
    );
};

export default GradientBackground;

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});
