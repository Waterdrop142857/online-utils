<template>
  <div class="tool-view">
    <header class="tool-header">
      <router-link to="/" class="back-btn">← 返回导航</router-link>
      <h1 v-if="tool">{{ tool.icon }} {{ tool.name }}</h1>
    </header>

    <main class="tool-content">
      <div v-if="tool" class="tool-placeholder">
        <p class="tool-description">{{ tool.description }}</p>
        <div class="placeholder-content">
          <p>🚧 工具开发中...</p>
          <p>此工具页面尚未实现</p>
        </div>
      </div>
      <div v-else class="not-found">
        <p>❌ 工具不存在</p>
        <router-link to="/" class="back-btn">返回首页</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { tools } from '../data/tools.js'

const route = useRoute()

const tool = computed(() => {
  return tools.find(t => t.id === route.params.toolId)
})
</script>

<style scoped>
.tool-view {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #f5f5f5;
  --card-bg: #fff;
  --border-color: #e0e0e0;
  --placeholder-bg: #f9f9f9;
  --primary-color: #42b983;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color);
}

[data-theme="dark"] .tool-view {
  --text-color: #e0e0e0;
  --text-light: #b0b0b0;
  --text-muted: #808080;
  --bg-color: #121212;
  --card-bg: #1e1e1e;
  --border-color: #333;
  --placeholder-bg: #2a2a2a;
  --primary-color: #42b983;
}

[data-theme="light"] .tool-view {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #f5f5f5;
  --card-bg: #fff;
  --border-color: #e0e0e0;
  --placeholder-bg: #f9f9f9;
  --primary-color: #42b983;
}

@media (prefers-color-scheme: dark) {
  .tool-view {
    --text-color: #e0e0e0;
    --text-light: #b0b0b0;
    --text-muted: #808080;
    --bg-color: #121212;
    --card-bg: #1e1e1e;
    --border-color: #333;
    --placeholder-bg: #2a2a2a;
    --primary-color: #42b983;
  }
}

.tool-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.back-btn:hover {
  text-decoration: underline;
}

.tool-header h1 {
  font-size: 2rem;
  color: var(--text-color);
}

.tool-content {
  flex: 1;
}

.tool-placeholder {
  text-align: center;
  padding: 3rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.tool-description {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.placeholder-content {
  padding: 2rem;
  background: var(--placeholder-bg);
  border-radius: 8px;
  color: var(--text-muted);
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.not-found .back-btn {
  display: inline-block;
  margin-top: 1rem;
}
</style>
