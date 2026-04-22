import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useMemo, useCallback, useEffect, useState } from 'react'
import MainContainer from '@components/container/MainContainer'
import Header from '@components/Header'
import fonts from '@assets/fonts'
import { getFontSize, getVertiPadding, getHoriPadding, getRadius, getWidth, getHeight } from '@utils/responsive'
import colors from '@assets/colors'
import { getChatbotHistoryList, getGroups } from '@api/services/mainServices'
import { useRoute } from '@react-navigation/native'
import navigationStrings from '@navigation/navigationStrings'

const ViewAiChat = ({ navigation }) => {
    const route = useRoute()
    const { groupId, tripId } = route?.params || {}
    const [tripTitle, setTripTitle] = useState('Trip')
    const [chatTopics, setChatTopics] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isMounted = true

        const loadGroupTripTitle = async () => {
            try {
                const response = await getGroups()
                const groups = response?.data || []
                if (!Array.isArray(groups) || groups.length === 0) return

                const matchedGroup =
                    groups.find((item) => String(item?._id) === String(groupId)) ||
                    groups.find((item) => String(item?.tripId) === String(tripId)) ||
                    groups.find((item) => String(item?.trip_id) === String(tripId)) ||
                    groups[0]

                const cityName = matchedGroup?.cityId?.name
                if (isMounted && cityName) {
                    setTripTitle(`${cityName} Trip`)
                }
            } catch (error) {
                // Keep fallback title if groups API fails.
            }
        }

        loadGroupTripTitle()

        return () => {
            isMounted = false
        }
    }, [groupId, tripId])

    useEffect(() => {
        let isMounted = true

        const loadChatHistory = async () => {
            if (!tripId) return
            setLoading(true)

            try {
                const response = await getChatbotHistoryList({
                    trip_id: tripId,
                    page: 1,
                    limit: 20,
                })

                const historyData = Array.isArray(response?.data) ? response.data : []

                if (isMounted) {
                    setChatTopics(historyData)
                }
            } catch (error) {
                if (isMounted) {
                    setChatTopics([])
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadChatHistory()

        return () => {
            isMounted = false
        }
    }, [tripId])

    const handleTopicPress = useCallback((topic) => {
        navigation.navigate(navigationStrings.AI_CHAT, {
            groupId,
            tripId,
            conversation_id: topic?.conversation_id,
            fromHistoryList: true,
        })
    }, [navigation, groupId, tripId])

    const renderTopicItem = useCallback(
        ({ item }) => {
            return (
                <TouchableOpacity
                    style={styles.topicItem}
                    onPress={() => handleTopicPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.topicTextContainer}>
                        <Text style={styles.topicText}>{item?.title || item?.last_message || 'Untitled Chat'}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
            )
        },
        [handleTopicPress]
    )

    const keyExtractor = useCallback((item, index) => `topic-${item?.conversation_id || index}`, [])

    const renderEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No AI chats found.</Text>
            </View>
        ),
        []
    )

    return (
        <MainContainer loader={loading}>
            <Header title="AI Chats" />
            <View style={styles.container}>
                <Text style={styles.tripTitle}>{tripTitle}</Text>
                <FlatList
                    data={chatTopics}
                    keyExtractor={keyExtractor}
                    renderItem={renderTopicItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
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
    topicTextContainer: {
        flex: 1,
    },
    topicText: {
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoMedium,
        color: colors.black,
    },
    chevron: {
        fontSize: getFontSize(20),
        color: colors.black,
        fontFamily: fonts.RobotoRegular,
        marginLeft: getWidth(8),
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: getVertiPadding(40),
    },
    emptyText: {
        fontSize: getFontSize(14),
        fontFamily: fonts.RobotoRegular,
        color: colors.lightText,
    },
})
