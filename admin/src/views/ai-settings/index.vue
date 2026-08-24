<template>
  <div class="ai-settings-container">
    <div class="admin-card">
      <div class="card-title">
        <span>🤖 Agnes AI Agent 与图像大模型接口配置 (兼容 pangxiaoyin_view)</span>
        <button class="btn-primary" @click="saveAiConfig">💾 保存模型配置</button>
      </div>

      <div class="ai-form-grid">
        <div class="form-item">
          <label class="form-label">AI 接口基础网关 (Base URL):</label>
          <input v-model="aiConfig.baseUrl" class="text-input" placeholder="例如：https://apihub.agnes-ai.com" />
        </div>

        <div class="form-item">
          <label class="form-label">Agnes API 密钥 (API Key):</label>
          <input v-model="aiConfig.apiKey" type="password" class="text-input" placeholder="请输入 Agnes AI API Key" />
        </div>

        <div class="form-item">
          <label class="form-label">AI 图片消除/生成模型 (Image Model):</label>
          <select v-model="aiConfig.imageModel" class="text-input">
            <option value="agnes-image-2.0-flash">agnes-image-2.0-flash (高速推荐)</option>
            <option value="dall-e-3">dall-e-3 (通用模型)</option>
            <option value="stable-diffusion-xl">stable-diffusion-xl</option>
          </select>
        </div>

        <div class="form-item">
          <label class="form-label">AI Agent 对话模型 (Chat Model):</label>
          <select v-model="aiConfig.chatModel" class="text-input">
            <option value="agnes-2.0-flash">agnes-2.0-flash (秒级响应)</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
          </select>
        </div>
      </div>
    </div>

    <!-- AI 调用日志与状态监控 -->
    <div class="admin-card">
      <div class="card-title">
        <span>📋 近期 AI 图像消除与去水印处理日志</span>
        <span class="badge badge-success">API 连通正常</span>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>请求时间</th>
            <th>功能模块</th>
            <th>使用模型</th>
            <th>耗时 (ms)</th>
            <th>处理结果</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in aiLogs" :key="log.id">
            <td>{{ log.time }}</td>
            <td><b>{{ log.feature }}</b></td>
            <td><code>{{ log.model }}</code></td>
            <td>{{ log.duration }}ms</td>
            <td>{{ log.prompt }}</td>
            <td><span class="badge badge-success">调用成功 (200)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const aiConfig = ref({
  baseUrl: 'https://apihub.agnes-ai.com',
  apiKey: 'sk-agnes-demo-key-configured',
  imageModel: 'agnes-image-2.0-flash',
  chatModel: 'agnes-2.0-flash'
})

const aiLogs = ref([
  { id: 1, time: '13:02:40', feature: 'AI 消除与去水印', model: 'agnes-image-2.0-flash', duration: 1180, prompt: '去除海滩水印并平滑填充背景' },
  { id: 2, time: '13:00:15', feature: 'AI 智能证件照制作', model: 'agnes-portrait-v2', duration: 920, prompt: '人像抠图替换为经典蓝底色' },
  { id: 3, time: '12:58:30', feature: 'AI 消除与去水印', model: 'agnes-image-2.0-flash', duration: 1350, prompt: '消除多余路人杂物' }
])

function saveAiConfig() {
  localStorage.setItem('admin_ai_config', JSON.stringify(aiConfig.value))
  alert('🎉 Agnes AI 模型配置已成功更新并生效！')
}
</script>

<style scoped>
.ai-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.text-input {
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  background: #ffffff;
}
</style>
