import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { userData, isLoading } = useApp();
  const systemColorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const isOnOnboarding = segments[0] === 'onboarding';

    if (!userData.onboarded && !isOnOnboarding) {
      router.replace('/onboarding');
    } else if (userData.onboarded && isOnOnboarding) {
      router.replace('/(tabs)');
    }
  }, [userData.onboarded, isLoading, segments]);

  if (isLoading) return null;
  
  const isDark = userData.theme === 'system' 
    ? systemColorScheme === 'dark' 
    : userData.theme === 'dark';

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  return (
    <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutInner />
      </AppProvider>
    </SafeAreaProvider>
  );
}
