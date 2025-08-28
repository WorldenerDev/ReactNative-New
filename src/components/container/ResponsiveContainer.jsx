import React from 'react';
import {
    TouchableWithoutFeedback,
    Keyboard,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MainContainer from './MainContainer';

const ResponsiveContainer = React.memo(({ children, loader = false }) => {
    return (
        <MainContainer loader={loader}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 40 : 100}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {children}
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        </MainContainer>
    );
});

export default ResponsiveContainer;

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    contentWrapper: {
        flex: 1,
    },
});
