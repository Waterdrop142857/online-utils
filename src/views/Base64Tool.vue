<template>
  <div class="base64-tool">
    <header class="tool-header">
      <router-link to="/" class="back-btn">← 返回导航</router-link>
      <h1>🔐 Base64 编解码</h1>
    </header>

    <main class="tool-content">
      <!-- 模式切换 -->
      <div class="mode-switch">
        <button
          :class="{ active: mode === 'encode' }"
          @click="mode = 'encode'"
        >
          编码
        </button>
        <button
          :class="{ active: mode === 'decode' }"
          @click="mode = 'decode'"
        >
          解码
        </button>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <label>{{ mode === 'encode' ? '原始文本' : 'Base64 密文' }}</label>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的 Base64 字符串...'"
          rows="5"
        ></textarea>
      </div>

      <!-- 选项 -->
      <div class="options-section">
        <label class="checkbox-label">
          <input type="checkbox" v-model="urlSafe" />
          <span>URL 安全模式（使用 - 和 _ 替代 + 和 /）</span>
        </label>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn" @click="process" :disabled="!canProcess">
          {{ mode === 'encode' ? '📤 编码' : '📥 解码' }}
        </button>
        <button class="action-btn secondary" @click="swapMode">
          🔄 切换模式
        </button>
        <button class="action-btn secondary" @click="clearAll">
          清空
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-section" v-if="outputText">
        <label>结果</label>
        <textarea v-model="outputText" rows="5" readonly></textarea>
        <div class="output-actions">
          <button class="copy-btn" @click="copyResult">
            {{ copied ? '✅ 已复制' : '📋 复制结果' }}
          </button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div class="error-msg" v-if="errorMsg">
        ❌ {{ errorMsg }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const mode = ref('encode')
const inputText = ref('')
const outputText = ref('')
const errorMsg = ref('')
const copied = ref(false)
const urlSafe = ref(false)

const canProcess = computed(() => {
  return inputText.value.trim().length > 0
})

// Base64 编码
const encodeBase64 = (str) => {
  try {
    // 处理 Unicode 字符
    const utf8Bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    let result = btoa(binary)
    
    // URL 安全模式
    if (urlSafe.value) {
      result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    
    return result
  } catch (e) {
    throw new Error('编码失败')
  }
}

// Base64 解码
const decodeBase64 = (str) => {
  try {
    let input = str.trim()
    
    // URL 安全模式还原
    if (urlSafe.value) {
      // 补充 = 号
      const padCount = (4 - input.length % 4) % 4
      input = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padCount)
    }
    
    // 验证 Base64 格式
    if (!/^[A-Za-z0-9+/]*=*$/.test(input) && !urlSafe.value) {
      throw new Error('无效的 Base64 格式')
    }
    
    const binary = atob(input)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    
    return new TextDecoder().decode(bytes)
  } catch (e) {
    throw new Error('解码失败，请检查输入是否为有效的 Base64 字符串')
  }
}

const process = () => {
  errorMsg.value = ''
  outputText.value = ''
  
  if (!inputText.value.trim()) {
    errorMsg.value = '请输入内容'
    return
  }
  
  try {
    if (mode.value === 'encode') {
      outputText.value = encodeBase64(inputText.value)
    } else {
      outputText.value = decodeBase64(inputText.value)
    }
  } catch (e) {
    errorMsg.value = e.message
  }
}

const swapMode = () => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  inputText.value = outputText.value
  outputText.value = ''
  errorMsg.value = ''
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  errorMsg.value = ''
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    errorMsg.value = '复制失败，请手动复制'
  }
}
</script>

<style scoped>
.base64-tool {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #fff;
  --page-bg: #f5f5f5;
  --border-color: #e0e0e0;
  --input-bg: #fff;
  --section-bg: #f9f9f9;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --primary-color: #42b983;
  --primary-hover: #3aa876;
  --error-bg: #fff3f3;
  --error-border: #ffcccc;
  --error-text: #cc0000;
  --secondary-bg: #f0f0f0;
  --secondary-hover: #e0e0e0;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: var(--page-bg);
}

@media (prefers-color-scheme: dark) {
  .base64-tool {
    --text-color: #e0e0e0;
    --text-light: #b0b0b0;
    --text-muted: #808080;
    --bg-color: #1e1e1e;
    --page-bg: #121212;
    --border-color: #333;
    --input-bg: #2a2a2a;
    --section-bg: #2a2a2a;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    --primary-color: #42b983;
    --primary-hover: #3aa876;
    --error-bg: #3a1a1a;
    --error-border: #5c2b2b;
    --error-text: #ff6b6b;
    --secondary-bg: #333;
    --secondary-hover: #444;
  }
}

[data-theme="dark"] .base64-tool {
  --text-color: #e0e0e0;
  --text-light: #b0b0b0;
  --text-muted: #808080;
  --bg-color: #1e1e1e;
  --page-bg: #121212;
  --border-color: #333;
  --input-bg: #2a2a2a;
  --section-bg: #2a2a2a;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --primary-color: #42b983;
  --primary-hover: #3aa876;
  --error-bg: #3a1a1a;
  --error-border: #5c2b2b;
  --error-text: #ff6b6b;
  --secondary-bg: #333;
  --secondary-hover: #444;
}

[data-theme="light"] .base64-tool {
  --text-color: #333;
  --text-light: #666;
  --text-muted: #999;
  --bg-color: #fff;
  --page-bg: #f5f5f5;
  --border-color: #e0e0e0;
  --input-bg: #fff;
  --section-bg: #f9f9f9;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --primary-color: #42b983;
  --primary-hover: #3aa876;
  --error-bg: #fff3f3;
  --error-border: #ffcccc;
  --error-text: #cc0000;
  --secondary-bg: #f0f0f0;
  --secondary-hover: #e0e0e0;
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
  background: var(--bg-color);
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
  background: var(--bg-color);
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

.input-section,
.options-section,
.output-section {
  margin-bottom: 1.5rem;
}

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
  background: var(--input-bg);
  color: var(--text-color);
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:first-child {
  background: var(--primary-color);
  color: #fff;
}

.action-btn:first-child:hover:not(:disabled) {
  background: var(--primary-hover);
}

.action-btn:first-child:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.action-btn.secondary {
  background: var(--secondary-bg);
  color: var(--text-color);
}

.action-btn.secondary:hover {
  background: var(--secondary-hover);
}

.output-section textarea {
  background: var(--section-bg);
  color: var(--text-color);
}

.output-actions {
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

.copy-btn:hover {
  background: var(--primary-hover);
}

.error-msg {
  padding: 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 8px;
  color: var(--error-text);
}
</style>
