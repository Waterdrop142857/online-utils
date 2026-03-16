export const tools = [
  {
    id: 'aes',
    name: 'AES 加解密',
    description: 'AES 加密和解密工具，支持 AES-128/192/256',
    icon: '🔐',
    category: '加密工具',
    path: '/tools/aes'
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: 'Base64 编码和解码工具，支持 URL 安全模式',
    icon: '🔐',
    category: '数据处理',
    path: '/tools/base64'
  },
  {
    id: 'hash',
    name: '哈希计算',
    description: '支持 MD5、SHA-1、SHA-256 等多种哈希算法',
    icon: '🔒',
    category: '加密工具',
    path: '/tools/hash'
  },
  {
    id: 'url-encode',
    name: 'URL 编解码',
    description: 'URL 编码和解码工具，支持自动检测多重编码',
    icon: '🔗',
    category: '数据处理',
    path: '/tools/url'
  },
  {
    id: 'uuid',
    name: 'UUID 生成器',
    description: '在线生成 UUID 唯一标识符',
    icon: '🆔',
    category: '开发工具',
    path: '/tools/uuid'
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期格式相互转换',
    icon: '⏰',
    category: '开发工具',
    path: '/tools/timestamp'
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    description: '在线取色器和颜色格式转换',
    icon: '🎨',
    category: '设计工具',
    path: '/tools/color-picker'
  },
  {
    id: 'image-compress',
    name: '图片压缩',
    description: '在线压缩图片，支持多种格式',
    icon: '🖼️',
    category: '图片工具',
    path: '/tools/image-compress'
  }
]

export const categories = [...new Set(tools.map(t => t.category))]
