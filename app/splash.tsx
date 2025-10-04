import { Cairo_400Regular, useFonts } from "@expo-google-fonts/cairo";
import AppLoading from 'expo-app-loading';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from "react-native";
import SlideButton from '../components/SlideButton';

export default function Splash() {
    const [fontsLoaded] = useFonts({
        Cairo_400Regular,
    });

    if (!fontsLoaded) return <AppLoading />;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#004d40', '#00897b', '#4db6ac']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" />
            <View style={styles.content}>
                <View style={styles.centerContent}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../assets/images/kelp-splash-icon.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Kelp</Text>
                </View>
                
                <SlideButton />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    centerContent: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        elevation: 10,
    },
    logo: {
        width: 220,
        height: 220,
    },
    title: {
        fontFamily: "Cairo_400Regular",
        fontSize: 56,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Cairo_400Regular",
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
});
