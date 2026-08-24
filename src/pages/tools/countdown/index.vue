<template>
  <view class="countdown-container">
    <!-- 顶部主置顶倒数卡片 -->
    <view v-if="featuredEvent" class="featured-card card-box flex-between" :style="{ background: featuredEvent.bg }">
      <view class="featured-info">
        <text class="featured-tag">{{ featuredEvent.type === 'countdown' ? '⏳ 倒数中' : '💖 纪念日' }}</text>
        <text class="featured-title">{{ featuredEvent.title }}</text>
        <text class="featured-date">目标日期: {{ featuredEvent.targetDate }}</text>
      </view>
      <view class="featured-days-box flex-column flex-center">
        <text class="days-num">{{ getDaysDiff(featuredEvent.targetDate) }}</text>
        <text class="days-lbl">{{ featuredEvent.type === 'countdown' ? '天后到达' : '天已经过' }}</text>
      </view>
    </view>

    <!-- 事件列表头 -->
    <view class="list-header flex-between">
      <text class="list-title">📅 全部日程与纪念日 ({{ events.length }})</text>
      <button class="btn-create flex-center" @click="openAddModal">+ 新建倒数</button>
    </view>

    <!-- 事件卡片列表 -->
    <view class="events-list">
      <view 
        v-for="(item, index) in events" 
        :key="item.id"
        class="event-item card-box flex-between"
      >
        <view class="event-left flex-center">
          <view class="icon-bubble flex-center" :style="{ background: item.color }">
            <text class="event-emoji">{{ item.icon || '📌' }}</text>
          </view>
          <view class="event-meta">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-sub">{{ item.targetDate }} · {{ item.type === 'countdown' ? '未来倒计时' : '过去纪念日' }}</text>
          </view>
        </view>

        <view class="event-right flex-center">
          <view class="days-badge flex-column flex-center">
            <text class="badge-num" :style="{ color: item.color }">{{ getDaysDiff(item.targetDate) }}</text>
            <text class="badge-unit">天</text>
          </view>
          <text class="btn-del" @click="deleteEvent(index)">🗑️</text>
        </view>
      </view>
    </view>

    <!-- 新建弹窗 -->
    <view v-if="showModal" class="modal-overlay flex-center">
      <view class="modal-content card-box">
        <text class="modal-title">新建倒数 / 纪念日</text>
        
        <view class="form-item">
          <text class="form-label">标题事项</text>
          <input v-model="form.title" placeholder="如：距离春节 / 恋爱纪念日" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">选择日期 (YYYY-MM-DD)</text>
          <input v-model="form.targetDate" placeholder="2026-12-31" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">类型</text>
          <radio-group @change="onTypeChange" class="flex-center" style="gap: 30rpx;">
            <label class="radio-label"><radio value="countdown" :checked="form.type === 'countdown'" /> 倒数日</label>
            <label class="radio-label"><radio value="anniversary" :checked="form.type === 'anniversary'" /> 纪念日</label>
          </radio-group>
        </view>

        <view class="modal-actions flex-between">
          <button class="btn btn-cancel flex-center" @click="showModal = false">取消</button>
          <button class="btn btn-confirm flex-center" @click="saveEvent">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { soundManager } from '../../../utils/audio'

const events = ref([
  {
    id: 1,
    title: '新年倒计时 🎆',
    targetDate: '2027-01-01',
    type: 'countdown',
    icon: '🎉',
    color: '#6366f1',
    bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
  },
  {
    id: 2,
    title: '成为一名独立开发者 🚀',
    targetDate: '2026-01-01',
    type: 'anniversary',
    icon: '💻',
    color: '#10b981',
    bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
  },
  {
    id: 3,
    title: '下一次发薪日 💰',
    targetDate: '2026-09-15',
    type: 'countdown',
    icon: '🪙',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
  }
])

const featuredEvent = computed(() => events.value[0] || null)

const showModal = ref(false)
const form = ref({
  title: '',
  targetDate: '',
  type: 'countdown',
  icon: '📌',
  color: '#6366f1'
})

function getDaysDiff(dateStr) {
  if (!dateStr) return 0
  const target = new Date(dateStr).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  const diffTime = target - today
  return Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

function openAddModal() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  form.value = {
    title: '',
    targetDate: tomorrow,
    type: 'countdown',
    icon: '🎯',
    color: '#6366f1'
  }
  showModal.value = true
  soundManager.playPop()
}

function onTypeChange(e) {
  form.value.type = e.detail.value
}

function saveEvent() {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入事项标题', icon: 'none' })
    return
  }
  events.value.push({
    id: Date.now(),
    title: form.value.title.trim(),
    targetDate: form.value.targetDate,
    type: form.value.type,
    icon: form.value.type === 'countdown' ? '⏳' : '💖',
    color: form.value.type === 'countdown' ? '#6366f1' : '#ec4899',
    bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
  })
  saveToStorage()
  showModal.value = false
  soundManager.playCoin()
  uni.showToast({ title: '添加成功', icon: 'success' })
}

function deleteEvent(idx) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个倒数日程吗？',
    success: (res) => {
      if (res.confirm) {
        events.value.splice(idx, 1)
        saveToStorage()
        soundManager.playPop()
      }
    }
  })
}

function saveToStorage() {
  try {
    uni.setStorageSync('custom_events_list', JSON.stringify(events.value))
  } catch (e) {}
}

onMounted(() => {
  try {
    const cached = uni.getStorageSync('custom_events_list')
    if (cached) {
      events.value = JSON.parse(cached)
    }
  } catch (e) {}
})
</script>

<style scoped>
.countdown-container {
  padding: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.featured-card {
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  color: #ffffff;
  margin-bottom: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(99, 102, 241, 0.25);
}

.featured-tag {
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  display: inline-block;
  margin-bottom: 12rpx;
}

.featured-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.featured-date {
  font-size: 24rpx;
  opacity: 0.85;
}

.featured-days-box {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 20rpx 30rpx;
  border-radius: 24rpx;
}

.days-num {
  font-size: 56rpx;
  font-weight: 800;
  line-height: 1;
}

.days-lbl {
  font-size: 20rpx;
  margin-top: 6rpx;
}

/* 列表 */
.list-header {
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.list-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #334155;
}

.btn-create {
  background: #6366f1;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: bold;
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  margin: 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.event-item {
  padding: 24rpx;
  margin-bottom: 0;
}

.event-left {
  gap: 20rpx;
}

.icon-bubble {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
}

.event-emoji {
  font-size: 40rpx;
}

.item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
  margin-bottom: 4rpx;
}

.item-sub {
  font-size: 22rpx;
  color: #94a3b8;
}

.event-right {
  gap: 24rpx;
}

.days-badge {
  text-align: right;
}

.badge-num {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}

.badge-unit {
  font-size: 18rpx;
  color: #94a3b8;
}

.btn-del {
  font-size: 28rpx;
  cursor: pointer;
  padding: 8rpx;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  z-index: 999;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  padding: 40rpx 32rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
  margin-bottom: 28rpx;
  text-align: center;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 24rpx;
  color: #64748b;
  display: block;
  margin-bottom: 8rpx;
}

.form-input {
  background: #f1f5f9;
  height: 76rpx;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.modal-actions {
  gap: 20rpx;
  margin-top: 36rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-confirm {
  background: #6366f1;
  color: #ffffff;
}
</style>
