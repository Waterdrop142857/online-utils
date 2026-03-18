<template>
  <ToolLayout
    title="Base64 编解码"
    icon="🔐"
    v-model="mode"
    :modes="[
      { label: '编码', value: 'encode' },
      { label: '解码', value: 'decode' }
    ]"
    v-model:input="inputText"
    :inputLabel="mode === 'encode' ? '原始文本' : 'Base64 密文'"
    :inputPlaceholder="mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的 Base64 字符串...'"
    :output="outputText"
    :primaryActionLabel="mode === 'encode' ? '📤 编码' : '📥 解码'"
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
        <label class="checkbox-label">
          <input type="checkbox" v-model="urlSafe" />
          <span>URL 安全模式（使用 - 和 _ 替代 + 和 /）</span>
        </label>
      </div>
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
const urlSafe = ref(false)

const canProcess = computed(() => {
  return inputText.value.trim().length > 0
})

const encodeBase64 = (str) => {
  try {
    const utf8Bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    let result = btoa(binary)
    if (urlSafe.value) {
      result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    return result
  } catch (e) {
    throw new Error('编码失败')
  }
}

const decodeBase64 = (str) => {
  try {
    let input = str.trim()
    if (urlSafe.value) {
      const padCount = (4 - input.length % 4) % 4
      input = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padCount)
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
</script>

<style scoped>
.options-wrapper {
  margin-bottom: 1rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
}
.checkbox-label input[type="checkbox"] { width: auto; cursor: pointer; }
</style>
