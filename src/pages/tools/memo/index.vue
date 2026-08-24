<template>
  <view class="memo-container">
    <!-- 顶部快速输入栏 -->
    <view class="quick-add-box card-box flex-between">
      <input 
        v-model="newMemoText" 
        placeholder="✍️ 记录随时涌现的灵感或待办..." 
        class="add-input"
        @confirm="addMemo"
      />
      <button class="btn-add flex-center" @click="addMemo">添加</button>
    </view>

    <!-- 分类过滤器 -->
    <view class="filter-tabs flex-center">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 便签列表 -->
    <view class="memo-list">
      <view 
        v-for="(memo, idx) in filteredMemos" 
        :key="memo.id"
        class="memo-item card-box flex-between"
        :class="{ 'memo-done': memo.completed }"
      >
        <view class="memo-left flex-center" @click="toggleMemo(memo)">
          <view class="check-circle flex-center" :class="{ checked: memo.completed }">
            <text v-if="memo.completed" class="check-mark">✓</text>
          </view>
          <view class="memo-content-box">
            <text class="memo-text">{{ memo.content }}</text>
            <text class="memo-time">{{ memo.time }}</text>
          </view>
        </view>

        <text class="btn-del" @click="deleteMemo(idx)">🗑️</text>
      </view>

      <view v-if="filteredMemos.length === 0" class="empty-state flex-column flex-center">
        <text class="empty-emoji">📝</text>
        <text class="empty-text">暂无便签，快随手记一条吧</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { soundManager } from '../../../utils/audio'

const newMemoText = ref('')
const currentTab = ref('all')

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'todo', label: '待办中' },
  { id: 'done', label: '已完成' }
]

const memos = ref([
  { id: 1, content: '通关消消乐第1关 💎', completed: true, time: '今天 09:30' },
  { id: 2, content: '在飞机大战中突破 5000 分 🚀', completed: false, time: '今天 10:15' },
  { id: 3, content: '体验命运大转盘决定午餐 🍲', completed: false, time: '昨天 12:00' }
])

const filteredMemos = computed(() => {
  if (currentTab.value === 'todo') return memos.value.filter(m => !m.completed)
  if (currentTab.value === 'done') return memos.value.filter(m => m.completed)
  return memos.value
})

function addMemo() {
  if (!newMemoText.value.trim()) return
  const now = new Date()
  const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  memos.value.unshift({
    id: Date.now(),
    content: newMemoText.value.trim(),
    completed: false,
    time: timeStr
  })

  newMemoText.value = ''
  saveToStorage()
  soundManager.playPop()
}

function toggleMemo(memo) {
  memo.completed = !memo.completed
  if (memo.completed) {
    soundManager.playCoin()
  } else {
    soundManager.playPop()
  }
  saveToStorage()
}

function deleteMemo(idx) {
  memos.value.splice(idx, 1)
  saveToStorage()
  soundManager.playPop()
}

function saveToStorage() {
  try {
    uni.setStorageSync('custom_memos_list', JSON.stringify(memos.value))
  } catch (e) {}
}

onMounted(() => {
  try {
    const cached = uni.getStorageSync('custom_memos_list')
    if (cached) {
      memos.value = JSON.parse(cached)
    }
  } catch (e) {}
})
</script>

<style scoped>
.memo-container {
  padding: 24rpx;
  background: #f0fdfa;
  min-height: 100vh;
}

.quick-add-box {
  padding: 16rpx 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #ccfbf1;
}

.add-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: #0f766e;
}

.btn-add {
  background: #14b8a6;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 32rpx;
  margin-left: 16rpx;
}

/* 过滤 Tab */
.filter-tabs {
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab-btn {
  padding: 10rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #64748b;
  cursor: pointer;
}

.tab-btn.active {
  background: #14b8a6;
  color: #ffffff;
  font-weight: bold;
}

/* 便签列表 */
.memo-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.memo-item {
  padding: 24rpx;
  margin-bottom: 0;
  transition: all 0.2s ease;
}

.memo-left {
  gap: 20rpx;
  flex: 1;
  cursor: pointer;
}

.check-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 4rpx solid #cbd5e1;
  flex-shrink: 0;
}

.check-circle.checked {
  background: #14b8a6;
  border-color: #14b8a6;
}

.check-mark {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}

.memo-content-box {
  flex: 1;
}

.memo-text {
  font-size: 28rpx;
  color: #1e293b;
  display: block;
}

.memo-time {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 4rpx;
  display: block;
}

.memo-done .memo-text {
  text-decoration: line-through;
  color: #94a3b8;
}

.btn-del {
  font-size: 28rpx;
  cursor: pointer;
  padding: 8rpx;
}

.empty-state {
  padding: 100rpx 0;
}

.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
}
</style>
