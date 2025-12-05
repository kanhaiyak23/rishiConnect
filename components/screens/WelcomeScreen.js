import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withRepeat
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { signInWithGoogle } from '../redux/slices/authSlice'
import { Ionicons } from '@expo/vector-icons'
import { Button } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from 'expo-linear-gradient'
import { useBottomSheet } from '../../context/BottomSheetContext'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

// Custom Confetti Component
const ConfettiParticle = ({ delay }) => {
  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(Math.random() * 300 - 150);

  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9333EA'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 100 + "%"; // Random horizontal start position

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(800, { duration: 2000 + Math.random() * 1000 })
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1000 }), -1)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` }
    ]
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -50,
          left: startX,
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
        },
        animatedStyle
      ]}
    />
  );
};

const ConfettiSystem = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => i);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((i) => (
        <ConfettiParticle key={i} delay={Math.random() * 1000} />
      ))}
    </View>
  );
};

export default function WelcomeScreen({ navigation }) {
  const animationRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { showBottomSheet } = useBottomSheet();

  const handlePress = () => {
    console.log("Celebrate button pressed!");
    setVisible(true);

    // Play animation
    setTimeout(() => {
      console.log("Playing animation...");
      animationRef.current?.play();
    }, 50);

    // Hide after done (90 frames @ 30fps ≈ 3 sec)
    setTimeout(() => {
      console.log("Hiding animation...");
      setVisible(false);
    }, 3000);
  };
  const dispatch = useDispatch()
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const descOpacity = useSharedValue(0)
  const button1Opacity = useSharedValue(0)
  const button1Scale = useSharedValue(0.8)
  const button2Opacity = useSharedValue(0)
  const button2Scale = useSharedValue(0.8)

  useEffect(() => {
    logoScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }))
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 500 }))
    descOpacity.value = withDelay(250, withTiming(1, { duration: 400 }))

    // Buttons animate in quickly with fade + scale
    button1Opacity.value = withDelay(400, withTiming(1, { duration: 400 }))
    button1Scale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 100 }))

    button2Opacity.value = withDelay(450, withTiming(1, { duration: 400 }))
    button2Scale.value = withDelay(450, withSpring(1, { damping: 10, stiffness: 100 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }))

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Opacity.value,
    transform: [{ scale: button1Scale.value }],
  }))

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Opacity.value,
    transform: [{ scale: button2Scale.value }],
  }))



  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      showBottomSheet('Error', error || 'Failed to sign in with Google')
    }
  }



  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/iconf.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        <Text style={styles.appName}>RishiConnect</Text>
        <Animated.Text style={[styles.description, descStyle]}>
          Let's dive in into your account!
        </Animated.Text>
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedTouchable
          style={[styles.socialButton, button1Style]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.socialButtonContent}>
            <Image
              source={require('../../assets/google-logo.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </View>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.loginButtonContainer, button2Style]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </LinearGradient>
        </AnimatedTouchable>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>
            Don't have an account? <Text style={styles.signUpLinkText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
        {/* <Button title="Celebrate 🎉" onPress={handlePress} /> */}


      </View>
      {visible && <ConfettiSystem />}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 20,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    color: '#999999',
    fontSize: 16,
  },
  signUpLinkText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
})
