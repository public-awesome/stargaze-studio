import { create } from 'zustand'

export type Timezone = 'UTC' | 'Local'

export const useGlobalSettings = create(() => ({
  timezone: 'UTC' as Timezone,
}))

export const setTimezone = (timezone: Timezone) => {
  useGlobalSettings.setState({ timezone })
}
