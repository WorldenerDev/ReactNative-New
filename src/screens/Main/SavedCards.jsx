import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useState, useCallback, useMemo } from 'react'
import MainContainer from '@components/container/MainContainer'
import Header from '@components/Header'
import ButtonComp from '@components/ButtonComp'
import colors from '@assets/colors'
import fonts from '@assets/fonts'
import {
    getFontSize,
    getHoriPadding,
    getRadius,
    getVertiPadding,
    getHeight,
    getWidth,
} from '@utils/responsive'

/**
 * Mastercard Icon Component
 * Renders the Mastercard logo using two overlapping circles
 */
const MastercardIcon = React.memo(({ size = 30 }) => {
    const circleSize = size * 0.67
    const overlap = size * 0.33

    return (
        <View style={[styles.mastercardContainer, { width: size, height: circleSize }]}>
            <View
                style={[
                    styles.mastercardCircle,
                    styles.mastercardCircleLeft,
                    {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: circleSize / 2
                    }
                ]}
            />
            <View
                style={[
                    styles.mastercardCircle,
                    styles.mastercardCircleRight,
                    {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: circleSize / 2,
                        right: overlap
                    }
                ]}
            />
        </View>
    )
})

MastercardIcon.displayName = 'MastercardIcon'

const SavedCards = () => {
    const [selectedCardId, setSelectedCardId] = useState(null)

    // Mock data for saved cards - In production, this would come from API/Redux
    const savedCards = useMemo(
        () => [
            { id: 1, lastFour: '4187', type: 'mastercard' },
            { id: 2, lastFour: '9387', type: 'mastercard' },
        ],
        []
    )

    const handleCardSelect = useCallback((cardId) => {
        setSelectedCardId(cardId)
    }, [])

    const handleAddCard = useCallback(() => {
        // TODO: Navigate to add card screen
        // navigation.navigate(navigationStrings.ADD_CARD)
        console.log('Navigate to add card screen')
    }, [])

    const handleContinue = useCallback(() => {
        if (!selectedCardId) {
            // TODO: Show error toast
            return
        }
        // TODO: Handle continue action with selected card
        console.log('Continue with selected card:', selectedCardId)
    }, [selectedCardId])

    const renderCardItem = useCallback(
        ({ item }) => {
            const isSelected = selectedCardId === item.id

            return (
                <TouchableOpacity
                    style={styles.cardItem}
                    onPress={() => handleCardSelect(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardLeft}>
                        <Text style={styles.cardNumber}>**** {item.lastFour}</Text>
                        <MastercardIcon size={getWidth(30)} />
                    </View>
                    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                        {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                </TouchableOpacity>
            )
        },
        [selectedCardId, handleCardSelect]
    )

    const renderListHeader = useCallback(() => {
        return (
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Select A Payment Method</Text>
            </View>
        )
    }, [])

    const renderListFooter = useCallback(() => {
        return (
            <TouchableOpacity
                style={styles.addCardItem}
                onPress={handleAddCard}
                activeOpacity={0.7}
            >
                <Text style={styles.addCardText}>Add Credit Card</Text>
                <View style={styles.plusIconContainer}>
                    <Text style={styles.plusIcon}>+</Text>
                </View>
            </TouchableOpacity>
        )
    }, [handleAddCard])

    const keyExtractor = useCallback((item) => `card-${item.id}`, [])

    return (
        <MainContainer>
            <Header title="Saved Cards" />
            <View style={styles.container}>
                <FlatList
                    data={savedCards}
                    keyExtractor={keyExtractor}
                    renderItem={renderCardItem}
                    ListHeaderComponent={renderListHeader}
                    ListFooterComponent={renderListFooter}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <View style={styles.floatingButtonContainer}>
                <ButtonComp
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedCardId}
                    containerStyle={styles.continueButton}
                />
            </View>
        </MainContainer>
    )
}

export default SavedCards

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: getVertiPadding(100), // Space for floating button
    },
    headerContainer: {
        paddingTop: getVertiPadding(20),
        paddingBottom: getVertiPadding(24),
    },
    headerTitle: {
        fontSize: getFontSize(20),
        fontFamily: fonts.RobotoMedium,
        color: colors.black,
        textAlign: 'left',
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.input,
        borderRadius: getRadius(8),
        paddingVertical: getVertiPadding(16),
        paddingHorizontal: getHoriPadding(16),
        marginBottom: getVertiPadding(12),
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getWidth(12),
    },
    cardNumber: {
        fontSize: getFontSize(16),
        fontFamily: fonts.RobotoRegular,
        color: colors.black,
    },
    mastercardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mastercardCircle: {
        position: 'absolute',
    },
    mastercardCircleLeft: {
        backgroundColor: '#FF5F00',
        left: 0,
        zIndex: 1,
    },
    mastercardCircleRight: {
        backgroundColor: '#EB001B',
        zIndex: 0,
    },
    radioButton: {
        width: getWidth(20),
        height: getWidth(20),
        borderRadius: getWidth(10),
        borderWidth: 2,
        borderColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: colors.black,
    },
    radioButtonInner: {
        width: getWidth(10),
        height: getWidth(10),
        borderRadius: getWidth(5),
        backgroundColor: colors.black,
    },
    addCardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.input,
        borderRadius: getRadius(8),
        paddingVertical: getVertiPadding(16),
        paddingHorizontal: getHoriPadding(16),
        marginTop: getVertiPadding(8),
    },
    addCardText: {
        fontSize: getFontSize(16),
        fontFamily: fonts.RobotoRegular,
        color: colors.black,
    },
    plusIconContainer: {
        width: getWidth(24),
        height: getWidth(24),
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
        fontSize: getFontSize(24),
        fontFamily: fonts.RobotoRegular,
        color: colors.black,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: getHoriPadding(15),
        paddingVertical: getVertiPadding(15),
        paddingBottom: getVertiPadding(25),
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    continueButton: {
        width: '100%',
        marginVertical: 0,
    },
})
