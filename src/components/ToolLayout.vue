<template>
  <div class="tool-layout">
    <header class="tool-header">
      <router-link to="/" class="back-btn">← 返回导航</router-link>
      <h1>{{ icon }} {{ title }}</h1>
    </header>

    <main class="tool-content">
      <!-- 模式切换 (如果提供) -->
      <div v-if="modes && modes.length > 0" class="mode-switch">
        <button
          v-for="m in modes"
          :key="m.value"
          :class="{ active: modelValue === m.value }"
          @click="$emit('update:modelValue', m.value)"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- 高级选项插槽 -->
      <div v-if="$slots.options" class="options-section">
        <slot name="options"></slot>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <label>{{ inputLabel }}</label>
        <textarea
          v-model="internalInput"
          :placeholder="inputPlaceholder"
          :rows="inputRows"
          @input="$emit('update:input', internalInput)"
        ></textarea>
        <div class="input-actions">
          <button class="action-btn small" @click="$emit('paste')">
            📋 粘贴
          </button>
          <button class="action-btn small" @click="$emit('clear')">
            清空
          </button>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <button 
          class="action-btn primary" 
          @click="$emit('process')" 
          :disabled="!canProcess"
        >
          {{ primaryActionLabel }}
        </button>
        <button 
          v-if="showSwap" 
          class="action-btn secondary" 
          @click="$emit('swap')"
        >
          🔄 切换
        </button>
        <slot name="extra-actions"></slot>
      </div>

      <!-- 输出区域 -->
      <div class="output-section" v-if="output">
        <label>{{ outputLabel }}</label>
        <slot name="output-top"></slot>
        <textarea v-model="internalOutput" :rows="outputRows" readonly></textarea>
        <slot name="output-bottom"></slot>
        <div class="output-actions">
          <button class="copy-btn" @click="$emit('copy')">
            {{ copied ? '✅ 已复制' : '📋 复制' }}
          </button>
          <slot name="output-actions"></slot>
        </div>
      </div>

      <!-- 错误提示 -->
      <div class="error-msg" v-if="error">
        ❌ {{ error }}
      </div>

      <!-- 额外内容插槽 -->
      <slot name="footer"></slot>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: String,
  icon: String,
  modelValue: String, // 用于 mode
  modes: Array,       // [{ label: '加密', value: 'encrypt' }, ...]
  input: String,
  inputLabel: { type: String, default: '输入' },
  inputPlaceholder: { type: String, default: '请输入内容...' },
  inputRows: { type: Number, default: 5 },
  output: String,
  outputLabel: { type: String, default: '结果' },
  outputRows: { type: Number, default: 5 },
  primaryActionLabel: { type: String, default: '处理' },
  canProcess: { type: Boolean, default: true },
  showSwap: { type: Boolean, default: false },
  error: String,
  copied: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:modelValue',
  'update:input',
  'process',
  'clear',
  'paste',
  'copy',
  'swap'
])

const internalInput = ref(props.input)
const internalOutput = ref(props.output)

watch(() => props.input, (newVal) => {
  internalInput.value = newVal
})

watch(() => props.output, (newVal) => {
  internalOutput.value = newVal
})
</script>

<style scoped>
.tool-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.tool-header { margin-bottom: 2rem; }
.back-btn {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}
.back-btn:hover { text-decoration: underline; }
.tool-header h1 { font-size: 2rem; color: var(--text-color); }

.tool-content {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.mode-switch {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.mode-switch button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}
.mode-switch button.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

.options-section { margin-bottom: 1.5rem; }

.input-section, .output-section { margin-bottom: 1.5rem; }
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  background: var(--card-bg);
  color: var(--text-color);
}
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn.small {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.action-btn.small:hover { background: var(--border-color); }

.action-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.action-btn.primary {
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background: var(--primary-color);
  color: #fff;
}
.action-btn.primary:hover:not(:disabled) { background: var(--primary-hover, #3aa876); }
.action-btn.primary:disabled { background: var(--text-muted); cursor: not-allowed; }
.action-btn.secondary {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.action-btn.secondary:hover { background: var(--border-color); }

.output-section textarea {
  background: var(--bg-color);
  color: var(--text-color);
}
.output-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.copy-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.copy-btn:hover { background: var(--primary-hover, #3aa876); }

.error-msg {
  padding: 1rem;
  background: var(--error-bg, #fff3f3);
  border: 1px solid var(--error-border, #ffcccc);
  border-radius: 8px;
  color: var(--error-text, #cc0000);
}

@media (prefers-color-scheme: dark) {
  .error-msg {
    --error-bg: #3a1a1a;
    --error-border: #5c2b2b;
    --error-text: #ff6b6b;
  }
}
</style>
