# 使用指南 - 现代化主题 + 任务勾选框

## 快速开始（3步）

### 1️⃣ 构建项目

```bash
cd web
npm install
npm run build
```

### 2️⃣ 打开演示页面

在浏览器中打开：
- `example-modern-task.html` （推荐 - 简洁版）
- `demo-modern-task.html` （完整版）

### 3️⃣ 开始使用

- 点击节点前的勾选框来标记任务完成
- 双击节点编辑文本
- 使用工具栏按钮操作思维导图

## 功能展示

### ✅ 任务勾选功能

| 节点类型 | 显示效果 | 行为 |
|---------|---------|------|
| 叶子节点 | 方形勾选框 □ / ☑ | 点击切换自身状态 |
| 父节点 | 圆形进度条 ⟳ 60% | 显示子任务完成度，点击批量操作 |

**示例**：
```
项目开发 ⟳ 50%           ← 父节点显示完成度
├─ 需求分析 ☑            ← 已完成
├─ 设计 ☑                ← 已完成  
├─ 开发 □                ← 未完成
└─ 测试 □                ← 未完成
```

### 🎨 Modern 主题

**视觉特点**：
- ✨ 柔和的圆角（6-12px）
- 🎭 多层次阴影效果
- 🌈 Tailwind Slate 配色
- 📏 现代系统字体
- 🔗 优雅的曲线连接

**颜色方案**：
```
根节点：  白色 (#ffffff) + 深灰文字 (#0f172a)
二级节点：白色 (#ffffff) + 灰色文字 (#1e293b)
子节点：  白色 (#ffffff) + 深灰文字 (#334155)
连线：    灰蓝色 (#94a3b8)
背景：    浅灰蓝 (#f8fafc)
```

## 使用方法

### 方式 1：直接使用 HTML 文件

**最简单的方式 - 无需修改代码**

1. 打开 `example-modern-task.html`
2. 开始使用！

### 方式 2：在 index.html 中使用

修改 `index.html`，添加主题和插件配置：

```html
<script>
  const mindMap = new window.MindMap({
    el: document.getElementById('app'),
    theme: 'modern',  // 使用现代化主题
    createNodePrefixContent: (node) => {
      // 添加勾选框
      if (mindMap.taskCheckbox) {
        return mindMap.taskCheckbox.createCheckboxContent(node)
      }
      return null
    }
  })
</script>
```

### 方式 3：在 Vue 应用中使用

修改 `web/src/pages/Edit/components/Edit.vue`：

```javascript
// 在 mounted 或 created 钩子中
this.mindMap = new MindMap({
  el: this.$refs.mindMapContainer,
  theme: 'modern',  // 使用 modern 主题
  createNodePrefixContent: (node) => {
    if (this.mindMap.taskCheckbox) {
      return this.mindMap.taskCheckbox.createCheckboxContent(node)
    }
    return null
  }
})
```

## 数据格式

### 基本结构

```javascript
{
  data: {
    text: '节点文本',
    taskChecked: false  // 勾选状态（必需）
  },
  children: [
    // 子节点...
  ]
}
```

### 完整示例

```javascript
const projectData = {
  data: {
    text: '🚀 新项目开发',
    taskChecked: false
  },
  children: [
    {
      data: {
        text: '📋 需求分析',
        taskChecked: false
      },
      children: [
        {
          data: {
            text: '用户调研',
            taskChecked: true  // 已完成
          },
          children: []
        },
        {
          data: {
            text: '需求文档',
            taskChecked: true  // 已完成
          },
          children: []
        },
        {
          data: {
            text: '原型设计',
            taskChecked: false  // 未完成
          },
          children: []
        }
      ]
    },
    {
      data: {
        text: '💻 开发实现',
        taskChecked: false
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
```

## API 使用

### 获取插件实例

```javascript
const taskCheckbox = mindMap.taskCheckbox
```

### 常用方法

```javascript
// 1. 切换节点勾选状态
taskCheckbox.toggleCheckbox(node)

// 2. 设置节点为已完成
taskCheckbox.setNodeChecked(node, true)

// 3. 设置节点为未完成
taskCheckbox.setNodeChecked(node, false)

// 4. 获取节点勾选状态
const isChecked = taskCheckbox.getNodeChecked(node)

// 5. 获取节点完成度信息
const completion = taskCheckbox.getNodeCompletion(node)
console.log(completion)
// 输出: { total: 10, completed: 7, percentage: 70 }
```

### 批量操作

