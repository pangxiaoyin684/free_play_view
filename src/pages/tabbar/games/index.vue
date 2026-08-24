<template>
  <view class="games-hall-container">
    <!-- 顶部极简资产状态栏 -->
    <view class="user-status-strip card-box flex-between">
      <view class="user-info flex-center" @click="goToProfile">
        <image class="avatar" :src="userStore.userAvatar" mode="aspectFill" />
        <view class="info-text">
          <view class="nickname-row flex-center">
            <text class="nickname">{{ userStore.userNickname }}</text>
            <text class="badge-tag" :class="userStore.userInfo?.loginType === 'mock' ? 'badge-warning' : 'badge-primary'">
              {{ userStore.userInfo?.loginType === 'mock' ? '体验' : '正式' }}
            </text>
          </view>
          <text class="status-sub">无尽极限挑战进行中</text>
        </view>
      </view>

      <view class="coins-pill flex-center" @click="claimDailyCoins">
        <text class="coin-icon">🪙</text>
        <text class="coin-count">{{ userStore.userCoins }}</text>
        <text v-if="!hasClaimedToday" class="btn-claim-text">+签到</text>
      </view>
    </view>

    <!-- 典雅极简全服排行榜 Hero Banner -->
    <view class="hero-season-banner flex-between" @click="openRankModal('match3')">
      <view class="banner-left">
        <view class="season-tag-row flex-center">
          <text class="season-dot"></text>
          <text class="season-tag">2026 S1 全服无尽赛季</text>
        </view>
        <text class="banner-title">英雄战神排行榜</text>
        <text class="banner-desc">实时全服动态战绩排位 · 点击查看榜单</text>
      </view>
      <view class="banner-right flex-center">
        <view class="trophy-box flex-center">
          <text class="trophy-emoji">🏆</text>
        </view>
      </view>
    </view>

    <!-- 分区标题 -->
    <view class="section-bar flex-between">
      <text class="section-title">竞技小游戏</text>
      <text class="section-count">3 款无尽模式</text>
    </view>

    <!-- 极简高质感游戏列表 -->
    <view class="games-list">
      <view 
        v-for="game in gamesList" 
        :key="game.id" 
        class="game-card card-box flex-between"
        @click="launchGame(game)"
      >
        <view class="game-icon-box flex-center" :style="{ background: game.iconBg }">
          <text class="game-icon">{{ game.icon }}</text>
        </view>

        <view class="game-main-info flex-1">
          <view class="game-title-row flex-between">
            <text class="game-name">{{ game.name }}</text>
            <text class="badge-tag" :style="{ background: game.tagBg, color: game.tagColor }">
              {{ game.tag }}
            </text>
          </view>

          <text class="game-desc">{{ game.description }}</text>

          <view class="game-bottom-row flex-between">
            <view class="score-info flex-center">
              <text class="score-label">最佳纪录:</text>
              <text class="score-val">{{ (userStore.userInfo?.highScores?.[game.key] || 0).toLocaleString() }}</text>
            </view>

            <view class="action-btn-group flex-center" style="gap: 12rpx;">
              <button class="btn-rank-outline flex-center" @click.stop="openRankModal(game.key)">
                榜单
              </button>
              <button class="btn-play-primary flex-center">
                挑战
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 排行榜弹窗 -->
    <rank-modal 
      :visible="showRankModal" 
      :default-game-key="selectedRankGameKey"
      @close="showRankModal = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../../stores/user'
import { checkAuthGuard } from '../../../utils/auth-guard'
import { soundManager } from '../../../utils/audio'
import RankModal from '../../../components/rank-modal.vue'

const userStore = useUserStore()
const hasClaimedToday = ref(false)
const showRankModal = ref(false)
const selectedRankGameKey = ref('match3')

