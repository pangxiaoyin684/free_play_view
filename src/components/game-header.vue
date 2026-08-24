<template>
  <view class="game-header-wrap">
    <view class="header-inner flex-between">
      <!-- 返回与游戏标题 -->
      <view class="left-action flex-center" @click="handleBack">
        <text class="btn-icon">◀</text>
        <text class="game-title">{{ title }}</text>
      </view>

      <!-- 核心无尽状态数据栏 (得分、当前波次/难度、步数/生命/时间) -->
      <view class="center-stats flex-center">
        <!-- 当前波次/关卡 (无尽模式专属) -->
        <view v-if="wave !== undefined" class="stat-badge wave-badge">
          <text class="badge-label">波次</text>
          <text class="badge-value text-purple">W.{{ wave }}</text>
        </view>

        <!-- 分数 -->
        <view class="stat-badge score-badge">
          <text class="badge-label">得分</text>
          <text class="badge-value text-gold">{{ score.toLocaleString() }}</text>
        </view>

        <!-- 步数 / 生命 / 倒计时 -->
        <view v-if="moves !== undefined" class="stat-badge">
          <text class="badge-label">剩余步数</text>
          <text class="badge-value text-blue">{{ moves }} 步</text>
        </view>
        <view v-else-if="lives !== undefined" class="stat-badge">
          <text class="badge-label">生命值</text>
          <text class="badge-value text-red">❤️ {{ lives }}</text>
        </view>
        <view v-else-if="time !== undefined" class="stat-badge">
          <text class="badge-label">倒计时</text>
          <text class="badge-value text-orange">{{ time }}s</text>
        </view>
      </view>

      <!-- 右侧控制区 (排行榜、音效、暂停) -->
      <view class="right-actions flex-center">
        <view class="icon-btn flex-center" @click="$emit('openRank')">
          <text class="action-icon">🏆</text>
        </view>
        <view class="icon-btn flex-center" @click="toggleSound">
          <text class="action-icon">{{ appStore.soundEnabled ? '🔊' : '🔇' }}</text>
        </view>
        <view v-if="showPause" class="icon-btn flex-center" @click="$emit('pause')">
          <text class="action-icon">⏸️</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const props = defineProps({
  title: { type: String, default: '休闲游戏' },
  score: { type: Number, default: 0 },
  wave: { type: Number, default: undefined },
  moves: { type: Number, default: undefined },
  lives: { type: Number, default: undefined },
  time: { type: Number, default: undefined },
  showPause: { type: Boolean, default: true }
})

const emit = defineEmits(['pause', 'restart', 'back', 'openRank'])
const appStore = useAppStore()

function toggleSound() {
  appStore.toggleSound()
}

function handleBack() {
  uni.showModal({
    title: '退出游戏',
    content: '确定要退出当前游戏并返回吗？本次无尽模式分数将结算保存。',
    confirmText: '退出',
    cancelText: '继续挑战',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack({
          fail: () => {
            uni.switchTab({ url: '/pages/tabbar/games/index' })
          }
        })
      }
    }
  })
}
</script>

<style scoped>
.game-header-wrap {
  padding: 14rpx 20rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #e5e6eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.left-action {
  gap: 8rpx;
  cursor: pointer;
}

.btn-icon {
  font-size: 22rpx;
  color: #4f46e5;
  font-weight: 700;
}

.game-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1d2129;
}

.center-stats {
  gap: 10rpx;
}

.stat-badge {
  background: #f7f8fa;
  border: 1rpx solid #e5e6eb;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.badge-label {
  font-size: 16rpx;
  color: #86909c;
  line-height: 1.1;
}

.badge-value {
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.2;
}

.text-purple { color: #4f46e5; }
.text-gold { color: #d97706; }
.text-blue { color: #2563eb; }
.text-red { color: #ef4444; }
.text-orange { color: #ea580c; }

.right-actions {
  gap: 10rpx;
}

.icon-btn {
  width: 52rpx;
  height: 52rpx;
  background: #f2f3f5;
  border-radius: 12rpx;
  cursor: pointer;
}

.action-icon {
  font-size: 24rpx;
}
</style>
