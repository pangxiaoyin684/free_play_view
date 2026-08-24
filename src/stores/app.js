import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    let soundEnabled = true
    let vibrationEnabled = true
    try {
      const soundCache = uni.getStorageSync('setting_sound')
      if (soundCache !== '') soundEnabled = soundCache === true || soundCache === 'true'
      const vibCache = uni.getStorageSync('setting_vibration')
      if (vibCache !== '') vibrationEnabled = vibCache === true || vibCache === 'true'
    } catch (e) {}

    return {
      appName: import.meta.env.VITE_APP_TITLE || '休闲游戏与百宝箱',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      requireLogin: import.meta.env.VITE_REQUIRE_LOGIN === 'true',
      enableMockLogin: import.meta.env.VITE_ENABLE_MOCK_LOGIN !== 'false',
      soundEnabled,
      vibrationEnabled
    }
  },

  actions: {
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      try {
        uni.setStorageSync('setting_sound', this.soundEnabled)
      } catch (e) {}
    },
    toggleVibration() {
      this.vibrationEnabled = !this.vibrationEnabled
      try {
        uni.setStorageSync('setting_vibration', this.vibrationEnabled)
      } catch (e) {}
    }
  }
})
