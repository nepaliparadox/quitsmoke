import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useApp } from '@/context/AppContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlertCircle, History, Send, Cigarette } from 'lucide-react-native';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const { logSmoking, userData } = useApp();
  const [why, setWhy] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const SCARY_FACTS = [
    "Every single cigarette you smoke costs you about 11 minutes of your life. Was it worth those 11 minutes?",
    "Tobacco smoke contains over 7,000 chemicals, at least 70 of which are known to cause cancer.",
    "Smoking causes 1 out of every 5 deaths in the world. It is a slow, painful path.",
    "Within seconds, the carbon monoxide in that cigarette has reduced the oxygen in your bloodstream.",
    "Smoking narrows your arteries, making it harder for your heart to pump blood. Heart failure is real.",
    "The tar you just inhaled is now coating your lungs like black soot in a chimney.",
    "Are your parents happy with you smoking? How would they feel seeing you destroy your health?",
    "Who will take care of your family if you're not around? Think about the burden you'll leave behind.",
    "Is the smell of tobacco worth the rejection of those you love? You are pushing people away.",
    "You’re literally paying companies to kill you. You are funding your own destruction.",
    "Your future self is screaming at you to stop. Why aren't you listening to your own survival instinct?",
    "One cigarette today is a hospital bed tomorrow. It's not 'just one'.",
    "You are burning your hard-earned money and your health at the same time. Both are going up in smoke.",
    "Imagine the look on your family's face if they found out you relapsed. The disappointment is real.",
    "Is this how you want to be remembered? As someone who gave up on their health for a habit?",
    "Every puff is a nail in your own coffin. How many more do you need before it's finished?",
    "Smoking doesn't solve stress; it just adds the terrifying stress of dying young and painfully.",
    "Your lungs are begging for clean air. Why are you punishing them with every single inhale?",
    "You are trading decades of retirement and family time for minutes of a chemical buzz.",
    "Think of those who died from lung cancer. They would give anything for the healthy lungs you're ruining.",
    "Smoking makes you age faster on the outside and rot faster on the inside. You can see it in the mirror.",
    "You are a slave to a small stick of tobacco. When will you finally choose to be free?",
    "Your children are watching you. Is this the 'healthy' example you want them to follow?",
    "The market price of a pack is nothing compared to the 100% cost of chemotherapy and surgery.",
    "Every slip-up is a step closer to a heart attack. You are playing a lethal game of chance with your heart.",
    "You promised yourself you'd stop. Is a piece of paper and leaf really stronger than your own word?",
    "If you died today because of this addiction, what would be your biggest, final regret?",
    "Smoking damages your DNA, which can lead to the uncontrollable growth of cells—cancer.",
    "That one cigarette has already increased your risk of a sudden, fatal stroke.",
    "Smoking is the leading cause of preventable blindness. You are literally losing your sight.",
    "Your lungs are losing their elasticity. Every breath you take will soon become a struggle.",
    "Smoking causes premature aging. Your skin is thinning and wrinkling faster with every puff.",
    "Tobacco use is linked to 15 different types of cancer, not just in your lungs.",
    "Secondhand smoke kills. You aren't just hurting yourself; you're hurting everyone around you.",
    "Smoking can cause your bones to become brittle and break much more easily.",
    "Cigarettes weaken your immune system. Your body is now less able to fight off even simple infections.",
    "Smoking causes permanent damage to your heart's muscle and its valves.",
    "The toxins in tobacco smoke reach every single organ in your body within minutes.",
    "Smoking significantly increases your risk of developing type 2 diabetes and its complications.",
    "Chronic Obstructive Pulmonary Disease (COPD) is a slow death by suffocation. That's where you're headed.",
    "Smoking causes erectile dysfunction in men and reduced fertility in women. It kills your future.",
    "Think about your family. Is this the example you want to set for those who love you?",
    "Every puff is a choice to ignore the damage you are doing to your own future."
  ];

  const showAlert = (title: string, message: string, type: 'success' | 'error') => {
    setModalContent({ title, message, type });
    setModalVisible(true);
  };

  const handleLog = () => {
    const words = why.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    if (wordCount < 5) {
      showAlert(
        "Observation needed",
        "Please provide more detail (at least 5 words). Why did you smoke?",
        'error'
      );
      return;
    }

    logSmoking(why.trim());
    setWhy('');
    
    const randomFact = SCARY_FACTS[Math.floor(Math.random() * SCARY_FACTS.length)];
    showAlert("Slip-up Logged", randomFact, 'success');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <View style={{ height: insets.top, backgroundColor: Colors[colorScheme].background }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <View style={styles.iconCircle}>
            <Cigarette color="#fff" size={32} />
          </View>
          <ThemedText type="title" style={styles.title}>Don't lie, log it here</ThemedText>
          <ThemedText style={styles.subtitle}>Be honest with yourself. Understanding your triggers is the first step to overcoming them.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputSection}>
          <ThemedText style={styles.label}>WHY DID YOU SMOKE TODAY?</ThemedText>
          <TextInput
            style={[
              styles.input, 
              { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }
            ]}
            placeholder="e.g., I was feeling stressed at work..."
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'}
            multiline
            numberOfLines={4}
            value={why}
            onChangeText={setWhy}
          />
          <View style={styles.wordCountContainer}>
            <AlertCircle size={14} color={why.trim().split(/\s+/).filter(w => w.length > 0).length < 5 ? "#ff4d4d" : "#52B788"} />
            <ThemedText style={[
              styles.wordCount, 
              { color: why.trim().split(/\s+/).filter(w => w.length > 0).length < 5 ? "#ff4d4d" : "#52B788" }
            ]}>
              {why.trim().split(/\s+/).filter(w => w.length > 0).length} / 5 words minimum
            </ThemedText>
          </View>

          <TouchableOpacity 
            style={[styles.logButton, { backgroundColor: Colors[colorScheme].tint }]} 
            onPress={handleLog}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.logButtonText}>Log Slip-up</ThemedText>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </ThemedView>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <History size={20} color={Colors[colorScheme].tabIconDefault} />
            <ThemedText style={styles.historyTitle}>Recent Slip-ups</ThemedText>
          </View>

          {userData.logs.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No logs yet. Keep it up! 🌟</ThemedText>
            </ThemedView>
          ) : (
            userData.logs.map((log) => (
              <ThemedView key={log.id} style={styles.logItem}>
                <View style={styles.logDateContainer}>
                  <ThemedText style={styles.logDate}>
                    {format(new Date(log.date), 'MMM d, h:mm a')}
                  </ThemedText>
                </View>
                <ThemedText style={styles.logWhy}>{log.why}</ThemedText>
              </ThemedView>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={[styles.modalIcon, { backgroundColor: modalContent.type === 'success' ? '#52B788' : '#ff4d4d' }]}>
              {modalContent.type === 'success' ? <Send color="#fff" size={24} /> : <AlertCircle color="#fff" size={24} />}
            </View>
            <ThemedText style={styles.modalTitle}>{modalContent.title}</ThemedText>
            <ThemedText style={styles.modalMessage}>{modalContent.message}</ThemedText>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: modalContent.type === 'success' ? '#2D6A4F' : '#ff4d4d' }]}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.modalButtonText}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  inputSection: {
    padding: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 183, 136, 0.05)',
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.5,
    marginBottom: 15,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  logButton: {
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
    shadowColor: "#2D6A4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  historySection: {
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyText: {
    opacity: 0.4,
    fontStyle: 'italic',
  },
  logItem: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
  },
  logDateContainer: {
    marginBottom: 5,
  },
  logDate: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  logWhy: {
    fontSize: 15,
    lineHeight: 22,
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
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
