import { useSettings } from './SettingsContext'
import { lightColors, darkColors } from '@/constants/Colors'

export type ColorTokens = typeof lightColors

export function useThemeColors(): ColorTokens {
  const { settings } = useSettings()
  return settings.dark_mode ? darkColors : lightColors
}
