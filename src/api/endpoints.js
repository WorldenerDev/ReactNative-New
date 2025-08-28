// endpoints.ts
export const endpoints = {
    auth: {
        login: 'auth/login',
        signup: 'auth/register',
        otp: 'auth/verify-otp',
        resendOtp: 'auth/resend-otp',
        resetPass: 'auth/reset-password',
        freelancer: {
            profile: 'auth/freelancer/profile'
        },
        // logout: 'auth/logout',
        // session: 'auth/session',
    },
};
