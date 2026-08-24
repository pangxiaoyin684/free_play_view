<template>
  <div class="dashboard-container">
    <!-- 核心指标卡片网格 -->
    <div class="metrics-grid">
      <div v-for="m in metrics" :key="m.id" class="metric-card" :style="{ borderLeft: `6px solid ${m.color}` }">
        <div class="metric-header">
          <span class="metric-title">{{ m.title }}</span>
          <span class="metric-icon">{{ m.icon }}</span>
        </div>
        <div class="metric-val">{{ m.value }}</div>
        <div class="metric-trend" :class="m.isUp ? 'trend-up' : 'trend-down'">
          <span>{{ m.trendText }}</span>
          <span class="trend-sub">较昨日 {{ m.change }}</span>
        </div>
      </div>
    </div>

    <!-- 运营图表与数据看板 -->
    <div class="charts-row">
      <!-- 游戏与工具热度占比 -->
      <div class="admin-card chart-card">
        <div class="card-title">
          <span>🎮 各小游戏今日热度与局数占比</span>
          <span class="badge badge-indigo">实时更新</span>
        </div>
        <div class="game-stat-bars">
          <div v-for="game in gameStats" :key="game.id" class="stat-bar-row">
            <div class="bar-info">
              <span class="bar-name">{{ game.icon }} {{ game.name }}</span>
              <span class="bar-count">{{ game.plays }} 局 ({{ game.percent }}%)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${game.percent}%`, background: game.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 图像模型与工具调用统计 -->
      <div class="admin-card chart-card">
        <div class="card-title">
          <span>🤖 AI 图像与百宝箱工具调用分布</span>
          <span class="badge badge-success">服务正常</span>
        </div>
        <div class="game-stat-bars">
          <div v-for="tool in toolStats" :key="tool.id" class="stat-bar-row">
            <div class="bar-info">
              <span class="bar-name">{{ tool.icon }} {{ tool.name }}</span>
              <span class="bar-count">{{ tool.calls }} 次 ({{ tool.percent }}%)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${tool.percent}%`, background: tool.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新玩家动态与游玩日志 -->
    <div class="admin-card">
      <div class="card-title">
        <span>⚡ 实时玩家游戏与结算流水日志</span>
        <button class="btn-primary btn-sm" @click="refreshLogs">🔄 刷新流水</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>玩家</th>
            <th>项目类型</th>
            <th>项目名称</th>
            <th>成绩/操作</th>
            <th>金币变动</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in recentLogs" :key="log.id">
            <td>{{ log.time }}</td>
            <td><b>{{ log.nickname }}</b> (ID: {{ log.userId }})</td>
            <td>
              <span class="badge" :class="log.type === 'game' ? 'badge-indigo' : 'badge-warning'">
                {{ log.type === 'game' ? '休闲游戏' : '百宝箱' }}
              </span>
            </td>
            <td>{{ log.title }}</td>
            <td>{{ log.result }}</td>
            <td :style="{ color: log.coins >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }">
              {{ log.coins > 0 ? '+' + log.coins : log.coins }} 🪙
            </td>
            <td><span class="badge badge-success">正常结算</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const metrics = ref([
  { id: 1, title: '累计注册玩家数', icon: '👥', value: '1,428 人', trendText: '↑ 12.8%', isUp: true, change: '+162', color: '#4f46e5' },
  { id: 2, title: '今日小游戏游玩局数', icon: '🎮', value: '3,892 局', trendText: '↑ 24.5%', isUp: true, change: '+760', color: '#0891b2' },
  { id: 3, title: 'AI 消除与证件照调用', icon: '🪄', value: '856 次', trendText: '↑ 18.2%', isUp: true, change: '+132', color: '#7c3aed' },
  { id: 4, title: '玩家金币流动总量', icon: '🪙', value: '186,400', trendText: '平稳', isUp: true, change: '+1.5%', color: '#f59e0b' }
])

const gameStats = ref([
  { id: 1, name: '全民飞机大战 (无尽弹幕)', icon: '🚀', plays: 1680, percent: 43, color: '#3b82f6' },
  { id: 2, name: '宝石消消乐 (无尽步数)', icon: '💎', plays: 1320, percent: 34, color: '#ec4899' },
  { id: 3, name: '欢乐连连看 (无尽清屏)', icon: '🍇', plays: 892, percent: 23, color: '#10b981' }
])

const toolStats = ref([
  { id: 1, name: 'AI 消除与去水印', icon: '🪄', calls: 340, percent: 40, color: '#7c3aed' },
  { id: 2, name: 'AI 智能证件照制作', icon: '📸', calls: 256, percent: 30, color: '#2563eb' },
  { id: 3, name: '中秋玉兔浪漫告白', icon: '🥮', calls: 160, percent: 18, color: '#db2777' },
  { id: 4, name: '欢乐聚会摇骰子', icon: '🎲', calls: 100, percent: 12, color: '#dc2626' }
])

const recentLogs = ref([
  { id: 'L1', time: '13:05:12', nickname: '银河王牌飞行员', userId: '101', type: 'game', title: '全民飞机大战', result: '突破第 18 波 (得分 78,900)', coins: 65 },
  { id: 'L2', time: '13:04:48', nickname: '快乐小仙女', userId: '102', type: 'tool', title: '中秋玉兔告白', result: '放飞孔明灯并生成贺卡', coins: 0 },
  { id: 'L3', time: '13:04:15', nickname: '连击达人小萌', userId: '103', type: 'game', title: '宝石消消乐', result: '突破第 12 波 (得分 26,400)', coins: 45 },
  { id: 'L4', time: '13:03:50', nickname: '修图狂人', userId: '104', type: 'tool', title: 'AI 智能去水印', result: '完成高精度背景重构', coins: 0 },
  { id: 'L5', time: '13:03:10', nickname: '夜市摇骰王', userId: '105', type: 'tool', title: '欢乐摇骰子', result: '摇出 6 颗全同豹子', coins: 0 }
])

function refreshLogs() {
  alert('流水日志已刷新！')
}
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-title {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.metric-icon {
  font-size: 24px;
}

.metric-val {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  gap: 6px;
}

.trend-up {
  color: #16a34a;
  font-weight: 600;
}

.trend-sub {
  color: #94a3b8;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.game-stat-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.bar-track {
  width: 100%;
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s ease;
}
</style>
