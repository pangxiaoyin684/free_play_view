<template>
  <view class="link-game-container">
    <!-- 顶部状态栏 (包含无尽波次、得分、倒计时与排行榜入口) -->
    <game-header 
      title="欢乐连连看 (无尽模式)" 
      :score="score" 
      :wave="currentWave"
      :time="timeLeft" 
      @pause="togglePause"
      @openRank="showRankModal = true"
    />

    <!-- 剩余方块与波次信息条 -->
    <view class="game-meta-bar flex-between">
      <view class="wave-left flex-center">
        <text class="wave-tag">第 {{ currentWave }} 波</text>
        <text class="meta-label">剩余: <text class="highlight">{{ remainingTiles }}</text> / {{ totalTiles }}</text>
      </view>
      <text class="meta-tip">每消一对 +2秒 续命 ⏱️</text>
    </view>

    <!-- 棋盘网格区域 -->
    <view class="board-container flex-center">
      <view class="grid-wrap" :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }">
        <view 
          v-for="(tile, index) in board" 
          :key="index"
          class="tile-cell flex-center"
          :class="{
            'tile-empty': !tile,
            'tile-selected': selectedIdx === index
          }"
          @click="onTileClick(index)"
        >
          <text v-if="tile" class="tile-icon">{{ tile.icon }}</text>
        </view>
      </view>
    </view>

    <!-- 底部道具栏 -->
    <view class="tool-actions-bar flex-between">
      <button class="action-btn flex-center" @click="useShuffle">
        <text class="btn-icon">🔀</text>
        <text>重排 (10🪙)</text>
      </button>
      <button class="action-btn flex-center" @click="useHint">
        <text class="btn-icon">💡</text>
        <text>提示 (10🪙)</text>
      </button>
      <button class="action-btn flex-center btn-rank" @click="showRankModal = true">
        <text class="btn-icon">🏆</text>
        <text>英雄榜</text>
      </button>
      <button class="action-btn flex-center" @click="restartGame">
        <text class="btn-icon">🔄</text>
        <text>重置</text>
      </button>
    </view>

    <!-- 暂停弹窗 -->
    <game-pause-modal 
      :visible="isPaused" 
      @resume="resumeGame" 
      @restart="restartGame" 
      @quit="quitToHall" 
    />

    <!-- 结算弹窗 -->
    <game-over-modal 
      :visible="isGameOver"
      :is-win="currentWave >= 5"
      :score="score"
      :wave="currentWave"
      :high-score="userStore.userInfo?.highScores?.linkGame || 0"
      :is-new-record="isNewRecord"
      :reward-coins="rewardCoins"
      @restart="restartGame"
      @quit="quitToHall"
      @openRank="showRankModal = true"
    />

    <!-- 排行榜弹窗 -->
    <rank-modal 
      :visible="showRankModal" 
      default-game-key="linkGame"
      @close="showRankModal = false"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameHeader from '../../../components/game-header.vue'
import GamePauseModal from '../../../components/game-pause-modal.vue'
import GameOverModal from '../../../components/game-over-modal.vue'
import RankModal from '../../../components/rank-modal.vue'
import { useUserStore } from '../../../stores/user'
import { soundManager } from '../../../utils/audio'
import { apiSubmitScore } from '../../../api/rank'

const userStore = useUserStore()

const ROWS = 8
const COLS = 8
const INNER_ROWS = 6
const INNER_COLS = 6

const ALL_FRUITS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍊', '🥝', '🍍', '🍒', '🍑']

const board = ref([])
const selectedIdx = ref(-1)
const score = ref(0)
const currentWave = ref(1)
const timeLeft = ref(90)
const totalTiles = ref(INNER_ROWS * INNER_COLS)

const isPaused = ref(false)
const isGameOver = ref(false)
const isNewRecord = ref(false)
const rewardCoins = ref(0)
const showRankModal = ref(false)
let timer = null

const remainingTiles = computed(() => {
  return board.value.filter(t => t !== null).length
})

// 根据当前波次获取水果池 (随波次增加水果种类干扰)
function getFruitPoolForWave() {
  const count = Math.min(ALL_FRUITS.length, 5 + currentWave.value)
  return ALL_FRUITS.slice(0, count)
}

