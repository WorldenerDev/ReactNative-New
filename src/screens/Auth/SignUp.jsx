import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import ResponsiveContainer from '@components/container/ResponsiveContainer';
import Header from '@components/Header';
import StepTitle from '@components/StepTitle';
import CustomInput from '@components/CustomInput';
import { getFontSize, getHeight, getHoriPadding, getVertiPadding, getWidth } from '@utils/responsive';
import ButtonComp from '@components/ButtonComp';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
// import CustomCheckbox from '@components/CustomCheckbox';
import imagePath from '@assets/icons';
import navigationStrings from '@navigation/navigationStrings';
import { validateEmail, validateForm, validateLetter, validatePasswordAndConfirm } from '@utils/validators';
import { showToast } from '@components/AppToast';
import { useDispatch } from 'react-redux';
import { getDeviceType } from '@utils/uiUtils';
import { signupUser } from '@redux/slices/authSlice';

const SignUp = ({ navigation, route }) => {
    const { role } = route?.params || {};
    const dispatch = useDispatch();

    const [data, setData] = useState({
        name: 'Alex Johnson',
        email: 'a@yopmail.com',
        password: 'Test@123',
        confirmPassword: 'Test@123',
        agree: false,
    });

    const onClickContinue = () => {
        const error = validateForm([
            { values: [data?.name, "Name"], validator: validateLetter },
            { values: [data?.email], validator: validateEmail },
            { values: [data?.password, data?.confirmPassword], validator: validatePasswordAndConfirm },
        ]);

        if (error) {
            showToast('error', error);
        } else {
            const newData = {
                fullName: data?.name,
                email: data?.email,
                password: data?.password,
                deviceType: getDeviceType(),
                userType: role,
            };

            dispatch(signupUser(newData))
                .then((res) => {
                    console.log(res);
                    if (res?.payload?.success) {
                        setData({
                            name: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            agree: false,
                        });
                        navigation.navigate(navigationStrings.OTPSCREEN, {
                            fromScreen: 'signup',
                            email: res?.payload?.data?.user?.email, // pass email from API response
                        });
                    }
                });
        }
    };

    return (
        <ResponsiveContainer>
            <Header
                rightLabel="Sign In"
                rightAction={() => navigation.navigate(navigationStrings.SIGNINSCREEN)}
            />
            <StepTitle title="Create Your Employer Account" />

            <CustomInput
                label="Full Name"
                placeholder="Enter full name"
                value={data.name}
                onChangeText={(txt) => setData({ ...data, name: txt })}
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
                secure
                value={data.password}
                onChangeText={(txt) => setData({ ...data, password: txt })}
            />

            <CustomInput
                label="Confirm Password"
                placeholder="Enter confirm password"
                secure
                value={data.confirmPassword}
                onChangeText={(txt) => setData({ ...data, confirmPassword: txt })}
            />

            <View style={styles.checkboxContainer}>
                {/* <CustomCheckbox
                    checked={data.agree}
                    onToggle={() => setData({ ...data, agree: !data.agree })}
                /> */}
                <Text style={styles.termsText}>
                    Yes, I understand and agree to the{' '}
                    <Text style={styles.link}>Staffflow AI Terms of Service</Text>, including the{' '}
                    <Text style={styles.link}>User Agreement</Text> and{' '}
                    <Text style={styles.link}>Privacy Policy</Text>.
                </Text>
            </View>

            <View style={styles.bottomActions}>
                <ButtonComp
                    title="Continue"
                    disabled={!data?.agree}
                    onPress={onClickContinue}
                    containerStyle={styles.signUpBtn}
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

export default SignUp;

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: getHeight(16),
        paddingRight: getHeight(20),
    },
    termsText: {
        flex: 1,
        fontSize: getFontSize(12),
        color: colors.bodyText,
        lineHeight: getHeight(18),
        fontFamily: fonts.RobotoRegular,
    },
    link: {
        color: colors.secondary,
        fontFamily: fonts.RobotoMedium,
        fontSize: getFontSize(12),
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
        marginHorizontal: getHoriPadding(10),
        fontSize: getFontSize(15),
        color: colors.placeholderText,
        fontFamily: fonts.RobotoBold,
        fontWeight: '600',
    },
    bottomActions: {
        marginTop: 'auto',
        paddingBottom: getVertiPadding(30),
    },
    signUpBtn: {
        marginBottom: getVertiPadding(20),
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
