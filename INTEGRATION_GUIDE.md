# 集成指南：在其他项目中使用增强版 SimpleMindMap

本指南详细介绍如何在你的项目中集成带有 TaskCheckbox 插件和 Modern 主题的 SimpleMindMap。

## 📋 目录

1. [安装方式](#安装方式)
2. [完整示例项目](#完整示例项目)
3. [配置说明](#配置说明)
4. [常见问题](#常见问题)

---

## 🚀 安装方式

### 方式一：通过 npm link（推荐用于开发）

#### 第一步：在 simple-mind-map 项目中创建链接

```bash
# 进入 simple-mind-map 目录
cd /path/to/mind-map/simple-mind-map

# 创建全局链接
npm link
```

#### 第二步：在目标项目中使用链接

```bash
# 进入你的目标项目
cd /path/to/your-project

# 链接 simple-mind-map
npm link simple-mind-map
```

#### 第三步：在代码中使用

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

// 注册插件
MindMap.usePlugin(TaskCheckbox)

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern',
  data: {
    data: { text: '根节点' },
    children: []
  }
})
```

---

### 方式二：直接从 GitHub 安装

在目标项目的 `package.json` 中添加：

```json
{
  "dependencies": {
    "simple-mind-map": "github:your-username/mind-map#main"
  }
}
```

或者直接安装：

```bash
npm install github:your-username/mind-map
```

---

### 方式三：Git Submodule（适合大型项目）

```bash
# 在目标项目根目录
git submodule add https://github.com/your-username/mind-map.git libs/mind-map
git submodule update --init --recursive
```

然后配置构建工具别名：

#### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'libs/mind-map/simple-mind-map')
    }
  }
})
```

#### Webpack 配置

```javascript
// webpack.config.js
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'libs/mind-map/simple-mind-map')
    }
  }
}
```

---

### 方式四：本地文件复制（不推荐）

将 `simple-mind-map` 整个文件夹复制到目标项目：

```
your-project/
├── src/
├── lib/
│   └── simple-mind-map/  ← 复制到这里
└── package.json
```

然后使用相对路径导入：

```javascript
import MindMap from './lib/simple-mind-map/index.js'
import TaskCheckbox from './lib/simple-mind-map/src/plugins/TaskCheckbox.js'
```

---

## 📦 完整示例项目

### 示例 1：Vue 3 + Vite 项目

#### 安装依赖

```bash
npm install simple-mind-map
# 如果使用 npm link，执行 npm link simple-mind-map
```

#### 创建组件 `TaskMindMap.vue`

```vue
<template>
  <div class="mind-map-container">
    <div class="toolbar">
      <button @click="toggleFilterMode">
        切换过滤 ({{ filterMode }})
      </button>
      <button @click="changeTheme">
        切换主题 ({{ currentTheme }})
      </button>
      <button @click="getCompletion">
        查看完成度
      </button>
    </div>
    <div ref="mindMapRef" class="mind-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

// 注册插件
MindMap.usePlugin(TaskCheckbox)

const mindMapRef = ref(null)
const currentTheme = ref('modern')
const filterMode = ref('all')
let mindMap = null

const initialData = {
  data: {
    text: '项目任务管理'
  },
  children: [
    {
      data: { text: '前端开发' },
      children: [
        { data: { text: '页面开发', taskChecked: true }, children: [] },
        { data: { text: '组件开发', taskChecked: false }, children: [] },
        { data: { text: '测试', taskChecked: false }, children: [] }
      ]
    },
    {
      data: { text: '后端开发' },
      children: [
        { data: { text: 'API 开发', taskChecked: true }, children: [] },
        { data: { text: '数据库设计', taskChecked: true }, children: [] }
      ]
    }
  ]
}

onMounted(() => {
  mindMap = new MindMap({
    el: mindMapRef.value,
    theme: 'modern',
    data: initialData,
    layout: 'logicalStructure'
  })

  // 监听过滤模式变化
  mindMap.on('taskCheckboxFilterChanged', ({ mode }) => {
    filterMode.value = mode
  })
})

onBeforeUnmount(() => {
  if (mindMap) {
    mindMap.destroy()
  }
})

const toggleFilterMode = () => {
  if (mindMap && mindMap.taskCheckbox) {
    mindMap.taskCheckbox.cycleFilterMode()
  }
}

const changeTheme = () => {
  const themes = ['default', 'modern']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  mindMap.setTheme(nextTheme)
  currentTheme.value = nextTheme
}

const getCompletion = () => {
  if (mindMap && mindMap.renderer && mindMap.renderer.root) {
    const completion = mindMap.taskCheckbox.getNodeCompletion(
      mindMap.renderer.root
    )
    alert(`总任务: ${completion.total}\n已完成: ${completion.completed}\n完成度: ${completion.percentage}%`)
  }
}
</script>

<style scoped>
.mind-map-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.toolbar button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar button:hover {
  background: #2563eb;
}

.mind-map {
  flex: 1;
  background: #f8fafc;
}

/* 必须包含这些样式以确保正常显示 */
.mind-map * {
  margin: 0;
  padding: 0;
}
</style>
```

#### 在 `App.vue` 中使用

```vue
<template>
  <TaskMindMap />
</template>

<script setup>
import TaskMindMap from './components/TaskMindMap.vue'
</script>
```

---

### 示例 2：React 项目

#### 创建组件 `TaskMindMap.jsx`

```jsx
import React, { useEffect, useRef, useState } from 'react'
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'
import './TaskMindMap.css'

// 注册插件（只需要注册一次）
MindMap.usePlugin(TaskCheckbox)

const TaskMindMap = () => {
  const mindMapRef = useRef(null)
  const [mindMap, setMindMap] = useState(null)
  const [filterMode, setFilterMode] = useState('all')
  const [theme, setTheme] = useState('modern')

  const initialData = {
    data: {
      text: 'Q1 计划'
    },
    children: [
      {
        data: { text: '产品设计' },
        children: [
          { data: { text: '需求分析', taskChecked: true }, children: [] },
          { data: { text: 'UI设计', taskChecked: false }, children: [] }
        ]
      },
      {
        data: { text: '技术开发' },
        children: [
          { data: { text: '前端', taskChecked: false }, children: [] },
          { data: { text: '后端', taskChecked: false }, children: [] }
        ]
      }
    ]
  }

  useEffect(() => {
    if (mindMapRef.current) {
      const mm = new MindMap({
        el: mindMapRef.current,
        theme: 'modern',
        data: initialData
      })

      // 监听过滤模式变化
      mm.on('taskCheckboxFilterChanged', ({ mode }) => {
        setFilterMode(mode)
      })

      setMindMap(mm)

      return () => {
        mm.destroy()
      }
    }
  }, [])

  const toggleFilter = () => {
    if (mindMap?.taskCheckbox) {
      mindMap.taskCheckbox.cycleFilterMode()
    }
  }

  const changeTheme = () => {
    const themes = ['default', 'modern']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    mindMap?.setTheme(nextTheme)
    setTheme(nextTheme)
  }

  const showCompletion = () => {
    if (mindMap?.renderer?.root) {
      const completion = mindMap.taskCheckbox.getNodeCompletion(
        mindMap.renderer.root
      )
      alert(
        `总任务: ${completion.total}\n` +
        `已完成: ${completion.completed}\n` +
        `完成度: ${completion.percentage}%`
      )
    }
  }

  return (
    <div className="mind-map-container">
      <div className="toolbar">
        <button onClick={toggleFilter}>
          切换过滤 ({filterMode})
        </button>
        <button onClick={changeTheme}>
          切换主题 ({theme})
        </button>
        <button onClick={showCompletion}>
          查看完成度
        </button>
      </div>
      <div ref={mindMapRef} className="mind-map" />
    </div>
  )
}

export default TaskMindMap
```

#### CSS 样式 `TaskMindMap.css`

```css
.mind-map-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.toolbar button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.toolbar button:hover {
  background: #2563eb;
}

.mind-map {
  flex: 1;
  background: #f8fafc;
}

.mind-map * {
  margin: 0;
  padding: 0;
}
```

---

### 示例 3：原生 JavaScript + HTML

#### `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>任务思维导图</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      padding: 15px;
      background: #ffffff;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .toolbar button {
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .toolbar button:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .toolbar button:active {
      transform: translateY(0);
    }

    #mindMapContainer {
      flex: 1;
      background: #f8fafc;
    }

    #mindMapContainer * {
      margin: 0;
      padding: 0;
    }

    .info {
      padding: 15px;
      background: #f0f9ff;
      border-bottom: 2px solid #bae6fd;
      color: #0c4a6e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="info">
      💡 提示：右键点击勾选框打开过滤菜单，或使用 Ctrl+F 快捷键切换过滤模式
    </div>
    <div class="toolbar">
      <button onclick="toggleFilter()">切换过滤模式</button>
      <button onclick="toggleTheme()">切换主题</button>
      <button onclick="showCompletion()">查看完成度</button>
      <button onclick="exportData()">导出数据</button>
      <span id="status" style="margin-left: auto; color: #64748b;"></span>
    </div>
    <div id="mindMapContainer"></div>
  </div>

  <script type="module">
    import MindMap from './node_modules/simple-mind-map/index.js'
    import TaskCheckbox from './node_modules/simple-mind-map/src/plugins/TaskCheckbox.js'

    // 注册插件
    MindMap.usePlugin(TaskCheckbox)

    // 初始化数据
    const initialData = {
      data: {
        text: '2024 年度目标'
      },
      children: [
        {
          data: { text: 'Q1 目标' },
          children: [
            { data: { text: '学习 Vue 3', taskChecked: true }, children: [] },
            { data: { text: '完成项目 A', taskChecked: true }, children: [] },
            { data: { text: '阅读 5 本书', taskChecked: false }, children: [] }
          ]
        },
        {
          data: { text: 'Q2 目标' },
          children: [
            { data: { text: '学习 React', taskChecked: false }, children: [] },
            { data: { text: '完成项目 B', taskChecked: false }, children: [] }
          ]
        }
      ]
    }

    // 创建思维导图实例
    const mindMap = new MindMap({
      el: document.getElementById('mindMapContainer'),
      theme: 'modern',
      data: initialData
    })

    // 监听事件
    mindMap.on('taskCheckboxFilterChanged', ({ mode }) => {
      updateStatus(`过滤模式: ${mode}`)
    })

    mindMap.on('data_change', () => {
      updateStatus('数据已更新')
    })

    // 工具函数
    function updateStatus(text) {
      const status = document.getElementById('status')
      status.textContent = text
      setTimeout(() => {
        status.textContent = ''
      }, 2000)
    }

    // 全局函数
    window.toggleFilter = function() {
      mindMap.taskCheckbox.cycleFilterMode()
    }

    window.toggleTheme = function() {
      const themes = ['default', 'modern']
      const current = mindMap.getTheme()
      const nextTheme = themes[(themes.indexOf(current) + 1) % themes.length]
      mindMap.setTheme(nextTheme)
      updateStatus(`主题: ${nextTheme}`)
    }

    window.showCompletion = function() {
      const root = mindMap.renderer.root
      const completion = mindMap.taskCheckbox.getNodeCompletion(root)
      alert(
        `📊 整体完成度\n\n` +
        `总任务数: ${completion.total}\n` +
        `已完成: ${completion.completed}\n` +
        `完成率: ${completion.percentage}%`
      )
    }

    window.exportData = function() {
      const data = mindMap.getData(true)
      console.log('导出的数据:', data)
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mindmap-data.json'
      a.click()
      updateStatus('数据已导出')
    }

    // 暴露到全局供调试
    window.mindMap = mindMap
  </script>
</body>
</html>
```

---

## ⚙️ 配置说明

### TaskCheckbox 插件配置

```javascript
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern',
  data: yourData,
  
  // TaskCheckbox 相关配置
  // 节点前置内容会自动包含勾选框
  createNodePrefixContent: null  // 不要覆盖，否则勾选框不显示
})

