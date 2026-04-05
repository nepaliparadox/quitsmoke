import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useApp } from '@/context/AppContext';

export function useColorScheme() {
  const { userData } = useApp();
  const systemColorScheme = useSystemColorScheme();
  
  if (userData.theme === 'system') {
    return systemColorScheme || 'light';
  }
  
  return userData.theme;
}
