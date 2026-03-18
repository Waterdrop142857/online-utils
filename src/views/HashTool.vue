<template>
  <ToolLayout
    title="哈希工具"
    icon="🔒"
    v-model:input="inputText"
    inputLabel="输入文本"
    inputPlaceholder="请输入要计算哈希的文本..."
    :output="hashResult"
    outputLabel="哈希结果"
    primaryActionLabel="🔐 计算哈希"
    :canProcess="canCompute"
    :copied="copied"
    @process="computeHash"
    @clear="clearInput"
    @paste="pasteFromClipboard"
    @copy="copyResult"
  >
    <template #options>
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
    </template>

    <template #output-bottom>
      <div class="hash-output" v-if="hashResult">
        <code>{{ hashResult }}</code>
      </div>
    </template>

    <template #output-actions>
      <button class="copy-btn secondary" @click="copyWithInfo">
        📋 详情
      </button>
    </template>

    <template #footer>
      <div class="info-msg" v-if="algorithmInfo">
        ℹ️ {{ algorithmInfo }}
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'
import ToolLayout from '../components/ToolLayout.vue'

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
.algorithm-section { margin-bottom: 1.5rem; }
.algorithm-section label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
}
.algorithm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}
.algorithm-grid button {
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}
.algorithm-grid button:hover { background: var(--bg-color); }
.algorithm-grid button.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

.hash-output {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}
.hash-output code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: var(--text-color);
  word-break: break-all;
}

.copy-btn.secondary {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.copy-btn.secondary:hover { background: var(--border-color); }

.info-msg {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 0.9rem;
}
</style>
