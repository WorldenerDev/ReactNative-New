import navigationStrings from "@navigation/navigationStrings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ActivityDetailsCheckAvability,
  AddCard,
  Cart,
  CartCustomerInfo,
  Chat,
  CreateTrip,
  Payment,
  PaymentMethods,
  PaymentSuccess,
  SaveCard,
} from "@screens/index";
import BottomTabNavigator from "./BottomTabNavigator";

const MainStack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <MainStack.Navigator
      initialRouteName={navigationStrings.BOTTOM_TAB}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        name={navigationStrings.BOTTOM_TAB}
        component={BottomTabNavigator}
      />
      <MainStack.Screen name={navigationStrings.CHAT} component={Chat} />
      <MainStack.Screen
        name={navigationStrings.CREATE_TRIP}
        component={CreateTrip}
      />
      <MainStack.Screen name={navigationStrings.PAYMENT} component={Payment} />
      <MainStack.Screen
        name={navigationStrings.PAYMENT_SUCCESS}
        component={PaymentSuccess}
      />
      <MainStack.Screen
        name={navigationStrings.PAYMENT_METHODS}
        component={PaymentMethods}
      />
      <MainStack.Screen name={navigationStrings.ADD_CARD} component={AddCard} />
      <MainStack.Screen name={navigationStrings.SAVE_CARD} component={SaveCard} />
      <MainStack.Screen name={navigationStrings.CART} component={Cart} />
      <MainStack.Screen
        name={navigationStrings.CART_CUSTOMER_INFO}
        component={CartCustomerInfo}
      />
      <MainStack.Screen
        name={navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY}
        component={ActivityDetailsCheckAvability}
      />
    </MainStack.Navigator>
  );
};

export default MainNavigator;
