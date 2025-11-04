# 发布包包含源代码配置说明

## 修改内容

为了方便在其他项目中调试 `@ljs1592/simple-mind-map` 包，现在发布到 GitHub Packages 的包已包含完整源代码。

## 具体修改

### 1. 修改 `simple-mind-map/package.json`

在 `files` 字段中添加了源代码相关的文件和目录：

```json
{
  "files": [
    "dist",      // 打包后的生产文件（原有）
    "types",     // TypeScript 类型定义（原有）
    "src",       // ✨ 新增：完整源代码目录
    "index.js",  // ✨ 新增：主入口文件
    "full.js"    // ✨ 新增：包含所有插件的完整版本入口
  ]
}
```

### 2. 更新 `PUBLISH_GUIDE.md`

在发布流程文档中添加了：
- 包含内容说明
- 源代码调试使用指南
- 注意事项

## 发布包内容结构

发布后的包将包含以下内容：

```
@ljs1592/simple-mind-map/
├── dist/                          # 打包后的文件
│   ├── simpleMindMap.esm.js       # ESM 格式
│   ├── simpleMindMap.esm.min.js   # ESM 压缩版
│   └── ...其他打包文件
├── types/                         # TypeScript 类型定义
│   ├── index.d.ts
│   └── ...
├── src/                           # ✨ 完整源代码
│   ├── core/                      # 核心功能
│   │   ├── command/               # 命令系统
│   │   ├── event/                 # 事件系统
│   │   ├── render/                # 渲染系统
│   │   └── view/                  # 视图系统
│   ├── layouts/                   # 布局算法
│   ├── plugins/                   # 插件
│   ├── theme/                     # 主题
│   ├── utils/                     # 工具函数
│   ├── constants/                 # 常量定义
│   ├── parse/                     # 解析器
│   └── svg/                       # SVG 相关
├── index.js                       # ✨ 主入口（引用 src）
├── full.js                        # ✨ 完整版入口（包含所有插件）
├── package.json                   # 包配置
└── README.md                      # 说明文档
```

## 使用方式

### 方式 1：使用打包后的版本（推荐生产环境）

```javascript
import MindMap from '@ljs1592/simple-mind-map'
// 默认导入的是 dist/simpleMindMap.esm.min.js
```

### 方式 2：直接使用源代码

```javascript
// 基础版本（仅核心功能，需要手动注册插件）
import MindMap from '@ljs1592/simple-mind-map/index.js'

// 完整版本（包含所有插件）
import MindMap from '@ljs1592/simple-mind-map/full.js'

// 单独引入插件
import MiniMap from '@ljs1592/simple-mind-map/src/plugins/MiniMap.js'
```

### 方式 3：在浏览器调试工具中查看源码

安装包后，可以直接在浏览器开发者工具中找到：
```
node_modules/@ljs1592/simple-mind-map/src/
```

在这里可以设置断点进行调试。

## 优点

1. **便于调试**：可以直接在 `node_modules` 中查看和调试源代码
2. **灵活引用**：可以选择引用打包版本或源代码版本
3. **学习研究**：方便学习库的实现细节
4. **问题排查**：遇到问题时可以快速定位到源代码

## 注意事项

### 1. 构建工具配置

如果直接引用源代码（非 `dist` 目录），需要确保你的构建工具能够处理 ES6+ 语法：

**Webpack 配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          // 包含 node_modules 中的 @ljs1592/simple-mind-map
          path.resolve(__dirname, 'node_modules/@ljs1592/simple-mind-map')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
```

**Vite 配置**：
Vite 默认会处理 `node_modules` 中的 ES 模块，通常不需要额外配置。

### 2. 包大小

包含源代码会增加 npm 包的大小，但不会影响最终构建产物的大小（因为构建工具只会打包实际使用的代码）。

### 3. 生产环境建议

生产环境建议使用默认的打包版本：
```javascript
import MindMap from '@ljs1592/simple-mind-map' // 使用 dist/simpleMindMap.esm.min.js
```

只在开发调试时使用源代码版本。

## 版本更新

从 **v1.0.11** 版本开始，发布的包将包含完整源代码。

如果你使用的是旧版本，请更新到最新版本：

```bash
npm update @ljs1592/simple-mind-map
```

## 相关文件

- `simple-mind-map/package.json` - 包配置文件
- `PUBLISH_GUIDE.md` - 完整的发布流程文档
- `.github/workflows/publish.yml` - GitHub Actions 自动发布配置

---

**最后更新时间**：2025-11-04