```javascript
// 获取所有已完成的节点
function getCompletedNodes(root) {
  const completed = []
  const walk = (node) => {
    if (node.nodeData.data.taskChecked === true) {
      completed.push(node)
    }
    if (node.children) {
      node.children.forEach(walk)
    }
  }
  walk(root)
  return completed
}

// 获取所有未完成的节点
function getIncompleteNodes(root) {
  const incomplete = []
  const walk = (node) => {
    if (!node.nodeData.children || node.nodeData.children.length === 0) {
      // 叶子节点
      if (node.nodeData.data.taskChecked !== true) {
        incomplete.push(node)
      }
    } else if (node.children) {
      node.children.forEach(walk)
    }
  }
  walk(root)
  return incomplete
}
```

## 常见问题

### Q1: 为什么打开 HTML 文件没有显示思维导图？

**A**: 需要先构建项目：
```bash
cd web
npm install
npm run build
```

### Q2: 勾选框没有显示？

**A**: 确保配置了 `createNodePrefixContent`：
```javascript
createNodePrefixContent: (node) => {
  if (mindMap.taskCheckbox) {
    return mindMap.taskCheckbox.createCheckboxContent(node)
  }
  return null
}
```

### Q3: 如何更改主题？

**A**: 修改初始化配置：
```javascript
theme: 'modern'  // 使用 modern 主题
theme: 'default' // 使用默认主题
```

### Q4: 父节点的完成度不更新？

**A**: 确保调用了 `mindMap.render()` 来触发重新渲染：
```javascript
mindMap.taskCheckbox.setNodeChecked(node, true)
mindMap.render()  // 触发重新渲染
```

### Q5: 可以自定义勾选框样式吗？

**A**: 可以！编辑 `simple-mind-map/src/plugins/TaskCheckbox.js`：
```javascript
// 修改勾选框大小
this.checkboxSize = 20

// 修改颜色（在 createCheckbox 方法中）
.fill(checked ? '#10b981' : '#ffffff')  // 改为绿色
.stroke({ color: checked ? '#10b981' : '#cbd5e1', width: 2 })
```

### Q6: 如何导出带勾选框的思维导图？

**A**: 使用导出功能：
```javascript
// 导出为 PNG 图片
mindMap.export('png', true, '思维导图')

// 导出为 JSON 数据
const data = mindMap.getData()
console.log(JSON.stringify(data, null, 2))
```

## 工具栏按钮说明

| 按钮 | 功能 | 快捷键 |
|-----|------|--------|
| ➕ 添加任务 | 为选中节点添加子任务 | Tab |
| ✓ 切换勾选 | 切换选中节点的勾选状态 | - |
| 📂 展开全部 | 展开所有节点 | - |
| 📁 收起全部 | 收起所有节点 | - |
| 🔍 适应画布 | 调整视图以显示完整思维导图 | - |
| 🔄 重置数据 | 恢复为初始示例数据 | - |

## 键盘快捷键

| 快捷键 | 功能 |
|-------|------|
| `Tab` | 插入子节点 |
| `Enter` | 插入同级节点 |
| `Delete` / `Backspace` | 删除节点 |
| `Ctrl + C` | 复制节点 |
| `Ctrl + V` | 粘贴节点 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Y` | 重做 |
| `↑` `↓` `←` `→` | 导航节点 |
| `双击` | 编辑节点文本 |

## 最佳实践

### 1. 项目管理

适合用于：
- Sprint 任务规划
- 项目里程碑追踪
- 团队任务分配

### 2. 个人任务清单

适合用于：
- 日常待办事项
- 学习计划
- 读书笔记

### 3. 会议记录

适合用于：
- 会议议程
- 行动项追踪
- 决策记录

## 进阶技巧

### 自定义节点颜色

```javascript
// 根据完成状态设置节点颜色
mindMap.on('node_tree_render_end', () => {
  const walk = (node) => {
    if (node.nodeData.data.taskChecked) {
      node.style.fillColor = '#d1fae5'  // 已完成 - 绿色
    } else {
      node.style.fillColor = '#ffffff'  // 未完成 - 白色
    }
    if (node.children) {
      node.children.forEach(walk)
    }
  }
  walk(mindMap.renderer.root)
})
```

### 进度统计

```javascript
// 计算整体完成度
function getOverallProgress() {
  const completion = mindMap.taskCheckbox.getNodeCompletion(
    mindMap.renderer.root
  )
  console.log(`总体进度: ${completion.percentage}%`)
  console.log(`已完成: ${completion.completed}/${completion.total}`)
  return completion
}
```

## 支持

如有问题，请：
1. 检查控制台错误信息
2. 查看本文档的"常见问题"部分
3. 提交 Issue 到项目仓库

祝使用愉快！🎉

