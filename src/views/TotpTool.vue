<template>
  <ToolLayout
    title="2FA 验证码生成器 (TOTP)"
    icon="🔑"
    v-model:input="secret"
    inputLabel="Base32 密钥 (Secret)"
    inputPlaceholder="请输入 Base32 编码的密钥 (如: JBSWY3DPEHPK3PXP)"
    :inputRows="2"
    :output="token"
    outputLabel="当前验证码"
    primaryActionLabel="🔄 刷新"
    :canProcess="!!secret"
    :copied="copied"
    @process="generateToken"
    @clear="clearInput"
    @paste="pasteFromClipboard"
    @copy="copyResult"
  >
    <template #options>
      <div class="totp-options">
        <div class="option-row">
          <label>算法</label>
          <select v-model="algorithm">
            <option value="SHA1">SHA-1 (标准)</option>
            <option value="SHA256">SHA-256</option>
            <option value="SHA512">SHA-512</option>
          </select>
        </div>
        <div class="option-row">
          <label>位数</label>
          <select v-model="digits">
            <option :value="6">6 位</option>
            <option :value="8">8 位</option>
          </select>
        </div>
        <div class="option-row">
          <label>步长 (秒)</label>
          <input type="number" v-model.number="period" min="1" max="300" />
        </div>
      </div>
    </template>

    <template #output-top>
      <div class="token-display" v-if="token">
        <span class="token-digits">{{ formattedToken }}</span>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progressWidth + '%' }" :class="{ warning: timeLeft < 5 }"></div>
        </div>
        <span class="time-left">剩余 {{ timeLeft }} 秒</span>
      </div>
    </template>

    <template #footer>
      <div class="info-msg">
        <p>💡 <strong>什么是 TOTP？</strong></p>
        <p>基于时间的一次性密码 (Time-based One-Time Password) 是 Google Authenticator 等应用使用的标准算法。</p>
        <p>本工具在本地浏览器中运行，不会向服务器发送您的密钥。</p>
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import CryptoJS from 'crypto-js'
import ToolLayout from '../components/ToolLayout.vue'

const secret = ref('')
const token = ref('')
const algorithm = ref('SHA1')
const digits = ref(6)
const period = ref(30)
const timeLeft = ref(0)
const copied = ref(false)
const timer = ref(null)

const formattedToken = computed(() => {
  if (!token.value) return ''
  if (digits.value === 6) {
    return token.value.slice(0, 3) + ' ' + token.value.slice(3)
  }
  return token.value.slice(0, 4) + ' ' + token.value.slice(4)
})

const progressWidth = computed(() => (timeLeft.value / period.value) * 100)

// Base32 Decoder
const base32ToHex = (base32) => {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  let hex = ''

  const s = base32.replace(/=+$/, '').toUpperCase()
  for (let i = 0; i < s.length; i++) {
    const val = base32chars.indexOf(s.charAt(i))
    if (val === -1) throw new Error('无效的 Base32 字符')
    bits += val.toString(2).padStart(5, '0')
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4)
    hex += parseInt(chunk, 2).toString(16)
  }
  return hex
}

const leftpad = (str, len, pad) => {
  if (len + 1 >= str.length) {
    str = Array(len + 1 - str.length).join(pad) + str
  }
  return str
}

const generateToken = () => {
  if (!secret.value) {
    token.value = ''
    return
  }

  try {
    const epoch = Math.round(new Date().getTime() / 1000.0)
    const time = leftpad(Math.floor(epoch / period.value).toString(16), 16, '0')
    timeLeft.value = period.value - (epoch % period.value)

    const key = CryptoJS.enc.Hex.parse(base32ToHex(secret.value))
    const msg = CryptoJS.enc.Hex.parse(time)
    
    let hmac
    if (algorithm.value === 'SHA1') hmac = CryptoJS.HmacSHA1(msg, key)
    else if (algorithm.value === 'SHA256') hmac = CryptoJS.HmacSHA256(msg, key)
    else if (algorithm.value === 'SHA512') hmac = CryptoJS.HmacSHA512(msg, key)

    const hmacHex = hmac.toString(CryptoJS.enc.Hex)
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16)
    const otp = (parseInt(hmacHex.substr(offset * 2, 8), 16) & 0x7fffffff) + ''
    token.value = otp.substr(otp.length - digits.value, digits.value).padStart(digits.value, '0')
  } catch (e) {
    token.value = ''
    console.error(e)
  }
}

const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    const epoch = Math.round(new Date().getTime() / 1000.0)
    timeLeft.value = period.value - (epoch % period.value)
    if (timeLeft.value === period.value || !token.value) {
      generateToken()
    }
  }, 1000)
}

watch(secret, () => generateToken())
watch([algorithm, digits, period], () => generateToken())

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

const clearInput = () => {
  secret.value = ''
  token.value = ''
}

const pasteFromClipboard = async () => {
  try {
    secret.value = await navigator.clipboard.readText()
  } catch (e) {
    alert('无法读取剪贴板')
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(token.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    alert('复制失败')
  }
}
</script>

<style scoped>
.totp-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

select, input[type="number"] {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-color);
}

.token-display {
  text-align: center;
  padding: 2rem;
  background: var(--bg-color);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.token-digits {
  font-size: 3.5rem;
  font-weight: 700;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.1rem;
  color: var(--primary-color);
  display: block;
  margin-bottom: 1rem;
}

.progress-container {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 1s linear, background-color 0.3s;
}

.progress-bar.warning {
  background: #ff4d4f;
}

.time-left {
  font-size: 0.9rem;
  color: var(--text-light);
}

.info-msg {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-color);
  border-left: 4px solid var(--primary-color);
  border-radius: 4px;
}

.info-msg p {
  margin-bottom: 0.5rem;
}
</style>
