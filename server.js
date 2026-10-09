import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'group-reports.json');
const CLASSROOM_FILE = path.join(DATA_DIR, 'classroom-config.json');

// myusellm 统一大模型默认参数
const APIHUB_BASE_URL =
  process.env.APIHUB_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const APIHUB_API_KEY =
  process.env.APIHUB_API_KEY ||
  'sk-GUdpKQNIwwJSZQ5mYyrMnuCJBOwSbB73c2N6NcnNfk5LoKyq';

const DEFAULT_CLASSROOM_CONFIG = {
  groupCount: 5,
  unlockAnswerTask1: false,
  unlockAnswerTask2: false,
  unlockAnswerTask3: false,
  teacherBroadcast: '',
};

function getLanIPv4Addresses() {
  const ips = [];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
  } catch {
    // Ignore
  }
  return ips;
}

function ensureDataDir() {
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
    if (!fs.existsSync(REPORTS_FILE)) {
      fs.writeFileSync(
        REPORTS_FILE,
        JSON.stringify({ reports: {} }, null, 2),
        'utf-8'
      );
    }
    if (!fs.existsSync(CLASSROOM_FILE)) {
      fs.writeFileSync(
        CLASSROOM_FILE,
        JSON.stringify(DEFAULT_CLASSROOM_CONFIG, null, 2),
        'utf-8'
      );
    }
  } catch (err) {
    console.warn('[WARN] Data directory initialization skipped:', err);
  }
}

function readReportsMap() {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.reports && typeof parsed.reports === 'object'
      ? parsed.reports
      : {};
  } catch {
    return {};
  }
}

