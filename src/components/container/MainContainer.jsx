import colors from '@assets/colors';
import Loader from '@components/Loader';
import { getHeight, getHoriPadding, getRadius, getVertiPadding } from '@utils/responsive';
import React from 'react';
import {
    View,
    SafeAreaView,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

const MainContainer = React.memo(({ children, loader = false }) => {
    const { loading: reduxLoading } = useSelector(state => state.auth);
    const showLoader = loader || reduxLoading;

    return (
        <View style={styles.root}>
            <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
            <View style={styles.header} />

            <SafeAreaView style={styles.safe}>
                <View style={styles.innerContainer}>
                    {children}
                    {showLoader && <Loader />}
                </View>
            </SafeAreaView>
        </View>
    );
});

export default MainContainer;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    safe: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        height: getHeight(90),
        backgroundColor: colors.primary,
    },
    innerContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: getRadius(30),
        borderTopRightRadius: getRadius(30),
        marginTop: getVertiPadding(-30),
        paddingTop: getVertiPadding(20),
        paddingHorizontal: getHoriPadding(20),
    },
});
