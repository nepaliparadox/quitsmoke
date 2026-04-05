import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '@/context/AppContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { Banknote, HeartPulse, CigaretteOff, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { userData } = useApp();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const themeColors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quitDate = new Date(userData.quitDate);
  const diffSeconds = Math.max(0, differenceInSeconds(now, quitDate));
  
  const duration = intervalToDuration({
    start: quitDate,
    end: now > quitDate ? now : quitDate,
  });

  const diffInDays = diffSeconds / (24 * 3600);
  const cigsAvoided = Math.floor(diffInDays * userData.cigsPerDay);
  const moneySaved = (cigsAvoided / userData.cigsPerPack) * userData.pricePerPack;
  const lifeRegainedMinutes = cigsAvoided * 11;
  
  const healthMetrics = [
    { label: "Blood Pressure", min: 20 / 1440 },
    { label: "Oxygen Levels", min: 8 / 24 },
    { label: "Carbon Monoxide", min: 1 },
    { label: "Circulation", min: 14 }
  ];

  const avgProgress = healthMetrics.reduce((acc, metric) => 
    acc + Math.min(1, diffInDays / metric.min), 0) / healthMetrics.length;

  const formatTime = (val?: number) => (val || 0).toString().padStart(2, '0');

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      stickyHeaderIndices={[0]}
    >
      <View>
        <View style={{ height: insets.top, backgroundColor: themeColors.tint }} />
        <LinearGradient
          colors={[themeColors.icon, themeColors.tint]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.headerTitle}>Smoke Free Journey</ThemedText>
          <ThemedText style={styles.timerSubtitle}>You've been smoke free for</ThemedText>
          
          <View style={styles.timerContainer}>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeValue}>{formatTime(duration.days)}</ThemedText>
              <ThemedText style={styles.timeLabel}>Days</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeValue}>{formatTime(duration.hours)}</ThemedText>
              <ThemedText style={styles.timeLabel}>Hours</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeValue}>{formatTime(duration.minutes)}</ThemedText>
              <ThemedText style={styles.timeLabel}>Min</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeValue}>{formatTime(duration.seconds)}</ThemedText>
              <ThemedText style={styles.timeLabel}>Sec</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ThemedView style={styles.statsGrid}>
        <StatCard 
          icon={<Banknote color={themeColors.tint} size={24} />} 
          label="Money Saved" 
          value={`${userData.currency}${moneySaved.toFixed(2)}`} 
        />
        <StatCard 
          icon={<CigaretteOff color={themeColors.tint} size={24} />} 
          label="Cigs Avoided" 
          value={cigsAvoided.toString()} 
        />
        <StatCard 
          icon={<HeartPulse color={themeColors.tint} size={24} />} 
          label="Life Regained" 
          value={formatLifeRegained(lifeRegainedMinutes)} 
        />
        <StatCard 
          icon={<TrendingUp color={themeColors.tint} size={24} />} 
          label="Health Improved" 
          value={`${(avgProgress * 100).toFixed(0)}%`} 
        />
      </ThemedView>

      {userData.savingGoal > 0 && (
        <ThemedView style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <ThemedText type="subtitle" style={styles.goalTitle}>Goal Progress</ThemedText>
            <ThemedText style={styles.goalText}>
              {userData.currency}{moneySaved.toFixed(0)} / {userData.currency}{userData.savingGoal}
            </ThemedText>
          </View>
          <View style={styles.progressBarBgLarge}>
            <View 
              style={[
                styles.progressBarFillLarge, 
                { width: `${Math.min(100, (moneySaved / userData.savingGoal) * 100)}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.goalRemaining}>
            {moneySaved >= userData.savingGoal 
              ? "Goal Achieved! 🎉" 
              : `${userData.currency}${(userData.savingGoal - moneySaved).toFixed(2)} remaining`}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Health Improvements</ThemedText>
        <HealthProgress 
           label="Blood Pressure" 
           progress={Math.min(1, diffInDays / (20/1440))} // 20 mins
           timeframe="20 minutes"
        />
        <HealthProgress 
           label="Oxygen Levels" 
           progress={Math.min(1, diffInDays / (8/24))} // 8 hours
           timeframe="8 hours"
        />
        <HealthProgress 
           label="Carbon Monoxide" 
           progress={Math.min(1, diffInDays / 1)} // 24 hours
           timeframe="24 hours"
        />
        <HealthProgress 
           label="Circulation" 
           progress={Math.min(1, diffInDays / 14)} // 2 weeks
           timeframe="2 weeks"
        />
      </ThemedView>
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <ThemedView style={styles.statCard}>
      <View style={styles.iconContainer}>{icon}</View>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </ThemedView>
  );
}

function HealthProgress({ label, progress, timeframe }: { label: string, progress: number, timeframe: string }) {
  const isComplete = progress >= 1;
  return (
    <View style={styles.healthItem}>
      <View style={styles.healthInfo}>
        <ThemedText style={styles.healthLabel}>{label}</ThemedText>
        <ThemedText style={styles.healthTime}>{isComplete ? 'Restored!' : timeframe}</ThemedText>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }, isComplete && styles.progressComplete]} />
      </View>
    </View>
  );
}

function formatLifeRegained(minutes: number) {
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;
  return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20, // Reduced since we have status bar spacer
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  timerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  timeSeparator: {
    fontSize: 24,
    color: '#fff',
    marginTop: -15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    marginTop: 10,
  },
  statCard: {
    width: (width - 40) / 2,
    margin: 5,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    backgroundColor: 'rgba(82, 183, 136, 0.1)',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthItem: {
    marginBottom: 20,
  },
  healthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontWeight: '500',
  },
  healthTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#52B788', // This stays green as a global success color or we can use themeColors.success if we want
  },
  progressComplete: {
    backgroundColor: '#2D6A4F',
  },
  goalSection: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 183, 136, 0.1)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  progressBarBgLarge: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFillLarge: {
    height: '100%',
    backgroundColor: '#52B788',
  },
  goalRemaining: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  }
});
