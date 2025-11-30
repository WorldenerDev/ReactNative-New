import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import ScreenWapper from '@components/container/ScreenWapper';
import OptimizedImage from '@components/OptimizedImage';
import ImagePlaceholder from '@components/ImagePlaceholder';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import {
    getFontSize,
    getVertiPadding,
    getHoriPadding,
    getRadius,
    getWidth,
    getHeight,
} from '@utils/responsive';
import imagePath from '@assets/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const ROTATION_DEG = 10;

const Surprises = ({ navigation, route }) => {
    const { cityData } = route.params || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const position = useRef(new Animated.ValueXY()).current;
    const isAnimating = useRef(false);
    const currentPosition = useRef({ x: 0, y: 0 });

    const surprises = [
        {
            id: 1,
            name: 'Rovaniemi',
            image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
            description: 'Northern Lights Experience',
            subtitle: 'Aurora borealis viewing in Lapland',
        },
        {
            id: 2,
            name: 'Tokyo',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: 'Traditional Sushi Making',
            subtitle: 'Learn from master chefs in Shibuya',
        },
        {
            id: 3,
            name: 'Paris',
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            description: 'Seine River Cruise',
            subtitle: 'Romantic evening cruise with dinner',
        },
        {
            id: 4,
            name: 'Santorini',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
            description: 'Sunset Wine Tasting',
            subtitle: 'Premium wines with stunning views',
        },
        {
            id: 5,
            name: 'Bali',
            image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
            description: 'Beach Yoga Retreat',
            subtitle: 'Morning sessions by the ocean',
        },
        {
            id: 6,
            name: 'New York',
            image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
            description: 'Broadway Show Experience',
            subtitle: 'Hamilton tickets with dinner',
        },
        {
            id: 7,
            name: 'Dubai',
            image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
            description: 'Desert Safari Adventure',
            subtitle: 'Camel rides and traditional dinner',
        },
        {
            id: 8,
            name: 'Iceland',
            image: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=800',
            description: 'Blue Lagoon Spa Day',
            subtitle: 'Relax in geothermal waters',
        },
        {
            id: 9,
            name: 'Rome',
            image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800',
            description: 'Colosseum Tour',
            subtitle: 'Skip-the-line guided experience',
        },
        {
            id: 10,
            name: 'Barcelona',
            image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
            description: 'Tapas Food Tour',
            subtitle: 'Explore local cuisine in Gothic Quarter',
        },
        {
            id: 11,
            name: 'Kyoto',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
            description: 'Cherry Blossom Viewing',
            subtitle: 'Spring festival at Maruyama Park',
        },
        {
            id: 12,
            name: 'Maldives',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: 'Snorkeling Adventure',
            subtitle: 'Coral reef exploration tour',
        },
    ];

    const cityName = cityData?.name || 'Paris';
    const cityImage = cityData?.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800';

    useEffect(() => {
        position.stopAnimation();
        position.setValue({ x: 0, y: 0 });
        position.setOffset({ x: 0, y: 0 });
        position.flattenOffset();
        currentPosition.current = { x: 0, y: 0 };
        isAnimating.current = false;
    }, [currentIndex]);

    useEffect(() => {
        const listenerX = position.x.addListener(({ value }) => {
            currentPosition.current.x = value;
        });
        const listenerY = position.y.addListener(({ value }) => {
            currentPosition.current.y = value;
        });
        return () => {
            position.x.removeListener(listenerX);
            position.y.removeListener(listenerY);
        };
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !isAnimating.current,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return !isAnimating.current && Math.abs(gestureState.dx) > 5;
            },
            onPanResponderGrant: () => {
                position.stopAnimation();
                position.setOffset({
                    x: currentPosition.current.x,
                    y: currentPosition.current.y,
                });
                position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState) => {
                if (isAnimating.current) return;
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (isAnimating.current) return;

                position.flattenOffset();

                const swipeDistance = Math.abs(gestureState.dx);
                const swipeVelocity = Math.abs(gestureState.vx);

                if (swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 0.5) {
                    handleSwipe(gestureState.dx > 0 ? 'right' : 'left');
                } else {
                    isAnimating.current = true;
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                        tension: 50,
                        friction: 8,
                    }).start(() => {
                        isAnimating.current = false;
                    });
                }
            },
        })
    ).current;

    const handleSwipe = (direction) => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const swipedCard = surprises[currentIndex];
        const exitX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        Animated.timing(position, {
            toValue: { x: exitX, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            position.flattenOffset();
            console.log(direction === 'right' ? '✅ LIKED (swiped RIGHT):' : '❌ UNLIKED (swiped LEFT):', swipedCard?.name);
            nextCard();
        });
    };

    const nextCard = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex < surprises.length - 1) {
                return prevIndex + 1;
            }
            console.log('No more surprises');
            return prevIndex;
        });
    };

    const onLikePress = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        position.stopAnimation();
        position.flattenOffset();
        position.setValue({ x: 0, y: 0 });
        position.setOffset({ x: 0, y: 0 });
        currentPosition.current = { x: 0, y: 0 };

        const swipedCard = surprises[currentIndex];

        Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            console.log('✅ LIKED (button pressed):', swipedCard?.name);
            nextCard();
        });
    };

    const onUnlikePress = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        position.stopAnimation();
        position.flattenOffset();
        position.setValue({ x: 0, y: 0 });
        position.setOffset({ x: 0, y: 0 });
        currentPosition.current = { x: 0, y: 0 };

        const swipedCard = surprises[currentIndex];

        Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            console.log('❌ UNLIKED (button pressed):', swipedCard?.name);
            nextCard();
        });
    };

    const rotateCard = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [`-${ROTATION_DEG}deg`, '0deg', `${ROTATION_DEG}deg`],
        extrapolate: 'clamp',
    });

    const cardOpacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0.7, 1, 0.7],
        extrapolate: 'clamp',
    });

    const currentCard = surprises[currentIndex];

    if (!currentCard) {
        return (
            <ScreenWapper>
                <View style={styles.container}>
                    <Text style={styles.emptyText}>No more surprises!</Text>
                </View>
            </ScreenWapper>
        );
    }

    return (
        <ScreenWapper>
            <View style={styles.container}>
                <View>
                    <OptimizedImage
                        source={{
                            uri: cityImage,
                        }}
                        style={styles.banner}
                        placeholder={
                            <ImagePlaceholder
                                style={styles.banner}
                                text="Loading city image..."
                            />
                        }
                    />
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.iconBtn}
                    >
                        <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cityBtn} activeOpacity={0.7}>
                        <Text style={styles.cityName}>{cityName} ⌄</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.sectionTitle}>Surprises for you!</Text>

                    <View style={styles.cardContainer}>
                        <Animated.View
                            key={currentIndex}
                            style={[
                                styles.card,
                                {
                                    transform: [
                                        { translateX: position.x },
                                        { translateY: position.y },
                                        { rotate: rotateCard },
                                    ],
                                    opacity: cardOpacity,
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <OptimizedImage
                                source={{ uri: currentCard.image }}
                                style={styles.cardImage}
                                placeholder={
                                    <ImagePlaceholder
                                        style={styles.cardImage}
                                        text="Loading..."
                                    />
                                }
                            />
                            <View style={styles.cardOverlay}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {currentCard.name}
                                </Text>
                                <View style={styles.separator} />
                                <View style={styles.bulletPoints}>
                                    <Text style={styles.cardDescription}>Lorem Ipsum</Text>
                                    <View style={styles.bullet} />
                                    <Text style={styles.cardDescription}>Lorem Ipsum</Text>
                                    <View style={styles.bullet} />
                                    <Text style={styles.cardDescription}>Lorem Ipsum</Text>
                                </View>
                                <Text style={styles.cardSubtitle} numberOfLines={2}>
                                    Lorem Ipsum is simply dummy
                                </Text>
                            </View>
                        </Animated.View>
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onUnlikePress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.unlikeButton}>
                                <Text style={styles.unlikeIcon}>✕</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onLikePress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.likeButton}>
                                <Image
                                    source={imagePath.UN_LIKE_ICON}
                                    style={styles.likeIcon}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenWapper>
    );
};

