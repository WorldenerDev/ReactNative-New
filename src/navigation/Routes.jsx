import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./NavigationContainer/AuthNavigator";
import { clearStorage, getItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@redux/slices/authSlice";
import MainNavigator from "./NavigationContainer/MainNavigator";

const Routes = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      //let clear = await clearStorage();
      try {
        const savedUser = await getItem(STORAGE_KEYS.USER_DATA);
        if (savedUser?.accessToken) {
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
      {/* <MainNavigator /> */}
      {user?.accessToken ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default Routes;
