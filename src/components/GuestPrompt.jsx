import colors from "@assets/colors";
import fonts from "@assets/fonts";
import ButtonComp from "@components/ButtonComp";
import navigationStrings from "@navigation/navigationStrings";
import { exitGuestForSignIn } from "@redux/slices/authSlice";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";

const GuestPrompt = ({
  title = "Sign in to continue",
  subtitle = "Create an account or sign in to access this feature.",
  showCreateAccount = true,
}) => {
  const dispatch = useDispatch();

  const goToSignIn = () => {
    dispatch(exitGuestForSignIn(navigationStrings.SIGNINSCREEN));
  };

  const goToCreateAccount = () => {
    dispatch(exitGuestForSignIn(navigationStrings.SIGNUPSCREEN));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <ButtonComp
        title="Sign In"
        disabled={false}
        onPress={goToSignIn}
        containerStyle={styles.primaryBtn}
      />
      {showCreateAccount ? (
        <ButtonComp
          title="Create Account"
          disabled={false}
          onPress={goToCreateAccount}
          containerStyle={styles.secondaryBtn}
          textStyle={styles.secondaryBtnText}
        />
      ) : null}
    </View>
  );
};

export default GuestPrompt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(32),
    paddingBottom: getHeight(80),
  },
  icon: {
    fontSize: getFontSize(48),
    marginBottom: getVertiPadding(16),
  },
  title: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
    marginBottom: getVertiPadding(8),
  },
  subtitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    lineHeight: getFontSize(20),
    marginBottom: getVertiPadding(28),
  },
  primaryBtn: {
    width: "100%",
    marginBottom: getVertiPadding(12),
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.black,
  },
});
