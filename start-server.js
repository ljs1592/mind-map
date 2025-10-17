// 简单的本地服务器，用于运行演示文件
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // 处理根路径
  let filePath = req.url === '/' ? '/example-modern-task.html' : req.url;
  filePath = path.join(__dirname, filePath);

  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - 文件不存在</h1>', 'utf-8');
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`服务器错误: ${error.code}`, 'utf-8');
      }
    } else {
      // 成功返回文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n🎉 本地服务器已启动！\n');
  console.log(`📂 服务目录: ${__dirname}`);
  console.log(`🌐 访问地址:\n`);
  console.log(`   主页（推荐）:            http://localhost:${PORT}/standalone-demo.html`);
  console.log('\n💡 提示: 按 Ctrl+C 停止服务器\n');
});

