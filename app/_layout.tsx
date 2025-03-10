import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { useColorScheme } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle font loading
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [loaded]);

  // Handle authentication and navigation
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isReady || !isMounted) return;

      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup && isMounted) {
          // Use setTimeout to ensure navigation happens after mount
          setTimeout(() => {
            router.replace('/login');
          }, 0);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setTimeout(() => {
            router.replace('/login');
          }, 0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isReady, segments]);

  // Show loading screen while initializing
  if (!isReady || isLoading) {
    return (
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </ThemeProvider>
  );
}
