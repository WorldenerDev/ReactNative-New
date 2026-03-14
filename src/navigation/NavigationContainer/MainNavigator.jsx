import navigationStrings from "@navigation/navigationStrings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ActivityDetails,
  ActivityDetailsCheckAvability,
  AddToTrip,
  AiChat,
  BookingDetails,
  BrouseByCategory,
  CalendarViewTripDetail,
  Cart,
  CartCustomerInfo,
  Chat,
  CityDetail,
  CreateTrip,
  EditProfile,
  EditTrip,
  GroupDetails,
  MemberProfile,
  NotificationScreen,
  NotificationSettings,
  Payment,
  PaymentSuccess,
  PrivacyTerms,
  SavedCards,
  SearchCity,
  Surprises,
  TripDetails,
  UpdateInterests,
  ViewAiChat,
} from "@screens/index";
import BottomTabNavigator from "./BottomTabNavigator";

const MainStack = createNativeStackNavigator();
const MainNavigator = () => {
  return (
    <>
      <MainStack.Navigator
        initialRouteName={navigationStrings.BOTTOM_TAB}
        screenOptions={{
          headerShown: false,
        }}
      >
        <MainStack.Screen
          name={navigationStrings.PAYMENT_SUCCESS}
          component={PaymentSuccess}
        />
        <MainStack.Screen
          name={navigationStrings.BOTTOM_TAB}
          component={BottomTabNavigator}
        />
        <MainStack.Screen
          name={navigationStrings.SEARCH_CITY}
          component={SearchCity}
        />
        <MainStack.Screen
          name={navigationStrings.CITY_DETAIL}
          component={CityDetail}
        />
        <MainStack.Screen
          name={navigationStrings.BROUSE_BY_CATEGORY}
          component={BrouseByCategory}
        />
        <MainStack.Screen
          name={navigationStrings.ACTIVITY_DETAILS}
          component={ActivityDetails}
        />
        <MainStack.Screen
          name={navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY}
          component={ActivityDetailsCheckAvability}
        />
        <MainStack.Screen
          name={navigationStrings.CREATE_TRIP}
          component={CreateTrip}
        />
        <MainStack.Screen
          name={navigationStrings.ADD_TO_TRIP}
          component={AddToTrip}
        />
        <MainStack.Screen
          name={navigationStrings.TRIP_DETAILS}
          component={TripDetails}
        />
        <MainStack.Screen
          name={navigationStrings.EDIT_TRIP}
          component={EditTrip}
        />
        <MainStack.Screen
          name={navigationStrings.CALENDAR_VIEW_TRIP_DETAIL}
          component={CalendarViewTripDetail}
        />
        <MainStack.Screen name={navigationStrings.CART} component={Cart} />
        <MainStack.Screen
          name={navigationStrings.CART_CUSTOMER_INFO}
          component={CartCustomerInfo}
        />
        <MainStack.Screen
          name={navigationStrings.NOTIFICATION_SCREEN}
          component={NotificationScreen}
        />
        <MainStack.Screen
          name={navigationStrings.NOTIFICATION_SETTINGS}
          component={NotificationSettings}
        />
        <MainStack.Screen
          name={navigationStrings.EDIT_PROFILE}
          component={EditProfile}
        />
        <MainStack.Screen
          name={navigationStrings.PAYMENT}
          component={Payment}
        />
        <MainStack.Screen name={navigationStrings.CHAT} component={Chat} />
        <MainStack.Screen name={navigationStrings.AI_CHAT} component={AiChat} />
        <MainStack.Screen
          name={navigationStrings.VIEW_AI_CHAT}
          component={ViewAiChat}
        />
        <MainStack.Screen
          name={navigationStrings.GROUP_DETAILS}
          component={GroupDetails}
        />
        <MainStack.Screen
          name={navigationStrings.BOOKING_DETAILS}
          component={BookingDetails}
        />
        <MainStack.Screen
          name={navigationStrings.SAVED_CARDS}
          component={SavedCards}
        />
        <MainStack.Screen
          name={navigationStrings.SURPRISES}
          component={Surprises}
        />
        <MainStack.Screen
          name={navigationStrings.PRIVACYTERMS}
          component={PrivacyTerms}
        />
        <MainStack.Screen
          name={navigationStrings.MEMBER_PROFILE}
          component={MemberProfile}
        />
        <MainStack.Screen
          name={navigationStrings.UPDATE_INTERESTS}
          component={UpdateInterests}
        />
      </MainStack.Navigator>
    </>
  );
};

export default MainNavigator;
