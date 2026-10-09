import React, { useEffect, useState, useCallback } from 'react';
import {
  Compass,
  Microscope,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Users,
  Radio,
  Wifi,
  UserPlus,
  X,
} from 'lucide-react';
import {
  ClassroomConfig,
  GroupLabRecord,
  Task1Data,
  Task2Data,
  Task3Data,
  TaskId,
} from './types/lab';
import { CAMPUS_CASES, PLEDGE_ITEMS } from './data/labPresets';
import { Task1Compass } from './components/Task1Compass';
import { Task2Dissection } from './components/Task2Dissection';
import { Task3Construct } from './components/Task3Construct';
import { ReportModal } from './components/ReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import {
  DEFAULT_CLASSROOM_CONFIG,
  fetchClassroomConfig,
  syncGroupReportToServer,
} from './utils/reportSync';

const STORAGE_PREFIX = 'campus_info_appraiser_v1_group_';
const ACTIVE_GROUP_KEY = 'campus_info_appraiser_v1_active_group';

function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  return (
    pathname === '/admin' ||
    pathname.endsWith('/admin') ||
    hash === '#/admin' ||
    hash === '#admin'
  );
}

function createDefaultRecord(groupId: string): GroupLabRecord {
  return {
    groupId,
    studentName: '',
    memberNames: '',
    currentTask: 'task1',
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
      selectedPledges: [PLEDGE_ITEMS[0], PLEDGE_ITEMS[3]],
      groupSlogan: '',
    },
    lastUpdated: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

function loadGroupRecord(groupId: string): GroupLabRecord {
  const cleanId = groupId.trim() || '1';
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${cleanId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as GroupLabRecord;
      return {
        ...createDefaultRecord(cleanId),
        ...parsed,
        groupId: cleanId,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return createDefaultRecord(cleanId);
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    checkIsAdminRoute()
  );

  const [groupId, setGroupId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(ACTIVE_GROUP_KEY) || '1';
    } catch {
      return '1';
    }
  });

  const [activeTask, setActiveTask] = useState<TaskId>('task1');
  const [record, setRecord] = useState<GroupLabRecord>(() =>
    loadGroupRecord(groupId)
  );
  const [classroomCfg, setClassroomCfg] = useState<ClassroomConfig>(
    DEFAULT_CLASSROOM_CONFIG
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [syncPulse, setSyncPulse] = useState(false);
  const [submitSuccessToast, setSubmitSuccessToast] = useState(false);

  // Listen to browser popstate / hashchange for /admin navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Poll classroom state from teacher machine every 4 seconds (for answer unlocks & teacher broadcasts)
  useEffect(() => {
    if (isAdminRoute) return;
    fetchClassroomConfig().then(setClassroomCfg);
    const timer = window.setInterval(() => {
      fetchClassroomConfig().then(setClassroomCfg);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isAdminRoute]);

  // When groupId changes, load that group's record from localStorage
  const handleGroupChange = (newGroupId: string) => {
    const sanitized = newGroupId
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .slice(0, 8);
    setGroupId(sanitized);
    try {
      window.localStorage.setItem(ACTIVE_GROUP_KEY, sanitized || '1');
    } catch {
      // Ignore
    }
    const loaded = loadGroupRecord(sanitized || '1');
    setRecord(loaded);
  };

  // Persist record to localStorage and sync to teacher machine automatically
  useEffect(() => {
    if (isAdminRoute) return;
    const keyId = groupId.trim() || '1';
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${keyId}`,
        JSON.stringify(record)
      );
      setSyncPulse(true);
      const timer = window.setTimeout(() => setSyncPulse(false), 600);

      // Sync to teacher server if the group has filled in any answer, student name, or exported report
      const hasAnyProgress =
        record.isExportedReport ||
        (record.studentName && record.studentName.trim() !== '') ||
        (record.memberNames && record.memberNames.trim() !== '') ||
        record.task1.equalValueChoice !== '' ||
        record.task1.dependsOnInput.trim() !== '' ||
        record.task2.isDissected ||
        record.task2.verdictChoice !== '' ||
        Object.keys(record.task3.caseMatches).length > 0 ||
        record.task3.groupSlogan.trim() !== '';

      const syncTimer = window.setTimeout(() => {
        if (hasAnyProgress) {
          syncGroupReportToServer(
            { ...record, groupId: keyId, currentTask: activeTask },
            Boolean(record.isExportedReport)
          ).then((synced) => {
            if (
              synced.memberNames &&
              synced.memberNames !== record.memberNames
            ) {
              setRecord((prev) => ({
                ...prev,
                memberNames: synced.memberNames,
                membersMap: synced.membersMap,
              }));
            }
          });
        }
      }, 350);

      return () => {
        window.clearTimeout(timer);
        window.clearTimeout(syncTimer);
      };
    } catch {
      // Ignore storage write errors
    }
  }, [record, groupId, activeTask, isAdminRoute]);

  const handleOpenAndSubmitReport = async () => {
    const nowStr = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const updatedRecord: GroupLabRecord = {
      ...record,
      groupId: groupId.trim() || '1',
      currentTask: activeTask,
      lastUpdated: nowStr,
      submittedAt: nowStr,
      isExportedReport: true,
    };
    setRecord(updatedRecord);
    setShowReportModal(true);
    await syncGroupReportToServer(updatedRecord, true);
    setSubmitSuccessToast(true);
    window.setTimeout(() => setSubmitSuccessToast(false), 3500);
  };

  const updateTask1 = useCallback((updater: (prev: Task1Data) => Task1Data) => {
    setRecord((prev) => ({
      ...prev,
      task1: updater(prev.task1),
      lastUpdated: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
  }, []);

  const updateTask2 = useCallback((updater: (prev: Task2Data) => Task2Data) => {
    setRecord((prev) => ({
      ...prev,
      task2: updater(prev.task2),
      lastUpdated: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
  }, []);

  const updateTask3 = useCallback((updater: (prev: Task3Data) => Task3Data) => {
    setRecord((prev) => ({
      ...prev,
      task3: updater(prev.task3),
      lastUpdated: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
  }, []);

  const handleResetCurrentGroup = () => {
    const fresh = createDefaultRecord(groupId || '1');
    fresh.memberNames = record.memberNames || '';
    setRecord(fresh);
  };

  // If visiting /admin, render the Teacher Admin Login / Dashboard view
  if (isAdminRoute) {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // Completion statuses for the 3 tasks
  const isTask1Done =
    record.task1.equalValueChoice !== '' &&
    record.task1.dependsOnInput.trim().length > 0 &&
    record.task1.timeTrendInput.trim().length > 0;

  const isTask2Done =
    record.task2.isDissected &&
    record.task2.verdictChoice !== '' &&
    record.task2.causePurposeInput.trim().length > 0 &&
    record.task2.characteristicInput.trim().length > 0;

  const correctCasesCount = CAMPUS_CASES.filter(
    (c) => record.task3.caseMatches[c.id] === c.correctFeature
  ).length;

  const isTask3Done =
    correctCasesCount >= 3 &&
    record.task3.carrierConceptInput.trim().length > 0 &&
    record.task3.sharingConceptInput.trim().length > 0;

  const completedTasksCount = [isTask1Done, isTask2Done, isTask3Done].filter(
    Boolean
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-20">
      {/* 固定顶部导航栏（专为学生机上机操作设计的纯净数字实验室界面） */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-cyan-900/60 shadow-md no-print">
        <div className="max-w-[1380px] mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-4">
          {/* 左侧：应用标题 + 副标题 */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-xs">
              鉴
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight">
                数字信息鉴别师工作站
              </h1>
              <p className="text-xs text-cyan-400 font-mono">
                1.3 信息及其特征 探究实验 · 校园数字信息鉴别师行动
              </p>
            </div>
          </div>

          {/* 中间：三个任务切换标签页 */}
          <nav
            aria-label="实验任务切换"
            className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800"
          >
            <button
              type="button"
              onClick={() => setActiveTask('task1')}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTask === 'task1'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>【任务一·问诊】</span>
              {isTask1Done && (
                <CheckCircle2
                  className={`w-4 h-4 ${
                    activeTask === 'task1'
                      ? 'text-slate-950'
                      : 'text-emerald-400'
                  }`}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTask('task2')}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTask === 'task2'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Microscope className="w-4 h-4 shrink-0" />
              <span>【任务二·解剖】</span>
              {isTask2Done && (
                <CheckCircle2
                  className={`w-4 h-4 ${
                    activeTask === 'task2'
                      ? 'text-slate-950'
                      : 'text-emerald-400'
                  }`}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTask('task3')}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTask === 'task3'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>【任务三·建构】</span>
              {isTask3Done && (
                <CheckCircle2
                  className={`w-4 h-4 ${
                    activeTask === 'task3'
                      ? 'text-slate-950'
                      : 'text-emerald-400'
                  }`}
                />
              )}
            </button>
          </nav>

          {/* 右侧：小组编号输入框 + 快捷选组/登记组员按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-800/80 px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-200">第</span>
              <input
                type="text"
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                aria-label="小组编号"
                placeholder="1"
                className="w-11 text-center bg-slate-800 border border-cyan-600/60 rounded-md py-0.5 px-1 text-base font-mono font-bold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <span className="text-sm font-semibold text-slate-200">小组</span>
            </div>

            <button
              type="button"
              onClick={() => setShowGroupPicker(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="点击快速点选组号或填写你的姓名"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {record.studentName || record.memberNames
                  ? `已登记：${record.studentName || record.memberNames}`
                  : '选组/登记组员'}
              </span>
            </button>
          </div>
        </div>

        {/* 教师机实时课堂广播通知横幅（仅当教师在后台发送课堂指令时显示） */}
        {classroomCfg.teacherBroadcast && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 shadow-xs">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>【教师机课堂广播】{classroomCfg.teacherBroadcast}</span>
          </div>
        )}
      </header>

      {/* 提交成功浮动反馈条 */}
      {submitSuccessToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-500 flex items-center gap-2.5 text-sm font-bold animate-bounce no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>第 {groupId} 小组探究报告已成功同步至教师机大屏！</span>
        </div>
      )}

      {/* 主体探究实验内容区 */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 lg:px-6 py-6">
        {activeTask === 'task1' && (
          <Task1Compass
            data={record.task1}
            onChange={updateTask1}
            onNextTask={() => {
              setActiveTask('task2');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            answerUnlocked={classroomCfg.unlockAnswerTask1}
          />
        )}

        {activeTask === 'task2' && (
          <Task2Dissection
            data={record.task2}
            onChange={updateTask2}
            onNextTask={() => {
              setActiveTask('task3');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            answerUnlocked={classroomCfg.unlockAnswerTask2}
          />
        )}

        {activeTask === 'task3' && (
          <Task3Construct
            data={record.task3}
            onChange={updateTask3}
            onOpenReport={handleOpenAndSubmitReport}
            answerUnlocked={classroomCfg.unlockAnswerTask3}
          />
        )}
      </main>

      {/* 底部全局固定栏：实时连接教师机状态 + 导出本组探究报告按钮 */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-slate-200 shadow-lg no-print">
        <div className="max-w-[1380px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          {/* 左侧：与教师机实时同步状态与小组进度 */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
              <Wifi
                className={`w-4 h-4 transition-colors ${
                  syncPulse ? 'text-cyan-600' : 'text-emerald-600'
                }`}
              />
              <span>
                已连接教师机 · 第{' '}
                <strong className="text-slate-900">{groupId || '1'}</strong>{' '}
                小组作答实时保存中（{record.lastUpdated}）
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                本组探究进度：
              </span>
              <span className="font-mono font-bold text-cyan-800 text-sm tabular-nums">
                {completedTasksCount} / 3 个任务已完成
              </span>
            </div>
          </div>

          {/* 右侧：重置按钮 + 全局固定“导出本组探究报告”按钮 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetCurrentGroup}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="清空当前小组填写内容并重新开始"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">重置本组答案</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAndSubmitReport}
              className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 active:scale-98 text-white text-sm md:text-base font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>导出本组探究报告</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 机房学生机快捷选组与鉴别师成员姓名登记弹窗 */}
      {showGroupPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-cyan-700" />
                <h2 className="text-lg font-bold text-slate-900">
                  小组编号选择与成员登记
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  1. 点击选择你所在的小组编号（共{' '}
                  {Math.max(1, Math.min(30, Number(classroomCfg.groupCount) || 5))}{' '}
                  个小组）：
                </label>
                <span className="text-xs font-mono text-cyan-700 font-semibold">
                  当前：第 {groupId} 小组
                </span>
              </div>
              <div
                className={`grid gap-2.5 ${
                  (Number(classroomCfg.groupCount) || 5) <= 5
                    ? 'grid-cols-5'
                    : (Number(classroomCfg.groupCount) || 5) <= 8
                    ? 'grid-cols-4 sm:grid-cols-4'
                    : 'grid-cols-4 sm:grid-cols-6'
                }`}
              >
                {Array.from(
                  {
                    length: Math.max(
                      1,
                      Math.min(30, Number(classroomCfg.groupCount) || 5)
                    ),
                  },
                  (_, i) => String(i + 1)
                ).map((num) => {
                  const active = groupId === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleGroupChange(num)}
                      className={`py-2.5 rounded-xl font-mono font-bold text-sm border transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs scale-102'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40'
                      }`}
                    >
                      第{num}组
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                2. 填写本组鉴别师成员姓名（只需填写你自己的姓名，省时高效）：
              </label>
              <input
                type="text"
                value={record.studentName ?? record.memberNames ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setRecord((prev) => ({
                    ...prev,
                    studentName: val,
                    memberNames: prev.memberNames || val,
                    lastUpdated: new Date().toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }),
                  }));
                }}
                placeholder="例如：张同学（直接填你自己的姓名即可，无需填全组名单）"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
              <div className="p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs text-cyan-900 leading-relaxed space-y-1">
                <p>
                  ⚡ <strong>课堂快速登记说明：</strong>
                  每人只需在自己电脑上填写<strong>自己的姓名</strong>（仅需2秒），若同组多位同学登记，教师机后台将自动合并汇总为本组完整成员名单！
                </p>
                {record.memberNames && (
                  <p className="font-mono font-bold text-cyan-800 pt-0.5">
                    📋 当前第 {groupId} 组已汇总成员：{record.memberNames}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGroupPicker(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer"
              >
                确认并开始实验（第 {groupId} 小组）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导出本组探究报告弹窗（学生视角） */}
      {showReportModal && (
        <ReportModal
          record={record}
          isAdminView={false}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