function initBoard() {
  const newBoard = new Array(ROWS * COLS).fill(null)
  const fruits = getFruitPoolForWave()
  
  const totalInner = INNER_ROWS * INNER_COLS
  const pool = []
  for (let i = 0; i < totalInner / 2; i++) {
    const f = fruits[i % fruits.length]
    pool.push(f, f)
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = pool[i]
    pool[i] = pool[j]
    pool[j] = temp
  }

  let p = 0
  for (let r = 1; r <= INNER_ROWS; r++) {
    for (let c = 1; c <= INNER_COLS; c++) {
      const idx = r * COLS + c
      newBoard[idx] = { icon: pool[p++] }
    }
  }

  board.value = newBoard
}

function canConnect(p1, p2) {
  if (p1 === p2) return false
  const t1 = board.value[p1], t2 = board.value[p2]
  if (!t1 || !t2 || t1.icon !== t2.icon) return false

  const r1 = Math.floor(p1 / COLS), c1 = p1 % COLS
  const r2 = Math.floor(p2 / COLS), c2 = p2 % COLS

  if (checkStraightLine(r1, c1, r2, c2)) return true

  if (isEmpty(r1, c2) && checkStraightLine(r1, c1, r1, c2) && checkStraightLine(r1, c2, r2, c2)) {
    return true
  }
  if (isEmpty(r2, c1) && checkStraightLine(r1, c1, r2, c1) && checkStraightLine(r2, c1, r2, c2)) {
    return true
  }

  for (let c = 0; c < COLS; c++) {
    if (c === c1) continue
    if (isEmpty(r1, c) && isEmpty(r2, c) && checkStraightLine(r1, c1, r1, c) && checkStraightLine(r1, c, r2, c) && checkStraightLine(r2, c, r2, c2)) {
      return true
    }
  }

  for (let r = 0; r < ROWS; r++) {
    if (r === r1) continue
    if (isEmpty(r, c1) && isEmpty(r, c2) && checkStraightLine(r1, c1, r, c1) && checkStraightLine(r, c1, r, c2) && checkStraightLine(r, c2, r2, c2)) {
      return true
    }
  }

  return false
}

function isEmpty(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true
  const idx = r * COLS + c
  return board.value[idx] === null
}

function checkStraightLine(r1, c1, r2, c2) {
  if (r1 === r2) {
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2)
    for (let c = minC + 1; c < maxC; c++) {
      if (!isEmpty(r1, c)) return false
    }
    return true
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2)
    for (let r = minR + 1; r < maxR; r++) {
      if (!isEmpty(r, c1)) return false
    }
    return true
  }
  return false
}

function onTileClick(index) {
  if (isPaused.value || isGameOver.value) return
  const tile = board.value[index]
  if (!tile) return

  if (selectedIdx.value === -1) {
    selectedIdx.value = index
    soundManager.playPop()
    return
  }

  if (selectedIdx.value === index) {
    selectedIdx.value = -1
    return
  }

  const prev = selectedIdx.value
  const curr = index

  if (canConnect(prev, curr)) {
    soundManager.playMatch()
    board.value[prev] = null
    board.value[curr] = null
    selectedIdx.value = -1

    // 消除得分与续命 +2s
    score.value += 60 + currentWave.value * 10
    timeLeft.value = Math.min(99, timeLeft.value + 2)

    if (remainingTiles.value === 0) {
      handleWaveClear()
    }
  } else {
    selectedIdx.value = curr
    soundManager.playPop()
  }
}

// 清屏自动晋级下一波 (无尽模式)
function handleWaveClear() {
  currentWave.value++
  soundManager.playCombo(currentWave.value)

  // 下一波初始时间随难度递减
  const waveBaseTime = Math.max(45, 90 - (currentWave.value - 1) * 8)
  timeLeft.value += waveBaseTime

  uni.showModal({
    title: '🎉 清屏晋级！',
    content: `恭喜突破第 ${currentWave.value - 1} 波！\n进入第 ${currentWave.value} 波，难度升级，奖励额外 +${waveBaseTime}秒 倒计时！`,
    showCancel: false,
    confirmText: '继续迎战'
  })

  initBoard()
}

function handleTimeOver() {
  clearInterval(timer)
  isGameOver.value = true
  soundManager.playGameOver()
  rewardCoins.value = Math.floor(score.value / 20) + currentWave.value * 10
  userStore.addCoins(rewardCoins.value)
  isNewRecord.value = userStore.recordScore('linkGame', score.value)

  // 提交战绩至排行榜
  apiSubmitScore({
    gameKey: 'linkGame',
    score: score.value,
    wave: currentWave.value,
    user: userStore.userInfo
  })
}

