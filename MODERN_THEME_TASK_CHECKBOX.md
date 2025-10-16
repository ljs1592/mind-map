# 现代化主题 + 任务勾选框功能

## 🎯 功能概述

本项目新增了两个强大的功能：

1. **Modern 主题** - 类似 React Flow 的 Tailwind + Shadcn/FramerMotion 现代化风格
2. **TaskCheckbox 插件** - 支持任务勾选，父节点自动显示完成度

## 📦 新增文件

### 主题文件
- `simple-mind-map/src/theme/modern.js` - 现代化主题配置

### 插件文件
- `simple-mind-map/src/plugins/TaskCheckbox.js` - 任务勾选框插件

### 示例文件
- `example-modern-task.html` - 独立演示页面（推荐）
- `demo-modern-task.html` - 完整功能演示

## 🚀 快速开始

### 方法一：使用独立演示页面（最简单）

1. **构建项目**
```bash
cd web
npm install
npm run build
```

2. **打开演示页面**
   - 在浏览器中直接打开 `example-modern-task.html`
   - 或者使用 Live Server 等工具

### 方法二：在现有项目中使用

1. **引入插件和主题**

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

// 注册插件
MindMap.usePlugin(TaskCheckbox)

// 创建实例，使用 modern 主题
const mindMap = new MindMap({
  el: document.getElementById('mindMapContainer'),
  data: yourData,
  theme: 'modern', // 使用现代化主题
  // 添加勾选框到节点
  createNodePrefixContent: (node) => {
    if (mindMap.taskCheckbox) {
      return mindMap.taskCheckbox.createCheckboxContent(node)
    }
    return null
  }
})
```

2. **准备数据格式**

```javascript
const data = {
  data: {
    text: '项目计划',
    taskChecked: false // 勾选状态
  },
  children: [
    {
      data: {
        text: '需求分析',
        taskChecked: false
      },
      children: [
        {
          data: {
            text: '收集需求',
            taskChecked: true // 已完成
          },
          children: []
        }
      ]
    }
  ]
}
```

## 🎨 Modern 主题特性

### 设计风格
- **配色方案**: 采用 Tailwind CSS 的 Slate 色系
- **字体**: 现代系统字体栈（-apple-system, SF Pro, Segoe UI 等）
- **圆角**: 根节点 12px，二级节点 8px，子节点 6px
- **阴影**: 多层次阴影效果，类似 Shadcn UI
- **连线**: 优雅的曲线风格，颜色柔和

### 节点样式

#### 根节点
- 字号：20px
- 字重：600
- 内边距：20px × 12px
- 边框：2px，#e2e8f0
- 阴影：0 4px 6px -1px rgba(0,0,0,0.1)

#### 二级节点
- 字号：16px
- 字重：500
- 内边距：20px × 12px
- 边框：1.5px，#cbd5e1
- 阴影：0 1px 3px rgba(0,0,0,0.1)

#### 三级及以下节点
- 字号：14px
- 字重：400
- 内边距：20px × 12px
- 边框：1px，#e2e8f0
- 阴影：0 1px 2px rgba(0,0,0,0.05)

### 背景和连线
- 背景色：#f8fafc（浅灰蓝）
- 连线颜色：#94a3b8（中灰蓝）
- 连线宽度：2px
- 连线风格：curve（曲线）

## ✅ TaskCheckbox 插件使用

### 基本功能

1. **叶子节点** - 显示方形勾选框
   - 未勾选：白色背景，灰色边框
   - 已勾选：蓝色背景，白色对勾

2. **父节点** - 显示圆形进度指示器
   - 显示子节点的完成百分比
   - 动画过渡效果
   - 完成时显示对勾图标

### API 方法

```javascript
// 切换节点勾选状态
mindMap.taskCheckbox.toggleCheckbox(node)

// 设置节点勾选状态
mindMap.taskCheckbox.setNodeChecked(node, true)

