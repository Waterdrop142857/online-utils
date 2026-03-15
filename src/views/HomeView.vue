<template>
  <div class="home-view">
    <header class="header">
      <h1>🛠️ 在线工具集</h1>
      <p class="subtitle">简洁、高效的纯前端工具</p>
    </header>

    <!-- 分类筛选 -->
    <nav class="category-nav">
      <button
        :class="{ active: selectedCategory === 'all' }"
        @click="selectedCategory = 'all'"
      >
        全部
      </button>
      <button
        v-for="category in categories"
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </nav>

    <!-- 工具卡片列表 -->
    <main class="tools-grid">
      <router-link
        v-for="tool in filteredTools"
        :key="tool.id"
        :to="tool.path"
        class="tool-card"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <h3 class="tool-name">{{ tool.name }}</h3>
        <p class="tool-description">{{ tool.description }}</p>
        <span class="tool-category">{{ tool.category }}</span>
      </router-link>
    </main>

    <footer class="footer">
      <p>© 2026 在线工具集 - 纯前端实现，数据不上传服务器</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tools, categories } from '../data/tools.js'

const selectedCategory = ref('all')

const filteredTools = computed(() => {
  if (selectedCategory.value === 'all') {
    return tools
  }
  return tools.filter(tool => tool.category === selectedCategory.value)
})
</script>

<style scoped>
.home-view {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #f5f5f5;
  --card-bg: #fff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  --primary-color: #42b983;
  --category-bg: #f0f0f0;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color);
}

[data-theme="dark"] .home-view {
  --text-color: #e0e0e0;
  --text-light: #b0b0b0;
  --text-muted: #808080;
  --bg-color: #121212;
  --card-bg: #1e1e1e;
  --border-color: #333;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.5);
  --primary-color: #42b983;
  --category-bg: #333;
}

[data-theme="light"] .home-view {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #f5f5f5;
  --card-bg: #fff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  --primary-color: #42b983;
  --category-bg: #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .home-view {
    --text-color: #e0e0e0;
    --text-light: #b0b0b0;
    --text-muted: #808080;
    --bg-color: #121212;
    --card-bg: #1e1e1e;
    --border-color: #333;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.5);
    --primary-color: #42b983;
    --category-bg: #333;
  }
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
}

.category-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.category-nav button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}

.category-nav button:hover {
  background: var(--category-bg);
}

.category-nav button.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.2s;
  cursor: pointer;
}

.tool-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.tool-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.tool-description {
  font-size: 0.9rem;
  color: var(--text-light);
  text-align: center;
  margin-bottom: 1rem;
}

.tool-category {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  background: var(--category-bg);
  border-radius: 12px;
  color: var(--text-light);
}

.footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
