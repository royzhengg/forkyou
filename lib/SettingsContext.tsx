import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

interface Settings {
  notif_likes: boolean
  notif_comments: boolean
  notif_followers: boolean
  notif_mentions: boolean
  private_account: boolean
  allow_comments: boolean
  allow_tags: boolean
  dark_mode: boolean
}

const DEFAULTS: Settings = {
  notif_likes: true,
  notif_comments: true,
  notif_followers: true,
  notif_mentions: true,
  private_account: false,
  allow_comments: true,
  allow_tags: true,
  dark_mode: false,
}

interface SettingsContextValue {
  settings: Settings
  loading: boolean
  updateSetting: (key: keyof Settings, value: boolean) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  loading: false,
  updateSetting: async () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULTS)
      return
    }
    setLoading(true)
    ;(supabase.from('user_settings') as any)
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: Settings | null }) => {
        if (data) setSettings(data)
        setLoading(false)
      })
  }, [user])

  async function updateSetting(key: keyof Settings, value: boolean) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    if (!user) return
    await (supabase.from('user_settings') as any).upsert({
      id: user.id,
      ...next,
      updated_at: new Date().toISOString(),
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
