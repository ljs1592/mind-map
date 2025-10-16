# 🎨 新功能：现代化主题 + 任务勾选框

## ✨ 快速开始（2 步）

### 步骤 1: 构建项目
```bash
cd web
npm install
npm run build
```

### 步骤 2: 打开演示
在浏览器中打开 **`example-modern-task.html`** ✅

## 📁 新增文件清单

### 核心文件
- ✅ `simple-mind-map/src/theme/modern.js` - Modern 主题
- ✅ `simple-mind-map/src/plugins/TaskCheckbox.js` - 任务勾选框插件
- ✅ `simple-mind-map/src/theme/index.js` - 已更新（添加 modern 主题）
- ✅ `simple-mind-map/full.js` - 已更新（注册 TaskCheckbox 插件）

### 演示文件
- ✅ `example-modern-task.html` - **推荐使用**（简洁、独立）
- ✅ `demo-modern-task.html` - 完整演示
- ✅ `MODERN_THEME_TASK_CHECKBOX.md` - 详细技术文档
- ✅ `USAGE_GUIDE.md` - 使用指南

## 🎯 功能特性

### 1️⃣ 任务勾选框
- ☑️ 叶子节点：方形勾选框
- ⟳ 父节点：圆形进度显示器（自动计算完成度）
- 🖱️ 点击切换：叶子节点切换自身，父节点批量操作子节点
- ✨ 动画效果：平滑过渡动画

### 2️⃣ Modern 主题
- 🎨 **设计风格**：React Flow + Tailwind + Shadcn
- 🌈 **配色**：Tailwind Slate 色系
- 📐 **圆角**：12px / 8px / 6px
- 🎭 **阴影**：多层次阴影效果
- 🔗 **连线**：优雅曲线
- 📝 **字体**：现代系统字体栈

## 🚀 使用方法

### 在 HTML 中使用

```html
<script src="./dist/js/chunk-vendors.js"></script>
<script src="./dist/js/app.js"></script>
<script>
  const mindMap = new window.MindMap({
    el: document.getElementById('mindMapContainer'),
    theme: 'modern',  // 使用 modern 主题
    data: {
      data: { text: '项目计划', taskChecked: false },
      children: [
        { data: { text: '任务1', taskChecked: true }, children: [] },
        { data: { text: '任务2', taskChecked: false }, children: [] }
      ]
    },
    createNodePrefixContent: (node) => {
      if (mindMap.taskCheckbox) {
        return mindMap.taskCheckbox.createCheckboxContent(node)
      }
      return null
    }
  })
</script>
```

### 在 Vue 中使用

```javascript
import MindMap from 'simple-mind-map'
import TaskCheckbox from 'simple-mind-map/src/plugins/TaskCheckbox'

MindMap.usePlugin(TaskCheckbox)

const mindMap = new MindMap({
  el: this.$refs.container,
  theme: 'modern',
  createNodePrefixContent: (node) => {
    if (this.mindMap.taskCheckbox) {
      return this.mindMap.taskCheckbox.createCheckboxContent(node)
    }
    return null
  }
})
```

## 📊 数据格式

```javascript
{
  data: {
    text: '节点文本',
    taskChecked: false  // true=已完成, false=未完成
  },
  children: [
    // 子节点...
  ]
}
```

## 🎮 API

```javascript
// 切换勾选状态
mindMap.taskCheckbox.toggleCheckbox(node)

// 设置勾选状态
mindMap.taskCheckbox.setNodeChecked(node, true)

// 获取勾选状态
const checked = mindMap.taskCheckbox.getNodeChecked(node)

// 获取完成度信息
const { total, completed, percentage } = 
  mindMap.taskCheckbox.getNodeCompletion(node)
```

## 📸 效果预览

### 任务勾选框

```
📋 项目开发计划 ⟳ 50%       ← 父节点（50%完成度）
├─ ☑ 需求分析              ← 已完成（蓝色勾选框）
├─ ☑ 设计阶段              ← 已完成
├─ ☐ 开发阶段              ← 未完成（白色勾选框）
│  ├─ ☐ 前端开发          ← 未完成
│  └─ ☐ 后端开发          ← 未完成
└─ ☐ 测试阶段              ← 未完成
```

