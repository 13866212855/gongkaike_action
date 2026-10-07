import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');

// myusellm 统一大模型默认参数
const APIHUB_BASE_URL =
  process.env.APIHUB_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const APIHUB_API_KEY =
  process.env.APIHUB_API_KEY ||
  'sk-GUdpKQNIwwJSZQ5mYyrMnuCJBOwSbB73c2N6NcnNfk5LoKyq';

// 确保数据持久化目录存在并写入初始化状态文件
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const statusFile = path.join(DATA_DIR, 'service-status.json');
  if (!fs.existsSync(statusFile)) {
    fs.writeFileSync(
      statusFile,
      JSON.stringify(
        {
          app: 'gongkaike',
          title: '数字信息鉴别师工作站 - 1.3 信息及其特征探究实验',
          initializedAt: new Date().toISOString(),
          llmEndpoint: APIHUB_BASE_URL,
        },
        null,
        2
      ),
      'utf-8'
    );
  }
} catch (err) {
  console.warn('[WARN] Data directory initialization skipped:', err);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // 健康检查接口
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        status: 'ok',
        app: 'gongkaike',
        port: PORT,
        llmConfigured: Boolean(APIHUB_API_KEY),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // 大模型代理接口（使用 myusellm 配置）
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const upstream = await fetch(`${APIHUB_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${APIHUB_API_KEY}`,
          },
          body: JSON.stringify({
            model: payload.model || 'gemini-2.5-flash',
            messages: payload.messages || [],
            temperature: payload.temperature ?? 0.7,
          }),
        });
        const data = await upstream.text();
        res.writeHead(upstream.status, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // 静态资源服务（从 dist 目录读取）
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA 路由回退至 index.html
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexHtml).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build artifacts not found. Please run npm run build first.');
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`[gongkaike] Production server running at http://${HOSTNAME}:${PORT}`);
});
