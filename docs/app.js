// 情绪调色板交互逻辑
(function() {
  'use strict';

  const MOODS = window.MOOD_DATA;
  let currentMood = MOODS[0];
  let adjustedPalette = [...currentMood.palette];
  let exportFormat = 'css';
  let diary = loadDiary();

  // ========== 颜色转换工具 ==========
  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0,2),16)/255;
    const g = parseInt(hex.substr(2,2),16)/255;
    const b = parseInt(hex.substr(4,2),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0, l=(max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return [h*360, s*100, l*100];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
      const v = Math.round(x * 255).toString(16);
      return v.length === 1 ? '0' + v : v;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    return {
      r: parseInt(hex.substr(0,2),16),
      g: parseInt(hex.substr(2,2),16),
      b: parseInt(hex.substr(4,2),16)
    };
  }
  function getContrastColor(hex) {
    const {r,g,b} = hexToRgb(hex);
    const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
    return luminance > 0.55 ? '#1a1a24' : '#ffffff';
  }
  // 中文色名（简单映射）
  function getColorName(hex) {
    const [h,s,l] = hexToHsl(hex);
    if (l < 15) return '墨色';
    if (s < 15) {
      if (l > 85) return '雪白'; if (l > 60) return '银灰';
      if (l > 35) return '中灰'; return '深灰';
    }
    if (h < 15 || h >= 345) return l>60?'浅红':(l<30?'暗红':'正红');
    if (h < 45) return l>60?'杏黄':'橙色';
    if (h < 70) return l>60?'鹅黄':'芥黄';
    if (h < 150) return l>60?'嫩绿':(l<30?'墨绿':'翠绿');
    if (h < 200) return '青色';
    if (h < 250) return l>60?'天蓝':(l<30?'深蓝':'宝蓝');
    if (h < 290) return l>60?'淡紫':'紫色';
    if (h < 330) return l>60?'粉紫':'玫红';
    return '粉红';
  }

  // ========== 调色板计算 ==========
  function computeAdjustedPalette() {
    const satMul = parseInt(document.getElementById('satSlider').value)/100;
    const lightMul = parseInt(document.getElementById('lightSlider').value)/100;
    const hueShift = parseInt(document.getElementById('hueSlider').value);
    adjustedPalette = currentMood.palette.map(hex => {
      let [h,s,l] = hexToHsl(hex);
      h = h + hueShift;
      s = s * satMul;
      l = l * lightMul;
      return hslToHex(h, s, l);
    });
  }

  // ========== 渲染：情绪列表 ==========
  function renderMoodList() {
    const list = document.getElementById('moodList');
    list.innerHTML = MOODS.map(m => {
      const active = m.id === currentMood.id ? 'active' : '';
      const dots = m.palette.slice(0,3).map(c => `<span style="background:${c}"></span>`).join('');
      return `<div class="mood-card ${active}" data-id="${m.id}"
        style="--mc1:${m.palette[0]};--mc2:${m.palette[2]}">
        <div class="mood-emoji">${m.emoji}</div>
        <div class="mood-name">${m.name}</div>
        <div class="mood-dots">${dots}</div>
      </div>`;
    }).join('');
    list.querySelectorAll('.mood-card').forEach(card => {
      card.addEventListener('click', () => selectMood(card.dataset.id));
    });
  }

  // ========== 渲染：当前情绪横幅 ==========
  function renderBanner() {
    document.getElementById('bigEmoji').textContent = currentMood.emoji;
    document.getElementById('moodTitle').textContent = currentMood.name;
    document.getElementById('moodKeyword').textContent = currentMood.keyword;
    document.getElementById('moodDesc').textContent = currentMood.desc;
    document.getElementById('moodScenes').textContent = '适用：' + currentMood.scenes;
    document.getElementById('bannerGlow').style.background = adjustedPalette[2];
    document.getElementById('bgGlow').style.background = `radial-gradient(circle, ${adjustedPalette[0]} 0%, transparent 70%)`;
    // 更新CSS变量accent
    document.documentElement.style.setProperty('--accent', currentMood.accent);
  }

  // ========== 渲染：调色板色块 ==========
  function renderPalette() {
    const display = document.getElementById('paletteDisplay');
    display.innerHTML = adjustedPalette.map((hex, i) => {
      const name = getColorName(hex);
      return `<div class="color-block" data-hex="${hex}" data-index="${i}"
        style="background:${hex}">
        <div class="copy-hint">点击复制</div>
        <div class="color-info">
          <div class="hex">${hex.toUpperCase()}</div>
          <div class="name">${name}</div>
        </div>
      </div>`;
    }).join('');
    display.querySelectorAll('.color-block').forEach(block => {
      block.addEventListener('click', () => { copyToClipboard(block.dataset.hex, block); trackEvent('copy_color'); });
    });
  }

  // ========== 渲染：应用预览 ==========
  function renderPreview() {
    const [c1, c2, c3, c4, c5] = adjustedPalette;
    // 渐变
    document.getElementById('demoGradient').style.background =
      `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
    // 按钮
    const btn1 = document.getElementById('demoBtn1');
    btn1.style.background = c2;
    btn1.style.color = getContrastColor(c2);
    const btn2 = document.getElementById('demoBtn2');
    btn2.style.background = 'transparent';
    btn2.style.border = `2px solid ${c3}`;
    btn2.style.color = c3;
    // 卡片
    const card = document.getElementById('demoCard');
    card.style.borderLeftColor = c2;
    card.style.background = c4 + '22';
    card.querySelector('h4').style.color = c1;
    // 文字
    const textDemo = document.getElementById('demoText');
    textDemo.style.background = c5 + '22';
    textDemo.style.color = c2;
  }

  // ========== 渲染：导出代码 ==========
  function renderExport() {
    const code = document.getElementById('exportCode');
    const [c1,c2,c3,c4,c5] = adjustedPalette;
    let out = '';
    switch(exportFormat) {
      case 'css':
        out = `:root {\n  --mood-${currentMood.id}-1: ${c1};\n  --mood-${currentMood.id}-2: ${c2};\n  --mood-${currentMood.id}-3: ${c3};\n  --mood-${currentMood.id}-4: ${c4};\n  --mood-${currentMood.id}-5: ${c5};\n  --mood-${currentMood.id}-accent: ${currentMood.accent};\n}\n\n/* 用法: color: var(--mood-${currentMood.id}-2); */`;
        break;
      case 'json':
        out = JSON.stringify({
          mood: currentMood.name, id: currentMood.id,
          keyword: currentMood.keyword, accent: currentMood.accent,
          palette: adjustedPalette,
          palette_names: adjustedPalette.map(getColorName)
        }, null, 2);
        break;
      case 'scss':
        out = `// ${currentMood.name} · ${currentMood.keyword}\n$${currentMood.id}-1: ${c1};\n$${currentMood.id}-2: ${c2};\n$${currentMood.id}-3: ${c3};\n$${currentMood.id}-4: ${c4};\n$${currentMood.id}-5: ${c5};\n$${currentMood.id}-accent: ${currentMood.accent};`;
        break;
      case 'tailwind':
        out = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${currentMood.id}': {\n          1: '${c1}',\n          2: '${c2}',\n          3: '${c3}',\n          4: '${c4}',\n          5: '${c5}',\n          accent: '${currentMood.accent}'\n        }\n      }\n    }\n  }\n}`;
        break;
      case 'gradient':
        out = `/* ${currentMood.name} 渐变 */\n.background {\n  background: linear-gradient(135deg, ${c1} 0%, ${c2} 35%, ${c3} 70%, ${c4} 100%);\n}\n\n/* 径向渐变 */\n.radial {\n  background: radial-gradient(circle at 30% 30%, ${c1}, ${c3});\n}\n\n/* 锥形渐变 */\n.conic {\n  background: conic-gradient(from 0deg, ${c1}, ${c2}, ${c3}, ${c4}, ${c5}, ${c1});\n}`;
        break;
    }
    code.textContent = out;
  }

  // ========== 情绪日记 ==========
  function loadDiary() {
    try {
      return JSON.parse(localStorage.getItem('mood-diary') || '[]');
    } catch(e) { return []; }
  }
  function saveDiary() {
    localStorage.setItem('mood-diary', JSON.stringify(diary));
  }
  function recordMood() {
    const now = new Date();
    const entry = {
      mood: currentMood.name,
      emoji: currentMood.emoji,
      color: currentMood.accent,
      time: now.getTime(),
      timeStr: now.toLocaleString('zh-CN', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
    };
    diary.push(entry);
    if (diary.length > 60) diary = diary.slice(-60); // 保留最近60条
    saveDiary();
    renderDiary();
    showToast('已记录「' + currentMood.name + '」情绪 ✓');
  }
  function renderDiary() {
    const tl = document.getElementById('diaryTimeline');
    const stats = document.getElementById('diaryStats');
    if (diary.length === 0) {
      tl.innerHTML = '<div class="diary-empty">还没有记录。点击"记录此刻情绪"开始你的情绪色谱之旅 🌈</div>';
      stats.innerHTML = '';
      return;
    }
    tl.innerHTML = diary.map(d => {
      const lightColor = adjustLightness(d.color, 65);
      return `<div class="diary-cell" style="background:linear-gradient(${d.color},${lightColor})">
        <div class="tip">${d.emoji} ${d.mood} · ${d.timeStr}</div>
      </div>`;
    }).join('');
    // 统计
    const counts = {};
    diary.forEach(d => counts[d.mood] = (counts[d.mood]||0)+1);
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topMood = sorted[0];
    stats.innerHTML = `共记录 <b>${diary.length}</b> 次 · 主导情绪：<b>${topMood[0]}</b>（${topMood[1]}次） · ` +
      `<span onclick="if(confirm('清空所有记录？')){localStorage.removeItem('mood-diary');location.reload();}" style="cursor:pointer;color:var(--text-dim);text-decoration:underline;">清空</span>`;
  }
  function adjustLightness(hex, l) {
    let [h,s] = hexToHsl(hex);
    return hslToHex(h, s, l);
  }

  // ========== 交互 ==========
  function selectMood(id) {
    currentMood = MOODS.find(m => m.id === id) || currentMood;
    // 重置滑块
    document.getElementById('satSlider').value = 100;
    document.getElementById('lightSlider').value = 100;
    document.getElementById('hueSlider').value = 0;
    document.getElementById('satVal').textContent = '100%';
    document.getElementById('lightVal').textContent = '100%';
    document.getElementById('hueVal').textContent = '0°';
    computeAdjustedPalette();
    renderAll();
  }
  function renderAll() {
    renderMoodList();
    renderBanner();
    renderPalette();
    renderPreview();
    renderExport();
  }

  // 复制
  function copyToClipboard(text, block) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('已复制：' + text);
      if (block) {
        block.classList.add('copied');
        setTimeout(() => block.classList.remove('copied'), 1200);
      }
    } catch(e) {
      showToast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // ========== 事件绑定 ==========
  // 滑块
  ['satSlider','lightSlider','hueSlider'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      const v = el.value;
      if (id === 'satSlider') document.getElementById('satVal').textContent = v + '%';
      if (id === 'lightSlider') document.getElementById('lightVal').textContent = v + '%';
      if (id === 'hueSlider') document.getElementById('hueVal').textContent = v + '°';
      computeAdjustedPalette();
      renderPalette();
      renderPreview();
      renderExport();
    });
  });
  // 导出tab
  document.querySelectorAll('.export-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.export-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      exportFormat = tab.dataset.format;
      renderExport();
    });
  });
  // 复制导出
  document.getElementById('exportCopyBtn').addEventListener('click', () => {
    copyToClipboard(document.getElementById('exportCode').textContent);
    trackEvent('export_palette');
  });
  // 随机
  document.getElementById('randomBtn').addEventListener('click', () => {
    const others = MOODS.filter(m => m.id !== currentMood.id);
    selectMood(others[Math.floor(Math.random()*others.length)].id);
  });
  // 主题
  document.getElementById('themeBtn').addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('mood-theme', isLight ? 'dark' : 'light');
  });
  // 恢复主题
  const savedTheme = localStorage.getItem('mood-theme');
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme','light');
  // 记录情绪
  document.getElementById('recordMoodBtn').addEventListener('click', recordMood);

  // ========== 初始化 ==========
  renderAll();
  renderDiary();
})();