function useShuffle() {
  if (userStore.userCoins < 10) {
    uni.showToast({ title: '金币不足 10 枚', icon: 'none' })
    return
  }
  userStore.addCoins(-10)
  soundManager.playPop()

  const remaining = []
  const validIndices = []
  board.value.forEach((t, i) => {
    if (t) {
      remaining.push(t)
      validIndices.push(i)
    }
  })

  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = remaining[i]
    remaining[i] = remaining[j]
    remaining[j] = temp
  }

  validIndices.forEach((pos, i) => {
    board.value[pos] = remaining[i]
  })

  uni.showToast({ title: '已重新洗牌！', icon: 'none' })
}

function useHint() {
  if (userStore.userCoins < 10) {
    uni.showToast({ title: '金币不足 10 枚', icon: 'none' })
    return
  }
  
  for (let i = 0; i < board.value.length; i++) {
    if (!board.value[i]) continue
    for (let j = i + 1; j < board.value.length; j++) {
      if (!board.value[j]) continue
      if (canConnect(i, j)) {
        userStore.addCoins(-10)
        selectedIdx.value = i
        soundManager.playCoin()
        uni.showToast({ title: `找到了: ${board.value[i].icon}`, icon: 'none' })
        return
      }
    }
  }
  uni.showToast({ title: '当前暂无直接可连，建议使用洗牌', icon: 'none' })
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function resumeGame() {
  isPaused.value = false
}

function restartGame() {
  clearInterval(timer)
  isPaused.value = false
  isGameOver.value = false
  isNewRecord.value = false
  score.value = 0
  currentWave.value = 1
  timeLeft.value = 90
  selectedIdx.value = -1
  initBoard()
  startTimer()
}

function quitToHall() {
  clearInterval(timer)
  uni.switchTab({ url: '/pages/tabbar/games/index' })
}

function startTimer() {
  timer = setInterval(() => {
    if (isPaused.value || isGameOver.value) return
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleTimeOver()
    }
  }, 1000)
}

onMounted(() => {
  initBoard()
  startTimer()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.link-game-container {
  min-height: 100vh;
  background: #ecfdf5;
  display: flex;
  flex-direction: column;
}

.game-meta-bar {
  padding: 14rpx 24rpx;
  background: #ffffff;
  border-bottom: 2rpx solid #d1fae5;
}

.wave-left {
  gap: 12rpx;
}

.wave-tag {
  background: #ecfdf5;
  color: #059669;
  font-size: 20rpx;
  font-weight: bold;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  border: 2rpx solid #a7f3d0;
}

.meta-label {
  font-size: 24rpx;
  color: #065f46;
}

.highlight {
  font-weight: bold;
  color: #059669;
}

.meta-tip {
  font-size: 22rpx;
  color: #10b981;
}

/* 棋盘 */
.board-container {
  flex: 1;
  padding: 16rpx;
}

.grid-wrap {
  width: 710rpx;
  height: 710rpx;
  display: grid;
  gap: 6rpx;
  background: #ffffff;
  padding: 12rpx;
  border-radius: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(16, 185, 129, 0.12);
  border: 4rpx solid #a7f3d0;
}

.tile-cell {
  background: #f0fdf4;
  border-radius: 12rpx;
  border: 2rpx solid #bbf7d0;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s;
}

.tile-empty {
  background: transparent !important;
  border: none !important;
  pointer-events: none;
}

.tile-selected {
  transform: scale(1.15);
  background: #fef08a !important;
  border: 4rpx solid #eab308 !important;
  box-shadow: 0 0 16rpx #facc15;
  z-index: 10;
}

.tile-icon {
  font-size: 38rpx;
}

/* 底部操作栏 */
.tool-actions-bar {
  padding: 20rpx 28rpx 50rpx;
  gap: 14rpx;
}

.action-btn {
  flex: 1;
  height: 78rpx;
  background: #ffffff;
  border: 2rpx solid #a7f3d0;
  border-radius: 39rpx;
  font-size: 22rpx;
  font-weight: bold;
  color: #065f46;
}

.btn-rank {
  background: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}

.btn-icon {
  font-size: 28rpx;
  margin-right: 6rpx;
}
</style>
