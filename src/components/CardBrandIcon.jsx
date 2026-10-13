import { CARD_BRAND_SVGS } from "@assets/icons/cardBrandSvgs";
import { getCardBrandKey } from "@utils/cardBrand";
import { SvgXml } from "react-native-svg";

const CardBrandIcon = ({ brand, width = 36, height = 24 }) => {
  const xml = CARD_BRAND_SVGS[getCardBrandKey(brand)] || CARD_BRAND_SVGS.unknown;
  return <SvgXml xml={xml} width={width} height={height} />;
};

export default CardBrandIcon;
