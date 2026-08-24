<script>
import { useUserStore } from './stores/user'
import { useAppStore } from './stores/app'
import { setupRouteGuard } from './utils/auth-guard'

export default {
  onLaunch() {
    const appStore = useAppStore()
    const userStore = useUserStore()
    setupRouteGuard()

    if (appStore.requireLogin && !userStore.isLoggedIn) {
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/auth/login'
        })
      }, 100)
    }
  }
}
</script>

<style>
/* ==========================================================================
   商业级极简优雅设计规范 (Enterprise Clean & Refined UI System)
   ========================================================================== */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

page {
  background-color: #f7f8fa;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #1d2129;
  font-size: 28rpx;
  line-height: 1.5;
  min-height: 100%;
}

/* 基础排版字阶规范 */
.text-heading-1 {
  font-size: 36rpx;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.3;
}

.text-heading-2 {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.text-body {
  font-size: 26rpx;
  font-weight: 400;
  color: #4e5969;
  line-height: 1.5;
}

.text-caption {
  font-size: 22rpx;
  font-weight: 400;
  color: #86909c;
  line-height: 1.4;
}

/* 常用弹性布局 */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

/* 标准高级白底卡片 */
.card-box {
  background: #ffffff;
  border-radius: 20rpx;
  border: 1rpx solid #e5e6eb;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

/* 按钮微交互 */
button {
  outline: none;
  border: none;
  font-family: inherit;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

button:active, .btn-hover {
  opacity: 0.85;
  transform: scale(0.98);
}

/* 标准胶囊标签 */
.badge-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.2;
}

.badge-primary { background: #eef2ff; color: #4f46e5; }
.badge-success { background: #e8ffea; color: #00b42a; }
.badge-warning { background: #fff7e8; color: #ff7d00; }
.badge-danger  { background: #ffece8; color: #f53f3f; }
.badge-neutral { background: #f2f3f5; color: #4e5969; }

/* 页面通用外间距 */
.page-wrap {
  padding: 24rpx;
  min-height: 100vh;
}
</style>
