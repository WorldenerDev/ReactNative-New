// utils/responsive.js
import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const USE_FOR_BIGGER_SIZE = true;

const getWidth = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const getHeight = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

const getDynamicSize = (size) => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    if (USE_FOR_BIGGER_SIZE || SCREEN_WIDTH < BASE_WIDTH) {
        return size * scale;
    }
    return size;
};

const getHoriPadding = (size, factor = 0.5) => {
    const scaled = getWidth(size);
    return size + (scaled - size) * factor;
};

const getVertiPadding = (size, factor = 0.5) => {
    const scaled = getHeight(size);
    return size + (scaled - size) * factor;
};

const getRadius = (size, factor = 0.5) => {
    const scaleW = getWidth(size);
    const scaleH = getHeight(size);
    const scaled = Math.min(scaleW, scaleH);
    return size + (scaled - size) * factor;
};

const getFontSize = (percent) => {
    const ratio = SCREEN_HEIGHT / SCREEN_WIDTH;
    const adjustedHeight =
        ratio > 1.8 ? SCREEN_HEIGHT * 0.126 : SCREEN_HEIGHT * 0.15;
    return Math.round((percent * adjustedHeight) / 100);
};

export {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    getWidth,
    getHeight,
    getHoriPadding,
    getVertiPadding,
    getRadius,
    getFontSize,
    getDynamicSize,
};
