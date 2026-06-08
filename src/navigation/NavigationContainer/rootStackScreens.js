import navigationStrings from "@navigation/navigationStrings";
import {
  ActivityDetails,
  ActivityDetailsCheckAvability,
  AddCard,
  AddToTrip,
  AiChat,
  Cart,
  CartCustomerInfo,
  Chat,
  CreateTrip,
  MemberProfile,
  Payment,
  PaymentMethods,
  PaymentSuccess,
  SaveCard,
  SearchCity,
  ViewAiChat,
} from "@screens/index";

/** Screens on root MainStack (outside tab navigator). */
export const rootStackScreens = [
  { name: navigationStrings.BOTTOM_TAB, component: null, isNavigator: true },
  { name: navigationStrings.CHAT, component: Chat },
  { name: navigationStrings.CREATE_TRIP, component: CreateTrip },
  { name: navigationStrings.SEARCH_CITY, component: SearchCity },
  { name: navigationStrings.ADD_TO_TRIP, component: AddToTrip },
  { name: navigationStrings.ACTIVITY_DETAILS, component: ActivityDetails },
  { name: navigationStrings.AI_CHAT, component: AiChat },
  { name: navigationStrings.MEMBER_PROFILE, component: MemberProfile },
  { name: navigationStrings.VIEW_AI_CHAT, component: ViewAiChat },
  { name: navigationStrings.PAYMENT, component: Payment },
  { name: navigationStrings.PAYMENT_SUCCESS, component: PaymentSuccess },
  { name: navigationStrings.PAYMENT_METHODS, component: PaymentMethods },
  { name: navigationStrings.ADD_CARD, component: AddCard },
  { name: navigationStrings.SAVE_CARD, component: SaveCard },
  { name: navigationStrings.CART, component: Cart },
  { name: navigationStrings.CART_CUSTOMER_INFO, component: CartCustomerInfo },
  {
    name: navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY,
    component: ActivityDetailsCheckAvability,
  },
];

export const renderRootStackScreens = (Stack, BottomTabNavigator) =>
  rootStackScreens.map(({ name, component, isNavigator }) => {
    if (isNavigator) {
      return (
        <Stack.Screen
          key={name}
          name={name}
          component={BottomTabNavigator}
        />
      );
    }
    return <Stack.Screen key={name} name={name} component={component} />;
  });
