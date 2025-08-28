import { Platform } from "react-native";

const fonts = {
    RobotoBold: Platform.OS === 'ios' ? "Roboto-Bold" : "RobotoBold",
    RobotoMedium: Platform.OS === 'ios' ? "Roboto-Medium" : "RobotoMedium",
    RobotoRegular: Platform.OS === 'ios' ? "Roboto-Regular" : "RobotoRegular",
};

export default fonts;
