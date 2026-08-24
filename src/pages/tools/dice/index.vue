<template>
  <view class="dice-container">
    <!-- 顶部横幅 -->
    <view class="tool-banner flex-between">
      <view class="banner-text">
        <text class="banner-title">🎲 欢乐聚会摇骰子</text>
        <text class="banner-sub">支持 1~6 颗骰子、3D 翻滚音效、点数统计与聚会玩法</text>
      </view>
      <text class="banner-icon">🎰</text>
    </view>

    <!-- 骰子数量切换 -->
    <view class="dice-count-selector card-box flex-between">
      <text class="selector-label">骰子数量:</text>
      <view class="count-btns flex-center">
        <view 
          v-for="num in 6" 
          :key="num"
          class="count-btn"
          :class="{ active: diceCount === num }"
          @click="changeDiceCount(num)"
        >
          {{ num }}个
        </view>
      </view>
    </view>

    <!-- 骰盅与骰子主展示区 -->
    <view class="dice-cup-card card-box flex-column flex-center" @click="rollDice">
      <!-- 点数汇总浮条 -->
      <view class="total-badge flex-between">
        <text class="total-label">点数总和: <text class="total-num">{{ totalPoints }}</text></text>
        <text class="status-tip">{{ isRolling ? '🎲 正在摇骰中...' : getDiceResultSummary() }}</text>
      </view>

      <!-- 骰子网格 -->
      <view class="dice-stage flex-center">
        <view class="dice-grid" :class="'grid-' + diceCount">
          <view 
            v-for="(val, idx) in diceValues" 
            :key="idx"
            class="dice-cube flex-center"
            :class="{ 'animate-roll': isRolling }"
          >
            <!-- 骰子 1~6 点阵绘制 -->
            <view class="dice-face" :class="'face-' + val">
              <view v-for="dot in val" :key="dot" class="dot" :class="{ 'red-dot': val === 1 || val === 4 }"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 点击摇晃提示 -->
      <text class="tap-hint">👆 点击任意处或下方按钮立即掷骰</text>
    </view>

    <!-- 摇骰子按钮 -->
    <view class="action-card card-box">
      <button 
        class="btn-roll flex-center" 
        hover-class="btn-hover"
        :disabled="isRolling"
        @click="rollDice"
      >
        <text class="roll-icon">🎲</text>
        <text>{{ isRolling ? '摇骰中...' : '立即摇骰子 (Roll)' }}</text>
      </button>
    </view>

    <!-- 聚会常用玩法规则指南 -->
    <view class="rules-card card-box">
      <text class="rules-title">🍻 聚会经典玩法速查</text>
      <view class="rule-item">
        <text class="rule-name">1. 大话骰 (吹牛):</text>
        <text class="rule-desc">每人5颗骰子，依次叫点（如“4个5”），1点未被叫过可作为百搭任意点。</text>
      </view>
      <view class="rule-item">
        <text class="rule-name">2. 猜大小:</text>
        <text class="rule-desc">3颗骰子，总和 4~10 为小，11~17 为大；三颗相同（豹子）通吃。</text>
      </view>
      <view class="rule-item">
        <text class="rule-name">3. 七八九 (酒桌必玩):</text>
        <text class="rule-desc">2颗骰子，摇出7随便喝，摇出8喝半杯，摇出9喝一杯，摇出双数指定别人喝。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { soundManager } from '../../../utils/audio'

const diceCount = ref(3)
const diceValues = ref([6, 6, 6])
const isRolling = ref(false)

const totalPoints = computed(() => {
  return diceValues.value.reduce((a, b) => a + b, 0)
})

function changeDiceCount(num) {
  if (isRolling.value) return
  diceCount.value = num
  const newVals = []
  for (let i = 0; i < num; i++) {
    newVals.push(Math.floor(Math.random() * 6) + 1)
  }
  diceValues.value = newVals
  soundManager.playPop()
}

function getDiceResultSummary() {
  const vals = diceValues.value
  const sum = totalPoints.value
  if (diceCount.value === 3) {
    if (vals[0] === vals[1] && vals[1] === vals[2]) return '🎉 豹子通吃！'
    return sum >= 11 ? '📈 大' : '📉 小'
  }
  if (vals.every(v => v === vals[0])) {
    return '🌟 全同点数！'
  }
  return sum % 2 === 0 ? '双数' : '单数'
}

function rollDice() {
  if (isRolling.value) return
  isRolling.value = true
  soundManager.playExplosion()

  // 掷骰子过程中的连续碰撞音效
  let soundTick = 0
  const soundTimer = setInterval(() => {
    soundTick++
    soundManager.playTone(400 + Math.random() * 300, 'triangle', 0.05, 0.15)
    // 随机跳动展示
    diceValues.value = diceValues.value.map(() => Math.floor(Math.random() * 6) + 1)
    if (soundTick >= 8) {
      clearInterval(soundTimer)
    }
  }, 100)

  setTimeout(() => {
    isRolling.value = false
    const finalVals = []
    for (let i = 0; i < diceCount.value; i++) {
      finalVals.push(Math.floor(Math.random() * 6) + 1)
    }
    diceValues.value = finalVals
    soundManager.playCoin()
    uni.showToast({
      title: `总点数: ${totalPoints.value} 点！`,
      icon: 'none'
    })
  }, 1000)
}

