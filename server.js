const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 图片转文字 OCR 工具已启动！');
    console.log('='.repeat(50));
    console.log(`📱 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://0.0.0.0:${PORT}`);
    console.log('='.repeat(50));
    console.log('按 Ctrl+C 停止服务器');
});

