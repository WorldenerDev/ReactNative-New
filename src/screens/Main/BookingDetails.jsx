import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import MainContainer from '@components/container/MainContainer';
import Header from '@components/Header';
import ButtonComp from '@components/ButtonComp';
import colors from '@assets/colors';
import fonts from '@assets/fonts';
import {
    getHeight,
    getFontSize,
    getRadius,
    getHoriPadding,
    getVertiPadding,
} from '@utils/responsive';

const BookingDetails = ({ navigation, route }) => {
    const { orderId, bookingId } = route?.params || {};
    console.log("orderId", orderId);
    console.log("bookingId", bookingId);

    // Dummy booking data matching the design
    const bookingData = {
        title: 'Tokyo Tower Visit and a dinner with live music',
        date: '28 April, 2026',
        options: 'Semi-private Tour - 10:30 AM',
        tickets: [
            { type: 'Adult', ageRange: '19-99', quantity: 1 },
            { type: 'Child', ageRange: '7-18', quantity: 1 },
            { type: 'Infant', ageRange: '0-6', quantity: 5 },
        ],
        transactionId: 'txn #12381',
        purchasedOn: '28 April, 2026',
    };

    const handleViewTicket = () => {
        // Handle view ticket action
        console.log('View ticket pressed');
    };

    const handleCancel = () => {
        // Handle cancel action
        console.log('Cancel pressed');
    };

    const handleContactSupport = () => {
        // Handle contact support action
        console.log('Contact support pressed');
    };

    return (
        <MainContainer>
            <Header showBack={true} title={bookingId || 'Booking Details'} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main White Card */}
                <View style={styles.whiteCard}>
                    {/* Title */}
                    <Text style={styles.title} numberOfLines={3}>
                        {bookingData.title}
                    </Text>

                    {/* Date */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>{bookingData.date}</Text>
                    </View>

                    {/* Options */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Options:</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                            {bookingData.options}
                        </Text>
                    </View>

                    {/* Tickets Section */}
                    <View style={styles.ticketsSection}>
                        <Text style={styles.ticketsLabel}>Tickets:</Text>
                        {bookingData.tickets.map((ticket, index) => (
                            <View key={index} style={styles.ticketRow}>
                                <Text style={styles.ticketBullet}>•</Text>
                                <Text style={styles.ticketItem}>
                                    {ticket.quantity}x {ticket.type} ({ticket.ageRange})
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* View Ticket Button */}
                    <ButtonComp
                        title="View ticket"
                        onPress={handleViewTicket}
                        disabled={false}
                        containerStyle={styles.viewTicketButton}
                        textStyle={styles.viewTicketButtonText}
                    />
                </View>

                {/* Payment Details Section */}
                <View style={styles.paymentSection}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment Details:</Text>
                        <Text style={styles.paymentValue}>{bookingData.transactionId}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Purchased on:</Text>
                        <Text style={styles.paymentValue}>{bookingData.purchasedOn}</Text>
                    </View>
                </View>

                {/* Cancel Button */}
                <ButtonComp
                    title="Cancel"
                    onPress={handleCancel}
                    disabled={false}
                    containerStyle={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                />

                {/* Contact Support Link */}
                <TouchableOpacity
                    onPress={handleContactSupport}
                    style={styles.contactSupportButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.contactSupportText}>
                        Contact Support Here
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </MainContainer>
    );
};

export default BookingDetails;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        marginHorizontal: -getHoriPadding(15), // Extend beyond MainContainer padding
    },
    scrollContent: {
        paddingTop: getHeight(16),
        paddingBottom: getHeight(24),
        paddingHorizontal: getHoriPadding(15), // Restore padding for content
    },
    whiteCard: {
        backgroundColor: colors.white,
        borderRadius: getRadius(12),
        paddingHorizontal: getHoriPadding(20),
        paddingVertical: getVertiPadding(24),
        marginBottom: getHeight(20),
        marginHorizontal: getHoriPadding(15), // Add margin to create spacing from edges
        // Shadow for depth
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: colors.black,
        marginBottom: getHeight(16),
        lineHeight: getFontSize(26),
        fontFamily: fonts.RobotoBold,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: getHeight(10),
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: getFontSize(14),
        color: colors.lightText,
        marginRight: getHoriPadding(8),
        minWidth: getHoriPadding(70),
    },
    detailValue: {
        flex: 1,
        fontSize: getFontSize(14),
        color: colors.lightText,
        lineHeight: getFontSize(20),
    },
    ticketsSection: {
        marginTop: getHeight(16),
        marginBottom: getHeight(20),
        paddingTop: getHeight(16),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    ticketsLabel: {
        fontSize: getFontSize(14),
        color: colors.lightText,
        marginBottom: getHeight(12),
        fontWeight: '500',
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getHeight(6),
    },
    ticketBullet: {
        fontSize: getFontSize(14),
        color: colors.lightText,
        marginRight: getHoriPadding(8),
        lineHeight: getFontSize(20),
    },
    ticketItem: {
        flex: 1,
        fontSize: getFontSize(14),
        color: colors.lightText,
        lineHeight: getFontSize(20),
    },
    viewTicketButton: {
        backgroundColor: colors.secondary,
        borderRadius: getRadius(8),
        paddingVertical: getVertiPadding(14),
        paddingHorizontal: getHoriPadding(24),
        marginTop: getHeight(8),
        // Shadow for button
        shadowColor: colors.secondary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    viewTicketButtonText: {
        color: colors.black,
        fontWeight: '700',
        fontSize: getFontSize(16),
        letterSpacing: 0.5,
    },
    paymentSection: {
        marginBottom: getHeight(20),
        paddingHorizontal: getHoriPadding(15), // Match MainContainer padding
    },
    paymentRow: {
        flexDirection: 'row',
        marginBottom: getHeight(8),
        alignItems: 'flex-start',
    },
    paymentLabel: {
        fontSize: getFontSize(14),
        color: colors.black,
        fontWeight: '500',
        marginRight: getHoriPadding(8),
        minWidth: getHoriPadding(120),
    },
    paymentValue: {
        flex: 1,
        fontSize: getFontSize(14),
        color: colors.black,
        lineHeight: getFontSize(20),
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.red,
        borderRadius: getRadius(8),
        paddingVertical: getVertiPadding(16),
        paddingHorizontal: getHoriPadding(40),
        marginBottom: getHeight(16),
        marginHorizontal: getHoriPadding(15), // Match MainContainer padding
    },
    cancelButtonText: {
        color: colors.red,
        fontWeight: '600',
        fontSize: getFontSize(16),
        letterSpacing: 0.3,
    },
    contactSupportButton: {
        alignItems: 'center',
        marginBottom: getHeight(16),
        paddingVertical: getVertiPadding(8),
        paddingHorizontal: getHoriPadding(15), // Match MainContainer padding
    },
    contactSupportText: {
        fontSize: getFontSize(14),
        color: colors.red,
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
});