export default Surprises;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    banner: {
        width: '100%',
        height: getHeight(230),
    },
    iconBtn: {
        width: getWidth(32),
        height: getHeight(32),
        borderRadius: getRadius(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.border,
        position: 'absolute',
        top: getVertiPadding(45),
        left: getHoriPadding(16),
        paddingVertical: getVertiPadding(6),
        paddingHorizontal: getHoriPadding(10),
    },
    iconStyle: {
        height: getHeight(20),
        width: getWidth(20),
        resizeMode: 'contain',
    },
    cityBtn: {
        position: 'absolute',
        top: getVertiPadding(48),
        left: getHoriPadding(56),
        paddingVertical: getVertiPadding(6),
        paddingHorizontal: getHoriPadding(10),
        borderRadius: getRadius(20),
    },
    cityName: {
        color: colors.white,
        fontSize: getFontSize(15),
        fontFamily: fonts.RobotoBold,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getHoriPadding(20),
        paddingTop: getVertiPadding(16),
        paddingBottom: getVertiPadding(20),
    },
    sectionTitle: {
        fontSize: getFontSize(20),
        fontFamily: fonts.RobotoBold,
        color: '#000000',
        marginBottom: getVertiPadding(18),
        marginTop: 0,
        letterSpacing: -0.5,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: getVertiPadding(16),
    },
    card: {
        width: SCREEN_WIDTH - getHoriPadding(40),
        height: getHeight(380),
        borderRadius: getRadius(20),
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: getHeight(8),
        left: getHoriPadding(12),
        right: getHoriPadding(12),
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        paddingTop: getVertiPadding(16),
        paddingBottom: getVertiPadding(18),
        paddingHorizontal: getHoriPadding(18),
        borderRadius: getRadius(16),
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    cardTitle: {
        fontSize: getFontSize(26),
        fontFamily: fonts.RobotoBold,
        color: '#1A1A1A',
        marginBottom: getVertiPadding(12),
        lineHeight: getFontSize(30),
        letterSpacing: -0.3,
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginBottom: getVertiPadding(12),
    },
    bulletPoints: {
        flexDirection: 'row',
        marginBottom: getVertiPadding(10),
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    bullet: {
        width: getWidth(5),
        height: getHeight(5),
        borderRadius: getRadius(2.5),
        backgroundColor: '#666666',
        marginHorizontal: getWidth(8),
    },
    cardDescription: {
        fontSize: getFontSize(10),
        fontFamily: fonts.RobotoRegular,
        color: '#4A4A4A',
        lineHeight: getFontSize(20),
    },
    cardSubtitle: {
        fontSize: getFontSize(13),
        fontFamily: fonts.RobotoRegular,
        color: '#666666',
        lineHeight: getFontSize(18),
        marginTop: getVertiPadding(4),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: getVertiPadding(16),
        marginTop: getVertiPadding(8),
        gap: getWidth(56),
        paddingHorizontal: getHoriPadding(20),
    },
    actionButton: {
        width: getWidth(68),
        height: getHeight(68),
    },
    unlikeButton: {
        width: '100%',
        height: '100%',
        borderRadius: getRadius(34),
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E53935',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    unlikeIcon: {
        fontSize: getFontSize(28),
        color: '#E53935',
        fontWeight: '600',
        lineHeight: getFontSize(28),
    },
    likeButton: {
        width: '100%',
        height: '100%',
        borderRadius: getRadius(34),
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    likeIcon: {
        width: getWidth(32),
        height: getHeight(32),
        resizeMode: 'contain',
        tintColor: '#FFD700',
    },
    emptyText: {
        fontSize: getFontSize(18),
        fontFamily: fonts.RobotoMedium,
        color: colors.lightText,
        textAlign: 'center',
        marginTop: getVertiPadding(100),
    },
});
