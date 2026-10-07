import React, { useEffect, useState, useCallback } from 'react';
import {
  Compass,
  Microscope,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Users,
  Save,
  FileText,
} from 'lucide-react';
import {
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
import { WordExportModal } from './components/WordExportModal';
import { exportTaskToWord, WordExportTarget } from './utils/wordExport';

const STORAGE_PREFIX = 'campus_info_appraiser_v1_group_';
const ACTIVE_GROUP_KEY = 'campus_info_appraiser_v1_active_group';

function createDefaultRecord(groupId: string): GroupLabRecord {
  return {
    groupId,
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [wordModalTarget, setWordModalTarget] =
    useState<WordExportTarget | null>(null);
  const [savePulse, setSavePulse] = useState(false);

  const handleQuickExportTaskWord = (target: WordExportTarget) => {
    // Immediately download the blank student printable Word worksheet for the chosen task
    // and open the Word Export Modal so the teacher can also choose Teacher Answer Key or Filled mode
    exportTaskToWord(target, record, 'blank');
    setWordModalTarget(target);
  };

  // When groupId changes, load that group's record from localStorage
  const handleGroupChange = (newGroupId: string) => {
    const sanitized = newGroupId.replace(/[^\w\u4e00-\u9fa5-]/g, '').slice(0, 8);
    setGroupId(sanitized);
    try {
      window.localStorage.setItem(ACTIVE_GROUP_KEY, sanitized || '1');
    } catch {
      // Ignore
    }
    const loaded = loadGroupRecord(sanitized || '1');
    setRecord(loaded);
  };

  // Persist record to localStorage automatically whenever it changes
  useEffect(() => {
    const keyId = groupId.trim() || '1';
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${keyId}`,
        JSON.stringify(record)
      );
      setSavePulse(true);
      const timer = window.setTimeout(() => setSavePulse(false), 600);
      return () => window.clearTimeout(timer);
    } catch {
      // Ignore storage write errors
    }
  }, [record, groupId]);

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
    setRecord(fresh);
  };

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
      {/* 固定顶部导航栏（深海科技蓝实验室风格） */}
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
                    activeTask === 'task1' ? 'text-slate-950' : 'text-emerald-400'
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
                    activeTask === 'task2' ? 'text-slate-950' : 'text-emerald-400'
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
                    activeTask === 'task3' ? 'text-slate-950' : 'text-emerald-400'
                  }`}
                />
              )}
            </button>
          </nav>

          {/* 右侧：Word学案导出 + 小组编号输入框 */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setWordModalTarget(activeTask)}
              className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="将任务一、任务二、任务三单独导出为可打印的 Word 纸质实验单"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>导出 Word 纸质实验单</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-800/80 px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-200">第</span>
              <input
                type="text"
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                aria-label="小组编号"
                placeholder="1"
                className="w-12 text-center bg-slate-800 border border-cyan-600/60 rounded-md py-0.5 px-1 text-base font-mono font-bold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <span className="text-sm font-semibold text-slate-200">小组</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主体探究实验内容区（浅色高对比度背景，确保机房屏幕与教室大屏投影清晰可读） */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 lg:px-6 py-6">
        {activeTask === 'task1' && (
          <Task1Compass
            data={record.task1}
            onChange={updateTask1}
            onNextTask={() => {
              setActiveTask('task2');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExportWord={() => handleQuickExportTaskWord('task1')}
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
            onExportWord={() => handleQuickExportTaskWord('task2')}
          />
        )}

        {activeTask === 'task3' && (
          <Task3Construct
            data={record.task3}
            onChange={updateTask3}
            onOpenReport={() => setShowReportModal(true)}
            onExportWord={() => handleQuickExportTaskWord('task3')}
          />
        )}
      </main>

      {/* 底部全局固定栏：实时本地保存状态 + 分任务Word导出 + 导出本组探究报告按钮 */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-slate-200 shadow-lg no-print">
        <div className="max-w-[1380px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          {/* 左侧：自动保存与小组进度 */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <Save
                className={`w-4 h-4 transition-colors ${
                  savePulse ? 'text-cyan-600' : 'text-emerald-600'
                }`}
              />
              <span>
                第 <strong className="text-slate-900">{groupId || '1'}</strong> 小组数据已自动保存（{record.lastUpdated}）
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                探究任务完成度：
              </span>
              <span className="font-mono font-bold text-cyan-800 text-sm tabular-nums">
                {completedTasksCount} / 3
              </span>
            </div>
          </div>

          {/* 右侧：重置按钮 + 分任务导出Word按钮 + 全局固定“导出本组探究报告”按钮 */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetCurrentGroup}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="清空当前小组填写内容并重新开始"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">重置本组数据</span>
            </button>

            <button
              type="button"
              onClick={() => setWordModalTarget(activeTask)}
              className="px-4 py-2.5 rounded-xl border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="将任务一、任务二、任务三单独导出为 Word 文档供打印分发"
            >
              <FileText className="w-4 h-4 text-cyan-700" />
              <span>分任务导出 Word（打印版）</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 active:scale-98 text-white text-sm md:text-base font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>导出本组探究报告</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 导出本组探究报告弹窗 */}
      {showReportModal && (
        <ReportModal
          record={record}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* 分任务导出可打印 Word 实验单中心弹窗 */}
      {wordModalTarget && (
        <WordExportModal
          record={record}
          initialTarget={wordModalTarget}
          onClose={() => setWordModalTarget(null)}
        />
      )}
    </div>
  );
}
