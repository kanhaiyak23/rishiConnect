import React, { useEffect,useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withDelay,
    withRepeat,
    withSequence
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { CurvedNotch } from "./Curvednotch"

const { width, height } = Dimensions.get('window')
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function OnboardingScreen({ navigation }) {
    const phoneScale = useSharedValue(0)
    const phoneOpacity = useSharedValue(0)
    const titleOpacity = useSharedValue(0)
    const titleTranslateY = useSharedValue(30)
    const descOpacity = useSharedValue(0)
    const descTranslateY = useSharedValue(30)
    const buttonOpacity = useSharedValue(0)
    const buttonScale = useSharedValue(0.8)

    // Heart animations
    const heart1Scale = useSharedValue(0)
    const heart2Scale = useSharedValue(0)
    const heart3Scale = useSharedValue(0)
    const heart4Scale = useSharedValue(0)
    const heart5Scale = useSharedValue(0)
    const heart6Scale = useSharedValue(0)
    console.log(width)


    useEffect(() => {
        // Phone animation
        phoneScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }))
        phoneOpacity.value = withDelay(200, withTiming(1, { duration: 600 }))

        // Title animation
        titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }))
        titleTranslateY.value = withDelay(600, withSpring(0, { damping: 10, stiffness: 100 }))

        // Description animation
        descOpacity.value = withDelay(800, withTiming(1, { duration: 500 }))
        descTranslateY.value = withDelay(800, withSpring(0, { damping: 10, stiffness: 100 }))

        // Button animation
        buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }))
        buttonScale.value = withDelay(1000, withSpring(1, { damping: 10, stiffness: 100 }))

        // Floating hearts with continuous animation
        const heartAnimation = (heartValue, delay) => {
            heartValue.value = withDelay(
                delay,
                withSequence(
                    withSpring(1, { damping: 8 }),
                    withRepeat(
                        withSequence(
                            withTiming(1.15, { duration: 1000 }),
                            withTiming(1, { duration: 1000 })
                        ),
                        -1,
                        false
                    )
                )
            )
        }

        heartAnimation(heart1Scale, 1100)
        heartAnimation(heart2Scale, 1200)
        heartAnimation(heart3Scale, 1300)
        heartAnimation(heart4Scale, 1150)
        heartAnimation(heart5Scale, 1250)
        heartAnimation(heart6Scale, 1350)
    }, [])

    const phoneStyle = useAnimatedStyle(() => ({
        transform: [{ scale: phoneScale.value }],
        opacity: phoneOpacity.value,
    }))

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }))

    const descStyle = useAnimatedStyle(() => ({
        opacity: descOpacity.value,
        transform: [{ translateY: descTranslateY.value }],
    }))

    const buttonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ scale: buttonScale.value }],
    }))

    const createHeartStyle = (heartValue) => useAnimatedStyle(() => ({
        transform: [{ scale: heartValue.value }],
    }))

    return (
        <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.container}
        >
            {/* Top section with phone mockup */}
            <View style={styles.topSection}>
                <Animated.View style={[styles.phoneFrame, phoneStyle]}>
                    {/* Phone notch */}
                    <View style={styles.phoneNotch} />

                    {/* Phone screen */}
                    <View style={styles.phoneScreen}>
                        {/* Status bar */}
                        <View style={styles.statusBar}>
                            <Text style={styles.statusTime}>9:41</Text>
                            <View style={styles.statusIcons}>
                                <Ionicons name="cellular" size={14} color="#FFFFFF" style={styles.statusIcon} />
                                <Ionicons name="wifi" size={14} color="#FFFFFF" style={styles.statusIcon} />
                                <Ionicons name="battery-full" size={14} color="#FFFFFF" />
                            </View>
                        </View>

                        {/* Match notification content */}
                        <View style={styles.matchContainer}>
                            {/* Top hearts */}
                            <View style={styles.heartsRow}>
                                <Animated.View style={createHeartStyle(heart1Scale)}>
                                    <Ionicons name="heart" size={18} color="#C084FC" />
                                </Animated.View>
                                <Animated.View style={createHeartStyle(heart2Scale)}>
                                    <Ionicons name="heart" size={24} color="#A855F7" />
                                </Animated.View>
                                <Animated.View style={createHeartStyle(heart3Scale)}>
                                    <Ionicons name="heart" size={18} color="#C084FC" />
                                </Animated.View>
                            </View>

                            {/* Match avatars with heart shapes */}
                            <View style={styles.matchAvatars}>
                                <View style={[styles.heartContainer, styles.leftHeart]}>
                                    <View style={styles.heartBorder}>
                                        <Image
                                            source={require('../../assets/male-profile.png')}
                                            style={styles.heartImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                                <View style={[styles.heartContainer, styles.rightHeart]}>
                                    <View style={styles.heartBorder}>
                                        <Image
                                            source={require('../../assets/female-profile.png')}
                                            style={styles.heartImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                            </View>
                            {/* Bottom hearts */}
                            <View style={styles.heartsRow}>
                                <Animated.View style={createHeartStyle(heart4Scale)}>
                                    <Ionicons name="heart" size={18} color="#C084FC" />
                                </Animated.View>
                                <Animated.View style={createHeartStyle(heart5Scale)}>
                                    <Ionicons name="heart" size={24} color="#A855F7" />
                                </Animated.View>
                                <Animated.View style={createHeartStyle(heart6Scale)}>
                                    <Ionicons name="heart" size={18} color="#C084FC" />
                                </Animated.View>
                            </View>

                            {/* Match text */}
                            <Text style={styles.matchTitle}>You Got the Match!</Text>
                            <Text style={styles.matchSubtitle}>
                                You both liked each other. Take charge{'\n'}and start a meaningful conversation
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
            <View style={{ position: "absolute", bottom: -1, width: "100%" }}>
                <CurvedNotch />
            </View>

            {/* Bottom content section with curved top */}
            <View style={styles.contentWrapper}>
                {/* Curved notch overlays */}
                <View style={styles.notchLeft} />
                <View style={styles.notchRight} />

                <View style={styles.contentSection}>
                    <Animated.Text style={[styles.title, titleStyle]}>
                        Find Your Perfect Match{'\n'}Today
                    </Animated.Text>

                    <Animated.Text style={[styles.description, descStyle]}>
                        Discover real connections with Datify's intelligent matchmaking. Start swiping to find your perfect match today.
                    </Animated.Text>

                    {/* Pagination dots */}
                    <View style={styles.pagination}>
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                    </View>

                    <AnimatedTouchable
                        style={[styles.continueButton, buttonStyle]}
                        onPress={() => navigation.navigate('Welcome')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </LinearGradient>
                    </AnimatedTouchable>
                </View>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSection: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 0,
    },
    phoneFrame: {
        width: width * 0.78,
        height: height * 0.52,
        backgroundColor: '#000000',
        borderRadius: 45,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
        position: 'relative',
    },
    phoneNotch: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -75,
        width: 150,
        height: 30,
        backgroundColor: '#000000',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 10,
    },
    phoneScreen: {
        flex: 1,
        backgroundColor: '#0A0A0A',
        borderRadius: 35,
        overflow: 'hidden',
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    statusTime: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    statusIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusIcon: {
        marginRight: 4,
    },
    matchContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    heartsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 20,
    },
    matchAvatars: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    heartContainer: {
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartBorder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#8B5CF6',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        transform: [{ rotate: '0deg' }],
    },
    leftHeart: {
        marginRight: -30,
        zIndex: 1,
    },
    rightHeart: {
        marginLeft: -30,
        zIndex: 2,
    },
    heartImage: {
        width: '100%',
        height: '100%',
    },
    matchTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#C084FC',
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 12,
    },
    matchSubtitle: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 30,
    },
    contentWrapper: {
        position: 'relative',
        marginTop: -40,
    },
    notchLeft: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -80,
        width: 60,
        height: 60,
        backgroundColor: '#8B5CF6',
        borderBottomRightRadius: 60,
        zIndex: 1,
    },
    notchRight: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: 20,
        width: 60,
        height: 60,
        backgroundColor: '#7C3AED',
        borderBottomLeftRadius: 60,
        zIndex: 1,
    },
    contentSection: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 50,
        paddingBottom: 40,
        alignItems: 'center',
        zIndex: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 36,
    },
    description: {
        fontSize: 15,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#333333',
    },
    activeDot: {
        width: 24,
        backgroundColor: '#8B5CF6',
    },
    continueButton: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
})
