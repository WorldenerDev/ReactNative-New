import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
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
import { getOrderDetails, getRefundPolicies, cancelOrderItem } from '@api/services/mainServices';
import { showToast } from '@components/AppToast';

const BookingDetails = ({ navigation, route }) => {
    const { orderId, bookingId } = route?.params || {};
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [orderData, setOrderData] = useState(null); // Store full order data for cancellation
    const [cancelling, setCancelling] = useState(false);
    const [cancellableByDate, setCancellableByDate] = useState(null); // Store raw date for comparison

    // Fetch order details on mount
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                showToast('error', 'Order ID is required');
                return;
            }

            try {
                setLoading(true);
                const response = await getOrderDetails(orderId);

                if (response?.success && response?.data) {
                    // Transform API response to match component structure
                    const orderData = response.data;
                    setOrderData(orderData); // Store full order data for cancellation
                    const musementData = orderData?.musement_data;
                    const items = musementData?.items || [];

                    // Get title from first item's product
                    const firstItem = items[0];
                    const title = firstItem?.product?.title || 'N/A';

                    // Format date from first item's product date (format: "2025-11-19 09:00")
                    const productDate = firstItem?.product?.date;
                    let formattedDate = 'N/A';
                    if (productDate) {
                        try {
                            const dateObj = new Date(productDate);
                            formattedDate = dateObj.toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        } catch (e) {
                            formattedDate = productDate;
                        }
                    }

                    // Build options string from price feature and meeting point
                    const priceFeature = firstItem?.product?.price_tag?.price_feature || '';
                    const meetingPoint = firstItem?.product?.meeting_point || '';
                    const timeMatch = productDate?.match(/\d{2}:\d{2}/);
                    const time = timeMatch ? timeMatch[0] : '';
                    const options = [priceFeature, time, meetingPoint].filter(Boolean).join(' - ') || 'N/A';

                    // Transform items to tickets array
                    const tickets = items.map(item => {
                        const ticketHolder = item?.product?.price_tag?.ticket_holder || 'Ticket';
                        // ticket_holder already contains age range like "Child (3-10)", so use it as-is
                        // Extract just the type name (without age range) for cleaner display
                        const typeMatch = ticketHolder.match(/^([^(]+)/);
                        const type = typeMatch ? typeMatch[1].trim() : ticketHolder;
                        // Extract age range from ticket_holder if available (format: "Child (3-10)" -> "3-10")
                        const ageRangeMatch = ticketHolder.match(/\(([^)]+)\)/);
                        const ageRange = ageRangeMatch ? ageRangeMatch[1] : '';

                        return {
                            type: type,
                            quantity: item?.quantity || 1,
                            ageRange: ageRange,
                        };
                    });

                    // Format purchased date
                    let formattedPurchasedOn = 'N/A';
                    if (orderData?.createdAt) {
                        try {
                            const dateObj = new Date(orderData.createdAt);
                            formattedPurchasedOn = dateObj.toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        } catch (e) {
                            formattedPurchasedOn = orderData.createdAt;
                        }
                    }

                    // Initialize booking data
                    setBookingData({
                        title: title,
                        date: formattedDate,
                        options: options,
                        tickets: tickets,
                        transactionId: orderData?.order_identifier || orderData?.order_id || orderId,
                        purchasedOn: formattedPurchasedOn,
                        cancellableBy: 'N/A', // Will be updated after refund policies API call
                    });

                    // Fetch refund policies after order details are loaded
                    const orderUuid = musementData?.uuid;
                    const orderItemUuid = firstItem?.uuid;

                    if (orderUuid && orderItemUuid) {
                        try {
                            const refundResponse = await getRefundPolicies({
                                orderUuid: orderUuid,
                                orderItemUuid: orderItemUuid,
                            });

                            if (refundResponse?.success && refundResponse?.data?.length > 0) {
                                // Get the first refund policy's applicable_until date
                                const applicableUntil = refundResponse.data[0]?.applicable_until;
                                let formattedCancellableBy = 'N/A';

                                if (applicableUntil) {
                                    try {
                                        // Format: "2025-11-18 09:00"
                                        const dateObj = new Date(applicableUntil);
                                        formattedCancellableBy = dateObj.toLocaleString('en-US', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });
                                        // Store raw date for comparison
                                        setCancellableByDate(dateObj);
                                    } catch (e) {
                                        formattedCancellableBy = applicableUntil;
                                    }
                                }

                                // Update booking data with cancellable by date
                                setBookingData(prev => ({
                                    ...prev,
                                    cancellableBy: formattedCancellableBy,
                                }));
                            }
                        } catch (refundError) {
                            console.error('Error fetching refund policies:', refundError);
                            // Don't show error toast for refund policies, just log it
                        }
                    }
                } else {
                    showToast('error', response?.message || 'Failed to fetch order details');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                showToast('error', error?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleViewTicket = () => {
        // Handle view ticket action
    };

    const handleCancel = () => {
        if (!orderData) {
            showToast('error', 'Order data not available');
            return;
        }

        // Check if cancellation is allowed by comparing current date with cancellableBy date
        if (cancellableByDate) {
            const now = new Date();
            if (now > cancellableByDate) {
                Alert.alert(
                    'Cancellation Not Allowed',
                    'The cancellation deadline has passed. Cancellation is not allowed at this time.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        const musementData = orderData?.musement_data;
        const orderUuid = musementData?.uuid;
        const items = musementData?.items || [];

        if (!orderUuid || items.length === 0) {
            showToast('error', 'Unable to cancel: Order information incomplete');
            return;
        }

        // Get the first item's UUID for cancellation
        const firstItem = items[0];
        const orderItemUuid = firstItem?.uuid;

        if (!orderItemUuid) {
            showToast('error', 'Unable to cancel: Order item information incomplete');
            return;
        }

        // Show confirmation dialog
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancelling(true);
                            const response = await cancelOrderItem({
                                orderUuid: orderUuid,
                                orderItemUuid: orderItemUuid,
                                cancellation_reason: 'CANCELLED-BY-CUSTOMER',
                                cancellation_additional_info: 'Customer requested cancellation and refund started.',
                            });

                            if (response?.success) {
                                showToast('success', 'Booking cancelled successfully');
                                // Optionally navigate back or refresh data
                                navigation.goBack();
                            } else {
                                showToast('error', response?.message || 'Failed to cancel booking');
                            }
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            showToast('error', error?.message || 'Something went wrong while cancelling');
                        } finally {
                            setCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    const handleContactSupport = () => {
        // Handle contact support action
    };

    if (!bookingData) {
        return (
            <MainContainer>
                <Header showBack={true} title={bookingId || 'Booking Details'} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>No booking details found</Text>
                </View>
            </MainContainer>
        );
    }

    return (
        <MainContainer loader={loading}>
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
                    {bookingData.tickets && bookingData.tickets.length > 0 && (
                        <View style={styles.ticketsSection}>
                            <Text style={styles.ticketsLabel}>Tickets:</Text>
                            {bookingData.tickets.map((ticket, index) => (
                                <View key={index} style={styles.ticketRow}>
                                    <Text style={styles.ticketBullet}>•</Text>
                                    <Text style={styles.ticketItem}>
                                        {ticket.quantity || 1}x {ticket.type || ticket.name || 'Ticket'}
                                        {ticket.ageRange && ` (${ticket.ageRange})`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

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
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Cancellable by:</Text>
                        <Text style={styles.paymentValue}>{bookingData.cancellableBy}</Text>
                    </View>
                </View>

                {/* Cancel Button */}
                <ButtonComp
                    title={cancelling ? "Cancelling..." : "Cancel"}
                    onPress={handleCancel}
                    disabled={cancelling || !orderData}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: getHeight(40),
    },
    errorText: {
        fontSize: getFontSize(16),
        color: colors.red,
        textAlign: 'center',
    },
});
