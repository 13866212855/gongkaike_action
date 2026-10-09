import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  User,
  LogOut,
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  Sparkles,
  FileText,
  ArrowLeft,
  Award,
  Compass,
  Microscope,
  Layers,
  Radio,
  Send,
  Wifi,
} from 'lucide-react';
import { ClassroomConfig, GroupLabRecord } from '../types/lab';
import { CAMPUS_CASES, RED_FLAG_OPTIONS } from '../data/labPresets';
import {
  clearAllGroupReports,
   DEFAULT_CLASSROOM_CONFIG,
  deleteGroupReport,
  fetchAllGroupReports,
  fetchClassroomConfig,
  seedDemoGroupReports,
  updateClassroomConfig,
} from '../utils/reportSync';
import { ReportModal } from './ReportModal';
import { WordExportModal } from './WordExportModal';
import { exportTaskToWord, WordExportTarget } from '../utils/wordExport';

const ADMIN_SESSION_KEY = 'gongkaike_admin_logged_in';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [reports, setReports] = useState<GroupLabRecord[]>([]);
  const [classroomCfg, setClassroomCfg] = useState<ClassroomConfig>(
    DEFAULT_CLASSROOM_CONFIG
  );
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'groups' | 'word'>(
    'analytics'
  );
  const [inspectingGroup, setInspectingGroup] = useState<GroupLabRecord | null>(
    null
  );
  const [wordModalTarget, setWordModalTarget] =
    useState<WordExportTarget | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadReportsAndConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, cfg] = await Promise.all([
        fetchAllGroupReports(),
        fetchClassroomConfig(),
      ]);
      setReports(list);
      setClassroomCfg(cfg);
      setBroadcastInput((prev) =>
        prev === '' && cfg.teacherBroadcast ? cfg.teacherBroadcast : prev
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadReportsAndConfig();
  }, [isAuthenticated, loadReportsAndConfig]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const timer = window.setInterval(() => {
      fetchAllGroupReports().then(setReports);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, autoRefresh]);

  const handleToggleUnlock = async (
    key: 'unlockAnswerTask1' | 'unlockAnswerTask2' | 'unlockAnswerTask3'
  ) => {
    const nextVal = !classroomCfg[key];
    const updated = await updateClassroomConfig({ [key]: nextVal });
    setClassroomCfg(updated);
  };

  const handleUnlockAllAnswers = async (unlock: boolean) => {
    const updated = await updateClassroomConfig({
      unlockAnswerTask1: unlock,
      unlockAnswerTask2: unlock,
      unlockAnswerTask3: unlock,
    });
    setClassroomCfg(updated);
  };

  const handleSendBroadcast = async (text: string) => {
    setBroadcastInput(text);
    const updated = await updateClassroomConfig({
      teacherBroadcast: text.trim(),
    });
    setClassroomCfg(updated);
  };

  const handleGroupCountChange = async (nextCount: number) => {
    const clamped = Math.max(1, Math.min(30, Math.round(nextCount) || 5));
    const updated = await updateClassroomConfig({
      groupCount: clamped,
    });
    setClassroomCfg(updated);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (res.ok) {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setPassword('');
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // Fallback for offline local opening
    }

    if (username.trim() === 'admin' && password === 'admin123') {
      try {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // Ignore
      }
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setLoginError('管理员账号或密码错误，请核对后重试');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    const list = await seedDemoGroupReports();
    setReports(list);
    setIsLoading(false);
  };

  const handleDeleteSingle = async (groupId: string) => {
    await deleteGroupReport(groupId);
    await loadReportsAndConfig();
  };

  const handleClearAll = async () => {
    await clearAllGroupReports();
    setConfirmClearAll(false);
    await loadReportsAndConfig();
  };

  // ==================== 未登录状态：显示后台登录界面（严禁展示默认账号密码） ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <div className="text-xs font-mono text-cyan-400 mb-1">
              1.3 信息及其特征 · 机房教师机管理终端
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              数字信息鉴别师工作站 · 后台登录
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              登录后可控制课堂进程、查看全班各组报告及导出纸质实验单
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                管理员账号
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入管理员账号"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                登录密码
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入登录密码"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-md transition-all cursor-pointer mt-2"
            >
              {isLoggingIn ? '正在验证身份...' : '登录教师机管理后台'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回学生实验前台</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 已登录状态：计算全班汇总分析指标 ====================
  const totalGroups = reports.length;

  const isGroupTask1Done = (r: GroupLabRecord) =>
    r.task1.equalValueChoice !== '' &&
    r.task1.dependsOnInput.trim().length > 0 &&
    r.task1.timeTrendInput.trim().length > 0;

  const isGroupTask2Done = (r: GroupLabRecord) =>
    r.task2.verdictChoice !== '' &&
    r.task2.causePurposeInput.trim().length > 0 &&
    r.task2.characteristicInput.trim().length > 0;

  const getGroupTask3Score = (r: GroupLabRecord) =>
    CAMPUS_CASES.filter((c) => r.task3.caseMatches[c.id] === c.correctFeature)
      .length;

  const isGroupTask3Done = (r: GroupLabRecord) =>
    getGroupTask3Score(r) >= 3 &&
    r.task3.carrierConceptInput.trim().length > 0 &&
    r.task3.sharingConceptInput.trim().length > 0;

  // 任务一统计
  const task1EqualNoCount = reports.filter(
    (r) => r.task1.equalValueChoice === 'no'
  ).length;
  const task1EqualYesCount = reports.filter(
    (r) => r.task1.equalValueChoice === 'yes'
  ).length;
  const task1CorrectRate =
    totalGroups > 0 ? Math.round((task1EqualNoCount / totalGroups) * 100) : 0;

  // 任务二统计
  const task2FakeVerdictCount = reports.filter(
    (r) => r.task2.verdictChoice === 'fake'
  ).length;
  const task2FakeRate =
    totalGroups > 0
      ? Math.round((task2FakeVerdictCount / totalGroups) * 100)
      : 0;

  // 任务三统计
  const avgTask3Score =
    totalGroups > 0
      ? (
          reports.reduce((acc, r) => acc + getGroupTask3Score(r), 0) /
          totalGroups
        ).toFixed(1)
      : '0.0';

  // 整体任务完成率
  const totalCompletedTasks = reports.reduce((acc, r) => {
    return (
      acc +
      (isGroupTask1Done(r) ? 1 : 0) +
      (isGroupTask2Done(r) ? 1 : 0) +
      (isGroupTask3Done(r) ? 1 : 0)
    );
  }, 0);
  const overallCompletionRate =
    totalGroups > 0
      ? Math.round((totalCompletedTasks / (totalGroups * 3)) * 100)
      : 0;

  // 构造一个供后台导出空模板使用的默认 record
  const dummyRecordForWord: GroupLabRecord = reports[0] || {
    groupId: '1',
    task1: {
      selectedAudiences: ['high1', 'grade9', 'agency'],
      timeNodeIndex: 0,
      equalValueChoice: '',
      dependsOnInput: '',
      timeTrendInput: '',
    },
    task2: {
      activePresetId: 'weather',
      customTextA: '',
      customTextB: '',
      isDissected: false,
      selectedFlags: [],
      verdictChoice: '',
      causePurposeInput: '',
      causeProcessInput: '',
      characteristicInput: '',
      actionInput: '',
    },
    task3: {
      caseMatches: {},
      carrierConceptInput: '',
      sharingConceptInput: '',
      selectedPledges: [],
      groupSlogan: '',
    },
    lastUpdated: '',
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* 顶部管理导航栏 */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-cyan-900/60 shadow-md no-print">
        <div className="max-w-[1420px] mx-auto px-4 lg:px-6 h-20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold text-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white">
                  数字信息鉴别师工作站 · 机房教师机总控后台
                </h1>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded">
                  /admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                课堂节奏控制 · 全班实时学情汇总 · 小组报告投屏点评 · 纸质实验单导出
              </p>
            </div>
          </div>

          {/* 三个核心功能标签切换 */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>全班作答汇总分析 ({totalGroups}组)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>各小组报告与机房监控 ({totalGroups}份)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('word')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'word'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>分任务导出 Word（打印版）</span>
            </button>
          </div>

          {/* 右侧控制按钮组 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="开启后每4秒自动同步各学生机最新提交的数据"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              <span>{autoRefresh ? '实时同步中' : '自动同步已停'}</span>
            </button>

            <button
              type="button"
              onClick={loadReportsAndConfig}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              刷新
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>前台实验页</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="flex-1 max-w-[1420px] w-full mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* 机房公开课中控台：控制学生机参考答案解锁 + 课堂广播通知 */}
        <section className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    机房课堂总控台（实时控制全体学生机界面状态）
                  </h2>
                  {classroomCfg.lanUrls && classroomCfg.lanUrls.length > 0 && (
                    <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" />
                      学生机访问地址：{classroomCfg.lanUrls[0]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  学生上机探究期间默认锁定隐藏参考答案以防直接照抄；教师点评时点击右侧按钮即可向全班学生机同步解锁标准答案
                </p>
              </div>
            </div>

            {/* 三个任务的参考答案远程解锁开关 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 mr-1">
                学生机答案显示控制：
              </span>
              {[
                {
                  key: 'unlockAnswerTask1' as const,
                  label: '任务一参考答案',
                },
                {
                  key: 'unlockAnswerTask2' as const,
                  label: '任务二参考答案',
                },
                {
                  key: 'unlockAnswerTask3' as const,
                  label: '任务三参考答案',
                },
              ].map((item) => {
                const isUnlocked = classroomCfg[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggleUnlock(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isUnlocked
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{item.label}：已向学生公布</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.label}：已锁定隐藏</span>
                      </>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  handleUnlockAllAnswers(
                    !(
                      classroomCfg.unlockAnswerTask1 &&
                      classroomCfg.unlockAnswerTask2 &&
                      classroomCfg.unlockAnswerTask3
                    )
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {classroomCfg.unlockAnswerTask1 &&
                classroomCfg.unlockAnswerTask2 &&
                classroomCfg.unlockAnswerTask3
                  ? '全部重新锁回'
                  : '一键解锁全部答案'}
              </button>
            </div>
          </div>

          {/* 课堂分组数量配置栏（默认5组，动态控制学生机右上角选组窗口） */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 whitespace-nowrap">
                <Users className="w-4 h-4 text-cyan-400" />
                👥 课堂分组数量配置（控制学生机右上角“选组”展示数量）：
              </span>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg p-1">
                {[4, 5, 6, 8, 10, 12].map((num) => {
                  const currentCount = Number(classroomCfg.groupCount) || 5;
                  const active = currentCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleGroupCountChange(num)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {num}组{num === 5 ? '(默认)' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 ml-1">
                <span>自定义：</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={classroomCfg.groupCount || 5}
                  onChange={(e) =>
                    handleGroupCountChange(Number(e.target.value))
                  }
                  className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span>个小组</span>
              </div>
            </div>

            {/* 各小组在线/提交状态速览灯 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">
                各组接入状态：
              </span>
              {Array.from(
                {
                  length: Math.max(
                    1,
                    Math.min(30, Number(classroomCfg.groupCount) || 5)
                  ),
                },
                (_, i) => String(i + 1)
              ).map((gid) => {
                const found = reports.find((r) => r.groupId === gid);
                const isSubmitted = Boolean(found?.isExportedReport);
                const isActive = Boolean(found);
                return (
                  <span
                    key={gid}
                    title={
                      found
                        ? `第${gid}组${
                            found.memberNames ? `（${found.memberNames}）` : ''
                          } - ${isSubmitted ? '已提交报告' : '正在作答中'}`
                        : `第${gid}组尚未接入`
                    }
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                      isSubmitted
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : isActive
                        ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-500'
                    }`}
                  >
                    {gid}组{isSubmitted ? '✓' : isActive ? '●' : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 课堂实时广播提示条发送区 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-300 whitespace-nowrap">
                📢 向全体学生机顶部发送课堂指令：
              </span>
              <input
                type="text"
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="输入课堂提示（例如：请各小组在2分钟内完成任务二并点击提交报告），留空则关闭广播"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => handleSendBroadcast(broadcastInput)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>推送广播</span>
              </button>
              {classroomCfg.teacherBroadcast && (
                <button
                  type="button"
                  onClick={() => handleSendBroadcast('')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer whitespace-nowrap"
                >
                  撤回广播
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400">快捷指令：</span>
              {[
                '请各组抓紧完成【任务一·时空罗盘】，完成后进入任务二',
                '请点击【🔬开始解剖】观察三维度分析并完成真伪宣判',
                '实验即将结束，请各组点击右下角【导出本组探究报告】提交！',
              ].map((presetMsg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendBroadcast(presetMsg)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  指令{i + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 顶部 5 大全班核心指标卡片 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-mono text-slate-500 mb-1">
              已接入 / 预设分组总数
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-slate-900 tabular-nums">
                {totalGroups}{' '}
                <span className="text-lg font-normal text-slate-400">
                  / {classroomCfg.groupCount || 5}
                </span>
              </span>
              <span className="text-xs font-semibold text-cyan-700">
                个实验小组
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-mono text-slate-500 mb-1">
              全班整体探究完成率
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-cyan-700 tabular-nums">
                {overallCompletionRate}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {totalCompletedTasks}/{totalGroups * 3} 任务项
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-mono text-slate-500 mb-1">
              任务一·价值相对性认知率
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-emerald-700 tabular-nums">
                {task1CorrectRate}%
              </span>
              <span className="text-xs text-slate-500">
                {task1EqualNoCount}/{totalGroups} 组答“否”
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-mono text-slate-500 mb-1">
              任务二·伪信息成功识破率
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-rose-600 tabular-nums">
                {task2FakeRate}%
              </span>
              <span className="text-xs text-slate-500">
                {task2FakeVerdictCount}/{totalGroups} 组判定伪信息
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-mono text-slate-500 mb-1">
              任务三·校园情境辨析均分
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-amber-600 tabular-nums">
                {avgTask3Score}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                满分 5.0 分
              </span>
            </div>
          </div>
        </section>

        {/* 工具与数据管理快捷栏 */}
        <section className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Users className="w-4 h-4 text-cyan-700" />
            <span>
              当前已实时收集 <strong>{totalGroups}</strong> 个学生机小组的实验数据（已提交结项报告：
              <strong className="text-emerald-700 mx-1">
                {reports.filter((r) => r.isExportedReport).length}
              </strong>
              组）。
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setWordModalTarget('all')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>打开纸质实验单 Word 导出预览中心</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
              <span>生成5组课堂演示数据（课前彩排）</span>
            </button>

            {totalGroups > 0 && (
              <>
                {!confirmClearAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>课前清零全部小组数据</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-bold text-rose-800">
                      确认清空全部小组记录？
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold cursor-pointer"
                    >
                      确认清空
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="px-2 py-0.5 rounded bg-white text-slate-600 text-xs border border-slate-200 cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ==================== 视图三：分任务导出 Word（打印版）专区 ==================== */}
        {activeTab === 'word' ? (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  📄 课堂纸质实验单 · 分任务导出 Word（供无电脑教室打印分发或教案存档）
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  已从学生端界面移除并迁移至此处。您可以将任务一、任务二、任务三单独导出为标准 A4 排版的 Word 文档（.doc）
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWordModalTarget('task1')}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>打开全屏 A4 排版预览与打印中心</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'task1' as WordExportTarget,
                  title: '【任务一·问诊】Word实验单',
                  desc: '含时空罗盘6节点数据对照表、相对性与时效性结论填空',
                },
                {
                  id: 'task2' as WordExportTarget,
                  title: '【任务二·解剖】Word实验单',
                  desc: '含A/B快讯对照、语文分词热力框、科学极值表与真伪宣判',
                },
                {
                  id: 'task3' as WordExportTarget,
                  title: '【任务三·建构】Word实验单',
                  desc: '含五大特征速查表、校园5情境配对勾选表与行动口号栏',
                },
                {
                  id: 'all' as WordExportTarget,
                  title: '【任务一至三】全套合集 Word',
                  desc: '包含全部三个任务完整导学案，每任务自动分页独立一页A4',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        exportTaskToWord(item.id, dummyRecordForWord, 'blank')
                      }
                      className="w-full py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      📥 下载【学生空白打印版】(.doc)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        exportTaskToWord(item.id, dummyRecordForWord, 'teacher')
                      }
                      className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      🎓 下载【教师参考答案版】(.doc)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : totalGroups === 0 ? (
          /* 空状态提示 */
          <section className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="max-w-lg mx-auto space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">
                等待机房各学生机接入并提交数据...
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                学生机通过浏览器访问教师机地址后，在实验过程中填写的答案及点击底部“导出本组探究报告”的结果将自动实时汇总至此面板。
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeedDemo}
              className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>立即载入5组课堂模拟数据（预览公开课汇总效果）</span>
            </button>
          </section>
        ) : activeTab === 'analytics' ? (
          /* ==================== 视图一：全班作答汇总分析看板 ==================== */
          <div className="space-y-6">
            {/* 1. 任务一·问诊 汇总分析 */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      一、【任务一·问诊（时空罗盘）】全班作答汇总分析
                    </h2>
                    <p className="text-xs text-slate-500">
                      核心考察点：信息价值的相对性（因人而异）与信息的时效性（随时间衰减）
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-md">
                  已完成组数：{reports.filter(isGroupTask1Done).length} / {totalGroups} 组
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：Q1 选择分布 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-sm font-bold text-slate-900">
                    Q1. 信息是否对所有人都具备同等价值？
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-800">
                          ✓ 选“否（因人而异）”【正确】
                        </span>
                        <span className="font-mono text-emerald-700">
                          {task1EqualNoCount} 组 ({task1CorrectRate}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${task1CorrectRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-rose-800">
                          × 选“是（价值相同）”
                        </span>
                        <span className="font-mono text-rose-600">
                          {task1EqualYesCount} 组 (
                          {totalGroups > 0
                            ? Math.round((task1EqualYesCount / totalGroups) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all"
                          style={{
                            width: `${
                              totalGroups > 0
                                ? Math.round(
                                    (task1EqualYesCount / totalGroups) * 100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧 2/3：各小组 Q2 & Q3 填空答案对比表 */}
                <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
                  <div className="text-sm font-bold text-slate-900 mb-3">
                    各小组 Q2（相对性决定因素）与 Q3（时效性变化趋势）填写结果对比：
                  </div>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2 px-3 font-semibold">小组</th>
                        <th className="py-2 px-3 font-semibold">Q1 同等价值</th>
                        <th className="py-2 px-3 font-semibold">
                          Q2 取决于使用者的...
                        </th>
                        <th className="py-2 px-3 font-semibold">
                          Q3 随时间呈现...趋势
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                      {reports.map((r) => (
                        <tr key={r.groupId} className="bg-white/60">
                          <td className="py-2 px-3 font-mono font-bold text-cyan-900">
                            第 {r.groupId} 组
                          </td>
                          <td className="py-2 px-3">
                            {r.task1.equalValueChoice === 'no' ? (
                              <span className="text-emerald-700 font-bold">
                                否 ✓
                              </span>
                            ) : r.task1.equalValueChoice === 'yes' ? (
                              <span className="text-rose-600 font-bold">
                                是 ×
                              </span>
                            ) : (
                              <span className="text-slate-400">未填</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {r.task1.dependsOnInput || (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {r.task1.timeTrendInput || (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 2. 任务二·解剖 汇总分析 */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Microscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      二、【任务二·解剖（多学科真伪鉴别）】全班作答汇总分析
                    </h2>
                    <p className="text-xs text-slate-500">
                      核心考察点：伪信息破绽取证、失真成因剖析与信息的【真伪性】特征
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-md">
                  已完成组数：{reports.filter(isGroupTask2Done).length} / {totalGroups} 组
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：5大伪信息破绽全班发现率统计 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      🕵️ 全班对【信息B】五大破绽的取证勾选率统计：
                    </span>
                    <span className="text-xs text-slate-500">
                      识别率越低越需重点讲评
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {RED_FLAG_OPTIONS.map((flag) => {
                      const count = reports.filter((r) =>
                        r.task2.selectedFlags.includes(flag.id)
                      ).length;
                      const pct =
                        totalGroups > 0
                          ? Math.round((count / totalGroups) * 100)
                          : 0;
                      return (
                        <div key={flag.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-800">
                              <strong className="text-cyan-800">
                                [{flag.category}]
                              </strong>{' '}
                              {flag.label}
                            </span>
                            <span className="font-mono font-bold text-slate-700 tabular-nums">
                              {count}/{totalGroups} 组 ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-600 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 右侧：各小组任务二结论汇总表 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
                  <div className="text-sm font-bold text-slate-900 mb-3">
                    各小组真伪宣判、失真成因与特征提炼汇总：
                  </div>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2 px-2.5 font-semibold">小组</th>
                        <th className="py-2 px-2.5 font-semibold">真伪宣判</th>
                        <th className="py-2 px-2.5 font-semibold">
                          失真目的与过程偏差
                        </th>
                        <th className="py-2 px-2.5 font-semibold">体现特征</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                      {reports.map((r) => (
                        <tr key={r.groupId} className="bg-white/60">
                          <td className="py-2 px-2.5 font-mono font-bold text-cyan-900 whitespace-nowrap">
                            第 {r.groupId} 组
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap">
                            {r.task2.verdictChoice === 'fake' ? (
                              <span className="text-emerald-700 font-bold">
                                伪信息 ✓
                              </span>
                            ) : r.task2.verdictChoice ? (
                              <span className="text-rose-600 font-bold">
                                误判 ×
                              </span>
                            ) : (
                              <span className="text-slate-400">未填</span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-xs text-slate-700">
                            <div>
                              <strong>目的：</strong>
                              {r.task2.causePurposeInput || '—'}
                            </div>
                            <div>
                              <strong>偏差：</strong>
                              {r.task2.causeProcessInput || '—'}
                            </div>
                          </td>
                          <td className="py-2 px-2.5 font-bold text-cyan-900 whitespace-nowrap">
                            {r.task2.characteristicInput || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. 任务三·建构 汇总分析 */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      三、【任务三·建构（五大特征辨析与宣言）】全班作答汇总分析
                    </h2>
                    <p className="text-xs text-slate-500">
                      核心考察点：校园五情境对号入座正确率诊断、载体依附性与共享性概念、小组鉴别宣言
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md">
                  全班情境辨析平均分：{avgTask3Score} / 5.0
                </span>
              </div>

              {/* 5道校园情境题分题正确率诊断 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {CAMPUS_CASES.map((c) => {
                  const correctCount = reports.filter(
                    (r) => r.task3.caseMatches[c.id] === c.correctFeature
                  ).length;
                  const accuracy =
                    totalGroups > 0
                      ? Math.round((correctCount / totalGroups) * 100)
                      : 0;
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-cyan-800">
                          {c.title}
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          标准答案：{c.correctFeature}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between text-xs mb-1">
                          <span className="text-slate-500">全班正确率</span>
                          <span
                            className={`font-mono font-bold text-base tabular-nums ${
                              accuracy >= 80
                                ? 'text-emerald-700'
                                : accuracy >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {accuracy}% ({correctCount}/{totalGroups})
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              accuracy >= 80
                                ? 'bg-emerald-600'
                                : accuracy >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 各小组原创“校园数字信息鉴别行动口号”展示墙 */}
              <div className="bg-slate-900 text-white rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-3">
                  <Award className="w-4 h-4" />
                  <span>🏆 全班各小组《校园数字信息鉴别行动口号》精彩汇聚墙</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reports.map((r) => (
                    <div
                      key={r.groupId}
                      className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                        <span>
                          第 {r.groupId} 小组
                          {r.memberNames ? `（${r.memberNames}）` : ''}
                        </span>
                        <span>
                          Q1:{r.task3.carrierConceptInput || '未填'} / Q2:
                          {r.task3.sharingConceptInput || '未填'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        “{r.task3.groupSlogan || '（暂未填写口号）'}”
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ==================== 视图二：各小组“导出本组探究报告”明细与机房监控 ==================== */
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  机房各小组探究报告与实时进度明细表
                </h2>
                <p className="text-xs text-slate-500">
                  点击任意小组右侧的“查看该组完整报告（投屏点评）”即可在大屏展示该组实验报告，或导出为 Word 文档
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((r) => {
                const t1Ok = isGroupTask1Done(r);
                const t2Ok = isGroupTask2Done(r);
                const t3Score = getGroupTask3Score(r);
                const t3Ok = isGroupTask3Done(r);

                return (
                  <div
                    key={r.groupId}
                    className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 hover:bg-white hover:border-cyan-400 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* 卡片头部 */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 font-mono font-bold text-base">
                            第 {r.groupId} 小组
                          </span>
                          {r.memberNames && (
                            <span className="text-xs font-semibold text-slate-700">
                              成员：{r.memberNames}
                            </span>
                          )}
                          {r.isExportedReport ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              已导出提交报告
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-700">
                              ● 实时作答同步中
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          更新：{r.lastUpdated}
                        </span>
                      </div>

                      {/* 三个任务作答摘要 */}
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-900">
                              【任务一·问诊】
                            </strong>{' '}
                            同等价值：
                            <strong className="text-cyan-800">
                              {r.task1.equalValueChoice === 'no'
                                ? '否'
                                : r.task1.equalValueChoice === 'yes'
                                ? '是'
                                : '未填'}
                            </strong>{' '}
                            | 取决于：
                            <strong className="text-cyan-800">
                              {r.task1.dependsOnInput || '未填'}
                            </strong>{' '}
                            | 趋势：
                            <strong className="text-cyan-800">
                              {r.task1.timeTrendInput || '未填'}
                            </strong>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              t1Ok ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {t1Ok ? '✓ 已完成' : '待完善'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-900">
                              【任务二·解剖】
                            </strong>{' '}
                            信息B宣判：
                            <strong className="text-rose-700">
                              {r.task2.verdictChoice === 'fake'
                                ? '伪信息'
                                : r.task2.verdictChoice || '未宣判'}
                            </strong>{' '}
                            | 破绽：
                            <strong className="text-cyan-800">
                              {r.task2.selectedFlags.length}项
                            </strong>{' '}
                            | 特征：
                            <strong className="text-cyan-800">
                              {r.task2.characteristicInput || '未填'}
                            </strong>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              t2Ok ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {t2Ok ? '✓ 已完成' : '待完善'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-900">
                              【任务三·建构】
                            </strong>{' '}
                            情境辨析：
                            <strong className="text-emerald-700 font-mono">
                              {t3Score}/5分
                            </strong>{' '}
                            | 概念：
                            <strong className="text-cyan-800">
                              {r.task3.carrierConceptInput || '—'} /{' '}
                              {r.task3.sharingConceptInput || '—'}
                            </strong>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              t3Ok ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {t3Ok ? '✓ 已完成' : '待完善'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 italic truncate">
                        口号：“{r.task3.groupSlogan || '暂未填写口号'}”
                      </div>
                    </div>

                    {/* 操作按钮栏 */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingGroup(r)}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>查看该组完整报告（投屏点评）</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => exportTaskToWord('all', r, 'filled')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-700" />
                          <span>导出该组 Word</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(r.groupId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除该组记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 查看指定小组完整报告弹窗（管理员视角支持导出 Word） */}
      {inspectingGroup && (
        <ReportModal
          record={inspectingGroup}
          isAdminView={true}
          onClose={() => setInspectingGroup(null)}
        />
      )}

      {/* 纸质实验单 Word 导出与全屏预览弹窗 */}
      {wordModalTarget && (
        <WordExportModal
          record={dummyRecordForWord}
          initialTarget={wordModalTarget}
          onClose={() => setWordModalTarget(null)}
        />
      )}
    </div>
  );
};
