import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'group-reports.json');

const APIHUB_BASE_URL =
  process.env.APIHUB_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const APIHUB_API_KEY =
  process.env.APIHUB_API_KEY ||
  'sk-GUdpKQNIwwJSZQ5mYyrMnuCJBOwSbB73c2N6NcnNfk5LoKyq';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify({ reports: {} }, null, 2), 'utf-8');
  }
}

function readReportsMap(): Record<string, any> {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.reports && typeof parsed.reports === 'object' ? parsed.reports : {};
  } catch {
    return {};
  }
}

function writeReportsMap(reports: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(REPORTS_FILE, JSON.stringify({ reports }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write reports file:', err);
  }
}

async function startServer() {
  ensureDataDir();
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'gongkaike',
      port: PORT,
      timestamp: new Date().toISOString(),
    });
  });

  // Admin authentication endpoint
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'admin123') {
      res.json({ ok: true, token: 'gongkaike_admin_session_ok' });
    } else {
      res.status(401).json({ ok: false, message: '账号或密码错误，请重新输入' });
    }
  });

  // Get all group reports
  app.get('/api/reports', (_req, res) => {
    const reportsMap = readReportsMap();
    const list = Object.values(reportsMap).sort((a: any, b: any) =>
      String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', { numeric: true })
    );
    res.json({ reports: list });
  });

  // Submit / update a group's inquiry report
  app.post('/api/reports', (req, res) => {
    const record = req.body;
    if (!record || !record.groupId) {
      res.status(400).json({ error: 'Missing groupId' });
      return;
    }
    const cleanId = String(record.groupId).trim() || '1';
    const reportsMap = readReportsMap();
    const nowStr = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    reportsMap[cleanId] = {
      ...record,
      groupId: cleanId,
      lastUpdated: record.lastUpdated || nowStr,
      submittedAt: record.submittedAt || nowStr,
      isExportedReport: Boolean(record.isExportedReport ?? true),
    };
    writeReportsMap(reportsMap);
    res.json({ ok: true, report: reportsMap[cleanId] });
  });

  // Batch sync multiple records (e.g. from local browser storage)
  app.post('/api/reports/batch', (req, res) => {
    const { records } = req.body || {};
    if (!Array.isArray(records)) {
      res.status(400).json({ error: 'Invalid records array' });
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
    const list = Object.values(reportsMap).sort((a: any, b: any) =>
      String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', { numeric: true })
    );
    res.json({ ok: true, reports: list });
  });

  // Delete single group report
  app.delete('/api/reports/:groupId', (req, res) => {
    const groupId = String(req.params.groupId || '').trim();
    const reportsMap = readReportsMap();
    delete reportsMap[groupId];
    writeReportsMap(reportsMap);
    res.json({ ok: true });
  });

  // Clear all reports
  app.delete('/api/reports', (_req, res) => {
    writeReportsMap({});
    res.json({ ok: true });
  });

  // LLM proxy route (myusellm)
  app.post('/api/chat', async (req, res) => {
    try {
      const payload = req.body || {};
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
      const text = await upstream.text();
      res.status(upstream.status).type('application/json').send(text);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[gongkaike] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