// 插件实例化后的配置
mindMap.taskCheckbox.checkboxSize = 20  // 勾选框大小
mindMap.taskCheckbox.checkboxMargin = 10  // 勾选框右边距
```

### Modern 主题配置

```javascript
const mindMap = new MindMap({
  theme: 'modern',
  themeConfig: {
    // 全局配置
    backgroundColor: '#f8fafc',
    lineColor: '#94a3b8',
    lineWidth: 2,
    lineStyle: 'curve',
    
    // 根节点配置
    root: {
      fillColor: '#ffffff',
      color: '#0f172a',
      fontSize: 20,
      borderRadius: 12
    },
    
    // 二级节点配置
    second: {
      fillColor: '#ffffff',
      color: '#1e293b',
      fontSize: 16,
      borderRadius: 8
    },
    
    // 三级及以下节点配置
    node: {
      fillColor: '#ffffff',
      color: '#334155',
      fontSize: 14,
      borderRadius: 6
    }
  }
})
```

---

## 🔧 常见问题

### 1. 勾选框不显示

**原因：** TaskCheckbox 插件未正确注册或被其他配置覆盖

**解决方案：**

```javascript
// 确保在创建实例前注册插件
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

MindMap.usePlugin(TaskCheckbox)

// 不要设置 createNodePrefixContent
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  // createNodePrefixContent: null  // ❌ 不要设置
  data: yourData
})
```

### 2. Modern 主题不生效

**原因：** 主题名称错误或配置被覆盖

**解决方案：**

```javascript
// 正确的主题名称是 'modern'
const mindMap = new MindMap({
  theme: 'modern',  // ✅ 正确
  // theme: 'Modern'  // ❌ 错误，大小写敏感
  data: yourData
})

