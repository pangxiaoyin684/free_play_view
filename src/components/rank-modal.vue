<template>
  <view v-if="visible" class="rank-modal-overlay flex-center">
    <view class="rank-modal-card flex-column">
      <!-- 弹窗标题与关闭按钮 -->
      <view class="modal-header flex-between">
        <view class="title-wrap flex-center">
          <text class="trophy-icon">🏆</text>
          <text class="title-text">全服英雄排行榜</text>
        </view>
        <view class="btn-close-box flex-center" @click="$emit('close')">
          <text class="btn-close-txt">✕</text>
        </view>
      </view>

      <!-- 游戏切换 Tabs -->
      <view class="game-tabs-row flex-between">
        <view 
          v-for="g in GAME_TABS" 
          :key="g.key"
          class="game-tab-btn"
          :class="{ active: currentKey === g.key }"
          @click="switchGame(g.key)"
        >
          <text class="tab-btn-txt">{{ g.name }}</text>
        </view>
      </view>

      <!-- 时间周期 Tabs (总榜 / 周榜 / 日榜) -->
      <view class="period-tabs-bar flex-center">
        <view 
          v-for="p in PERIOD_TABS" 
          :key="p.id"
          class="period-item-pill"
          :class="{ active: currentPeriod === p.id }"
          @click="switchPeriod(p.id)"
        >
          <text class="period-txt">{{ p.label }}</text>
        </view>
      </view>

      <!-- 榜单列表区 -->
      <scroll-view scroll-y class="rank-list-scroll">
        <view v-if="rankList.length === 0" class="empty-box flex-center">
          <text class="empty-text">加载排行榜中...</text>
        </view>

        <view 
          v-for="item in rankList" 
          :key="item.id"
          class="rank-item-row flex-between"
          :class="{ 
            'top-1': item.rank === 1,
            'top-2': item.rank === 2,
            'top-3': item.rank === 3,
            'is-me': item.isMe
          }"
        >
          <view class="item-left-box flex-center">
            <!-- 名次徽章 -->
            <view class="rank-badge-box flex-center">
              <text v-if="item.rank === 1" class="medal-emoji">🥇</text>
              <text v-else-if="item.rank === 2" class="medal-emoji">🥈</text>
              <text v-else-if="item.rank === 3" class="medal-emoji">🥉</text>
              <text v-else class="rank-normal-num">{{ item.rank }}</text>
            </view>

            <!-- 玩家头像与资料 -->
            <image :src="item.avatar" class="user-avatar-img" mode="aspectFill" />
            <view class="user-meta-column flex-column">
              <view class="nickname-line flex-center">
                <text class="user-name-txt">{{ item.nickname }}</text>
                <text v-if="item.isMe" class="badge-me-tag">我</text>
              </view>
              <text class="user-wave-txt">到达第 {{ item.wave || 1 }} 波 · {{ item.title || '挑战者' }}</text>
            </view>
          </view>

          <!-- 战绩分数 -->
          <view class="item-right-score flex-column">
            <text class="score-value-txt">{{ item.score.toLocaleString() }}</text>
            <text class="score-unit-txt">分</text>
          </view>
        </view>
      </scroll-view>

      <!-- 底部固定栏：我的当前排名与战绩 -->
      <view class="my-rank-footer flex-between">
        <view class="my-info-left flex-center">
          <view class="my-rank-pill flex-center">
            <text class="my-rank-txt">No.{{ myRankInfo?.rank || '-' }}</text>
          </view>
          <image :src="userStore.userAvatar" class="my-avatar-img" mode="aspectFill" />
          <view class="my-text-box">
            <text class="my-nickname-txt">{{ userStore.userNickname }}</text>
            <text class="my-record-lbl">我的当前战绩</text>
          </view>
        </view>

        <view class="my-score-right flex-column">
          <text class="my-score-num">{{ (userStore.userInfo?.highScores?.[currentKey] || 0).toLocaleString() }}</text>
          <text class="my-score-unit">分</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { apiGetGameRankings } from '../api/rank'
import { useUserStore } from '../stores/user'
import { soundManager } from '../utils/audio'

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultGameKey: { type: String, default: 'match3' }
})

const emit = defineEmits(['close'])
const userStore = useUserStore()

const GAME_TABS = [
  { key: 'match3', name: '💎 消消乐' },
  { key: 'planeWar', name: '🚀 飞机大战' },
  { key: 'linkGame', name: '🍇 连连看' }
]

const PERIOD_TABS = [
  { id: 'all', label: '历史总榜' },
  { id: 'weekly', label: '本周榜' },
  { id: 'daily', label: '今日新星' }
]

const currentKey = ref(props.defaultGameKey || 'match3')
const currentPeriod = ref('all')
const rankList = ref([])
const myRankInfo = ref(null)

watch(() => props.visible, (val) => {
  if (val) {
    currentKey.value = props.defaultGameKey || 'match3'
    loadRankings()
  }
})

