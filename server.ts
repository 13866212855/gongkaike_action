import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'group-reports.json');
const CLASSROOM_FILE = path.join(DATA_DIR, 'classroom-config.json');

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

function getLanIPv4Addresses(): string[] {
  const ips: string[] = [];
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
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
}

function readReportsMap(): Record<string, any> {
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

function writeReportsMap(reports: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(
      REPORTS_FILE,
      JSON.stringify({ reports }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to write reports file:', err);
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

function writeClassroomConfig(cfg: any) {
  try {
    ensureDataDir();
    const next = { ...readClassroomConfig(), ...cfg };
    fs.writeFileSync(CLASSROOM_FILE, JSON.stringify(next, null, 2), 'utf-8');
    return next;
  } catch {
    return DEFAULT_CLASSROOM_CONFIG;
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

  // Get classroom live config (teacher answer unlock state, broadcast notice, LAN IPs)
  app.get('/api/classroom-state', (_req, res) => {
    const cfg = readClassroomConfig();
    const ips = getLanIPv4Addresses();
    res.json({
      ...cfg,
      lanUrls: ips.map((ip) => `http://${ip}:7874`),
    });
  });

  // Update classroom live config from /admin
  app.post('/api/classroom-state', (req, res) => {
    const updated = writeClassroomConfig(req.body || {});
    const ips = getLanIPv4Addresses();
    res.json({
      ok: true,
      config: {
        ...updated,
        lanUrls: ips.map((ip) => `http://${ip}:7874`),
      },
    });
  });

  // Admin authentication endpoint
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'admin123') {
      res.json({ ok: true, token: 'gongkaike_admin_session_ok' });
    } else {
      res
        .status(401)
        .json({ ok: false, message: '账号或密码错误，请重新输入' });
    }
  });

  // Get all group reports
  app.get('/api/reports', (_req, res) => {
    const reportsMap = readReportsMap();
    const list = Object.values(reportsMap).sort((a: any, b: any) =>
      String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', {
        numeric: true,
      })
    );
    res.json({
      reports: list,
      classroomConfig: readClassroomConfig(),
    });
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
    const existing = reportsMap[cleanId] || {};
    const nowStr = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Aggregate individual student names per group automatically
    const mergedMembersMap: Record<string, string> = {
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
    res.json({
      ok: true,
      report: reportsMap[cleanId],
      classroomConfig: readClassroomConfig(),
    });
  });

  // Batch sync multiple records
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
      String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', {
        numeric: true,
      })
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
