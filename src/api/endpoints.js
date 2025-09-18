// endpoints.ts
export const endpoints = {
  auth: {
    login: "/login",
    signup: "/signup",
    otp: "/verifyOtp",
    socialLogin: "/socialLoginAndSignUp",
    getCategory: "/getCategories",
    selectCategory: "/selectCategory",
  },
  main: {
    getAllCity: "/getAllCities",
    getEventForYou: "/getEventsForYou",
    getPopularEvents: "/getPopularEvents",
    getEventBrowserByCategory: "/getEventBrowserByCategory",
    getTrips: "/getTrips",
    createTrip: "/createTrip",
    deleteTrip: "/deleteTrip",
    activityLikeUnlike: "/activity-like-unlike",
    getEventDetails: "/get-event-Details", // Using same endpoint as checkPickupPoints
  },
};
