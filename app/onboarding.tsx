import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Dimensions, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/AppContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Cigarette, 
  Banknote, 
  Target, 
  ChevronRight, 
  ChevronLeft,
  CircleDollarSign,
  Package
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    id: 'currency',
    title: 'Choose Currency',
    subtitle: 'Which currency do you use for buying cigarettes?',
    icon: (color: string) => <CircleDollarSign color={color} size={48} />,
    field: 'currency',
    type: 'text',
    placeholder: 'e.g., $, £, €, Rs',
    keyboardType: 'default',
  },
  {
    id: 'cigsPerDay',
    title: 'Smoking Habit',
    subtitle: 'How many cigarettes did you smoke per day?',
    icon: (color: string) => <Cigarette color={color} size={48} />,
    field: 'cigsPerDay',
    type: 'number',
    placeholder: '10',
    keyboardType: 'numeric',
  },
  {
    id: 'cigsPerPack',
    title: 'Pack Size',
    subtitle: 'How many cigarettes are in one pack?',
    icon: (color: string) => <Package color={color} size={48} />,
    field: 'cigsPerPack',
    type: 'number',
    placeholder: '20',
    keyboardType: 'numeric',
  },
  {
    id: 'pricePerPack',
    title: 'Price per Pack',
    subtitle: 'How much does a single pack cost?',
    icon: (color: string) => <Banknote color={color} size={48} />,
    field: 'pricePerPack',
    type: 'number',
    placeholder: '15',
    keyboardType: 'numeric',
  },
  {
    id: 'savingGoal',
    title: 'Saving Goal',
    subtitle: 'What is your first goal amount to save?',
    icon: (color: string) => <Target color={color} size={48} />,
    field: 'savingGoal',
    type: 'number',
    placeholder: '100',
    keyboardType: 'numeric',
  },
];

const CURRENCIES = ['$', '€', '£', 'Rs', 'रू', 'AED', 'AUD', 'CAD'];

export default function OnboardingScreen() {
  const { updateUserData } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const themeColors = Colors[colorScheme];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    currency: '$',
    cigsPerDay: '10',
    cigsPerPack: '20',
    pricePerPack: '15',
    savingGoal: '100',
  });

  const fadeAnim = useState(new Animated.Value(1))[0];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      fadeOutIn(() => setCurrentStep(currentStep + 1));
    } else {
      const finalData = {
        currency: formData.currency,
        cigsPerDay: parseInt(formData.cigsPerDay) || 10,
        cigsPerPack: parseInt(formData.cigsPerPack) || 20,
        pricePerPack: parseFloat(formData.pricePerPack) || 15,
        savingGoal: parseFloat(formData.savingGoal) || 100,
        onboarded: true,
        quitDate: new Date().toISOString(),
      };
      updateUserData(finalData);
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      fadeOutIn(() => setCurrentStep(currentStep - 1));
    }
  };

  const fadeOutIn = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const step = STEPS[currentStep];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <LinearGradient
        colors={[themeColors.tint + '15', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingTop: insets.top + 50 }]}>
            {/* Progress Bar - Positioned with safe area in mind */}
            <View style={styles.progressContainer}>
              {STEPS.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.progressDot, 
                    { backgroundColor: index <= currentStep ? themeColors.tint : themeColors.border + '40' }
                  ]} 
                />
              ))}
            </View>

            <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
              <View style={[styles.iconContainer, { backgroundColor: themeColors.tint + '15' }]}>
                {step.icon(themeColors.tint)}
              </View>

              <ThemedText type="title" style={styles.title}>{step.title}</ThemedText>
              <ThemedText style={styles.subtitle}>{step.subtitle}</ThemedText>

              <View style={styles.inputWrapper}>
                {step.id === 'currency' ? (
                  <View style={styles.currencyGrid}>
                    {CURRENCIES.map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[
                          styles.currencyItem,
                          { borderColor: themeColors.border },
                          formData.currency === curr && { backgroundColor: themeColors.tint, borderColor: themeColors.tint }
                        ]}
                        onPress={() => setFormData({ ...formData, currency: curr })}
                      >
                        <ThemedText style={[
                          styles.currencyText,
                          formData.currency === curr && { color: '#fff' }
                        ]}>
                          {curr}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: themeColors.text, 
                        borderColor: themeColors.border,
                        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                      }
                    ]}
                    placeholder={step.placeholder}
                    placeholderTextColor={colorScheme === 'dark' ? '#555' : '#ccc'}
                    keyboardType={step.keyboardType as any}
                    value={formData[step.field as keyof typeof formData]}
                    onChangeText={(val) => setFormData({ ...formData, [step.field]: val })}
                    autoFocus={Platform.OS !== 'web'}
                    selectTextOnFocus
                  />
                )}
              </View>
            </Animated.View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
              <TouchableOpacity 
                style={[
                  styles.backButton, 
                  { borderColor: themeColors.border, opacity: currentStep === 0 ? 0 : 1 }
                ]} 
                onPress={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft color={themeColors.text} size={24} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nextButton, { backgroundColor: themeColors.tint }]} 
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>
                  {currentStep === STEPS.length - 1 ? 'Start Journey' : 'Next'}
                </ThemedText>
                <ChevronRight color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  stepContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 30,
    lineHeight: 22,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 300,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  currencyItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 54,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    width: 54,
    height: 54,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
