<template>
  <div class="aes-tool">
    <header class="tool-header">
      <router-link to="/" class="back-btn">← 返回导航</router-link>
      <h1>🔐 AES 加解密</h1>
    </header>

    <main class="tool-content">
      <!-- 模式切换 -->
      <div class="mode-switch">
        <button
          :class="{ active: mode === 'encrypt' }"
          @click="mode = 'encrypt'"
        >
          加密
        </button>
        <button
          :class="{ active: mode === 'decrypt' }"
          @click="mode = 'decrypt'"
        >
          解密
        </button>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <label>{{ mode === 'encrypt' ? '明文' : '密文' }}</label>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的密文（Base64 格式）...'"
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

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn primary" @click="process" :disabled="!canProcess">
          {{ mode === 'encrypt' ? '🔒 加密' : '🔓 解密' }}
        </button>
        <button class="action-btn secondary" @click="swapMode">
          🔄 切换
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-section" v-if="outputText">
        <label>结果</label>
        <textarea v-model="outputText" rows="5" readonly></textarea>
        <div class="output-info" v-if="encryptionInfo">
          <p><strong>加密信息：</strong>{{ encryptionInfo }}</p>
        </div>
        <div class="output-actions">
          <button class="copy-btn" @click="copyResult">
            {{ copied ? '✅ 已复制' : '📋 复制' }}
          </button>
          <button class="copy-btn secondary" @click="copyConfig" v-if="mode === 'encrypt'">
            📋 配置
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
import CryptoJS from 'crypto-js'

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
.aes-tool {
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
  --info-bg: #e8f5e9;
  --info-text: #2e7d32;
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
  .aes-tool {
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
    --info-bg: #1a3a2a;
    --info-text: #66bb6a;
    --secondary-bg: #333;
    --secondary-hover: #444;
  }
}

[data-theme="dark"] .aes-tool {
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
  --info-bg: #1a3a2a;
  --info-text: #66bb6a;
  --secondary-bg: #333;
  --secondary-hover: #444;
}

[data-theme="light"] .aes-tool {
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
  --info-bg: #e8f5e9;
  --info-text: #2e7d32;
  --secondary-bg: #f0f0f0;
  --secondary-hover: #e0e0e0;
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

.input-section, .key-section, .output-section { margin-bottom: 1.5rem; }
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}
textarea, input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--input-bg);
  color: var(--text-color);
}
textarea { resize: vertical; }
textarea:focus, input:focus, select:focus {
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
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  white-space: nowrap;
}
.gen-btn:hover { background: var(--secondary-hover); }

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
  background: var(--section-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}
.advanced-toggle:hover { background: var(--secondary-bg); }
.advanced-toggle.open {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.advanced-toggle span:last-child { transition: transform 0.2s; }
.advanced-toggle span.rotate { transform: rotate(180deg); }

.advanced-section {
  background: var(--section-bg);
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
  color: var(--text-color);
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
  color: var(--text-color);
}
.radio-label input[type="radio"], .radio-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
.action-btn.secondary {
  background: var(--secondary-bg);
  color: var(--text-color);
}
.action-btn.secondary:hover { background: var(--secondary-hover); }

.output-section textarea {
  background: var(--section-bg);
  color: var(--text-color);
}
.output-info {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--info-bg);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--info-text);
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

.error-msg {
  padding: 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 8px;
  color: var(--error-text);
}
</style>
