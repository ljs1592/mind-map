# 一个web思维导图的简单实现（增强版）

基于 [wanglin2/mind-map](https://github.com/wanglin2/mind-map) 的增强版本，新增任务管理和现代化主题功能。

## 新增特性

### 1. TaskCheckbox 插件 - 任务勾选框

完整的任务管理功能，支持任务完成度追踪和多视图切换：

**主要功能：**
- ✅ 叶子节点显示勾选框（□/✓），可点击切换状态
- 📊 父节点显示圆形进度条，实时显示子任务完成度
- 🎯 智能完成度计算：父节点自动汇总所有子节点的完成情况
- 🔄 级联更新：修改任何节点自动更新所有祖先节点的完成度
- 🎨 精美动画：勾选框和进度圆圈带有流畅的过渡动画
- 💡 Hover 提示：鼠标悬停显示详细完成度信息
- 🔍 **任务视图切换**：支持全部任务/未完成任务/已完成任务三种视图模式
- ⚙️ **灵活配置**：视图模式、动画参数、默认视图等均可自定义配置
- 🎬 **丝滑动画**：视图切换时节点带有淡出/淡入动画效果

**交互逻辑：**
- 叶子节点：点击切换 ✓/□ 状态
- 父节点：
  - 完成度 < 100%：点击设为 100%，所有子任务标记为已完成
  - 完成度 = 100%：点击设为 0%，所有子任务标记为未完成

**视图切换功能：**
- **全部任务视图**：显示所有任务，保持完整树结构
- **未完成任务视图**：只显示未完成的任务，勾选完成后节点自动淡出
- **已完成任务视图**：只显示已完成的任务，以已完成节点为根重组结构
- 支持 `Ctrl+F` 快捷键或右键菜单切换视图
- 视图模式、动画效果均可自定义配置

### 2. Modern 主题 - 现代化设计

类似 React Flow 的 Tailwind + Shadcn 风格，提供清爽现代的视觉体验：

**设计特点：**
- 🎨 现代化色彩系统（基于 Tailwind CSS 调色板）
- 📐 圆角卡片设计，优雅的边框和阴影
- 🔤 系统字体栈（-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...）
- 🌊 流畅的曲线连接线
- 🎯 清晰的视觉层次
- 💎 精致的节点间距和内边距

## 安装

```bash
npm i simple-mind-map
```

## 快速开始

### 基础使用

```javascript
import MindMap from 'simple-mind-map'

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  data: {
    data: {
      text: '根节点'
    },
    children: []
  }
})
```

### 使用 TaskCheckbox 插件

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

// 注册插件
MindMap.usePlugin(TaskCheckbox)

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  data: {
    data: {
      text: '项目任务'
    },
    children: [
      {
        data: {
          text: '需求分析',
          taskChecked: true  // 已完成
        },
        children: []
      },
      {
        data: {
          text: '开发实现',
          taskChecked: false  // 未完成
        },
        children: []
      }
    ]
  }
})

// 监听过滤模式变化
mindMap.on('taskCheckboxFilterChanged', ({ mode }) => {
  console.log('当前过滤模式:', mode)
})
```

**TaskCheckbox API：**

```javascript
// 设置节点勾选状态
mindMap.taskCheckbox.setNodeChecked(node, true)

// 获取节点勾选状态
const checked = mindMap.taskCheckbox.getNodeChecked(node)

// 获取节点完成度信息
const completion = mindMap.taskCheckbox.getNodeCompletion(node)
// 返回: { total: 10, completed: 7, percentage: 70 }

// 设置过滤模式
mindMap.taskCheckbox.setFilterMode('uncompleted')  // 'all', 'uncompleted', 'completed'

// 循环切换过滤模式
mindMap.taskCheckbox.cycleFilterMode()
```

**TaskCheckbox 任务视图配置：**

```javascript
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  
  // 任务视图功能配置
  taskCheckboxViewEnabled: true,  // 是否启用任务视图切换功能
  taskCheckboxViewModes: ['all', 'uncompleted', 'completed'],  // 可用的视图模式
  taskCheckboxDefaultViewMode: 'all',  // 默认视图模式
  
  // 动画效果配置
  taskCheckboxAnimationDelay: 550,  // 勾选框动画完成后等待多久再开始节点退出动画（毫秒）
  taskCheckboxAnimationDuration: 300,  // 节点淡出/淡入动画持续时间（毫秒）
  taskCheckboxAnimationMoveDistance: 30,  // 节点淡出时的水平移动距离（像素）
  taskCheckboxExitAnimationEasing: '>',  // 节点淡出动画的缓动函数：'>'(ease-out), '<'(ease-in), '-'(linear), '='(ease-in-out)
  taskCheckboxEnterAnimationEasing: '<'  // 节点淡入动画的缓动函数
})
```

**视图模式说明：**

- **`all`（全部任务）**：显示所有任务节点，保持原始结构
- **`uncompleted`（未完成任务）**：只显示未完成的任务节点，完成后的任务会带动画滑出
- **`completed`（已完成任务）**：只显示已完成的任务节点，以最高层级的已完成节点为根显示

**视图模式组合示例：**

```javascript
// 完整三种模式
taskCheckboxViewModes: ['all', 'uncompleted', 'completed']

// 只有"全部"和"未完成"
taskCheckboxViewModes: ['all', 'uncompleted']

// 只有"全部"和"已完成"
taskCheckboxViewModes: ['all', 'completed']

