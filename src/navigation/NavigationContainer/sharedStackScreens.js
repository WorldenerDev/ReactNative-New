import navigationStrings from "@navigation/navigationStrings";
import {
  ActivityDetails,
  AddCard,
  AddToTrip,
  AiChat,
  BookingDetails,
  BrouseByCategory,
  CalendarViewTripDetail,
  CityDetail,
  EditProfile,
  EditTrip,
  GroupDetails,
  GroupTripsOnboarding,
  MemberProfile,
  NotificationScreen,
  NotificationSettings,
  PaymentMethods,
  PrivacyTerms,
  SaveCard,
  SavedCards,
  SearchCity,
  Surprises,
  TransactionDetail,
  TransactionHistory,
  TripDetails,
  TripBrief,
  UpdateInterests,
  ViewAiChat,
} from "@screens/index";

export const sharedStackScreens = [
  { name: navigationStrings.SEARCH_CITY, component: SearchCity },
  { name: navigationStrings.CITY_DETAIL, component: CityDetail },
  { name: navigationStrings.BROUSE_BY_CATEGORY, component: BrouseByCategory },
  { name: navigationStrings.ACTIVITY_DETAILS, component: ActivityDetails },
  {
    name: navigationStrings.SURPRISES,
    component: Surprises,
    options: { gestureEnabled: false, fullScreenGestureEnabled: false },
  },
  { name: navigationStrings.ADD_TO_TRIP, component: AddToTrip },
  { name: navigationStrings.TRIP_DETAILS, component: TripDetails },
  { name: navigationStrings.EDIT_TRIP, component: EditTrip },
  {
    name: navigationStrings.CALENDAR_VIEW_TRIP_DETAIL,
    component: CalendarViewTripDetail,
  },
  { name: navigationStrings.GROUP_DETAILS, component: GroupDetails },
  { name: navigationStrings.TRIP_BRIEF, component: TripBrief },
  {
    name: navigationStrings.GROUP_TRIPS_ONBOARDING,
    component: GroupTripsOnboarding,
  },
  { name: navigationStrings.MEMBER_PROFILE, component: MemberProfile },
  { name: navigationStrings.NOTIFICATION_SCREEN, component: NotificationScreen },
  { name: navigationStrings.BOOKING_DETAILS, component: BookingDetails },
  { name: navigationStrings.EDIT_PROFILE, component: EditProfile },
  {
    name: navigationStrings.NOTIFICATION_SETTINGS,
    component: NotificationSettings,
  },
  { name: navigationStrings.PAYMENT_METHODS, component: PaymentMethods },
  { name: navigationStrings.SAVED_CARDS, component: SavedCards },
  { name: navigationStrings.TRANSACTION_HISTORY, component: TransactionHistory },
  { name: navigationStrings.TRANSACTION_DETAIL, component: TransactionDetail },
  { name: navigationStrings.ADD_CARD, component: AddCard },
  { name: navigationStrings.SAVE_CARD, component: SaveCard },
  { name: navigationStrings.PRIVACYTERMS, component: PrivacyTerms },
  { name: navigationStrings.UPDATE_INTERESTS, component: UpdateInterests },
  { name: navigationStrings.AI_CHAT, component: AiChat },
  { name: navigationStrings.VIEW_AI_CHAT, component: ViewAiChat },
];

export const renderSharedStackScreens = (Stack) =>
  sharedStackScreens.map(({ name, component, options }) => (
    <Stack.Screen
      key={name}
      name={name}
      component={component}
      options={options}
    />
  ));