### Modern 主题

```
┌─────────────────────────┐
│   🎯 项目计划           │ ← 根节点：大字体、粗边框、深阴影
└─────────────────────────┘
           │
    ┌──────┴──────┐
┌──────────┐  ┌──────────┐
│ 需求分析  │  │ 开发实施  │ ← 二级节点：中等样式
└──────────┘  └──────────┘
    │              │
  ┌─┴─┐          ┌─┴─┐
 ┌───┐ ┌───┐    ┌───┐ ┌───┐
 │调研│ │文档│    │前端│ │后端│ ← 子节点：简洁样式
 └───┘ └───┘    └───┘ └───┘
```

## ⚙️ 自定义配置

### 覆盖主题配置

```javascript
const mindMap = new MindMap({
  theme: 'modern',
  themeConfig: {
    backgroundColor: '#ffffff',  // 自定义背景色
    lineColor: '#667eea',        // 自定义连线颜色
    root: {
      fillColor: '#667eea',      // 自定义根节点背景
      color: '#ffffff'           // 自定义根节点文字颜色
    }
  }
})
```

### 修改勾选框样式

编辑 `simple-mind-map/src/plugins/TaskCheckbox.js`:

```javascript
// 第 9-10 行
this.checkboxSize = 20      // 改变大小（默认 18）
this.checkboxMargin = 10    // 改变间距（默认 8）

// 第 136-141 行 - 修改颜色
.fill(checked ? '#10b981' : '#ffffff')  // 改为绿色
.stroke({ 
  color: checked ? '#10b981' : '#cbd5e1', 
  width: 2 
})
```

## 🎯 使用场景

| 场景 | 适用性 | 推荐度 |
|-----|-------|--------|
| 📋 项目管理 | ⭐⭐⭐⭐⭐ | 极力推荐 |
| ✅ 任务清单 | ⭐⭐⭐⭐⭐ | 极力推荐 |
| 📚 学习计划 | ⭐⭐⭐⭐ | 推荐 |
| 📝 会议记录 | ⭐⭐⭐⭐ | 推荐 |
| 🎯 OKR 管理 | ⭐⭐⭐⭐⭐ | 极力推荐 |

## ❓ 常见问题

### Q: 为什么 HTML 文件打开是空白？
**A**: 需要先运行 `cd web && npm run build` 构建项目

### Q: 勾选框没有显示？
**A**: 检查是否配置了 `createNodePrefixContent` 选项

### Q: 如何在 index.html 中使用？
**A**: 
1. 修改 index.html 中的 `window.takeOverApp = true`
2. 在 `getDataFromBackend` 中设置 `theme: 'modern'`
3. 添加 `createNodePrefixContent` 配置

### Q: 父节点的进度不更新？
**A**: 调用 `mindMap.render()` 触发重新渲染

## 🔧 故障排查

### 检查清单
- [ ] 是否运行了 `npm run build`？
- [ ] 是否正确引入了 JS 文件？
- [ ] 控制台是否有错误信息？
- [ ] 数据格式是否正确（包含 `taskChecked` 字段）？
- [ ] 是否配置了 `createNodePrefixContent`？

### 调试技巧

```javascript
// 在控制台查看思维导图实例
console.log(mindMap)

// 查看插件是否加载
console.log(mindMap.taskCheckbox)  // 应该不是 undefined

// 查看当前主题
console.log(mindMap.themeConfig)

// 查看节点数据
const node = mindMap.renderer.activeNodeList[0]
console.log(node.nodeData.data)
```

## 📚 文档索引

- 📖 [详细技术文档](./MODERN_THEME_TASK_CHECKBOX.md)
- 📘 [使用指南](./USAGE_GUIDE.md)
- 🏠 [simple-mind-map 官方文档](https://github.com/wanglin2/mind-map)

## 🎉 开始使用

1. **构建**: `cd web && npm run build`
2. **打开**: `example-modern-task.html`
3. **体验**: 点击勾选框，体验现代化的任务管理！

---

**提示**: 首次使用建议直接打开 `example-modern-task.html` 体验所有功能！

**需要帮助?** 查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md) 获取详细使用说明。

🎨 享受现代化的思维导图体验！

