import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  STICKY_FOOTER_OFFSET,
  STICKY_SCROLL_PADDING,
} from "@navigation/constants/tabBar";

/** Bottom offset for fixed/sticky footers (tab bar + small gap). */
export const useStickyBottomInset = (extra = STICKY_FOOTER_OFFSET) => {
  const tabBarHeight = useBottomTabBarHeight();
  return tabBarHeight + extra;
};

/** Scroll content padding to keep items visible above a sticky footer. */
export const useStickyScrollPadding = (extra = STICKY_SCROLL_PADDING) => {
  const tabBarHeight = useBottomTabBarHeight();
  return tabBarHeight + extra;
};

export default useStickyBottomInset;
