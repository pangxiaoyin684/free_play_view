/**
 * 游戏排行榜服务模块
 * 提供日榜、周榜、总榜数据管理，预留真实 API 对接能力
 */

// 默认各游戏的模拟初始榜单数据
const DEFAULT_MOCK_RANKS = {
  match3: [
    { rank: 1, id: 'u_101', nickname: '💎 消除之神·凯尔', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', score: 38650, wave: 18, title: '消消乐宗师' },
    { rank: 2, id: 'u_102', nickname: '✨ 连击达人小萌', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', score: 29420, wave: 14, title: '狂暴连击手' },
    { rank: 3, id: 'u_103', nickname: '🔥 爆裂水晶王', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', score: 21800, wave: 11, title: '消除专家' },
    { rank: 4, id: 'u_104', nickname: '🍀 幸运四叶草', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', score: 15400, wave: 8, title: '资深玩家' },
    { rank: 5, id: 'u_105', nickname: '⚡ 闪电快手', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80', score: 11200, wave: 6, title: '新星玩家' }
  ],
  planeWar: [
    { rank: 1, id: 'u_201', nickname: '🚀 银河王牌王牌飞行员', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', score: 98600, wave: 25, title: '宇宙传奇' },
    { rank: 2, id: 'u_202', nickname: '⚡ 极光瞬杀·零式', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', score: 76300, wave: 19, title: '空天霸主' },
    { rank: 3, id: 'u_203', nickname: '🔥 烈焰轰炸机', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', score: 58900, wave: 15, title: '重装王牌' },
    { rank: 4, id: 'u_204', nickname: '🛸 幽灵猎手', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', score: 41200, wave: 10, title: '精英飞行员' },
    { rank: 5, id: 'u_205', nickname: '💫 巡航者', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80', score: 28400, wave: 7, title: '新晋飞将' }
  ],
  linkGame: [
    { rank: 1, id: 'u_301', nickname: '🍇 鹰眼速消王', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', score: 24500, wave: 15, title: '连连看神手' },
    { rank: 2, id: 'u_302', nickname: '🍉 快乐水果捞', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', score: 18900, wave: 12, title: '连线大师' },
    { rank: 3, id: 'u_303', nickname: '🍓 极速配对酱', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', score: 13600, wave: 9, title: '眼明手快' },
    { rank: 4, id: 'u_304', nickname: '🍍 菠萝吹雪', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', score: 9800, wave: 6, title: '连线达人' },
    { rank: 5, id: 'u_305', nickname: '🍊 橙子汽水', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80', score: 6200, wave: 4, title: '新手上路' }
  ]
}

/**
 * 获取指定游戏的排行榜数据
 * @param {string} gameKey 游戏标识 ('match3' | 'planeWar' | 'linkGame')
 * @param {string} period 时间周期 ('all' | 'weekly' | 'daily')
 * @param {Object} currentUser 当前用户信息
 */
export async function apiGetGameRankings(gameKey = 'match3', period = 'all', currentUser = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = []
      try {
        const cached = uni.getStorageSync(`rank_list_${gameKey}_${period}`)
        if (cached) {
          list = JSON.parse(cached)
        }
      } catch (e) {}

      if (!list || list.length === 0) {
        list = JSON.parse(JSON.stringify(DEFAULT_MOCK_RANKS[gameKey] || []))
      }

      // 如果有当前用户且有最高分，更新或插入当前用户位置
      let myRank = null
      if (currentUser && currentUser.highScores && currentUser.highScores[gameKey]) {
        const myScore = currentUser.highScores[gameKey]
        const existingIdx = list.findIndex(item => item.id === currentUser.id)
        if (existingIdx !== -1) {
          list[existingIdx].score = Math.max(list[existingIdx].score, myScore)
        } else {
          list.push({
            id: currentUser.id || 'me',
            nickname: currentUser.nickname || '我',
            avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            score: myScore,
            wave: Math.max(1, Math.floor(myScore / 1500)),
            title: myScore > 30000 ? '超神玩家' : myScore > 10000 ? '无尽高手' : '初级挑战者',
            isMe: true
          })
        }

        // 重新降序排列并计算排名
        list.sort((a, b) => b.score - a.score)
        list.forEach((item, idx) => {
          item.rank = idx + 1
          if (item.id === currentUser.id || item.isMe) {
            myRank = { ...item, rank: idx + 1 }
          }
        })
      }

      resolve({
        code: 200,
        gameKey,
        period,
        list: list.slice(0, 50),
        myRank: myRank || {
          rank: list.length + 1,
          score: currentUser?.highScores?.[gameKey] || 0,
          nickname: currentUser?.nickname || '我',
          avatar: currentUser?.avatar || ''
        }
      })
    }, 300)
  })
}

/**
 * 提交游戏新战绩
 */
export async function apiSubmitScore({ gameKey, score, wave, user }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        let list = DEFAULT_MOCK_RANKS[gameKey] || []
        const cached = uni.getStorageSync(`rank_list_${gameKey}_all`)
        if (cached) {
          list = JSON.parse(cached)
        }
        
        const myItem = {
          id: user?.id || 'me_' + Date.now(),
          nickname: user?.nickname || '快乐玩家',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          score,
          wave: wave || 1,
          title: score > 20000 ? '无尽宗师' : '无尽先锋',
          isMe: true
        }

        const idx = list.findIndex(i => i.id === myItem.id)
        if (idx !== -1) {
          if (score > list[idx].score) {
            list[idx].score = score
            list[idx].wave = wave
          }
        } else {
          list.push(myItem)
        }

        list.sort((a, b) => b.score - a.score)
        list.forEach((item, i) => { item.rank = i + 1 })

        uni.setStorageSync(`rank_list_${gameKey}_all`, JSON.stringify(list))
      } catch (e) {}

      resolve({ code: 200, message: '战绩已成功同步至排行榜！' })
    }, 200)
  })
}
