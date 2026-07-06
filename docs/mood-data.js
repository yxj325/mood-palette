// 情绪调色板数据 - 基于色彩心理学
// 每种情绪包含: 主色调、调色板(4-5色)、描述、适用场景

const MOOD_DATA = [
  {
    id: 'joy',
    name: '喜悦',
    emoji: '😄',
    keyword: '欢快 明亮 温暖',
    desc: '阳光般的明亮色彩，传递快乐与活力',
    scenes: '节日营销、儿童内容、庆祝活动',
    palette: ['#FFD93D', '#FF8C42', '#FF6B9D', '#FFE66D', '#FFAAA5'],
    accent: '#FF6B9D'
  },
  {
    id: 'calm',
    name: '平静',
    emoji: '🌊',
    keyword: '宁静 清爽 柔和',
    desc: '如水面般的青蓝色系，带来内心的安宁',
    scenes: '冥想App、健康养生、生活方式',
    palette: ['#A8DADC', '#457B9D', '#B8E0D2', '#E0F4F1', '#7FB3D5'],
    accent: '#457B9D'
  },
  {
    id: 'passion',
    name: '激情',
    emoji: '🔥',
    keyword: '热烈 冲动 张扬',
    desc: '强烈的暖红橙调，燃烧般的视觉冲击',
    scenes: '运动品牌、促销活动、音乐节',
    palette: ['#E63946', '#D62828', '#F77F00', '#FCBF49', '#9D0208'],
    accent: '#E63946'
  },
  {
    id: 'melancholy',
    name: '忧郁',
    emoji: '🌧️',
    keyword: '深沉 内省 诗意',
    desc: '低饱和的靛蓝灰紫，文学性的忧郁美感',
    scenes: '文艺内容、深夜电台、情感故事',
    palette: ['#1D3557', '#455A7B', '#7B6D8D', '#A8A0B8', '#5C677D'],
    accent: '#455A7B'
  },
  {
    id: 'anger',
    name: '愤怒',
    emoji: '⚡',
    keyword: '激烈 警示 对抗',
    desc: '高对比的烈红与暗黑，情绪的爆发点',
    scenes: '社会议题、警示海报、批判内容',
    palette: ['#9D0208', '#DC0F2F', '#E85D04', '#370617', '#6A040F'],
    accent: '#DC0F2F'
  },
  {
    id: 'anxiety',
    name: '焦虑',
    emoji: '🌫️',
    keyword: '紧绷 不安 混沌',
    desc: '浑浊的灰绿刺黄，说不清道不明的焦躁',
    scenes: '心理科普、职场压力、情绪管理',
    palette: ['#6B705C', '#B7B7A4', '#FFE8A3', '#CB997E', '#8B8B6E'],
    accent: '#CB997E'
  },
  {
    id: 'hope',
    name: '希望',
    emoji: '🌱',
    keyword: '新生 期待 光明',
    desc: '嫩芽般的嫩绿天蓝，破土而出的生机',
    scenes: '公益项目、新年规划、创业内容',
    palette: ['#95D5B2', '#72B5D3', '#E9C46A', '#B7E4C7', '#52B788'],
    accent: '#52B788'
  },
  {
    id: 'mystery',
    name: '神秘',
    emoji: '🔮',
    keyword: '深邃 未知 魅惑',
    desc: '深紫墨蓝黑曜石，夜的神秘与宇宙',
    scenes: '科技产品、悬疑内容、高端品牌',
    palette: ['#240046', '#5A189A', '#3C096C', '#10002B', '#7B2CBF'],
    accent: '#7B2CBF'
  },
  {
    id: 'warmth',
    name: '温暖',
    emoji: '☕',
    keyword: '舒适 怀旧 治愈',
    desc: '驼色暖棕奶白，午后的阳光与咖啡香',
    scenes: '家居生活、美食、亲情内容',
    palette: ['#D4A373', '#CC9B6C', '#FAEDCD', '#E9C46A', '#BC6C25'],
    accent: '#BC6C25'
  },
  {
    id: 'cool',
    name: '冷峻',
    emoji: '❄️',
    keyword: '理性 专业 克制',
    desc: '冰蓝钢灰银白，科技感与理性美',
    scenes: 'B端产品、金融科技、极简设计',
    palette: ['#CAE9FF', '#5FA8D3', '#62B6CB', '#1B4965', '#BEE9E8'],
    accent: '#1B4965'
  },
  {
    id: 'romance',
    name: '浪漫',
    emoji: '🌹',
    keyword: '柔美 甜蜜 梦幻',
    desc: '粉紫玫红的渐变，玫瑰花瓣的层次',
    scenes: '婚庆、美妆、情人节、情感',
    palette: ['#FF8FAB', '#FB6F92', '#CDB4DB', '#FFC2D1', '#B5179E'],
    accent: '#FB6F92'
  },
  {
    id: 'energy',
    name: '活力',
    emoji: '⚡',
    keyword: '动感 青春 跃动',
    desc: '荧光色与撞色组合，电光火石般的能量',
    scenes: '运动健身、电竞、潮流文化',
    palette: ['#06FFA5', '#FFEE32', '#FF6B35', '#00BBF9', '#F15BB5'],
    accent: '#06FFA5'
  }
];

// 导出供其他脚本使用
if (typeof window !== 'undefined') {
  window.MOOD_DATA = MOOD_DATA;
}
if (typeof module !== 'undefined') {
  module.exports = MOOD_DATA;
}
