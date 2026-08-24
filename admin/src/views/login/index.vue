<template>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="login-header">
        <span class="logo-emoji">🎮</span>
        <h2 class="login-title">休闲游戏与百宝箱</h2>
        <p class="login-subtitle">运营与数据管理控制台</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">管理员账号</label>
          <input 
            v-model="username" 
            type="text" 
            class="form-control" 
            placeholder="默认 admin" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">安全密码</label>
          <input 
            v-model="password" 
            type="password" 
            class="form-control" 
            placeholder="默认 admin123" 
            required 
          />
        </div>

        <div v-if="errorMsg" class="error-tip">
          ⚠️ {{ errorMsg }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '验证中...' : '立即登录后台' }}
        </button>

        <div class="quick-hint">
          <span>💡 提示：演示环境已预设账号 <b>admin</b> / 密码 <b>admin123</b></span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const errorMsg = ref('')

function handleLogin() {
  errorMsg.value = ''
  loading.value = true

  setTimeout(() => {
    loading.value = false
    if (username.value.trim() === 'admin' && (password.value === 'admin123' || password.value === '123456')) {
      localStorage.setItem('admin_token', 'mock_admin_token_' + Date.now())
      router.push('/dashboard')
    } else {
      errorMsg.value = '账号或密码错误（测试账号: admin / 密码: admin123）'
    }
  }, 400)
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.login-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.form-control:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.error-tip {
  color: #dc2626;
  font-size: 12px;
  margin-bottom: 16px;
  background: #fee2e2;
  padding: 8px 12px;
  border-radius: 6px;
}

.btn-submit {
  width: 100%;
  height: 44px;
  background: #4f46e5;
  color: #ffffff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-submit:hover {
  background: #4338ca;
}

.quick-hint {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
}
</style>
