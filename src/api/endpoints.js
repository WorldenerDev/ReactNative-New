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
  },
};
