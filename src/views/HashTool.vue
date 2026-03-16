<template>
  <div class="hash-tool">
    <header class="tool-header">
      <router-link to="/" class="back-btn">← 返回导航</router-link>
      <h1>🔒 哈希工具</h1>
    </header>

    <main class="tool-content">
      <!-- 算法选择 -->
      <div class="algorithm-section">
        <label>哈希算法</label>
        <div class="algorithm-grid">
          <button
            v-for="algo in algorithms"
            :key="algo.value"
            :class="{ active: algorithm === algo.value }"
            @click="algorithm = algo.value"
          >
            {{ algo.label }}
          </button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <label>输入文本</label>
        <textarea
          v-model="inputText"
          placeholder="请输入要计算哈希的文本..."
          rows="5"
        ></textarea>
        <div class="input-actions">
          <button class="action-btn small" @click="pasteFromClipboard">
            📋 粘贴
          </button>
          <button class="action-btn small" @click="clearInput">
            清空
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn primary" @click="computeHash" :disabled="!canCompute">
          🔐 计算哈希
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-section" v-if="hashResult">
        <label>哈希结果</label>
        <div class="hash-output">
          <code>{{ hashResult }}</code>
        </div>
        <div class="output-actions">
          <button class="copy-btn" @click="copyResult">
            {{ copied ? '✅ 已复制' : '📋 复制' }}
          </button>
          <button class="copy-btn secondary" @click="copyWithInfo">
            📋 详情
          </button>
        </div>
      </div>

      <!-- 信息提示 -->
      <div class="info-msg" v-if="algorithmInfo">
        ℹ️ {{ algorithmInfo }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'

const algorithm = ref('md5')
const inputText = ref('')
const hashResult = ref('')
const copied = ref(false)

const algorithms = [
  { value: 'md5', label: 'MD5', bits: 128 },
  { value: 'sha1', label: 'SHA-1', bits: 160 },
  { value: 'sha256', label: 'SHA-256', bits: 256 },
  { value: 'sha224', label: 'SHA-224', bits: 224 },
  { value: 'sha384', label: 'SHA-384', bits: 384 },
  { value: 'sha512', label: 'SHA-512', bits: 512 },
  { value: 'ripemd160', label: 'RIPEMD-160', bits: 160 }
]

const canCompute = computed(() => {
  return inputText.value.trim().length > 0
})

const algorithmInfo = computed(() => {
  const algo = algorithms.find(a => a.value === algorithm.value)
  if (!algo) return ''
  return `${algo.label} 算法生成 ${algo.bits} 位（${algo.bits / 4} 字符）的哈希值`
})

const computeHash = () => {
  if (!inputText.value.trim()) return

  let hash
  switch (algorithm.value) {
    case 'md5': hash = CryptoJS.MD5(inputText.value); break
    case 'sha1': hash = CryptoJS.SHA1(inputText.value); break
    case 'sha256': hash = CryptoJS.SHA256(inputText.value); break
    case 'sha224': hash = CryptoJS.SHA224(inputText.value); break
    case 'sha384': hash = CryptoJS.SHA384(inputText.value); break
    case 'sha512': hash = CryptoJS.SHA512(inputText.value); break
    case 'ripemd160': hash = CryptoJS.RIPEMD160(inputText.value); break
    default: hash = CryptoJS.MD5(inputText.value)
  }
  hashResult.value = hash.toString()
}

const clearInput = () => {
  inputText.value = ''
  hashResult.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    hashResult.value = ''
  } catch (e) {
    alert('无法读取剪贴板内容，请手动粘贴')
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(hashResult.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    alert('复制失败，请手动复制')
  }
}

const copyWithInfo = async () => {
  const algo = algorithms.find(a => a.value === algorithm.value)
  const info = `算法：${algo.label}\n输入：${inputText.value.substring(0, 50)}${inputText.value.length > 50 ? '...' : ''}\n哈希：${hashResult.value}`
  try {
    await navigator.clipboard.writeText(info)
    alert('详情已复制到剪贴板')
  } catch (e) {
    alert('复制失败')
  }
}
</script>

<style scoped>
.hash-tool {
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
  --secondary-bg: #f0f0f0;
  --secondary-hover: #e0e0e0;
  --info-bg: #e3f2fd;
  --info-text: #1976d2;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: var(--page-bg);
}

@media (prefers-color-scheme: dark) {
  .hash-tool {
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
    --secondary-bg: #333;
    --secondary-hover: #444;
    --info-bg: #1a3a5a;
    --info-text: #64b5f6;
  }
}

[data-theme="dark"] .hash-tool {
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
  --secondary-bg: #333;
  --secondary-hover: #444;
  --info-bg: #1a3a5a;
  --info-text: #64b5f6;
}

[data-theme="light"] .hash-tool {
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
  --secondary-bg: #f0f0f0;
  --secondary-hover: #e0e0e0;
  --info-bg: #e3f2fd;
  --info-text: #1976d2;
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
  background: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.algorithm-section { margin-bottom: 1.5rem; }
.algorithm-section label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--text-color);
}
.algorithm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}
.algorithm-grid button {
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}
.algorithm-grid button:hover { background: var(--secondary-bg); }
.algorithm-grid button.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

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
  background: var(--input-bg);
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
  background: var(--secondary-bg);
  color: var(--text-color);
}
.action-btn.small:hover { background: var(--secondary-hover); }

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
.action-btn.primary:hover:not(:disabled) { background: var(--primary-hover); }
.action-btn.primary:disabled { background: var(--text-muted); cursor: not-allowed; }

.hash-output {
  background: var(--section-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}
.hash-output code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: var(--text-color);
  word-break: break-all;
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
.copy-btn:hover { background: var(--primary-hover); }
.copy-btn.secondary {
  background: var(--secondary-bg);
  color: var(--text-color);
}
.copy-btn.secondary:hover { background: var(--secondary-hover); }

.info-msg {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--info-bg);
  border-radius: 8px;
  color: var(--info-text);
  font-size: 0.9rem;
}
</style>
