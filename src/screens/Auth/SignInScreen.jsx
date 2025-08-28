// Sign in screen
import fonts from '@assets/fonts';
import colors from '@assets/colors';
import imagePath from '@assets/icons';
import ButtonComp from '@components/ButtonComp';
import CustomInput from '@components/CustomInput';
import Header from '@components/Header';
import StepTitle from '@components/StepTitle';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
    getFontSize,
    getHeight,
    getHoriPadding,
    getVertiPadding,
    getWidth,
} from '@utils/responsive';
import navigationStrings from '@navigation/navigationStrings';
import ResponsiveContainer from '@components/container/ResponsiveContainer';
import { validateEmail, validateForm, validatePassword } from '@utils/validators';
import { showToast } from '@components/AppToast';
import { useDispatch } from 'react-redux';
import { loginUser, setUser } from '@redux/slices/authSlice';
import { setItem } from '@utils/storage';
import { STORAGE_KEYS } from '@utils/storageKeys';

const SignInScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [data, setData] = useState({
        email: '',
        password: '',
    });

    const onPressSignin = async () => {
        const error = validateForm([
            { values: [data.email], validator: validateEmail },
            { values: [data.password], validator: validatePassword },
        ]);

        if (error) {
            showToast('error', error);
            return;
        }

        try {
            const res = await dispatch(loginUser(data));
            console.log("Login successful: ", res);

            if (res?.payload?.userType === 'freelancer') {
                if (res?.payload?.token) {
                    await setItem(STORAGE_KEYS.FREELANCE_PROFILE_STATUS, res?.payload);
                    await setItem(STORAGE_KEYS.TOKEN, res?.payload?.token);
                }

                if (
                    !res?.payload?.hasProfessionalTitle &&
                    !res?.payload?.hasProfilePhoto &&
                    !res?.payload?.hasOverview
                ) {
                    navigation.navigate(navigationStrings.PROFILE_SETUP);
                } else if (!res?.payload?.hasProfilePhoto) {
                    navigation.navigate(navigationStrings.UPLOAD_PROFILE_IMAGE);
                } else if (!res?.payload?.hasProfessionalTitle) {
                    navigation.navigate(navigationStrings.PROFILE_PROFESSIONAL_TITTLE);
                } else if (!res?.payload?.hasOverview) {
                    navigation.navigate(navigationStrings.PROFILE_OVERVIEW);
                } else {
                    dispatch(setUser(res?.payload));
                }
            } else {
                dispatch(setUser(res?.payload));
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <ResponsiveContainer>
            <Header
                rightLabel="Sign up"
                rightAction={() => navigation.navigate(navigationStrings.CHOOSEROLESCREEN)}
            />
            <StepTitle
                title="Welcome Back"
                subtitle="Sign in to manage your gigs and freelancers."
            />

            <CustomInput
                label="Email"
                placeholder="Enter email address"
                value={data.email}
                onChangeText={(txt) => setData({ ...data, email: txt })}
            />

            <CustomInput
                label="Password"
                placeholder="Enter password"
                value={data.password}
                secure={true}
                onChangeText={(txt) => setData({ ...data, password: txt })}
                rightIcon={true}
            />

            <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate(navigationStrings.FORGOTPASSWORDSCREEN)}
            >
                <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            <View style={styles.bottomActions}>
                <ButtonComp
                    title="Sign in"
                    disabled={false}
                    onPress={onPressSignin}
                    containerStyle={styles.signInBtn}
                />

                <View style={styles.separatorWrapper}>
                    <View style={styles.separator} />
                    <Text style={styles.orText}>or connect with</Text>
                    <View style={styles.separator} />
                </View>

                <View style={styles.socialWrapper}>
                    <TouchableOpacity>
                        <Image source={imagePath.GOOGLE_ICON} style={styles.socialIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image source={imagePath.APPLE_ICON} style={styles.socialIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </ResponsiveContainer>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        paddingHorizontal: getHoriPadding(16),
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: getVertiPadding(10),
        marginBottom: getVertiPadding(20),
    },
    forgotText: {
        color: colors.secondary,
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoMedium,
    },
    bottomActions: {
        marginTop: 'auto',
        paddingBottom: getVertiPadding(30),
    },
    signInBtn: {
        marginBottom: getVertiPadding(10),
    },
    separatorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getVertiPadding(20),
    },
    separator: {
        flex: 1,
        height: getHeight(2),
        backgroundColor: colors.border,
    },
    orText: {
        marginHorizontal: 10,
        fontSize: getFontSize(15),
        color: colors.placeholderText,
        fontFamily: fonts.RobotoBold,
        fontWeight: '600',
    },
    socialWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: getWidth(20),
    },
    socialIcon: {
        width: getWidth(50),
        height: getHeight(50),
        resizeMode: 'contain',
    },
});
