<template>
  <div class="users-container">
    <div class="admin-card">
      <div class="card-title">
        <span>👥 玩家列表与资产管理</span>
        <div style="display: flex; gap: 12px;">
          <input v-model="searchKeyword" placeholder="搜索玩家昵称/ID..." class="search-input" />
          <button class="btn-primary btn-sm" @click="batchGiveCoins">🎁 全员空投金币</button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>UID</th>
            <th>玩家头像与昵称</th>
            <th>登录渠道</th>
            <th>持有金币</th>
            <th>消消乐最高</th>
            <th>战机最高</th>
            <th>账号状态</th>
            <th>注册时间</th>
            <th>管理操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>#{{ user.id }}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img :src="user.avatar" style="width: 36px; height: 36px; border-radius: 50%;" />
                <b>{{ user.nickname }}</b>
              </div>
            </td>
            <td>
              <span class="badge" :class="user.channel === 'wechat' ? 'badge-success' : 'badge-indigo'">
                {{ user.channel === 'wechat' ? '微信授权' : user.channel === 'phone' ? '手机号' : '模拟体验' }}
              </span>
            </td>
            <td><b style="color: #d97706;">{{ user.coins.toLocaleString() }}</b> 🪙</td>
            <td>{{ user.highScores.match3.toLocaleString() }}</td>
            <td>{{ user.highScores.planeWar.toLocaleString() }}</td>
            <td>
              <span class="badge" :class="user.status === 'active' ? 'badge-success' : 'badge-danger'">
                {{ user.status === 'active' ? '正常' : '已封禁' }}
              </span>
            </td>
            <td>{{ user.createdAt }}</td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button class="btn-primary btn-sm" @click="editCoins(user)">充值金币</button>
                <button 
                  class="btn-sm" 
                  :class="user.status === 'active' ? 'btn-danger' : 'btn-success'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.status === 'active' ? '封禁' : '解封' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchKeyword = ref('')

const users = ref([
  {
    id: 101,
    nickname: '银河王牌飞行员',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    channel: 'wechat',
    coins: 2450,
    status: 'active',
    createdAt: '2026-08-15',
    highScores: { match3: 18200, planeWar: 98600, linkGame: 14500 }
  },
  {
    id: 102,
    nickname: '连击达人小萌',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    channel: 'phone',
    coins: 1880,
    status: 'active',
    createdAt: '2026-08-16',
    highScores: { match3: 38650, planeWar: 32400, linkGame: 24500 }
  },
  {
    id: 103,
    nickname: '极光瞬杀·零式',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    channel: 'mock',
    coins: 600,
    status: 'active',
    createdAt: '2026-08-18',
    highScores: { match3: 15400, planeWar: 76300, linkGame: 18900 }
  },
  {
    id: 104,
    nickname: '刷分作弊嫌疑人',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
    channel: 'mock',
    coins: 99999,
    status: 'banned',
    createdAt: '2026-08-20',
    highScores: { match3: 999999, planeWar: 999999, linkGame: 999999 }
  }
])

const filteredUsers = computed(() => {
  if (!searchKeyword.value.trim()) return users.value
  return users.value.filter(u => 
    u.nickname.includes(searchKeyword.value) || String(u.id).includes(searchKeyword.value)
  )
})

function editCoins(user) {
  const input = prompt(`请输入为玩家【${user.nickname}】增加或扣减的金币数（正数增加，负数扣除）：`, '100')
  if (input !== null) {
    const delta = parseInt(input)
    if (!isNaN(delta)) {
      user.coins = Math.max(0, user.coins + delta)
      alert(`操作成功！当前金币余额为: ${user.coins}`)
    }
  }
}

function toggleUserStatus(user) {
  user.status = user.status === 'active' ? 'banned' : 'active'
  alert(`已更新玩家【${user.nickname}】状态为: ${user.status === 'active' ? '正常' : '已封禁'}`)
}

function batchGiveCoins() {
  const input = prompt('请输入向全服所有玩家空投发放的金币数量：', '200')
  if (input !== null) {
    const num = parseInt(input)
    if (!isNaN(num) && num > 0) {
      users.value.forEach(u => { u.coins += num })
      alert(`已成功向全服 ${users.value.length} 位玩家空投发放 ${num} 🪙 金币！`)
    }
  }
}
</script>

<style scoped>
.search-input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  width: 220px;
}
</style>
