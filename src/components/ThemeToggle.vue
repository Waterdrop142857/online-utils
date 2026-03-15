<template>
  <div class="theme-toggle">
    <button @click="toggleMenu" class="theme-btn" :title="`当前：${themeNames[theme]}`">
      <span class="icon">{{ themeIcons[theme] }}</span>
    </button>
    <div class="theme-menu" v-show="showMenu">
      <button
        v-for="(name, key) in themeNames"
        :key="key"
        :class="{ active: theme === key }"
        @click="setTheme(key)"
      >
        <span class="menu-icon">{{ themeIcons[key] }}</span>
        <span>{{ name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const theme = ref('auto')
const showMenu = ref(false)

const themeIcons = {
  auto: '🌗',
  light: '☀️',
  dark: '🌙'
}

const themeNames = {
  auto: '跟随系统',
  light: '亮色模式',
  dark: '暗色模式'
}

const applyTheme = (themeValue) => {
  if (themeValue === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}

const setTheme = (newTheme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  applyTheme(newTheme)
  showMenu.value = false
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.theme-toggle')) {
    showMenu.value = false
  }
}

onMounted(() => {
  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('theme') || 'auto'
  theme.value = savedTheme
  applyTheme(savedTheme)

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--border-color, #e0e0e0);
  background: var(--card-bg, #fff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.2s;
}

.theme-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.icon {
  line-height: 1;
}

.theme-menu {
  position: absolute;
  bottom: 60px;
  right: 0;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 140px;
  overflow: hidden;
}

.theme-menu button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-color, #333);
  transition: background 0.2s;
}

.theme-menu button:hover {
  background: var(--bg-color, #f5f5f5);
}

.theme-menu button.active {
  background: var(--primary-color, #42b983);
  color: #fff;
}

.menu-icon {
  font-size: 1.2rem;
}
</style>