// 获取节点勾选状态
const isChecked = mindMap.taskCheckbox.getNodeChecked(node)

// 获取节点完成度信息
const completion = mindMap.taskCheckbox.getNodeCompletion(node)
// 返回: { total, completed, percentage }
```

### 交互行为

1. **点击叶子节点勾选框**
   - 切换自身勾选状态
   - 自动更新所有祖先节点的完成度

2. **点击父节点勾选框**
   - 如果未全部完成：将所有子任务标记为已完成
   - 如果已全部完成：将所有子任务标记为未完成

### 自动计算完成度

父节点的完成度会自动根据子节点计算：

```javascript
完成百分比 = (已完成子任务数 / 总子任务数) × 100%
```

递归统计所有后代节点的完成情况。

## 🎯 使用场景

### 1. 项目管理
```javascript
{
  data: { text: '项目开发', taskChecked: false },
  children: [
    { data: { text: '需求分析', taskChecked: true } },
    { data: { text: '设计', taskChecked: true } },
    { data: { text: '开发', taskChecked: false } },
    { data: { text: '测试', taskChecked: false } }
  ]
}
```

### 2. 任务清单
```javascript
{
  data: { text: '本周任务', taskChecked: false },
  children: [
    { data: { text: '完成报告', taskChecked: true } },
    { data: { text: '开会讨论', taskChecked: true } },
    { data: { text: '代码评审', taskChecked: false } }
  ]
}
```

### 3. 学习计划
```javascript
{
  data: { text: '前端学习路线', taskChecked: false },
  children: [
    {
      data: { text: 'HTML/CSS', taskChecked: false },
      children: [
        { data: { text: 'HTML5 新特性', taskChecked: true } },
        { data: { text: 'CSS3 动画', taskChecked: false } }
      ]
    }
  ]
}
```

## 📝 自定义配置

### 修改主题配置

你可以在初始化时覆盖主题配置：

```javascript
const mindMap = new MindMap({
  el: el,
  theme: 'modern',
  themeConfig: {
    // 自定义配置
    backgroundColor: '#ffffff',
    lineColor: '#667eea',
    root: {
      fillColor: '#667eea',
      color: '#ffffff'
    }
  }
})
```

### 修改勾选框样式

编辑 `simple-mind-map/src/plugins/TaskCheckbox.js`：

```javascript
// 修改勾选框大小
this.checkboxSize = 20  // 默认 18

// 修改勾选框间距
this.checkboxMargin = 10  // 默认 8
```

## ⚠️ 注意事项

### 1. 构建项目
使用新功能前，请确保已经构建项目：
```bash
cd web
npm run build
```

### 2. 插件注册顺序
TaskCheckbox 插件应该在其他插件之后注册，确保不会被覆盖。

### 3. 数据格式
节点数据中需要包含 `taskChecked` 字段：
```javascript
data: {
  text: '任务名称',
  taskChecked: false  // 必须是 boolean 类型
}
```

### 4. 兼容性
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 不支持 IE11 及以下版本

## 🎨 界面预览

### 勾选框样式

**叶子节点（未勾选）**
```
┌─────┐
│     │  白色背景 + 灰色边框
└─────┘
```

**叶子节点（已勾选）**
```
┌─────┐
│  ✓  │  蓝色背景 + 白色对勾
└─────┘
```

**父节点（进度 60%）**
```
   ⟳ 60%
圆形进度条显示完成度
```

**父节点（完成 100%）**
```
   ⟳ ✓
圆形进度条 + 对勾
```

## 📚 相关资源

- [simple-mind-map 官方文档](https://github.com/wanglin2/mind-map)
- [React Flow](https://reactflow.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**提示**: 如果在使用过程中遇到问题，请检查：
1. 是否已经运行 `npm run build`
2. 浏览器控制台是否有错误信息
3. 节点数据格式是否正确
4. 插件是否正确注册

