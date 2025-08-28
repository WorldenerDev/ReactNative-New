// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// import kycReducer from './slices/kycSlice';
// import userReducer from './slices/userSlice';
// import freelancerReducer from './slices/freelancerSlice';
// import employerReducer from './slices/employerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // kyc: kycReducer,
        // user: userReducer,
        // freelancer: freelancerReducer,
        // employer: employerReducer,
    },
});
