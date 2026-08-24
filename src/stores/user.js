import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    let cachedUser = null
    let cachedToken = ''
    try {
      cachedToken = uni.getStorageSync('auth_token') || ''
      const userStr = uni.getStorageSync('user_info')
      if (userStr) {
        cachedUser = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('Failed to read user storage:', e)
    }

    return {
      token: cachedToken,
      userInfo: cachedUser || {
        id: '',
        nickname: '',
        avatar: '',
        phone: '',
        email: '',
        coins: 100, // 初始金币
        loginType: '', // 'mock' | 'weixin' | 'phone' | 'email'
        highScores: {
          match3: 0,
          planeWar: 0,
          linkGame: 0
        }
      }
    }
  },

  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    userNickname: (state) => state.userInfo?.nickname || '未登录玩家',
    userAvatar: (state) => state.userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    userCoins: (state) => state.userInfo?.coins || 0
  },

  actions: {
    // 设置登录态与用户信息
    setLoginInfo(token, userInfo) {
      this.token = token
      this.userInfo = {
        ...this.userInfo,
        ...userInfo,
        highScores: userInfo.highScores || this.userInfo.highScores || { match3: 0, planeWar: 0, linkGame: 0 }
      }

      try {
        uni.setStorageSync('auth_token', token)
        uni.setStorageSync('user_info', JSON.stringify(this.userInfo))
      } catch (e) {
        console.error('Storage save error:', e)
      }
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = {
        id: '',
        nickname: '',
        avatar: '',
        phone: '',
        email: '',
        coins: 0,
        loginType: '',
        highScores: { match3: 0, planeWar: 0, linkGame: 0 }
      }
      try {
        uni.removeStorageSync('auth_token')
        uni.removeStorageSync('user_info')
      } catch (e) {
        console.error('Storage remove error:', e)
      }
    },

    // 一键模拟登录 (全端可用)
    mockLogin(role = 'gamer') {
      const mockToken = 'mock_token_' + Date.now()
      const mockUser = {
        id: 'mock_uid_' + Math.floor(Math.random() * 89999 + 10000),
        nickname: role === 'vip' ? '👑 尊贵黄金玩家' : '🎮 快乐游戏家',
        avatar: role === 'vip' 
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        phone: '138****8888',
        email: 'player@casualgames.com',
        coins: role === 'vip' ? 8888 : 666,
        loginType: 'mock',
        highScores: {
          match3: 3500,
          planeWar: 12800,
          linkGame: 2400
        }
      }
      this.setLoginInfo(mockToken, mockUser)
      return mockUser
    },

    // 更新金币
    addCoins(amount) {
      if (!this.userInfo) return
      this.userInfo.coins = Math.max(0, (this.userInfo.coins || 0) + amount)
      try {
        uni.setStorageSync('user_info', JSON.stringify(this.userInfo))
      } catch (e) {}
    },

    // 记录游戏最高分
    recordScore(gameKey, score) {
      if (!this.userInfo) return
      if (!this.userInfo.highScores) {
        this.userInfo.highScores = { match3: 0, planeWar: 0, linkGame: 0 }
      }
      const currentHigh = this.userInfo.highScores[gameKey] || 0
      if (score > currentHigh) {
        this.userInfo.highScores[gameKey] = score
        try {
          uni.setStorageSync('user_info', JSON.stringify(this.userInfo))
        } catch (e) {}
        return true // 创造了新纪录
      }
      return false
    }
  }
})