watch(() => props.defaultGameKey, (val) => {
  if (val) currentKey.value = val
})

async function loadRankings() {
  const res = await apiGetGameRankings(currentKey.value, currentPeriod.value, userStore.userInfo)
  rankList.value = res.list || []
  myRankInfo.value = res.myRank || null
}

function switchGame(key) {
  currentKey.value = key
  soundManager.playPop()
  loadRankings()
}

function switchPeriod(period) {
  currentPeriod.value = period
  soundManager.playPop()
  loadRankings()
}

onMounted(() => {
  if (props.visible) {
    loadRankings()
  }
})
</script>

<style scoped>
.rank-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 999;
  padding: 32rpx 24rpx;
}

.rank-modal-card {
  width: 100%;
  max-width: 680rpx;
  height: 80vh;
  background: #ffffff;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

/* 顶部标题栏 */
.modal-header {
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #e5e6eb;
}

.title-wrap {
  gap: 10rpx;
}

.trophy-icon {
  font-size: 36rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1d2129;
}

.btn-close-box {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #f2f3f5;
  cursor: pointer;
}

.btn-close-txt {
  font-size: 24rpx;
  color: #86909c;
  line-height: 1;
}

/* 游戏切换 */
.game-tabs-row {
  padding: 16rpx 24rpx;
  background: #f7f8fa;
  gap: 14rpx;
}

.game-tab-btn {
  flex: 1;
  text-align: center;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: #ffffff;
  border: 1rpx solid #e5e6eb;
  cursor: pointer;
}

.tab-btn-txt {
  font-size: 24rpx;
  font-weight: 500;
  color: #4e5969;
  white-space: nowrap;
}

.game-tab-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
}

.game-tab-btn.active .tab-btn-txt {
  color: #ffffff;
  font-weight: 600;
}

/* 周期切换 */
.period-tabs-bar {
  padding: 12rpx 24rpx;
  border-bottom: 1rpx solid #f2f3f5;
  gap: 16rpx;
}

.period-item-pill {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  cursor: pointer;
}

.period-txt {
  font-size: 22rpx;
  color: #86909c;
}

.period-item-pill.active {
  background: #f2f3f5;
}

.period-item-pill.active .period-txt {
  color: #1d2129;
  font-weight: 600;
}

/* 列表滚动 */
.rank-list-scroll {
  flex: 1;
  padding: 16rpx 20rpx;
  overflow-y: auto;
}

.rank-item-row {
  padding: 16rpx;
  border-radius: 16rpx;
  margin-bottom: 10rpx;
  background: #ffffff;
  border: 1rpx solid #e5e6eb;
}

.top-1 { background: #fffdf0; border-color: #fde68a; }
.top-2 { background: #f8fafc; border-color: #cbd5e1; }
.top-3 { background: #fff9f5; border-color: #fed7aa; }
.is-me { background: #eef2ff; border-color: #c7d2fe; }

.item-left-box {
  gap: 14rpx;
}

.rank-badge-box {
  width: 44rpx;
  height: 44rpx;
}

.medal-emoji { font-size: 34rpx; }

.rank-normal-num {
  font-size: 24rpx;
  font-weight: 700;
  color: #86909c;
}

.user-avatar-img {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 1rpx solid #e5e6eb;
}

.nickname-line {
  justify-content: flex-start;
  gap: 8rpx;
}

.user-name-txt {
  font-size: 24rpx;
  font-weight: 600;
  color: #1d2129;
}

.badge-me-tag {
  background: #4f46e5;
  color: #ffffff;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-weight: 600;
}

.user-wave-txt {
  font-size: 20rpx;
  color: #86909c;
  margin-top: 2rpx;
}

.item-right-score {
  align-items: flex-end;
}

.score-value-txt {
  font-size: 28rpx;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.1;
}

.score-unit-txt {
  font-size: 16rpx;
  color: #86909c;
}

/* 底部我的排名 */
.my-rank-footer {
  padding: 18rpx 24rpx;
  background: #18181b;
  color: #ffffff;
}

.my-info-left {
  gap: 14rpx;
}

.my-rank-pill {
  background: #27272a;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  border: 1rpx solid #3f3f46;
}

.my-rank-txt {
  font-size: 20rpx;
  font-weight: 600;
  color: #fbbf24;
}

.my-avatar-img {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 1rpx solid #4f46e5;
}

.my-nickname-txt {
  font-size: 24rpx;
  font-weight: 600;
  color: #fafafa;
  display: block;
}

.my-record-lbl {
  font-size: 18rpx;
  color: #a1a1aa;
}

.my-score-right {
  align-items: flex-end;
}

.my-score-num {
  font-size: 30rpx;
  font-weight: 700;
  color: #38bdf8;
}

.my-score-unit {
  font-size: 16rpx;
  color: #a1a1aa;
}
</style>
