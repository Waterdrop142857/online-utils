<template>
  <button class="theme-toggle" @click="toggleTheme" :title="`当前：${themeNames[theme]}${theme === 'auto' ? ' (' + modeName + ')' : ''}`">
    <span class="icon">{{ themeIcon }}</span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const theme = ref('auto')

const themeIcons = {
  light: '☀️',
  dark: '🌙',
  auto: '🖥️'
}

const themeNames = {
  light: '亮色模式',
  dark: '暗色模式',
  auto: '跟随系统'
}

const modeName = computed(() => {
  if (theme.value === 'auto') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDark ? '暗色' : '亮色'
  }
  return theme.value === 'dark' ? '暗色' : '亮色'
})

const themeIcon = computed(() => {
  if (theme.value === 'auto') {
    return '🖥️'
  }
  return themeIcons[theme.value]
})

const applyTheme = (themeValue) => {
  if (themeValue === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}

const toggleTheme = () => {
  const themes = ['auto', 'light', 'dark']
  const currentIndex = themes.indexOf(theme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  theme.value = themes[nextIndex]
  localStorage.setItem('theme', theme.value)
  applyTheme(theme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'auto'
  theme.value = savedTheme
  applyTheme(savedTheme)
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
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
  z-index: 1000;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.icon {
  line-height: 1;
}
</style>
