# 🚀 启动演示服务器

由于浏览器的跨域安全限制，演示文件需要通过本地服务器运行。

## 快速启动

### Windows 用户

双击运行 **`start-server.bat`** 文件

或在命令行中执行：
```bash
node start-server.js
```

### Mac/Linux 用户

```bash
node start-server.js
```

## 访问演示页面

服务器启动后，在浏览器中访问：

- **推荐演示**: http://localhost:8080/example-modern-task.html
- **完整演示**: http://localhost:8080/demo-modern-task.html
- **Index 版本**: http://localhost:8080/index-modern-example.html
- **原始页面**: http://localhost:8080/index.html

## 其他方式

### 使用 Python (如果已安装)

**Python 3:**
```bash
python -m http.server 8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

然后访问: http://localhost:8080/example-modern-task.html

### 使用 VS Code Live Server

1. 安装 VS Code 扩展 "Live Server"
2. 右键点击 HTML 文件
3. 选择 "Open with Live Server"

### 使用 npm 的 http-server

```bash
# 安装（如果还没安装）
npm install -g http-server

# 启动
http-server -p 8080
```

然后访问: http://localhost:8080/example-modern-task.html

## 停止服务器

按 `Ctrl+C` 停止服务器

## 故障排除

### 端口被占用

如果 8080 端口被占用，修改 `start-server.js` 中的端口号：

```javascript
const PORT = 8081;  // 改为其他端口
```

### 页面无法加载

1. 确保已经运行了 `npm run build`
2. 确保 `dist` 目录存在
3. 检查浏览器控制台是否有错误信息

### 功能不正常

1. 刷新浏览器页面（Ctrl+F5 强制刷新）
2. 清除浏览器缓存
3. 查看控制台错误信息