const gamesList = ref([
  {
    id: 'plane-war',
    key: 'planeWar',
    name: '全民飞机大战',
    icon: '🚀',
    tag: '无尽弹幕',
    iconBg: '#eef2ff',
    tagBg: '#e0e7ff',
    tagColor: '#4f46e5',
    description: '4大传奇机库、散弹开火走位、5级火力狂飙！',
    path: '/pages/games/plane-war/index'
  },
  {
    id: 'match3',
    key: 'match3',
    name: '宝石消消乐',
    icon: '💎',
    tag: '无尽步数',
    iconBg: '#fdf2f8',
    tagBg: '#fce7f3',
    tagColor: '#db2777',
    description: '4连与Combo步数续命，波次目标难度阶梯递增！',
    path: '/pages/games/match3/index'
  },
  {
    id: 'link-game',
    key: 'linkGame',
    name: '欢乐连连看',
    icon: '🍇',
    tag: '无尽清屏',
    iconBg: '#ecfdf5',
    tagBg: '#d1fae5',
    tagColor: '#059669',
    description: '清屏自动晋级下一关，配对消除秒数续命冲榜！',
    path: '/pages/games/link-game/index'
  }
])

function launchGame(game) {
  soundManager.playPop()
  if (!checkAuthGuard(game.path)) return
  uni.navigateTo({
    url: game.path
  })
}

function openRankModal(gameKey = 'match3') {
  selectedRankGameKey.value = gameKey
  showRankModal.value = true
  soundManager.playPop()
}

function goToProfile() {
  uni.switchTab({ url: '/pages/tabbar/profile/index' })
}

function claimDailyCoins() {
  if (hasClaimedToday.value) {
    uni.showToast({ title: '今日已签到', icon: 'none' })
    return
  }
  userStore.addCoins(50)
  soundManager.playCoin()
  hasClaimedToday.value = true
  uni.showToast({ title: '已领取 +50 🪙 金币', icon: 'success' })
}
</script>

<style scoped>
.games-hall-container {
  padding: 24rpx;
  min-height: 100vh;
}

/* 顶部资产条 */
.user-status-strip {
  padding: 18rpx 24rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 18rpx;
  border: 2rpx solid #e5e6eb;
}

.nickname-row {
  justify-content: flex-start;
  gap: 10rpx;
}

.nickname {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.status-sub {
  font-size: 22rpx;
  color: #86909c;
  margin-top: 2rpx;
  display: block;
}

.coins-pill {
  background: #fff7e8;
  border: 1rpx solid #ffe4ba;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  gap: 8rpx;
  cursor: pointer;
}

.coin-icon {
  font-size: 26rpx;
}

.coin-count {
  font-size: 28rpx;
  font-weight: 700;
  color: #d46b08;
}

.btn-claim-text {
  font-size: 20rpx;
  color: #fa8c16;
  font-weight: 600;
  margin-left: 4rpx;
}

/* 赛季 Hero Banner */
.hero-season-banner {
  background: #18181b;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  color: #ffffff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(24, 24, 27, 0.15);
  cursor: pointer;
}

.season-tag-row {
  justify-content: flex-start;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.season-dot {
  width: 10rpx;
  height: 10rpx;
  background: #10b981;
  border-radius: 50%;
}

.season-tag {
  font-size: 20rpx;
  color: #a1a1aa;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.banner-title {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 4rpx;
  color: #fafafa;
}

.banner-desc {
  font-size: 22rpx;
  color: #71717a;
  display: block;
}

.trophy-box {
  width: 96rpx;
  height: 96rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.trophy-emoji {
  font-size: 52rpx;
}

/* 分区标题 */
.section-bar {
  margin: 24rpx 4rpx 14rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1d2129;
}

.section-count {
  font-size: 22rpx;
  color: #86909c;
}

/* 游戏卡片 */
.games-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.game-card {
  padding: 24rpx;
  margin-bottom: 0;
  align-items: flex-start;
  gap: 20rpx;
  cursor: pointer;
}

.game-icon-box {
  width: 104rpx;
  height: 104rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  border: 1rpx solid #e5e6eb;
}

.game-icon {
  font-size: 56rpx;
}

.game-title-row {
  margin-bottom: 6rpx;
}

.game-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.game-desc {
  font-size: 22rpx;
  color: #86909c;
  line-height: 1.4;
  margin-bottom: 14rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.game-bottom-row {
  border-top: 1rpx solid #f2f3f5;
  padding-top: 12rpx;
}

.score-info {
  gap: 8rpx;
}

.score-label {
  font-size: 20rpx;
  color: #86909c;
}

.score-val {
  font-size: 24rpx;
  font-weight: 700;
  color: #1d2129;
}

.btn-rank-outline {
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 12rpx;
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  color: #4e5969;
  font-size: 22rpx;
  font-weight: 600;
  margin: 0;
}

.btn-play-primary {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #4f46e5;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}
</style>
