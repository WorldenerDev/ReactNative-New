import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './NavigationContainer/AuthNavigator';
import { getItem } from '@utils/storage';
import { STORAGE_KEYS } from '@utils/storageKeys';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@redux/slices/authSlice';

const Routes = () => {
    const { token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [bootstrapped, setBootstrapped] = useState(false);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            // let clear = await clearStorage()
            try {
                const savedUser = await getItem(STORAGE_KEYS.USER_DATA);
                console.log("Loaded user from storage:", savedUser);
                if (savedUser?.token) {
                    dispatch(setUser(savedUser));
                }
            } catch (err) {
                console.error("Error loading user from storage:", err);
            } finally {
                setBootstrapped(true);
            }
        };
        loadUserFromStorage();
    }, [dispatch]);

    if (!bootstrapped) {
        return null; // Or <Loader /> if you want to show loader until ready
    }

    return (
        <NavigationContainer>
            {/* {token && user?.email ? (
                user?.userType === 'freelancer' ? (
                    <FreelancerMainNavigator />
                ) : (
                    <EmployerMainNavigator />
                )
            ) : (
                <AuthNavigator />
            )} */}
            <AuthNavigator />
        </NavigationContainer>
    );
};

export default Routes;