onMounted(() => {
  // 监听手机摇一摇 (微信小程序/App 支持)
  // #ifndef H5
  uni.onAccelerometerChange((res) => {
    if (Math.abs(res.x) > 1.8 || Math.abs(res.y) > 1.8 || Math.abs(res.z) > 1.8) {
      rollDice()
    }
  })
  // #endif
})
</script>

<style scoped>
.dice-container {
  padding: 24rpx;
  min-height: 100vh;
  background: #fef2f2;
}

.tool-banner {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 32rpx;
  border-radius: 28rpx;
  color: #ffffff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(220, 38, 38, 0.25);
}

.banner-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 6rpx;
}

.banner-sub {
  font-size: 22rpx;
  opacity: 0.85;
}

.banner-icon {
  font-size: 60rpx;
}

/* 数量切换 */
.dice-count-selector {
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.selector-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #1e293b;
}

.count-btns {
  gap: 10rpx;
}

.count-btn {
  padding: 8rpx 18rpx;
  background: #f1f5f9;
  border-radius: 18rpx;
  font-size: 22rpx;
  color: #64748b;
  cursor: pointer;
}

.count-btn.active {
  background: #dc2626;
  color: #ffffff;
  font-weight: bold;
}

/* 骰盅展示区 */
.dice-cup-card {
  padding: 40rpx 24rpx 30rpx;
  margin-bottom: 24rpx;
  background: radial-gradient(circle, #ffffff 60%, #fff1f2 100%);
  border: 4rpx solid #fecdd3;
  cursor: pointer;
}

.total-badge {
  width: 100%;
  background: #ffe4e6;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 36rpx;
}

.total-label {
  font-size: 26rpx;
  color: #9f1239;
}

.total-num {
  font-size: 34rpx;
  font-weight: 800;
  color: #e11d48;
}

.status-tip {
  font-size: 24rpx;
  font-weight: bold;
  color: #be123c;
}

.dice-stage {
  min-height: 280rpx;
  width: 100%;
}

.dice-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24rpx;
}

/* 骰子立方体 */
.dice-cube {
  width: 120rpx;
  height: 120rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.18), inset 0 0 10rpx rgba(0, 0, 0, 0.05);
  border: 4rpx solid #e2e8f0;
  padding: 12rpx;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-roll {
  animation: rollAnim 0.6s infinite ease-in-out;
}

@keyframes rollAnim {
  0% { transform: rotate(0deg) scale(0.9); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(0.9); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 骰子各点数布局 */
.dice-face {
  width: 100%;
  height: 100%;
  display: grid;
}

.dot {
  width: 20rpx;
  height: 20rpx;
  background: #1e293b;
  border-radius: 50%;
  margin: auto;
}

.red-dot {
  background: #ef4444;
}

/* 1 点 */
.face-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
.face-1 .dot {
  width: 32rpx;
  height: 32rpx;
}

/* 2 点 */
.face-2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.face-2 .dot:nth-child(1) { grid-area: 1 / 1; }
.face-2 .dot:nth-child(2) { grid-area: 2 / 2; }

/* 3 点 */
.face-3 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}
.face-3 .dot:nth-child(1) { grid-area: 1 / 1; }
.face-3 .dot:nth-child(2) { grid-area: 2 / 2; }
.face-3 .dot:nth-child(3) { grid-area: 3 / 3; }

/* 4 点 */
.face-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 5 点 */
.face-5 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}
.face-5 .dot:nth-child(1) { grid-area: 1 / 1; }
.face-5 .dot:nth-child(2) { grid-area: 1 / 3; }
.face-5 .dot:nth-child(3) { grid-area: 2 / 2; }
.face-5 .dot:nth-child(4) { grid-area: 3 / 1; }
.face-5 .dot:nth-child(5) { grid-area: 3 / 3; }

/* 6 点 */
.face-6 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.tap-hint {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 30rpx;
}

/* 操作按钮 */
.action-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.btn-roll {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  height: 92rpx;
  border-radius: 46rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(220, 38, 38, 0.35);
}

.roll-icon {
  font-size: 38rpx;
  margin-right: 14rpx;
}

/* 规则 */
.rules-card {
  padding: 26rpx 30rpx;
  background: #ffffff;
}

.rules-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #991b1b;
  display: block;
  margin-bottom: 16rpx;
}

.rule-item {
  margin-bottom: 16rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
}

.rule-desc {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.5;
  display: block;
  margin-top: 2rpx;
}
</style>
