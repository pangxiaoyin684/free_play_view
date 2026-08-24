<template>
  <view class="match3-container">
    <!-- 顶部状态栏 -->
    <game-header 
      title="宝石消消乐 (无尽模式)" 
      :score="score" 
      :wave="currentWave"
      :moves="remainingMoves" 
      @pause="handlePause"
      @openRank="showRankModal = true"
    />

    <!-- 无尽波次与晋级目标提示条 -->
    <view class="target-bar flex-between">
      <view class="wave-info flex-center">
        <text class="wave-tag">第 {{ currentWave }} 波</text>
        <text class="target-text">晋级目标: <text class="highlight">{{ waveTargetScore }}</text></text>
      </view>

      <view class="progress-box">
        <view class="progress-inner" :style="{ width: `${Math.min(100, (score / waveTargetScore) * 100)}%` }"></view>
      </view>

      <text class="combo-text" v-if="comboCount > 1">🔥 {{ comboCount }}连击 (+{{ comboCount - 1 }}步)!</text>
    </view>

    <!-- 游戏棋盘区域 -->
    <view class="board-wrapper flex-center">
      <view class="board-grid">
        <view 
          v-for="(gem, index) in board" 
          :key="gem.id"
          class="gem-cell flex-center"
          :class="{
            'gem-selected': selectedIndex === index,
            'gem-matched': gem.isMatched,
            'gem-dropping': gem.isDropping
          }"
          :style="{ background: gem.colorBg }"
          @click="onGemClick(index)"
        >
          <text class="gem-icon">{{ gem.icon }}</text>
        </view>
      </view>
    </view>

    <!-- 底部无尽功能栏 -->
    <view class="footer-tools flex-between">
      <button class="tool-btn flex-center" @click="shuffleBoard">
        <text class="tool-btn-icon">🔀</text>
        <text class="tool-btn-text">洗牌 (10🪙)</text>
      </button>
      <button class="tool-btn flex-center btn-rank-entry" @click="showRankModal = true">
        <text class="tool-btn-icon">🏆</text>
        <text class="tool-btn-text">无尽榜</text>
      </button>
      <button class="tool-btn flex-center" @click="resetGame">
        <text class="tool-btn-icon">🔄</text>
        <text class="tool-btn-text">重置</text>
      </button>
    </view>

    <!-- 暂停弹窗 -->
    <game-pause-modal 
      :visible="isPaused" 
      @resume="isPaused = false" 
      @restart="resetGame" 
      @quit="quitToHall" 
    />

    <!-- 结算弹窗 -->
    <game-over-modal 
      :visible="isGameOver"
      :is-win="currentWave >= 5"
      :score="score"
      :wave="currentWave"
      :high-score="userStore.userInfo?.highScores?.match3 || 0"
      :is-new-record="isNewRecord"
      :reward-coins="rewardCoins"
      @restart="resetGame"
      @quit="quitToHall"
      @openRank="showRankModal = true"
    />

    <!-- 排行榜弹窗 -->
    <rank-modal 
      :visible="showRankModal" 
      default-game-key="match3"
      @close="showRankModal = false"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import GameHeader from '../../../components/game-header.vue'
import GamePauseModal from '../../../components/game-pause-modal.vue'
import GameOverModal from '../../../components/game-over-modal.vue'
import RankModal from '../../../components/rank-modal.vue'
import { useUserStore } from '../../../stores/user'
import { soundManager } from '../../../utils/audio'
import { apiSubmitScore } from '../../../api/rank'

const userStore = useUserStore()

const BOARD_SIZE = 8
const GEM_TYPES = [
  { icon: '💎', colorBg: 'linear-gradient(135deg, #60a5fa, #2563eb)' }, // 蓝钻
  { icon: '🔮', colorBg: 'linear-gradient(135deg, #c084fc, #9333ea)' }, // 紫水晶
  { icon: '⭐', colorBg: 'linear-gradient(135deg, #fcd34d, #d97706)' }, // 金星
  { icon: '🍀', colorBg: 'linear-gradient(135deg, #4ade80, #16a34a)' }, // 翡翠
  { icon: '❤️', colorBg: 'linear-gradient(135deg, #f87171, #dc2626)' }, // 红宝石
  { icon: '⚡', colorBg: 'linear-gradient(135deg, #fbbf24, #ea580c)' }  // 闪电
]

const board = ref([])
const selectedIndex = ref(-1)
const isProcessing = ref(false)
const score = ref(0)
const remainingMoves = ref(20)
const comboCount = ref(0)

// 无尽模式状态
const currentWave = ref(1)
const waveTargetScore = computed(() => {
  // 每波目标分数动态递增：Wave 1 (1000), Wave 2 (2400), Wave 3 (4200), Wave 4 (6500)...
  return currentWave.value * 1000 + (currentWave.value - 1) * 400
})

const isPaused = ref(false)
const isGameOver = ref(false)
const isNewRecord = ref(false)
const rewardCoins = ref(0)
const showRankModal = ref(false)

