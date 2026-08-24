<template>
  <view v-if="visible" class="modal-overlay flex-center">
    <view class="modal-card">
      <view class="modal-icon">⏸️</view>
      <view class="modal-title">游戏已暂停</view>
      <view class="modal-desc">稍微休息一下，准备好继续挑战了吗？</view>

      <view class="modal-actions">
        <button class="btn btn-resume flex-center" hover-class="btn-hover" @click="$emit('resume')">
          ▶️ 继续游戏
        </button>
        <button class="btn btn-restart flex-center" hover-class="btn-hover" @click="$emit('restart')">
          🔄 重新开始
        </button>
        <button class="btn btn-quit flex-center" hover-class="btn-hover" @click="$emit('quit')">
          🚪 退出到大厅
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false }
})
defineEmits(['resume', 'restart', 'quit'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 999;
  padding: 40rpx;
}

.modal-card {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.2);
  animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.modal-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.modal-desc {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 40rpx;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.btn-resume {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
}

.btn-restart {
  background: #f1f5f9;
  color: #334155;
}

.btn-quit {
  background: transparent;
  color: #94a3b8;
}
</style>
