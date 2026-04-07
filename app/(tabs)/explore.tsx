import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Modal, Linking } from 'react-native';
import { useApp } from '@/context/AppContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Sun, Moon, Monitor, Trash2 } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { userData, updateUserData, resetData } = useApp();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const handleUpdate = (key: string, value: any) => {
    updateUserData({ [key]: value });
  };

  const handleReset = () => {
    setResetModalVisible(true);
  };

  const confirmReset = () => {
    resetData();
    setResetModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <View style={{ height: insets.top, backgroundColor: Colors[colorScheme].background }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={styles.subtitle}>Personalize your journey</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionLabel}>CIGARETTE INFO</ThemedText>
          <InputRow 
            label="Cigarettes per day" 
            value={(userData.cigsPerDay ?? 0).toString()} 
            onChangeText={(text: string) => handleUpdate('cigsPerDay', parseInt(text) || 0)}
            keyboardType="numeric"
          />
          <InputRow 
            label="Cigarettes per pack" 
            value={(userData.cigsPerPack ?? 0).toString()} 
            onChangeText={(text: string) => handleUpdate('cigsPerPack', parseInt(text) || 0)}
            keyboardType="numeric"
          />
          <InputRow 
            label="Price per pack" 
            value={(userData.pricePerPack ?? 0).toString()} 
            onChangeText={(text: string) => handleUpdate('pricePerPack', parseFloat(text) || 0)}
            keyboardType="numeric"
            prefix={userData.currency}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionLabel}>GOALS & CURRENCY</ThemedText>
          <InputRow 
            label="Savings Goal" 
            value={(userData.savingGoal ?? 0).toString()} 
            onChangeText={(text: string) => handleUpdate('savingGoal', parseFloat(text) || 0)}
            keyboardType="numeric"
            prefix={userData.currency}
          />
          <ThemedText style={styles.subSectionLabel}>Select Currency</ThemedText>
          <View style={styles.currencyGrid}>
            {['$', 'रू', '₹', '€', '£', '¥'].map((curr) => (
              <TouchableOpacity 
                key={curr}
                style={[
                  styles.currencyButton, 
                  userData.currency === curr && { backgroundColor: Colors[colorScheme].tint }
                ]}
                onPress={() => handleUpdate('currency', curr)}
              >
                <ThemedText style={[styles.currencyText, userData.currency === curr && styles.currencyTextActive]}>
                  {curr}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionLabel}>APPEARANCE</ThemedText>
          <View style={styles.themeRow}>
            <ThemeButton 
              active={userData.theme === 'light'} 
              onPress={() => handleUpdate('theme', 'light')}
              icon={<Sun size={20} color={userData.theme === 'light' ? '#fff' : Colors[colorScheme].text} />}
              label="Light"
              tint={Colors[colorScheme].tint}
            />
            <ThemeButton 
              active={userData.theme === 'dark'} 
              onPress={() => handleUpdate('theme', 'dark')}
              icon={<Moon size={20} color={userData.theme === 'dark' ? '#fff' : Colors[colorScheme].text} />}
              label="Dark"
              tint={Colors[colorScheme].tint}
            />
            <ThemeButton 
              active={userData.theme === 'system'} 
              onPress={() => handleUpdate('theme', 'system')}
              icon={<Monitor size={20} color={userData.theme === 'system' ? '#fff' : Colors[colorScheme].text} />}
              label="System"
              tint={Colors[colorScheme].tint}
            />
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionLabel}>DANGER ZONE</ThemedText>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Trash2 size={20} color="#ff4d4d" />
            <ThemedText style={styles.resetText}>Reset All Data</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            QuitSmoke v{Constants.expoConfig?.version || '1.0.0'}
          </ThemedText>
          <TouchableOpacity 
            style={{ width: '100%', alignItems: 'center' }}
            onPress={() => Linking.openURL('https://github.com/nepaliparadox/quitsmoke')}
          >
            <ThemedText style={[styles.footerText, { color: Colors[colorScheme].tint, marginTop: 5, textDecorationLine: 'underline' }]}>
              github.com/nepaliparadox/quitsmoke
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Reset Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#ff4d4d', marginTop: -10 }]}>
              <Trash2 color="#fff" size={32} />
            </View>
            <ThemedText style={styles.modalTitle}>Wait!</ThemedText>
            <ThemedText style={styles.modalMessage}>Are you sure you wanna quit looser?</ThemedText>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: themeColors.tint }]}
                onPress={() => setResetModalVisible(false)}
              >
                <ThemedText style={styles.modalButtonText}>I won't lose I win</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: 'rgba(255, 77, 77, 0.1)', marginTop: 10 }]}
                onPress={confirmReset}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#ff4d4d' }]}>I am a looser</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InputRow({ label, value, onChangeText, keyboardType, prefix }: any) {
  const colorScheme = useColorScheme();
  return (
    <View style={styles.inputRow}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <View style={styles.inputContainer}>
        {prefix && <ThemedText style={styles.prefix}>{prefix}</ThemedText>}
          <TextInput 
            style={[styles.textInput, { color: Colors[colorScheme].tint }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholderTextColor="#999"
          />
      </View>
    </View>
  );
}

function ThemeButton({ active, onPress, icon, label, tint }: any) {
  return (
    <TouchableOpacity 
      style={[styles.themeButton, active && { backgroundColor: tint }]} 
      onPress={onPress}
    >
      <View style={styles.themeIcon}>
        {icon}
      </View>
      <ThemedText style={[styles.themeLabel, active && styles.themeLabelActive]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.4,
    marginBottom: 15,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    flex: 1, // Allow label to take available space
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: 130, // Increased to fit labels properly
    height: 45,
  },
  prefix: {
    marginRight: 4,
    opacity: 0.5,
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    height: 45,
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 16,
  },
  subSectionLabel: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.5,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyActive: {
  },
  currencyText: {
    fontSize: 18,
  },
  currencyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4, // Added small padding
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  themeButtonActive: {
  },
  themeIcon: {
    marginBottom: 5,
  },
  themeLabel: {
    fontSize: 11, // Reduced from 12
    opacity: 0.7,
  },
  themeLabelActive: {
    color: '#fff',
    opacity: 1,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    gap: 10,
  },
  resetText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#ff4d4d',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: "#ff4d4d",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
  },
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.3,
    textAlign: 'center',
  }
});
