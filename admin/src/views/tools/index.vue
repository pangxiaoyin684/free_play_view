<template>
  <div class="tools-admin-container">
    <div class="admin-card">
      <div class="card-title">
        <span>🧰 实用百宝箱 · 工具上下架与排序管理</span>
        <button class="btn-primary" @click="saveToolsConfig">💾 保存工具配置</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>图标</th>
            <th>工具名称</th>
            <th>所属分类</th>
            <th>功能简介</th>
            <th>前台状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(t, index) in tools" :key="t.id">
            <td><b>{{ index + 1 }}</b></td>
            <td><span style="font-size: 24px;">{{ t.icon }}</span></td>
            <td><b>{{ t.name }}</b></td>
            <td><span class="badge badge-indigo">{{ t.category }}</span></td>
            <td style="color: #64748b; font-size: 12px;">{{ t.desc }}</td>
            <td>
              <span class="badge" :class="t.enabled ? 'badge-success' : 'badge-danger'">
                {{ t.enabled ? '✅ 正常展示' : '⛔ 已下架隐藏' }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button 
                  class="btn-sm" 
                  :class="t.enabled ? 'btn-danger' : 'btn-success'"
                  @click="t.enabled = !t.enabled"
                >
                  {{ t.enabled ? '下架' : '上架' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tools = ref([
  { id: 'mid-autumn-love', icon: '🥮', name: '中秋玉兔告白', category: '浪漫节日', desc: '萌兔送福、情书生成、孔明灯放飞与深情表白', enabled: true },
  { id: 'ai-remover', icon: '🪄', name: 'AI 消除与去水印', category: 'AI 图像', desc: '涂抹即消！基于 Agnes 图像模型智能补全背景', enabled: true },
  { id: 'id-photo', icon: '📸', name: 'AI 智能证件照', category: 'AI 图像', desc: '一寸/二寸/考研规格，智能抠图一键换红蓝白底', enabled: true },
  { id: 'dice', icon: '🎲', name: '欢乐摇骰子', category: '日常决策', desc: '聚会酒桌必备！1~6颗骰子、3D翻滚与音效', enabled: true },
  { id: 'decision-wheel', icon: '🎯', name: '命运大转盘', category: '日常决策', desc: '今天吃什么、谁去跑腿？转盘一转告别纠结！', enabled: true },
  { id: 'countdown', icon: '⏳', name: '倒数纪念日', category: '时间效率', desc: '记录重要日程、恋爱纪念日与发薪倒数', enabled: true },
  { id: 'memo', icon: '📝', name: '便签备忘录', category: '记录备忘', desc: '灵感清单、待办随手记、随时打勾完成', enabled: true }
])

function saveToolsConfig() {
  localStorage.setItem('admin_tools_config', JSON.stringify(tools.value))
  alert('🎉 百宝箱工具状态已成功同步保存！')
}
</script>