// 禁用视图切换功能
taskCheckboxViewEnabled: false
```

**快捷键：**

- `Ctrl+F`：循环切换任务视图模式
- 右键点击勾选框：打开视图切换菜单

### 使用 Modern 主题

```javascript
import MindMap from 'simple-mind-map'

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern',  // 使用 modern 主题
  data: {
    data: {
      text: '根节点'
    },
    children: []
  }
})

// 或者动态切换
mindMap.setTheme('modern')
```

**Modern 主题自定义配置：**

```javascript
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern',
  themeConfig: {
    // 自定义配置会与 modern 主题合并
    backgroundColor: '#ffffff',
    lineColor: '#94a3b8',
    root: {
      fillColor: '#f8fafc',
      color: '#0f172a',
      fontSize: 22
    }
  }
})
```

## 完整示例（TaskCheckbox + Modern 主题）

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

// 注册插件
MindMap.usePlugin(TaskCheckbox)

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern',  // 使用现代化主题
  
  // TaskCheckbox 视图功能配置
  taskCheckboxViewEnabled: true,
  taskCheckboxViewModes: ['all', 'uncompleted', 'completed'],
  taskCheckboxDefaultViewMode: 'all',
  
  // 自定义动画效果（可选）
  taskCheckboxAnimationDuration: 400,  // 更慢的动画
  taskCheckboxAnimationMoveDistance: 50,  // 更大的移动距离
  
  data: {
    data: {
      text: 'Q1 项目规划'
    },
    children: [
      {
        data: {
          text: '产品设计'
        },
        children: [
          {
            data: {
              text: '用户调研',
              taskChecked: true
            },
            children: []
          },
          {
            data: {
              text: '原型设计',
              taskChecked: true
            },
            children: []
          },
          {
            data: {
              text: 'UI 设计',
              taskChecked: false
            },
            children: []
          }
        ]
      },
      {
        data: {
          text: '技术开发'
        },
        children: [
          {
            data: {
              text: '前端开发',
              taskChecked: false
            },
            children: []
          },
          {
            data: {
              text: '后端开发',
              taskChecked: false
            },
            children: []
          }
        ]
      }
    ]
  }
})

// 监听视图模式变化
mindMap.on('taskCheckboxFilterChanged', ({ mode }) => {
  console.log('当前视图模式:', mode)
})

// 设置快捷键提示
console.log('快捷键：Ctrl+F 循环切换任务视图模式')
console.log('右键点击勾选框打开视图切换菜单')
```

## 在其他项目中引入

### 方式一：从 npm 安装（推荐）

如果你已经将增强版发布到 npm：

```bash
npm install your-enhanced-mind-map
```

```javascript
import MindMap from 'your-enhanced-mind-map'
import TaskCheckbox from 'your-enhanced-mind-map/src/plugins/TaskCheckbox'

MindMap.usePlugin(TaskCheckbox)

const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern'
})
```

### 方式二：本地链接（开发阶段）

在你的增强版项目根目录：

```bash
cd simple-mind-map
npm link
```

在你的目标项目：

```bash
npm link simple-mind-map
```

然后正常导入使用：

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'
```

### 方式三：相对路径引入

如果两个项目在同一工作区：

```javascript
import MindMap from '../path/to/mind-map/simple-mind-map/index.js'
import TaskCheckbox from '../path/to/mind-map/simple-mind-map/src/plugins/TaskCheckbox.js'
```

### 方式四：Git 子模块

在目标项目中添加子模块：

```bash
git submodule add https://github.com/your-username/mind-map.git libs/mind-map
git submodule update --init --recursive
```

然后配置构建工具（Webpack/Vite）的别名：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'libs/mind-map/simple-mind-map')
    }
  }
}

// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'simple-mind-map': path.resolve(__dirname, 'libs/mind-map/simple-mind-map')
    }
  }
}
```

## 完整插件列表

如需使用完整功能，从 `full.js` 导入：

```javascript
import MindMap from 'simple-mind-map/full.js'

// full.js 已包含所有插件，包括 TaskCheckbox
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  theme: 'modern'
})

// 直接使用 taskCheckbox 实例
mindMap.taskCheckbox.setFilterMode('uncompleted')
```

## 数据格式示例

```javascript
{
  data: {
    text: '根节点',
    taskChecked: false  // 任务勾选状态（可选）
  },
  children: [
    {
      data: {
        text: '子节点',
        taskChecked: true
      },
      children: []
    }
  ]
}
```

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 文档链接

- 原项目文档: [https://github.com/wanglin2/mind-map](https://github.com/wanglin2/mind-map)
- 原项目在线文档: [https://wanglin2.github.io/mind-map-docs/](https://wanglin2.github.io/mind-map-docs/)

## 许可证

MIT

---

## 更新日志

### v0.14.0-fix.1-enhanced

- ✨ 新增 `TaskCheckbox` 插件：完整的任务管理和完成度追踪功能
- 🎨 新增 `modern` 主题：现代化的视觉设计风格
- 🔄 TaskCheckbox 支持级联更新和智能完成度计算
- 🎯 TaskCheckbox 支持任务视图切换功能（全部/未完成/已完成）
- ⚙️ TaskCheckbox 视图功能支持灵活配置（视图模式、动画参数等）
- 🎬 TaskCheckbox 视图切换时带有丝滑的淡出/淡入动画效果
- 💫 优化了勾选框和进度圈的动画效果
- 📝 完善了 TaskCheckbox 视图功能的配置文档

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

感谢原作者 [wanglin2](https://github.com/wanglin2) 创建了这个优秀的思维导图库。
