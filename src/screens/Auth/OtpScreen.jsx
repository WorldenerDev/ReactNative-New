import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
} from 'react-native';
import ResponsiveContainer from '@components/container/ResponsiveContainer';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import ButtonComp from '@components/ButtonComp';
import Header from '@components/Header';

import {
    getFontSize,
    getHeight,
    getRadius,
    getVertiPadding,
    getWidth,
} from '@utils/responsive';
import StepTitle from '@components/StepTitle';
import navigationStrings from '@navigation/navigationStrings';
import { useDispatch } from 'react-redux';
import { onOtp, requestOtp } from '@redux/slices/authSlice';
import { STORAGE_KEYS } from '@utils/storageKeys';
import { setItem } from '@utils/storage';

const OtpScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { fromScreen, email } = route?.params || {};
    const [code, setCode] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputs = {};

    useEffect(() => {
        let interval;
        if (!canResend && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [canResend, timer]);

    const handleChange = (text, index) => {
        if (text.length > 1) return;
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 3) {
            const nextInput = `input_${index + 1}`;
            inputs[nextInput]?.focus();
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        const data = { email };
        dispatch(requestOtp(data))
            .then((res) => {
                console.log('OTP Resent!', res);
                setCanResend(false);
                setTimer(60);
            });
    };

    const verifyCode = async () => {
        const codeString = code.join('');
        const data = {
            email,
            otp: codeString,
        };
        dispatch(onOtp(data))
            .then(async (res) => {
                console.log("After fill otp res ", res);
                if (res?.payload?.success) {
                    if (res?.payload?.data?.token) {
                        await setItem(STORAGE_KEYS?.TOKEN, res?.payload?.data?.token);
                    }
                    if (fromScreen === 'signup') {
                        if (res?.payload?.data?.user?.userType === 'freelancer') {
                            navigation.navigate(navigationStrings.PROFILE_SETUP);
                        } else {
                            navigation.navigate(navigationStrings.EMPLOYERKYC);
                        }
                    } else {
                        navigation.navigate(navigationStrings.RESETPASSWORDSCREEN);
                    }
                }
            });
    };

    return (
        <ResponsiveContainer>
            <Header showBack={true} rightAction={() => { }} />

            <StepTitle
                title={fromScreen === 'signup' ? "Verify Your Email Address" : 'Enter Reset Code Now'}
                subtitle={fromScreen === 'signup'
                    ? "Check your inbox and enter the code to verify account access."
                    : 'Submit the code we sent you to continue password recovery.'}
            />

            <Text style={styles.label}>Code</Text>

            <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputs[`input_${index}`] = ref)}
                        style={styles.codeInput}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                    />
                ))}
            </View>

            <Text style={styles.resendTimer}>
                Resend code in 00:{timer < 10 ? `0${timer}` : timer}
            </Text>

            <ButtonComp
                disabled={code.some((digit) => digit === '')}
                title="Verify Code"
                onPress={verifyCode}
                containerStyle={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn’t receive a Code? </Text>
                <Text onPress={handleResend} style={styles.resendLink}>
                    Resend Code
                </Text>
            </View>
        </ResponsiveContainer>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    label: {
        marginTop: getVertiPadding(30),
        fontSize: getFontSize(15),
        fontFamily: fonts.RobotoMedium,
        color: colors.darkText,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: getVertiPadding(10),
        marginBottom: getVertiPadding(30),
    },
    codeInput: {
        width: getWidth(60),
        height: getHeight(60),
        borderRadius: getRadius(30),
        backgroundColor: colors.input,
        textAlign: 'center',
        fontSize: getFontSize(20),
        fontFamily: fonts.RobotoMedium,
        color: colors.darkText,
    },
    verifyButton: {
        marginTop: 'auto',
        marginBottom: getVertiPadding(20),
    },
    resendTimer: {
        fontSize: getFontSize(13),
        color: colors.primary,
        fontFamily: fonts.RobotoMedium,
        marginTop: getHeight(15),
        textAlign: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: getHeight(10),
    },
    resendText: {
        fontSize: getFontSize(13),
        color: colors.placeholderText,
        fontFamily: fonts.RobotoRegular,
    },
    resendLink: {
        fontSize: getFontSize(13),
        color: colors.secondary,
        fontFamily: fonts.RobotoMedium,
    },
});
