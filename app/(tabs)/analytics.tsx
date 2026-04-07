import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useApp } from '@/context/AppContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  format, 
  eachDayOfInterval, 
  subDays, 
  isSameDay, 
  startOfDay,
  differenceInSeconds,
  isAfter,
  endOfDay
} from 'date-fns';
import { TrendingUp, Activity, Banknote, Cigarette, Target, Trophy, Heart, Shield, Star, Award, Zap, Smile, Sun, Compass, Zap as Bolt, Flame, Crown, Gem, Briefcase, Rocket, Medal } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useApp();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const themeColors = Colors[colorScheme];
  const [duration, setDuration] = useState(7);
  const [selectedPoint, setSelectedPoint] = useState<{val: string, x: number, y: number} | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const end = startOfDay(now);
    const start = subDays(end, duration - 1);
    const days = eachDayOfInterval({ start, end });

    const avoidedCigsData: number[] = [];
    const loggedCigsData: number[] = [];
    const healthProgressData: number[] = [];
    const moneySavedData: number[] = [];
    const labels: string[] = [];

    const quitDate = new Date(userData.quitDate);

    days.forEach((day, index) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const logsThisDay = userData.logs.filter(log => isSameDay(new Date(log.date), dayStart));
      loggedCigsData.push(logsThisDay.length);

      let actualAvoided = 0, dailySaved = 0, avgHealth = 0;
      if (!isAfter(quitDate, dayEnd)) {
        const effectiveStart = isAfter(quitDate, dayStart) ? quitDate : dayStart;
        const effectiveEnd = isAfter(now, dayEnd) ? dayEnd : now;
        const daysInPeriod = Math.max(0, differenceInSeconds(effectiveEnd, effectiveStart) / (24 * 3600));
        actualAvoided = Math.max(0, Math.floor(daysInPeriod * userData.cigsPerDay) - logsThisDay.length);
        dailySaved = (actualAvoided / userData.cigsPerPack) * userData.pricePerPack;
        const totalDiffInDays = Math.max(0, differenceInSeconds(effectiveEnd, quitDate) / (24 * 3600));
        const healthPoints = [Math.min(1, totalDiffInDays/(20/1440)), Math.min(1, totalDiffInDays/(8/24)), Math.min(1, totalDiffInDays/1), Math.min(1, totalDiffInDays/14)];
        avgHealth = (healthPoints.reduce((a, b) => a + b, 0) / healthPoints.length) * 100;
      }
      avoidedCigsData.push(actualAvoided);
      moneySavedData.push(dailySaved);
      healthProgressData.push(avgHealth);
      labels.push(index === 0 || index === Math.floor(days.length / 2) || index === days.length - 1 ? format(day, 'MMM d') : '');
    });

    const maxAvoided = Math.max(...avoidedCigsData) || 1;
    const maxRelapsed = Math.max(...loggedCigsData) || 1;
    const maxMoney = Math.max(...moneySavedData) || 1;

    return {
      labels,
      datasets: [
        { data: loggedCigsData.map(v => (v / maxRelapsed) * 100), color: () => '#ff4d4d', strokeWidth: 3 },
        { data: healthProgressData, color: () => '#FFD166', strokeWidth: 3 },
        { data: moneySavedData.map(v => (v / maxMoney) * 100), color: () => '#118AB2', strokeWidth: 3 },
      ],
      raw: { avoidedCigsData, loggedCigsData, healthProgressData, moneySavedData },
      totals: {
        avoided: avoidedCigsData.reduce((a, b) => a + b, 0),
        relapsed: loggedCigsData.reduce((a, b) => a + b, 0),
        health: healthProgressData[healthProgressData.length - 1],
        money: moneySavedData.reduce((a, b) => a + b, 0),
      }
    };
  }, [userData, duration]);

  const totalAvoidedAllTime = Math.max(0, Math.floor((Math.max(0, differenceInSeconds(new Date(), new Date(userData.quitDate)) / (24 * 3600))) * userData.cigsPerDay) - userData.logs.length);
  const totalSavedAllTime = (totalAvoidedAllTime / userData.cigsPerPack) * userData.pricePerPack;
  const daysClean = Math.max(0, differenceInSeconds(new Date(), new Date(userData.quitDate)) / (24 * 3600));

  const BADGES = [
    { title: 'Fresh Start', rule: 'Avoided 1st cig', icon: <Cigarette size={20} color="#52B788" />, check: totalAvoidedAllTime >= 1 },
    { title: 'Day 1', rule: '24h clean', icon: <Sun size={20} color="#FFD166" />, check: daysClean >= 1 },
    { title: 'Bronze', rule: '50 avoided', icon: <Trophy size={20} color="#CD7F32" />, check: totalAvoidedAllTime >= 50 },
    { title: 'Silver', rule: '200 avoided', icon: <Trophy size={20} color="#C0C0C0" />, check: totalAvoidedAllTime >= 200 },
    { title: 'Gold', rule: '500 avoided', icon: <Trophy size={20} color="#FFD700" />, check: totalAvoidedAllTime >= 500 },
    { title: 'Diamond', rule: '1000 avoided', icon: <Star size={20} color="#B9F2FF" />, check: totalAvoidedAllTime >= 1000 },
    { title: 'Elite', rule: '2500 avoided', icon: <Medal size={20} color="#ff4d4d" />, check: totalAvoidedAllTime >= 2500 },
    { title: 'Legend', rule: '5000 avoided', icon: <Trophy size={20} color="#FF3B30" />, check: totalAvoidedAllTime >= 5000 },
    { title: 'Titan', rule: '10k avoided', icon: <Rocket size={20} color="#52B788" />, check: totalAvoidedAllTime >= 10000 },
    { title: 'Penny Pincher', rule: `Saved 50 ${userData.currency}`, icon: <Banknote size={20} color="#118AB2" />, check: totalSavedAllTime >= 50 },
    { title: 'Big Saver', rule: `Saved 200 ${userData.currency}`, icon: <Banknote size={20} color="#118AB2" />, check: totalSavedAllTime >= 200 },
    { title: 'Wealthy', rule: `Saved 1000 ${userData.currency}`, icon: <Crown size={20} color="#FFD700" />, check: totalSavedAllTime >= 1000 },
    { title: 'Tycoon', rule: `Saved 5k ${userData.currency}`, icon: <Briefcase size={20} color="#52B788" />, check: totalSavedAllTime >= 5000 },
    { title: 'Billionaire', rule: `Saved 10k ${userData.currency}`, icon: <Gem size={20} color="#118AB2" />, check: totalSavedAllTime >= 10000 },
    { title: 'Goal Hunter', rule: '50% Saving Goal', icon: <Target size={20} color="#118AB2" />, check: totalSavedAllTime >= userData.savingGoal * 0.5 },
    { title: 'Goal Crusher', rule: '100% Saving Goal', icon: <Award size={20} color="#52B788" />, check: totalSavedAllTime >= userData.savingGoal },
    { title: 'Iron Will', rule: '1 Week Clean', icon: <Shield size={20} color="#FFD166" />, check: daysClean >= 7 && userData.logs.length === 0 },
    { title: 'Fortress', rule: '1 Month Clean', icon: <Shield size={20} color="#118AB2" />, check: daysClean >= 30 },
    { title: 'Sage', rule: '6 Months Clean', icon: <Compass size={20} color="#52B788" />, check: daysClean >= 180 },
    { title: 'Immortal', rule: '1 Year Clean', icon: <Bolt size={20} color="#FFD700" />, check: daysClean >= 365 },
    { title: 'Heartfelt', rule: 'Heart rate improved', icon: <Heart size={20} color="#ff4d4d" />, check: daysClean >= 0.5 },
    { title: 'Clear Lungs', rule: 'Breathing easier', icon: <Activity size={20} color="#52B788" />, check: daysClean >= 3 },
    { title: 'Warrior', rule: '100% Health', icon: <Flame size={20} color="#FF3B30" />, check: stats.totals.health >= 99 },
    { title: 'Zen Master', rule: 'Clean Mindset', icon: <Smile size={20} color="#52B788" />, check: totalAvoidedAllTime >= 100 },
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: themeColors.background,
    backgroundGradientTo: themeColors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity * 0.15})` : `rgba(0, 0, 0, ${opacity * 0.15})`,
    labelColor: (opacity = 1) => colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity * 0.6})` : `rgba(0, 0, 0, ${opacity * 0.6})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: themeColors.background },
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{ height: insets.top, backgroundColor: themeColors.background }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <View style={styles.titleRow}><TrendingUp color={themeColors.tint} size={28} /><ThemedText type="title" style={styles.title}>Analytics</ThemedText></View>
          <ThemedText style={styles.subtitle}>Showing impact in percentages (0-100%)</ThemedText>
        </ThemedView>

        <View style={styles.durationSelector}>
          {[7, 30].map(d => (
            <TouchableOpacity key={d} style={[styles.durationButton, duration === d && { backgroundColor: themeColors.tint }]} onPress={() => { setDuration(d); setSelectedPoint(null); }}>
              <ThemedText style={[styles.durationLabel, duration === d && { color: '#fff', fontWeight: 'bold' }]}>{d} Days</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalsGrid}>
          <TotalCard label="Avoided" value={stats.totals.avoided.toString()} color="#52B788" />
          <TotalCard label="Relapsed" value={stats.totals.relapsed.toString()} color="#ff4d4d" />
          <TotalCard label="Health" value={`${stats.totals.health.toFixed(0)}%`} color="#FFD166" />
          <TotalCard label="Saved" value={`${userData.currency}${stats.totals.money.toFixed(0)}`} color="#118AB2" />
        </View>

        <ThemedView style={styles.chartContainer}>
          {selectedPoint && <View style={[styles.tooltip, { left: selectedPoint.x - 30, top: selectedPoint.y - 45 }]}><ThemedText style={styles.tooltipText}>{selectedPoint.val}</ThemedText></View>}
          <LineChart data={stats} width={screenWidth - 20} height={240} chartConfig={chartConfig} bezier fromZero={true} yAxisSuffix="%"
            onDataPointClick={({ dataset, index, x, y }) => {
              const dIdx = stats.datasets.findIndex(d => d.data === dataset.data);
              const vals = [stats.raw.loggedCigsData[index], stats.raw.healthProgressData[index].toFixed(0) + "%", userData.currency + stats.raw.moneySavedData[index].toFixed(0)];
              setSelectedPoint({ val: String(vals[dIdx]), x, y });
            }}
          />
        </ThemedView>

        <View style={styles.legendContainer}>
          {['Relapse', 'Health', 'Money'].map((l, i) => <LegendItem key={l} color={['#ff4d4d','#FFD166','#118AB2'][i]} label={l} />)}
        </View>

        <ThemedText style={styles.sectionTitle}>Badges & Achievements ({BADGES.length})</ThemedText>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge, i) => (
            <View key={i} style={[styles.badgeCard, !badge.check && { opacity: 0.15 }]}>
              <View style={styles.badgeIcon}>{badge.icon}</View>
              <ThemedText style={styles.badgeName} numberOfLines={1}>{badge.title}</ThemedText>
              <ThemedText style={styles.badgeRule} numberOfLines={2}>{badge.rule}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function TotalCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <View style={[styles.totalCard, { borderLeftColor: color }]}>
      <ThemedText style={styles.totalLabel}>{label}</ThemedText>
      <ThemedText style={[styles.totalValue, { color }]}>{value}</ThemedText>
    </View>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><ThemedText style={styles.legendLabel}>{label}</ThemedText></View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 10, paddingBottom: 60 },
  header: { marginBottom: 20, paddingHorizontal: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  title: { fontSize: 26 },
  subtitle: { opacity: 0.6, fontSize: 13 },
  durationSelector: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 15, padding: 5, marginBottom: 20, marginHorizontal: 10 },
  durationButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  durationLabel: { fontSize: 14, opacity: 0.7 },
  totalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25, paddingHorizontal: 10 },
  totalCard: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 15, padding: 12, borderLeftWidth: 4 },
  totalLabel: { fontSize: 11, opacity: 0.5, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
  chartContainer: { borderRadius: 30, paddingVertical: 10, marginBottom: 10, alignItems: 'center' },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, opacity: 0.7 },
  tooltip: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, zIndex: 100, minWidth: 60, alignItems: 'center' },
  tooltipText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, paddingHorizontal: 10 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 5, justifyContent: 'space-between' },
  badgeCard: { width: '31%', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 15, padding: 10, alignItems: 'center', height: 110, justifyContent: 'center' },
  badgeIcon: { marginBottom: 8 },
  badgeName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  badgeRule: { fontSize: 8, opacity: 0.5, textAlign: 'center', marginTop: 2 },
});
