<template>
  <view v-if="visible" class="modal-overlay flex-center">
    <view class="modal-card">
      <!-- 胜负与无尽模式标识 -->
      <view class="banner-icon">{{ isWin ? '🎉' : '💥' }}</view>
      <view class="banner-title" :class="isWin ? 'text-win' : 'text-lose'">
        {{ isWin ? '无尽突破！' : '无尽挑战结算' }}
      </view>
      <view class="banner-sub">{{ isWin ? '太强了！刷新了无尽生存记录！' : '虽败犹荣，下一次一定能走得更远！' }}</view>

      <!-- 成绩面板 -->
      <view class="score-board card-box">
        <view v-if="wave" class="score-row flex-between">
          <text class="label">到达波次</text>
          <text class="val wave-val">第 {{ wave }} 波 (Endless)</text>
        </view>
        <view class="score-row flex-between">
          <text class="label">本次得分</text>
          <text class="val current-val">{{ score.toLocaleString() }}</text>
        </view>
        <view class="score-row flex-between">
          <text class="label">历史最高</text>
          <text class="val">{{ highScore.toLocaleString() }}</text>
        </view>
        <view v-if="isNewRecord" class="record-tag flex-center">
          <text>🔥 刷新历史最高纪录并同步排行榜！</text>
        </view>
        <view v-if="rewardCoins > 0" class="reward-row flex-center">
          <text class="reward-text">获得奖励: +{{ rewardCoins }} 🪙 金币</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="modal-actions">
        <button class="btn btn-primary flex-center" hover-class="btn-hover" @click="$emit('restart')">
          🔄 再次挑战无尽
        </button>
        <button class="btn btn-rank flex-center" hover-class="btn-hover" @click="$emit('openRank')">
          🏆 查看英雄排行榜
        </button>
        <button class="btn btn-secondary flex-center" hover-class="btn-hover" @click="$emit('quit')">
          🎮 返回游戏大厅
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  isWin: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  wave: { type: Number, default: undefined },
  highScore: { type: Number, default: 0 },
  isNewRecord: { type: Boolean, default: false },
  rewardCoins: { type: Number, default: 0 }
})
defineEmits(['restart', 'quit', 'openRank'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 999;
  padding: 40rpx;
}

.modal-card {
  width: 100%;
  max-width: 620rpx;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 44rpx 36rpx;
  text-align: center;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.25);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.banner-icon {
  font-size: 88rpx;
  margin-bottom: 4rpx;
}

.banner-title {
  font-size: 40rpx;
  font-weight: 800;
  margin-bottom: 6rpx;
}

.text-win {
  color: #10b981;
}

.text-lose {
  color: #ef4444;
}

.banner-sub {
  font-size: 22rpx;
  color: #64748b;
  margin-bottom: 28rpx;
}

.score-board {
  background: #f8fafc;
  padding: 20rpx 28rpx;
  margin-bottom: 28rpx;
  border: 2rpx solid #e2e8f0;
}

.score-row {
  margin-bottom: 10rpx;
}

.score-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 24rpx;
  color: #64748b;
}

.val {
  font-size: 30rpx;
  font-weight: bold;
  color: #334155;
}

.wave-val {
  color: #7c3aed;
  font-weight: 800;
}

.current-val {
  font-size: 38rpx;
  color: #4f46e5;
}

.record-tag {
  background: #fef3c7;
  color: #d97706;
  font-size: 22rpx;
  font-weight: bold;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-top: 14rpx;
}

.reward-row {
  margin-top: 12rpx;
}

.reward-text {
  font-size: 22rpx;
  color: #059669;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn {
  height: 84rpx;
  border-radius: 42rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(79, 70, 229, 0.3);
}

.btn-rank {
  background: #fef3c7;
  color: #d97706;
  border: 2rpx solid #fde68a;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}
</style>