// 或者在创建后设置
mindMap.setTheme('modern')
```

### 3. npm link 失败

**解决方案：**

```bash
# 清理旧链接
npm unlink simple-mind-map -g
cd simple-mind-map
npm unlink

# 重新创建链接
npm link

# 在目标项目中
npm link simple-mind-map

# 如果还是失败，尝试使用绝对路径
npm link /absolute/path/to/simple-mind-map
```

### 4. 构建错误：找不到模块

**原因：** 构建工具未正确处理路径

**Vite 解决方案：**

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'node_modules/simple-mind-map')
    }
  },
  optimizeDeps: {
    include: ['simple-mind-map']
  }
}
```

**Webpack 解决方案：**

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'node_modules/simple-mind-map')
    }
  }
}
```

### 5. 样式显示异常

**原因：** CSS 样式冲突或未正确加载

**解决方案：**

```css
/* 确保容器有正确的样式 */
#mindMapContainer {
  width: 100%;
  height: 100vh;
  background: #f8fafc;
}

/* 重置内部元素样式 */
#mindMapContainer * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

### 6. TypeScript 类型错误

**解决方案：**

创建类型声明文件 `simple-mind-map.d.ts`：

```typescript
declare module 'simple-mind-map' {
  export default class MindMap {
    constructor(options: any)
    static usePlugin(plugin: any): typeof MindMap
    taskCheckbox: {
      setNodeChecked(node: any, checked: boolean): void
      getNodeChecked(node: any): boolean
      getNodeCompletion(node: any): {
        total: number
        completed: number
        percentage: number
      }
      setFilterMode(mode: 'all' | 'uncompleted' | 'completed'): void
      cycleFilterMode(): void
    }
    setTheme(theme: string): void
    getTheme(): string
    getData(withConfig?: boolean): any
    render(callback?: () => void): void
    destroy(): void
    on(event: string, handler: Function): void
    off(event: string, handler: Function): void
  }
}

declare module 'simple-mind-map/src/plugins/TaskCheckbox' {
  export default class TaskCheckbox {
    static instanceName: string
    constructor(options: any)
  }
}
```

---

## 📚 更多资源

- [原项目文档](https://wanglin2.github.io/mind-map-docs/)
- [GitHub 仓库](https://github.com/wanglin2/mind-map)
- [示例项目](./examples/)

---

## 💬 获取帮助

如果遇到问题：

1. 检查浏览器控制台错误信息
2. 确认插件已正确注册
3. 查看本指南的常见问题部分
4. 提交 Issue 到 GitHub

---

祝你使用愉快！🎉

