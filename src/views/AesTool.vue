<template>
  <ToolLayout
    title="AES 加解密"
    icon="🔐"
    v-model="mode"
    :modes="[
      { label: '加密', value: 'encrypt' },
      { label: '解密', value: 'decrypt' }
    ]"
    v-model:input="inputText"
    :inputLabel="mode === 'encrypt' ? '明文' : '密文'"
    :inputPlaceholder="mode === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的密文（Base64 格式）...'"
    :output="outputText"
    :primaryActionLabel="mode === 'encrypt' ? '🔒 加密' : '🔓 解密'"
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
      <!-- 高级选项 -->
      <div class="advanced-wrapper">
        <div class="advanced-toggle" :class="{ open: showAdvanced }" @click="showAdvanced = !showAdvanced">
          <span>⚙️ 高级选项</span>
          <span :class="{ rotate: showAdvanced }">▼</span>
        </div>

        <div class="advanced-section" v-show="showAdvanced">
          <div class="option-row">
            <label>加密模式</label>
            <div class="radio-group">
              <label class="radio-label" v-for="m in modes" :key="m.value">
                <input type="radio" name="aesMode" :value="m.value" v-model="encryptMode" />
                <span>{{ m.label }}</span>
              </label>
            </div>
          </div>

          <div class="option-row">
            <label>填充模式</label>
            <select v-model="padding">
              <option value="Pkcs7">PKCS7 (推荐)</option>
              <option value="ZeroPadding">Zero Padding</option>
              <option value="Iso97971">ISO/IEC 9797-1</option>
              <option value="AnsiX923">ANSI X.923</option>
              <option value="Iso10126">ISO 10126</option>
              <option value="NoPadding">No Padding</option>
            </select>
          </div>

          <div class="option-row">
            <label>密钥长度</label>
            <div class="radio-group">
              <label class="radio-label" v-for="len in keyLengths" :key="len">
                <input type="radio" name="keyLength" :value="len" v-model="selectedKeyLength" />
                <span>AES-{{ len }}</span>
              </label>
            </div>
          </div>

          <div class="option-row">
            <label>盐值 (Salt, 可选)</label>
            <div class="input-with-btn">
              <input v-model="salt" type="text" placeholder="留空则自动生成" />
              <button class="gen-btn" @click="generateSalt">🎲 生成</button>
            </div>
            <p class="hint">盐值会增加加密安全性，解密时需要使用相同的盐</p>
          </div>

          <div class="option-row" v-if="encryptMode !== 'ECB'">
            <label>初始化向量 (IV, 可选)</label>
            <div class="input-with-btn">
              <input v-model="iv" type="text" placeholder="留空则自动生成" />
              <button class="gen-btn" @click="generateIV">🎲 生成</button>
            </div>
            <p class="hint">CBC/CFB/OFB 模式需要 16 字符的 IV</p>
          </div>
        </div>
      </div>

      <!-- 密钥输入 -->
      <div class="key-section">
        <label>密钥</label>
        <div class="input-with-btn">
          <input v-model="secretKey" type="text" placeholder="请输入密钥" />
          <button class="gen-btn" @click="generateKey">🎲 生成</button>
        </div>
        <div class="key-info">
          <span class="key-length">原始长度：{{ rawKeyLength }} 字符</span>
          <span class="key-status" :class="{ warning: needsPadding }">{{ keyStatusText }}</span>
        </div>
        <label class="checkbox-label">
          <input type="checkbox" v-model="autoSalt" />
          <span>自动加盐补足密钥长度（推荐）</span>
        </label>
      </div>
    </template>

    <template #output-top>
      <div class="output-info" v-if="encryptionInfo">
        <p><strong>加密信息：</strong>{{ encryptionInfo }}</p>
      </div>
    </template>

    <template #output-actions>
      <button class="copy-btn secondary" @click="copyConfig" v-if="mode === 'encrypt'">
        📋 配置
      </button>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'
import ToolLayout from '../components/ToolLayout.vue'

const mode = ref('encrypt')
const inputText = ref('')
const secretKey = ref('')
const outputText = ref('')
const errorMsg = ref('')
const copied = ref(false)
const showAdvanced = ref(false)
const encryptMode = ref('CBC')
const padding = ref('Pkcs7')
const selectedKeyLength = ref(256)
const salt = ref('')
const iv = ref('')
const autoSalt = ref(true)
const encryptionInfo = ref('')

const modes = [
  { label: 'CBC', value: 'CBC' },
  { label: 'ECB', value: 'ECB' },
  { label: 'CFB', value: 'CFB' },
  { label: 'OFB', value: 'OFB' },
  { label: 'CTR', value: 'CTR' }
]
const keyLengths = [128, 192, 256]

const rawKeyLength = computed(() => secretKey.value.length)
const needsPadding = computed(() => rawKeyLength.value > 0 && rawKeyLength.value < selectedKeyLength.value / 8)

const keyStatusText = computed(() => {
  const targetLen = selectedKeyLength.value / 8
  if (rawKeyLength.value === 0) return '请输入密钥'
  if (rawKeyLength.value >= targetLen) return `✓ 密钥长度足够 (≥${targetLen}字符)`
  if (autoSalt.value) return `将自动补足至 ${targetLen} 字符`
  return `⚠ 需要 ${targetLen} 字符，当前 ${rawKeyLength.value} 字符`
})