let gemIdCounter = 1

function createRandomGem() {
  const typeIndex = Math.floor(Math.random() * GEM_TYPES.length)
  return {
    id: gemIdCounter++,
    type: typeIndex,
    icon: GEM_TYPES[typeIndex].icon,
    colorBg: GEM_TYPES[typeIndex].colorBg,
    isMatched: false,
    isDropping: false
  }
}

function initBoard() {
  const newBoard = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      let gem
      let match = true
      while (match) {
        gem = createRandomGem()
        const matchH = c >= 2 && newBoard[r * BOARD_SIZE + c - 1]?.type === gem.type && newBoard[r * BOARD_SIZE + c - 2]?.type === gem.type
        const matchV = r >= 2 && newBoard[(r - 1) * BOARD_SIZE + c]?.type === gem.type && newBoard[(r - 2) * BOARD_SIZE + c]?.type === gem.type
        if (!matchH && !matchV) {
          match = false
        }
      }
      newBoard.push(gem)
    }
  }
  board.value = newBoard
}

async function onGemClick(index) {
  if (isProcessing.value || isGameOver.value || isPaused.value) return

  if (selectedIndex.value === -1) {
    selectedIndex.value = index
    soundManager.playPop()
    return
  }

  if (selectedIndex.value === index) {
    selectedIndex.value = -1
    return
  }

  const prev = selectedIndex.value
  const curr = index

  const r1 = Math.floor(prev / BOARD_SIZE), c1 = prev % BOARD_SIZE
  const r2 = Math.floor(curr / BOARD_SIZE), c2 = curr % BOARD_SIZE
  const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2)

  if (!isAdjacent) {
    selectedIndex.value = curr
    soundManager.playPop()
    return
  }

  selectedIndex.value = -1
  isProcessing.value = true

  swapGems(prev, curr)

  const matches = checkMatches()
  if (matches.length > 0) {
    remainingMoves.value--
    comboCount.value = 1
    await processMatches(matches)
  } else {
    soundManager.playTone(200, 'sine', 0.1)
    setTimeout(() => {
      swapGems(prev, curr)
      isProcessing.value = false
    }, 250)
  }
}

function swapGems(i, j) {
  const temp = board.value[i]
  board.value[i] = board.value[j]
  board.value[j] = temp
}

function checkMatches() {
  const matchedIndices = new Set()

  for (let r = 0; r < BOARD_SIZE; r++) {
    let matchLen = 1
    for (let c = 0; c < BOARD_SIZE; c++) {
      const idx = r * BOARD_SIZE + c
      const nextIdx = r * BOARD_SIZE + c + 1
      if (c < BOARD_SIZE - 1 && board.value[idx]?.type === board.value[nextIdx]?.type) {
        matchLen++
      } else {
        if (matchLen >= 3) {
          for (let k = 0; k < matchLen; k++) {
            matchedIndices.add(r * BOARD_SIZE + (c - k))
          }
        }
        matchLen = 1
      }
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let matchLen = 1
    for (let r = 0; r < BOARD_SIZE; r++) {
      const idx = r * BOARD_SIZE + c
      const nextIdx = (r + 1) * BOARD_SIZE + c
      if (r < BOARD_SIZE - 1 && board.value[idx]?.type === board.value[nextIdx]?.type) {
        matchLen++
      } else {
        if (matchLen >= 3) {
          for (let k = 0; k < matchLen; k++) {
            matchedIndices.add((r - k) * BOARD_SIZE + c)
          }
        }
        matchLen = 1
      }
    }
  }

  return Array.from(matchedIndices)
}

async function processMatches(matches) {
  matches.forEach(idx => {
    if (board.value[idx]) board.value[idx].isMatched = true
  })

  // 得分与无尽步数奖励机制
  const matchPoints = matches.length * 15 * comboCount.value
  score.value += matchPoints

  // 消除大于等于4个或连击时，奖励额外步数以支持无尽续命
  if (matches.length >= 4) {
    remainingMoves.value += 1
    uni.showToast({ title: '4连消除 +1步！', icon: 'none' })
  }
  if (comboCount.value >= 2) {
    remainingMoves.value += 1
  }

  soundManager.playCombo(comboCount.value)

  await new Promise(r => setTimeout(r, 260))

  // 下落与填补
  for (let c = 0; c < BOARD_SIZE; c++) {
    let writeRow = BOARD_SIZE - 1
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      const idx = r * BOARD_SIZE + c
      if (!board.value[idx].isMatched) {
        if (writeRow !== r) {
          board.value[writeRow * BOARD_SIZE + c] = board.value[idx]
          board.value[writeRow * BOARD_SIZE + c].isDropping = true
        }
        writeRow--
      }
    }
    while (writeRow >= 0) {
      const newGem = createRandomGem()
      newGem.isDropping = true
      board.value[writeRow * BOARD_SIZE + c] = newGem
      writeRow--
    }
  }

  await new Promise(r => setTimeout(r, 220))

  board.value.forEach(g => {
    g.isDropping = false
    g.isMatched = false
  })

  // 递归检查连击
  const nextMatches = checkMatches()
  if (nextMatches.length > 0) {
    comboCount.value++
    await processMatches(nextMatches)
  } else {
    isProcessing.value = false
    comboCount.value = 0
    checkEndlessWaveProgress()
  }
}

