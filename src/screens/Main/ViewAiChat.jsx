import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useMemo, useCallback } from 'react'
import MainContainer from '@components/container/MainContainer'
import Header from '@components/Header'
import fonts from '@assets/fonts'
import { getFontSize, getVertiPadding, getHoriPadding, getRadius, getWidth, getHeight } from '@utils/responsive'
import colors from '@assets/colors'

const ViewAiChat = ({ navigation }) => {
    // Mock data for chat topics - In production, this would come from API/Redux
    const chatTopics = useMemo(
        () => [
            { id: 1, title: 'Chat_Topic_1' },
            { id: 2, title: 'Chat_Topic_2' },
            { id: 3, title: 'Chat_Topic_3' },
        ],
        []
    )

    const handleTopicPress = useCallback((topic) => {
        // TODO: Navigate to specific chat topic
        // navigation.navigate(navigationStrings.AI_CHAT, { topicId: topic.id });
        console.log('Navigate to topic:', topic.title)
    }, [])

    const renderTopicItem = useCallback(
        ({ item }) => {
            return (
                <TouchableOpacity
                    style={styles.topicItem}
                    onPress={() => handleTopicPress(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.topicText}>{item.title}</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            )
        },
        [handleTopicPress]
    )

    const keyExtractor = useCallback((item) => `topic-${item.id}`, [])

    return (
        <MainContainer loader={false}>
            <Header title="AI Chats" />
            <View style={styles.container}>
                <Text style={styles.tripTitle}>Tokyo Trip</Text>
                <FlatList
                    data={chatTopics}
                    keyExtractor={keyExtractor}
                    renderItem={renderTopicItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </MainContainer>
    )
}

export default ViewAiChat

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tripTitle: {
        fontSize: getFontSize(15),
        fontFamily: fonts.RobotoMedium,
        color: colors.black,
        textAlign: 'center',
        marginTop: getVertiPadding(20),
        marginBottom: getVertiPadding(20),
    },
    listContent: {
        paddingBottom: getVertiPadding(20),
    },
    topicItem: {
        backgroundColor: colors.input,
        borderRadius: getRadius(8),
        paddingVertical: getVertiPadding(12),
        paddingHorizontal: getHoriPadding(16),
        marginBottom: getVertiPadding(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    topicText: {
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoMedium,
        color: colors.black,
        flex: 1,
    },
    chevron: {
        fontSize: getFontSize(20),
        color: colors.black,
        fontFamily: fonts.RobotoRegular,
        marginLeft: getWidth(8),
    },
})