function writeReportsMap(reports) {
  try {
    ensureDataDir();
    fs.writeFileSync(
      REPORTS_FILE,
      JSON.stringify({ reports }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('[ERROR] Failed to write reports file:', err);
  }
}

function readClassroomConfig() {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(CLASSROOM_FILE, 'utf-8');
    return { ...DEFAULT_CLASSROOM_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CLASSROOM_CONFIG };
  }
}

function writeClassroomConfig(cfg) {
  try {
    ensureDataDir();
    const next = { ...readClassroomConfig(), ...cfg };
    fs.writeFileSync(CLASSROOM_FILE, JSON.stringify(next, null, 2), 'utf-8');
    return next;
  } catch {
    return DEFAULT_CLASSROOM_CONFIG;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

ensureDataDir();

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
  const reqUrl = new URL(
    req.url || '/',
    `http://${req.headers.host || 'localhost'}`
  );
  const pathname = decodeURIComponent(reqUrl.pathname);

  // 健康检查接口
  if (pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      app: 'gongkaike',
      port: PORT,
      llmConfigured: Boolean(APIHUB_API_KEY),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 课堂全局状态接口（教师控制答案解锁、广播通知）
  if (pathname === '/api/classroom-state' && req.method === 'GET') {
    const cfg = readClassroomConfig();
    const ips = getLanIPv4Addresses();
    sendJson(res, 200, {
      ...cfg,
      lanUrls: ips.map((ip) => `http://${ip}:7874`),
    });
    return;
  }

  if (pathname === '/api/classroom-state' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const updated = writeClassroomConfig(body || {});
      const ips = getLanIPv4Addresses();
      sendJson(res, 200, {
        ok: true,
        config: {
          ...updated,
          lanUrls: ips.map((ip) => `http://${ip}:7874`),
        },
      });
    } catch (err) {
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  // 后台登录验证接口
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const { username, password } = await readJsonBody(req);
      if (username === 'admin' && password === 'admin123') {
        sendJson(res, 200, { ok: true, token: 'gongkaike_admin_session_ok' });
      } else {
        sendJson(res, 401, {
          ok: false,
          message: '账号或密码错误，请重新输入',
        });
      }
    } catch {
      sendJson(res, 400, { ok: false, message: '请求格式错误' });
    }
    return;
  }

  // 获取所有小组报告
  if (pathname === '/api/reports' && req.method === 'GET') {
    const reportsMap = readReportsMap();
    const list = Object.values(reportsMap).sort((a, b) =>
      String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', {
        numeric: true,
      })
    );
    sendJson(res, 200, {
      reports: list,
      classroomConfig: readClassroomConfig(),
    });
    return;
  }

  // 提交或更新单个小组报告
  if (pathname === '/api/reports' && req.method === 'POST') {
    try {
      const record = await readJsonBody(req);
      if (!record || !record.groupId) {
        sendJson(res, 400, { error: 'Missing groupId' });
        return;
      }
      const cleanId = String(record.groupId).trim() || '1';
      const reportsMap = readReportsMap();
      const existing = reportsMap[cleanId] || {};
      const nowStr = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const mergedMembersMap = {
        ...(existing.membersMap || {}),
        ...(record.membersMap || {}),
      };
      const individualName = String(
        record.studentName ?? record.memberNames ?? ''
      ).trim();
      const clientKey = String(record.clientId || 'default_pc').trim();
      if (individualName) {
        mergedMembersMap[clientKey] = individualName;
      } else if (record.studentName === '') {
        delete mergedMembersMap[clientKey];
      }

      const uniqueNames = Array.from(
        new Set(
          Object.values(mergedMembersMap)
            .map((n) => String(n).trim())
            .filter(Boolean)
        )
      );
      const combinedMemberNames =
        uniqueNames.length > 0
          ? uniqueNames.join('、')
          : existing.memberNames || '';

      reportsMap[cleanId] = {
        ...existing,
        ...record,
        groupId: cleanId,
        membersMap: mergedMembersMap,
        memberNames: combinedMemberNames,
        lastUpdated: record.lastUpdated || nowStr,
        submittedAt: record.isExportedReport
          ? record.submittedAt || nowStr
          : existing.submittedAt,
        isExportedReport: Boolean(
          record.isExportedReport || existing.isExportedReport
        ),
      };
      writeReportsMap(reportsMap);
      sendJson(res, 200, {
        ok: true,
        report: reportsMap[cleanId],
        classroomConfig: readClassroomConfig(),
      });
    } catch (err) {
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  // 批量同步小组报告
  if (pathname === '/api/reports/batch' && req.method === 'POST') {
    try {
      const { records } = await readJsonBody(req);
      if (!Array.isArray(records)) {
        sendJson(res, 400, { error: 'Invalid records array' });
        return;
      }
      const reportsMap = readReportsMap();
      for (const item of records) {
        if (item && item.groupId) {
          const id = String(item.groupId).trim();
          reportsMap[id] = {
            ...reportsMap[id],
            ...item,
            groupId: id,
          };
        }
      }
      writeReportsMap(reportsMap);
      const list = Object.values(reportsMap).sort((a, b) =>
        String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', {
          numeric: true,
        })
      );
      sendJson(res, 200, { ok: true, reports: list });
    } catch (err) {
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  // 清空所有小组报告
  if (pathname === '/api/reports' && req.method === 'DELETE') {
    writeReportsMap({});
    sendJson(res, 200, { ok: true });
    return;
  }

  // 删除指定小组报告
  if (pathname.startsWith('/api/reports/') && req.method === 'DELETE') {
    const groupId = decodeURIComponent(
      pathname.replace('/api/reports/', '')
    ).trim();
    const reportsMap = readReportsMap();
    delete reportsMap[groupId];
    writeReportsMap(reportsMap);
    sendJson(res, 200, { ok: true });
    return;
  }

  // 大模型代理接口（使用 myusellm 配置）
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
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
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  // 静态资源服务（从 dist 目录读取）
  let filePath = path.join(
    DIST_DIR,
    pathname === '/' ? 'index.html' : pathname
  );
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

  // SPA 路由回退至 index.html（支持 /admin 直接打开）
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
  console.log(
    `[gongkaike] Production server running at http://${HOSTNAME}:${PORT}`
  );
});