const canProcess = computed(() => secretKey.value && inputText.value)

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const generateKey = () => {
  secretKey.value = generateRandomString(selectedKeyLength.value / 8)
  errorMsg.value = ''
}
const generateSalt = () => { salt.value = generateRandomString(16) }
const generateIV = () => { iv.value = generateRandomString(16) }

const processKey = (key, targetLength) => {
  if (key.length >= targetLength) return key.substring(0, targetLength)
  if (autoSalt.value) {
    let saltValue = salt.value || generateRandomString(16)
    if (!salt.value) salt.value = saltValue
    let combined = key + saltValue
    while (combined.length < targetLength) combined += saltValue
    return combined.substring(0, targetLength)
  }
  let result = key
  while (result.length < targetLength) result += key
  return result.substring(0, targetLength)
}

const process = () => {
  errorMsg.value = ''
  outputText.value = ''
  encryptionInfo.value = ''
  
  if (!secretKey.value || secretKey.value.length < 16) {
    errorMsg.value = '密钥长度至少需要 16 个字符'
    return
  }
  if (!inputText.value) {
    errorMsg.value = '请输入内容'
    return
  }
  
  try {
    const targetKeyLength = selectedKeyLength.value / 8
    const processedKey = processKey(secretKey.value, targetKeyLength)
    const keyUtf8 = CryptoJS.enc.Utf8.parse(processedKey)
    
    let config = {
      mode: CryptoJS.mode[encryptMode.value],
      padding: CryptoJS.pad[padding.value]
    }
    
    if (encryptMode.value !== 'ECB') {
      let ivValue = iv.value || generateRandomString(16)
      if (!iv.value) iv.value = ivValue
      let processedIv = ivValue.substring(0, 16)
      while (processedIv.length < 16) processedIv += '0'
      config.iv = CryptoJS.enc.Utf8.parse(processedIv)
    }
    
    if (mode.value === 'encrypt') {
      const result = CryptoJS.AES.encrypt(inputText.value, keyUtf8, config)
      outputText.value = result.toString()
      encryptionInfo.value = `模式：${encryptMode.value} | 密钥长度：AES-${selectedKeyLength.value} | 填充：${padding.value}${iv.value ? ` | IV: ${iv.value.substring(0, 8)}...` : ''}`
    } else {
      const decrypted = CryptoJS.AES.decrypt(inputText.value, keyUtf8, config)
      outputText.value = decrypted.toString(CryptoJS.enc.Utf8)
      if (!outputText.value) {
        errorMsg.value = '解密失败，请检查密钥、IV 和加密配置是否正确'
      }
    }
  } catch (e) {
    errorMsg.value = mode.value === 'encrypt' ? '加密失败：' + e.message : '解密失败，请检查输入和配置'
  }
}

const swapMode = () => {
  mode.value = mode.value === 'encrypt' ? 'decrypt' : 'encrypt'
  inputText.value = outputText.value
  outputText.value = ''
  errorMsg.value = ''
  encryptionInfo.value = ''
}

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMsg.value = ''
  encryptionInfo.value = ''
}

const pasteFromClipboard = async () => {
  try {
    inputText.value = await navigator.clipboard.readText()
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

const copyConfig = async () => {
  const config = {
    mode: encryptMode.value,
    padding: padding.value,
    keyLength: selectedKeyLength.value,
    key: secretKey.value,
    salt: salt.value,
    iv: iv.value || null,
    autoSalt: autoSalt.value,
    output: outputText.value
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    alert('配置已复制到剪贴板')
  } catch (e) {
    alert('复制失败')
  }
}
</script>

<style scoped>
.key-section { margin-bottom: 1.5rem; }
.key-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-color);
}
input:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
select { cursor: pointer; }

.input-with-btn {
  display: flex;
  gap: 0.5rem;
}
.input-with-btn input { flex: 1; }
.gen-btn {
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  white-space: nowrap;
}
.gen-btn:hover { background: var(--border-color); }

.key-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}
.key-length { color: var(--text-light); }
.key-status { color: var(--primary-color); }
.key-status.warning { color: #ff9800; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  cursor: pointer;
  color: var(--text-color);
}
.checkbox-label input[type="checkbox"] { width: auto; cursor: pointer; }

.hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-light);
  font-style: italic;
}

.advanced-wrapper { margin-bottom: 1.5rem; }
.advanced-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}
.advanced-toggle:hover { background: var(--border-color); }
.advanced-toggle.open {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.advanced-toggle span:last-child { transition: transform 0.2s; }
.advanced-toggle span.rotate { transform: rotate(180deg); }

.advanced-section {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 1rem;
}
.option-row { margin-bottom: 1rem; }
.option-row:last-child { margin-bottom: 0; }
.option-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}
.radio-label input[type="radio"] {
  width: auto;
  cursor: pointer;
}

.output-info {
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--primary-color);
}

.copy-btn.secondary {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.copy-btn.secondary:hover { background: var(--border-color); }
</style>
