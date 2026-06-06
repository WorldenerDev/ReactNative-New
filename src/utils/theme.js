import colors from "@assets/colors";
import { getHeight, getRadius, getWidth } from "@utils/responsive";

export const cardRadius = getRadius(12);
export const buttonRadius = getRadius(8);
export const cardGap = getHeight(12);
export const screenPaddingH = getWidth(16);

export const cardShadow = {
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

export const typography = {
  screenTitle: {
    fontSize: getHeight(18),
    fontWeight: "600",
    color: colors.black,
  },
  cardTitle: {
    fontSize: getHeight(16),
    fontWeight: "600",
    color: colors.black,
  },
  body: {
    fontSize: getHeight(14),
    color: colors.black,
  },
  caption: {
    fontSize: getHeight(12),
    color: colors.lightText,
  },
  emptyTitle: {
    fontSize: getHeight(18),
    fontWeight: "600",
    color: colors.black,
  },
  emptySubtitle: {
    fontSize: getHeight(14),
    color: colors.lightText,
  },
};
