import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import MainContainer from '@components/container/MainContainer'
import Header from '@components/Header'
import TopTab from '@components/TopTab'
import OptimizedImage from '@components/OptimizedImage'
import ButtonComp from '@components/ButtonComp'
import Loader from '@components/Loader'
import colors from '@assets/colors'
import fonts from '@assets/fonts'
import { getWidth, getHeight, getRadius, getFontSize, getHoriPadding, getVertiPadding } from '@utils/responsive'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import navigationStrings from '@navigation/navigationStrings'
import icons from '@assets/icons'
import ForYouCard from '@components/appComponent/ForYouCard'
import { getGroupDetails, getTripBuddies } from '@api/services/mainServices'
import { showToast } from '@components/AppToast'
import usePermissions from '@hooks/usePermissions'
import Contacts from 'react-native-contacts'

// Dummy image URL for users without images
const DUMMY_USER_IMAGE = 'https://ui-avatars.com/api/?name=User&background=random&size=200'

const GroupDetails = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { user } = useSelector((state) => state.auth)
  const { groupId } = route?.params || {}

  // Debug: Log route params
  useEffect(() => {
    console.log('GroupDetails: Route params:', route?.params)
    console.log('GroupDetails: groupId:', groupId)
  }, [route?.params, groupId])

  const [loading, setLoading] = useState(false)
  const [groupData, setGroupData] = useState(null)
  const { requestContactsPermission } = usePermissions()
  const [wishlisted] = useState([
    {
      id: 'w1',
      name: 'Rovaniemi',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200',
      isLiked: false,
      like_count: 3,
    },
    {
      id: 'w2',
      name: 'Tokyo Tower Visit',
      image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200',
      isLiked: true,
      like_count: 4,
    },
    {
      id: 'w3',
      name: 'Night Safari',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200',
      isLiked: false,
      like_count: 2,
    },
    {
      id: 'w4',
      name: 'Aurora Hunt',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200',
      isLiked: true,
      like_count: 1,
    },
    {
      id: 'w5',
      name: 'Beach Sunset',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
      isLiked: false,
      like_count: 6,
    },
    {
      id: 'w6',
      name: 'Mountain Trek',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200',
      isLiked: false,
      like_count: 5,
    },
  ])
  const tabs = ['Members', 'Compare', 'Wishlisted', 'Settings']
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [compareUser, setCompareUser] = useState(null)

  // Always show selection list when switching to Compare tab
  useEffect(() => {
    if (activeTab === 'Compare') {
      setCompareUser(null)
    }
  }, [activeTab])

  // Transform API response to members format
  const transformMembersData = (data) => {
    if (!data) return []

    const currentUserId = user?._id || user?.id
    const membersList = []
    const avatarBgColors = ['#FFE5E5', '#FFF5C4', '#E5D5FF', '#E5F5FF', '#FFE5F5']

    // Add createdBy user
    if (data.createdBy) {
      const isCurrentUser = data.createdBy._id === currentUserId
      membersList.push({
        id: data.createdBy._id,
        name: data.createdBy.name || 'Unknown',
        isYou: isCurrentUser,
        avatar: data.createdBy.image || data.createdBy.avatar || DUMMY_USER_IMAGE,
        isOnline: false, // API doesn't provide online status, defaulting to false
        isAdmin: true,
        avatarBg: avatarBgColors[0],
      })
    }

    // Add addedUsers
    if (data.addedUsers && Array.isArray(data.addedUsers)) {
      data.addedUsers.forEach((addedUser, index) => {
        // Skip if user is already added as createdBy
        if (addedUser._id === data.createdBy?._id) return

        const isCurrentUser = addedUser._id === currentUserId
        membersList.push({
          id: addedUser._id,
          name: addedUser.name || 'Unknown',
          isYou: isCurrentUser,
          avatar: addedUser.image || addedUser.avatar || DUMMY_USER_IMAGE,
          isOnline: false, // API doesn't provide online status, defaulting to false
          isAdmin: false,
          avatarBg: avatarBgColors[(index + 1) % avatarBgColors.length],
        })
      })
    }

    return membersList
  }

  // Fetch group details on mount
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        console.log('GroupDetails: No groupId provided')
        return
      }

      try {
        console.log('GroupDetails: Fetching group details for groupId:', groupId)
        setLoading(true)
        const response = await getGroupDetails(groupId)
        console.log('GroupDetails: API response:', response)
        if (response?.success && response?.data) {
          setGroupData(response.data)
        } else {
          showToast('error', response?.message || 'Failed to fetch group details')
        }
      } catch (error) {
        console.error('Error fetching group details:', error)
        showToast('error', error?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupDetails()
  }, [groupId])

  // Transform members data from groupData
  const members = groupData ? transformMembersData(groupData) : []

  const handleRemoveMember = (memberId) => {
    // TODO: Implement API call to remove member from group
    // For now, update local state
    if (groupData) {
      const updatedGroupData = {
        ...groupData,
        addedUsers: groupData.addedUsers?.filter(user => user._id !== memberId) || []
      }
      setGroupData(updatedGroupData)
    }
  }

  const handleInviteParticipants = async () => {
    try {
      const permissionGranted = await requestContactsPermission();
      if (permissionGranted) {
        // Fetch contacts after permission is granted
        try {
          const contacts = await Contacts.getAll();
          const phoneNumbers = contacts
            .flatMap(contact => contact.phoneNumbers || [])
            .map(phone => phone.number)
            .filter(phone => phone && phone.trim() !== ""); // Filter out empty phone numbers

          console.log("📱 Phone Numbers Array:", phoneNumbers);
          if (phoneNumbers.length > 0) {
            try {
              setLoading(true);
              const response = await getTripBuddies({
                contacts: phoneNumbers
              });
              navigation.navigate(navigationStrings.ADD_TO_TRIP, {
                groupId: groupId,
                selectedBuddyPhones: response?.data,
              });
            } catch (apiError) {
              console.error("Error calling getTripBuddies:", apiError);
              showToast("error", apiError?.message || "Failed to fetch trip buddies");
            } finally {
              setLoading(false);
            }
          }
        } catch (contactsError) {
          console.error("Error fetching contacts:", contactsError);
        }


      } else {
        showToast("error", "Contacts permission is required to add participants");
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      showToast("error", "Failed to request contacts permission");
    }
  }

  const handleChat = () => {
    navigation.navigate(navigationStrings.CHAT)
  }

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberLeft}>
        <View style={[styles.avatarContainer, { backgroundColor: item.avatarBg }]}>
          <OptimizedImage
            source={{ uri: item.avatar || DUMMY_USER_IMAGE }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: item.isOnline ? colors.green : colors.red },
            ]}
          />
        </View>
        <Text style={styles.memberName}>
          {item.name} {item.isYou && '(You)'}
        </Text>
      </View>
      <View style={styles.memberRight}>
        {item.isAdmin ? (
          <TouchableOpacity style={styles.adminButton}>
            <Text style={styles.adminButtonText}>Admin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handleRemoveMember(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const renderMembersContent = () => (
    <View style={styles.membersContainer}>
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.footerButtons}>
            <ButtonComp
              title={'Invite Participants'}
              onPress={handleInviteParticipants}
              disabled={false}
              containerStyle={{
                marginTop: getHeight(16),
                marginBottom: getHeight(12),
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.lightGray,
                borderRadius: getRadius(12),
              }}
              textStyle={{ color: colors.black, fontFamily: fonts.RobotoMedium }}
            />
          </View>
        )}
      />
    </View>
  )

  const renderCompareSelection = () => {
    const currentUser = members.find(m => m.isYou)
    return (
      <View style={styles.compareContainer}>
        <View style={styles.youRow}>
          <View style={[styles.avatarContainer, { backgroundColor: currentUser?.avatarBg || '#FFE5E5' }]}>
            <OptimizedImage source={{ uri: currentUser?.avatar || DUMMY_USER_IMAGE }} style={styles.avatar} resizeMode="cover" />
            <View style={[styles.statusIndicator, { backgroundColor: colors.green }]} />
          </View>
          <Text style={styles.youName}>{currentUser?.name || 'You'} (You)</Text>
        </View>
        <Text style={styles.vsHeading}>V/S</Text>
        <Text style={styles.compareHint}>Select a user you want to compare your itinerary.</Text>
        <FlatList
          data={members.filter(m => !m.isYou)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.compareListContent}
          renderItem={({ item }) => (
            <View style={styles.compareRow}>
              <View style={styles.compareUserLeft}>
                <View style={[styles.avatarContainer, { backgroundColor: item.avatarBg }]}>
                  <OptimizedImage source={{ uri: item.avatar || DUMMY_USER_IMAGE }} style={styles.avatar} resizeMode="cover" />
                  <View style={[styles.statusIndicator, { backgroundColor: item.isOnline ? colors.green : colors.red }]} />
                </View>
                <Text style={styles.memberName}>{item.name}</Text>
              </View>
              <TouchableOpacity style={styles.comparePillRight} activeOpacity={0.8} onPress={() => setCompareUser(item)}>
                <Text style={styles.comparePillText}>Compare</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    )
  }

  const renderComparisonDetails = () => {
    const currentUser = members.find(m => m.isYou)
    return (
      <ScrollView style={styles.compareDetails} contentContainerStyle={styles.compareDetailsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.compareHeader}>
          <View style={styles.compareHeaderSide}>
            <View style={[styles.avatarContainer, { backgroundColor: currentUser?.avatarBg || '#FFE5E5' }]}>
              <OptimizedImage source={{ uri: currentUser?.avatar || DUMMY_USER_IMAGE }} style={styles.avatar} resizeMode="cover" />
              <View style={[styles.statusIndicator, { backgroundColor: colors.green }]} />
            </View>
            <Text style={styles.compareHeaderName}>You</Text>
          </View>
          <Text style={styles.vsHeader}>V/S</Text>
          <View style={styles.compareHeaderSide}>
            <View style={[styles.avatarContainer, { backgroundColor: compareUser?.avatarBg }]}>
              <OptimizedImage source={{ uri: compareUser?.avatar || DUMMY_USER_IMAGE }} style={styles.avatar} resizeMode="cover" />
              <View style={[styles.statusIndicator, { backgroundColor: compareUser?.isOnline ? colors.green : colors.red }]} />
            </View>
            <Text style={styles.compareHeaderName}>{compareUser?.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Activities</Text>
          <Text style={styles.sectionNote}>Note: Dates and tickets may vary, it is recommended to review</Text>
          <View style={styles.cardRow}>
            <View style={styles.cardThumb} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Tokyo Tower Visit</Text>
              <Text style={styles.cardMeta}>Dec 16 • $129</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uncommon Activities</Text>
          <Text style={styles.sectionNote}>Note: Dates and tickets may vary, it is recommended to review</Text>
          <Text style={styles.subSectionTitle}>Added by You</Text>
          {[1, 2].map((i) => (
            <View key={`you-${i}`} style={styles.cardRow}>
              <View style={styles.cardThumb} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Tokyo Tower Visit</Text>
                <Text style={styles.cardMeta}>Dec 16 • $129</Text>
              </View>
              <TouchableOpacity style={styles.removePill}>
                <Text style={styles.removePillText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={styles.subSectionTitle}>Added by {compareUser?.name}</Text>
          <View style={styles.cardRow}>
            <View style={styles.cardThumb} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Tokyo Tower Visit</Text>
              <Text style={styles.cardMeta}>Dec 16 • $129</Text>
            </View>
            <TouchableOpacity style={styles.addPill}>
              <Text style={styles.addPillText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: getHeight(120) }} />
      </ScrollView>
    )
  }

  const renderWishlistedItem = ({ item }) => {
    const likeCount = item?.like_count || item?.likes || item?.liked_by || 0
    return (
      <View style={styles.wishItem}>
        <ForYouCard item={item} onPress={() => { }} />
        <View style={styles.likedRow}>
          <Text style={styles.likedText}>Liked by {likeCount} members</Text>
          <Image source={icons.RIGHT_ICON} style={styles.likedArrow} resizeMode="contain" />
        </View>
      </View>
    )
  }

  const renderWishlistedContent = () => (
    <View style={styles.wishContainer}>
      <FlatList
        data={wishlisted}
        keyExtractor={(it, idx) => String(it?.id || it?.activity_id || idx)}
        renderItem={renderWishlistedItem}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: getHoriPadding(4) }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.wishListContent}
      />
    </View>
  )

  return (
    <MainContainer>
      <Header title="Group Details" showBack={true} />
      <TopTab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content per tab */}
      {loading ? (
        <Loader />
      ) : (
        <View style={styles.contentContainer}>
          {activeTab === 'Members' && renderMembersContent()}
          {activeTab === 'Compare' && (
            compareUser ? renderComparisonDetails() : renderCompareSelection()
          )}
          {activeTab === 'Wishlisted' && renderWishlistedContent()}
          {activeTab === 'Settings' && (
            <Text style={styles.contentText}>Settings content</Text>
          )}
        </View>
      )}

      {/* Fixed bottom Chat button - only on Members tab */}
      {!loading && (activeTab === 'Members' || activeTab === 'Compare' || activeTab === 'Wishlisted') && (
        <View style={styles.fixedChatContainer}>
          <ButtonComp
            title={'Chat'}
            onPress={handleChat}
            disabled={false}
            containerStyle={{
              backgroundColor: colors.secondary,
              borderRadius: getRadius(30),
            }}
            textStyle={{ color: colors.black, fontFamily: fonts.RobotoBold }}
          />
        </View>
      )}
    </MainContainer>
  )
}

export default GroupDetails

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  membersContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: getHeight(8),
    paddingBottom: getHeight(100),
  },
  footerButtons: {
    paddingTop: getHeight(8),
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getHeight(12),
    paddingHorizontal: getHoriPadding(4),
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getWidth(20),
    marginRight: getWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: getWidth(38),
    height: getWidth(38),
    borderRadius: getWidth(19),
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: getWidth(12),
    height: getWidth(12),
    borderRadius: getWidth(6),
    borderWidth: 2,
    borderColor: colors.white,
  },
  memberName: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    // flex: 1,
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  adminButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(16),
  },
  adminButtonText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  removeButton: {
    paddingVertical: getVertiPadding(4),
    paddingHorizontal: getHoriPadding(8),
  },
  removeText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.red,
  },
  inviteButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: getVertiPadding(14),
    borderRadius: getRadius(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getHeight(16),
    marginBottom: getHeight(12),
  },
  inviteButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  chatButton: {
    backgroundColor: colors.secondary,
    paddingVertical: getVertiPadding(14),
    borderRadius: getRadius(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getHeight(16),
  },
  chatButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  fixedChatContainer: {
    position: 'absolute',
    left: getHoriPadding(16),
    right: getHoriPadding(16),
    bottom: getHeight(36),
    zIndex: 10,
  },
  wishContainer: {
    flex: 1,
  },
  wishListContent: {
    paddingVertical: getHeight(8),
    paddingBottom: getHeight(120),
  },
  wishItem: {
    flex: 1,
    marginBottom: getHeight(12),
  },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getHoriPadding(8),
    marginTop: getHeight(4),
  },
  likedText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  likedArrow: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.black,
  },
  compareContainer: {
    flex: 1,
  },
  vsHeading: {
    fontSize: getFontSize(36),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: 'center',
    marginTop: getHeight(12),
    marginBottom: getHeight(8),
  },
  compareHint: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginTop: getHeight(8),
    marginBottom: getHeight(16),
  },
  compareListContent: {
    paddingBottom: getHeight(120),
    // paddingRight: getHoriPadding(16),
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getHeight(14),
    paddingHorizontal: getHoriPadding(4),
  },
  compareUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightCapsule: {
    width: getWidth(36),
    height: getHeight(42),
    borderRadius: getRadius(20),
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.black,
  },
  comparePillRight: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(18),
    paddingVertical: getVertiPadding(10),
    borderRadius: getRadius(20),
    minWidth: getWidth(110),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  comparePillText: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(14),
  },
  youRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getWidth(10),
    marginTop: getHeight(12),
  },
  youName: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  compareDetails: {
    flex: 1,
  },
  compareDetailsContent: {
    paddingBottom: getHeight(16),
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: getHeight(8),
    marginBottom: getHeight(12),
  },
  compareHeaderSide: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  compareHeaderName: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  vsHeader: {
    fontSize: getFontSize(22),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  section: {
    marginBottom: getHeight(16),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  sectionNote: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginBottom: getHeight(8),
  },
  subSectionTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginVertical: getHeight(8),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getHoriPadding(10),
    borderRadius: getRadius(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: getHeight(10),
  },
  cardThumb: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getRadius(8),
    backgroundColor: colors.lightGray,
    marginRight: getWidth(10),
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  cardMeta: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginTop: getHeight(2),
  },
  removePill: {
    borderWidth: 1,
    borderColor: colors.red,
    paddingHorizontal: getHoriPadding(14),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
  },
  removePillText: {
    color: colors.red,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(12),
  },
  addPill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(18),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
  },
  addPillText: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(12),
  },
})
