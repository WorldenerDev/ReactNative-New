import * as React from "react";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  STICKY_FOOTER_OFFSET,
  STICKY_SCROLL_PADDING,
} from "@navigation/constants/tabBar";

/** Tab bar height when inside BottomTabNavigator; safe-area bottom otherwise. */
const useTabBarOrSafeAreaBottom = () => {
  const tabBarHeight = React.useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  return tabBarHeight ?? insets.bottom;
};

/** Bottom offset for fixed/sticky footers (tab bar + small gap). */
export const useStickyBottomInset = (extra = STICKY_FOOTER_OFFSET) => {
  return useTabBarOrSafeAreaBottom() + extra;
};

/** Scroll content padding to keep items visible above a sticky footer. */
export const useStickyScrollPadding = (extra = STICKY_SCROLL_PADDING) => {
  return useTabBarOrSafeAreaBottom() + extra;
};

export default useStickyBottomInset;