// 检查无尽模式波次晋级
function checkEndlessWaveProgress() {
  // 达到当前波次目标分数，自动晋级下一波并奖励步数
  if (score.value >= waveTargetScore.value) {
    currentWave.value++
    remainingMoves.value += 6 // 晋级大礼包
    soundManager.playCoin()
    uni.showModal({
      title: '🔥 无尽晋级！',
      content: `恭喜突破第 ${currentWave.value - 1} 波！\n进入第 ${currentWave.value} 波，奖励 +6 步数！目标分数已提升！`,
      showCancel: false,
      confirmText: '继续冲刺'
    })
  }

  // 步数耗尽则无尽挑战结算
  if (remainingMoves.value <= 0) {
    handleGameOver()
  }
}

function handleGameOver() {
  isGameOver.value = true
  soundManager.playGameOver()
  rewardCoins.value = Math.floor(score.value / 25) + currentWave.value * 10
  userStore.addCoins(rewardCoins.value)
  isNewRecord.value = userStore.recordScore('match3', score.value)

  // 提交战绩至排行榜
  apiSubmitScore({
    gameKey: 'match3',
    score: score.value,
    wave: currentWave.value,
    user: userStore.userInfo
  })
}

function shuffleBoard() {
  if (isProcessing.value) return
  if (userStore.userCoins < 10) {
    uni.showToast({ title: '金币不足 10 枚', icon: 'none' })
    return
  }
  userStore.addCoins(-10)
  soundManager.playPop()

  for (let i = board.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = board.value[i]
    board.value[i] = board.value[j]
    board.value[j] = temp
  }
  uni.showToast({ title: '已打乱棋盘', icon: 'none' })
}

function handlePause() {
  isPaused.value = true
}

function resetGame() {
  isPaused.value = false
  isGameOver.value = false
  isNewRecord.value = false
  score.value = 0
  currentWave.value = 1
  remainingMoves.value = 20
  comboCount.value = 0
  initBoard()
}

function quitToHall() {
  uni.switchTab({ url: '/pages/tabbar/games/index' })
}

onMounted(() => {
  initBoard()
})
</script>

<style scoped>
.match3-container {
  min-height: 100vh;
  background: #fdf2f8;
  display: flex;
  flex-direction: column;
}

.target-bar {
  padding: 14rpx 24rpx;
  background: #ffffff;
  border-bottom: 2rpx solid #fce7f3;
}

.wave-info {
  gap: 12rpx;
}

.wave-tag {
  background: #fdf2f8;
  color: #db2777;
  font-size: 20rpx;
  font-weight: bold;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  border: 2rpx solid #fbcfe8;
}

.target-text {
  font-size: 22rpx;
  color: #831843;
}

.highlight {
  font-weight: bold;
  color: #db2777;
}

.progress-box {
  width: 180rpx;
  height: 14rpx;
  background: #fbcfe8;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #ec4899, #be185d);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.combo-text {
  font-size: 22rpx;
  font-weight: bold;
  color: #e11d48;
}

/* 棋盘主体 */
.board-wrapper {
  flex: 1;
  padding: 20rpx;
}

.board-grid {
  width: 710rpx;
  height: 710rpx;
  background: #f43f5e15;
  border: 6rpx solid #fb7185;
  border-radius: 28rpx;
  padding: 12rpx;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 8rpx;
  box-shadow: 0 10rpx 30rpx rgba(225, 29, 72, 0.12);
}

.gem-cell {
  border-radius: 16rpx;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
  user-select: none;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
}

.gem-icon {
  font-size: 40rpx;
}

.gem-selected {
  transform: scale(1.18);
  box-shadow: 0 0 16rpx #fbbf24, 0 0 24rpx #f59e0b;
  z-index: 10;
}

.gem-matched {
  transform: scale(0);
  opacity: 0;
}

.gem-dropping {
  animation: dropAnim 0.25s ease-out;
}

@keyframes dropAnim {
  from { transform: translateY(-30rpx); opacity: 0.5; }
  to { transform: translateY(0); opacity: 1; }
}

/* 底部功能栏 */
.footer-tools {
  padding: 20rpx 32rpx 50rpx;
  gap: 16rpx;
}

.tool-btn {
  flex: 1;
  height: 80rpx;
  background: #ffffff;
  border: 2rpx solid #fbcfe8;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #9d174d;
  font-weight: bold;
}

.btn-rank-entry {
  background: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}

.tool-btn-icon {
  font-size: 30rpx;
  margin-right: 8rpx;
}
</style>
