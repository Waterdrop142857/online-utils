<template>
  <ToolLayout
    title="URL 编解码"
    icon="🔗"
    v-model="mode"
    :modes="[
      { label: '编码', value: 'encode' },
      { label: '解码', value: 'decode' }
    ]"
    v-model:input="inputText"
    :inputLabel="mode === 'encode' ? '原始 URL/文本' : '已编码的 URL'"
    :inputPlaceholder="mode === 'encode' ? '请输入要编码的 URL 或文本...' : '请输入要解码的 URL...'"
    :output="outputText"
    :primaryActionLabel="mode === 'encode' ? '🔗 编码' : '🔓 解码'"
    :canProcess="canProcess"
    :showSwap="true"
    :error="errorMsg"
    :copied="copied"
    @process="process"
    @swap="swapMode"
    @clear="clearInput"
    @paste="pasteFromClipboard"
    @copy="copyResult"
  >
    <template #options>
      <div class="options-wrapper">
        <label>编码模式</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="encodeMode" value="standard" v-model="encodeMode" />
            <span>标准 (encodeURIComponent)</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="encodeMode" value="full" v-model="encodeMode" />
            <span>完整 (encodeURI)</span>
          </label>
        </div>
      </div>
    </template>

    <template #output-actions>
      <button class="copy-btn secondary" @click="openInNewTab" v-if="isValidUrl">
        🌐 打开
      </button>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import ToolLayout from '../components/ToolLayout.vue'

const mode = ref('encode')
const inputText = ref('')
const outputText = ref('')
const errorMsg = ref('')
const copied = ref(false)
const encodeMode = ref('standard')

const canProcess = computed(() => {
  return inputText.value.trim().length > 0
})

const isValidUrl = computed(() => {
  try {
    new URL(outputText.value)
    return true
  } catch {
    return false
  }
})

const process = () => {
  errorMsg.value = ''
  outputText.value = ''
  if (!inputText.value.trim()) {
    errorMsg.value = '请输入内容'
    return
  }
  try {
    if (mode.value === 'encode') {
      outputText.value = encodeMode.value === 'full' 
        ? encodeURI(inputText.value) 
        : encodeURIComponent(inputText.value)
    } else {
      let decoded = inputText.value
      let prevDecoded, iterations = 0
      do {
        prevDecoded = decoded
        try {
          decoded = decodeURIComponent(decoded)
          iterations++
        } catch (e) {
          break
        }
      } while (decoded !== prevDecoded && iterations < 10)
      outputText.value = decoded
    }
  } catch (e) {
    errorMsg.value = mode.value === 'decode' 
      ? '解码失败：无效的 URL 编码格式' 
      : '编码失败：' + e.message
  }
}

const swapMode = () => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  inputText.value = outputText.value
  outputText.value = ''
  errorMsg.value = ''
}

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMsg.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    outputText.value = ''
    errorMsg.value = ''
  } catch (e) {
    alert('无法读取剪贴板内容，请手动粘贴')
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    errorMsg.value = '复制失败，请手动复制'
  }
}

const openInNewTab = () => {
  if (isValidUrl.value) {
    window.open(outputText.value, '_blank')
  }
}
</script>

<style scoped>
.options-wrapper {
  margin-bottom: 1.5rem;
}
.options-wrapper label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
}
.radio-group {
  display: flex;
  gap: 1.5rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.radio-label input[type="radio"] { width: auto; cursor: pointer; }

.copy-btn.secondary {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.copy-btn.secondary:hover { background: var(--border-color); }
</style>
