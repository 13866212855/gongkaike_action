import React, { useState } from 'react';
import {
  Microscope,
  ShieldCheck,
  AlertOctagon,
  BookOpen,
  Scale,
  Network,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Edit3,
  RotateCw,
  FileText,
} from 'lucide-react';
import { Task2Data, WordToken } from '../types/lab';
import {
  DISSECTION_PRESETS,
  RED_FLAG_OPTIONS,
  tokenizeCustomTextB,
} from '../data/labPresets';

interface Task2DissectionProps {
  data: Task2Data;
  onChange: (updater: (prev: Task2Data) => Task2Data) => void;
  onNextTask: () => void;
  onExportWord: () => void;
}

export const Task2Dissection: React.FC<Task2DissectionProps> = ({
  data,
  onChange,
  onNextTask,
  onExportWord,
}) => {
  // Animation step: 0 = not started, 1 = scanning Module A, 2 = scanning Module B, 3 = all 3 modules revealed
  const [scanStage, setScanStage] = useState<number>(data.isDissected ? 3 : 0);
  const [isScanning, setIsScanning] = useState(false);
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const currentPreset =
    data.activePresetId === 'zhongkao'
      ? DISSECTION_PRESETS.zhongkao
      : DISSECTION_PRESETS.weather;

  const displayTextA =
    data.activePresetId === 'custom' && data.customTextA.trim()
      ? data.customTextA
      : currentPreset.infoA.content;

  const displayTextB =
    data.activePresetId === 'custom' && data.customTextB.trim()
      ? data.customTextB
      : currentPreset.infoB.content;

  const displayTokens: WordToken[] =
    data.activePresetId === 'custom' && data.customTextB.trim()
      ? tokenizeCustomTextB(data.customTextB)
      : currentPreset.infoB.tokens;

  const startDissection = () => {
    setIsScanning(true);
    setScanStage(1);
    setActiveToken(null);

    window.setTimeout(() => {
      setScanStage(2);
    }, 550);

    window.setTimeout(() => {
      setScanStage(3);
      setIsScanning(false);
      onChange((prev) => ({ ...prev, isDissected: true }));
    }, 1100);
  };

  const toggleFlag = (flagId: string) => {
    onChange((prev) => {
      const exists = prev.selectedFlags.includes(flagId);
      const next = exists
        ? prev.selectedFlags.filter((id) => id !== flagId)
        : [...prev.selectedFlags, flagId];
      return { ...prev, selectedFlags: next };
    });
  };

  const extremeCount = displayTokens.filter((t) => t.level === 'extreme').length;
  const elevatedCount = displayTokens.filter((t) => t.level === 'elevated').length;

  const isTask2Completed =
    data.isDissected &&
    data.verdictChoice !== '' &&
    data.causePurposeInput.trim().length > 0 &&
    data.characteristicInput.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* 1. 顶部任务引导与案例切换栏 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
                <span>实验模块 02</span>
                <span aria-hidden="true">·</span>
                <span>多学科解剖台（探究信息的真伪性特征与鉴别方法）</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                任务二·解剖：海量网络快讯，如何一眼识破伪信息？
              </h2>
            </div>
          </div>

          {/* 案例切换器（支持气象局快讯、中考政策快讯及课堂自定义输入） */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowCustomEditor(false);
                  onChange((prev) => ({ ...prev, activePresetId: 'weather' }));
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  data.activePresetId === 'weather'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                气象局快讯对比（默认）
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomEditor(false);
                  onChange((prev) => ({ ...prev, activePresetId: 'zhongkao' }));
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  data.activePresetId === 'zhongkao'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                中考改革快讯对比
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomEditor((v) => !v);
                  onChange((prev) => ({
                    ...prev,
                    activePresetId: 'custom',
                    customTextA: prev.customTextA || currentPreset.infoA.content,
                    customTextB: prev.customTextB || currentPreset.infoB.content,
                  }));
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  data.activePresetId === 'custom'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>自定义快讯文本</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onExportWord}
              className="px-3.5 py-2 rounded-lg border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="将任务二单独导出为可打印的 Word 纸质实验单"
            >
              <FileText className="w-4 h-4 text-cyan-700" />
              <span>导出【任务二】Word</span>
            </button>
          </div>
        </div>

        {/* 可选：教师自定义文本输入框 */}
        {showCustomEditor && (
          <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">
                ✏️ 课堂自定义文本编辑（修改后下方卡片及分词热力图将实时同步更新）：
              </span>
              <button
                type="button"
                onClick={() => setShowCustomEditor(false)}
                className="text-xs font-semibold text-cyan-700 hover:underline cursor-pointer"
              >
                收起编辑器
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-sky-800 mb-1">
                  信息A·权威来源快讯原文：
                </label>
                <textarea
                  rows={3}
                  value={data.customTextA}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, customTextA: e.target.value }))
                  }
                  className="w-full p-2.5 text-sm rounded-lg border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  信息B·网络热传夸张快讯原文：
                </label>
                <textarea
                  rows={3}
                  value={data.customTextB}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, customTextB: e.target.value }))
                  }
                  className="w-full p-2.5 text-sm rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 左右分栏展示两则快讯原文 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧卡片：蓝色边框，标注“信息A·权威来源” */}
          <div className="rounded-xl border-2 border-sky-500 bg-sky-50/30 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-sky-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-700" />
                  <span className="text-base font-bold text-sky-900">
                    信息A · 权威来源
                  </span>
                </div>
                <span className="text-xs font-mono text-sky-700">
                  对照基准样本
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                <span>发布机构：{currentPreset.infoA.source}</span>
                <span aria-hidden="true">·</span>
                <span>{currentPreset.infoA.publishTime}</span>
              </div>

              <p className="text-base md:text-lg text-slate-800 leading-relaxed font-medium bg-white p-4 rounded-lg border border-sky-200">
                {displayTextA}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900">
              <span className="font-semibold">核心要素提取：</span>
              <div className="flex flex-wrap items-center gap-2">
                {currentPreset.infoA.keyFacts.map((fact, idx) => (
                  <span key={idx} className="font-mono">
                    {idx > 0 && <span className="mx-1 text-sky-400">|</span>}
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧卡片：红色边框，标注“信息B·网络热传”，默认选中为“待解剖对象” */}
          <div className="rounded-xl border-2 border-rose-500 bg-rose-50/40 p-5 flex flex-col justify-between ring-4 ring-rose-500/15 relative">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <span className="text-base font-bold text-rose-900">
                    信息B · 网络热传
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded">
                  🎯 默认选中：待解剖对象
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                <span>发布来源：{currentPreset.infoB.source}</span>
                <span aria-hidden="true">·</span>
                <span>{currentPreset.infoB.publishTime}</span>
              </div>

              <p className="text-base md:text-lg text-slate-900 leading-relaxed font-medium bg-white p-4 rounded-lg border border-rose-300">
                {displayTextB}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between gap-2 text-xs text-rose-800">
              <span>⚠️ 状态：已锁定进入解剖台实验槽位</span>
              <span className="font-mono font-semibold">
                疑似包含夸张修辞与失真数据
              </span>
            </div>
          </div>
        </div>

        {/* 醒目的“🔬开始解剖”按钮 */}
        <div className="mt-6 flex flex-col items-center justify-center pt-2">
          <button
            type="button"
            onClick={startDissection}
            disabled={isScanning}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-800 to-teal-700 hover:from-cyan-700 hover:to-teal-600 active:scale-98 text-white text-lg font-bold shadow-md transition-all flex items-center gap-3 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>🔬 正在启动多学科交叉解剖引擎...</span>
              </>
            ) : scanStage === 3 ? (
              <>
                <Microscope className="w-5 h-5" />
                <span>🔬 重新扫描解剖【信息B·网络热传】</span>
              </>
            ) : (
              <>
                <Microscope className="w-6 h-6" />
                <span>🔬 开始解剖【信息B·网络热传】</span>
              </>
            )}
          </button>
          {scanStage === 0 && (
            <p className="text-sm text-slate-500 mt-2">
              点击上方按钮，依次调用【语文之眼】【数学与科学之尺】【信源与社会之镜】三大模块拆解信息B
            </p>
          )}
        </div>
      </section>

      {/* 2. 三大解剖模块依次动画展示 */}
      {scanStage >= 1 && (
        <div className="space-y-6">
          {/* 【模块A：语文之眼 —— 分词热力图】 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-rose-700">
                    解剖维度 01 · 语言学与修辞情绪分析
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    模块A：语文之眼 —— 分词情绪热力图
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-rose-700 font-bold">
                  ● 极度夸张/煽动词：{extremeCount} 处（红色大字）
                </span>
                <span className="text-amber-700 font-bold">
                  ▲ 焦虑诱导词：{elevatedCount} 处（橙色中字）
                </span>
                <span className="text-slate-500">
                  ○ 普通客观词汇（灰色小字）
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* 左侧 2/3：分词热力画布 */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
                  <span>
                    💡 提示：点击任意<strong>红色高亮大字词条</strong>，可查看其背后的“造谣修辞套路”解析
                  </span>
                  <span className="font-mono text-rose-700 font-semibold">
                    情绪热力扫描已完成
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2.5 leading-loose p-4 bg-white rounded-lg border border-slate-200 min-h-[160px]">
                  {displayTokens.map((token, idx) => {
                    if (token.level === 'extreme') {
                      const isSelected = activeToken?.text === token.text;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveToken(token)}
                          className={`px-2.5 py-1 rounded-lg text-xl md:text-2xl font-extrabold text-rose-700 bg-rose-100 border-2 transition-transform hover:scale-105 cursor-pointer ${
                            isSelected
                              ? 'border-rose-600 ring-2 ring-rose-400/40'
                              : 'border-rose-300'
                          }`}
                        >
                          {token.text}
                        </button>
                      );
                    }
                    if (token.level === 'elevated') {
                      const isSelected = activeToken?.text === token.text;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveToken(token)}
                          className={`px-2 py-0.5 rounded-md text-lg font-bold text-amber-900 bg-amber-100 border transition-transform hover:scale-105 cursor-pointer ${
                            isSelected ? 'border-amber-600' : 'border-amber-300'
                          }`}
                        >
                          {token.text}
                        </button>
                      );
                    }
                    return (
                      <span
                        key={idx}
                        className="text-sm text-slate-400 font-normal select-text"
                      >
                        {token.text}
                      </span>
                    );
                  })}
                </div>

                {/* 词条点击诊断提示框 */}
                <div className="mt-3 p-3.5 rounded-lg bg-rose-950 text-white flex items-center justify-between gap-3">
                  {activeToken ? (
                    <div>
                      <span className="text-xs font-mono text-rose-300 block">
                        词条修辞诊断 · 【{activeToken.category || '高危情绪词'}】
                      </span>
                      <p className="text-sm md:text-base font-medium mt-0.5">
                        <strong className="text-rose-300 mr-2">
                          “{activeToken.text}”：
                        </strong>
                        {activeToken.tooltip || '通过极端化表述放大大众恐慌情绪，削弱理性判断力。'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-rose-200">
                      👆 点击上方热力图中任意<strong className="text-white">红色大字词块</strong>（如“{displayTokens.find((t) => t.level === 'extreme')?.text || '震惊'}”），查看语文修辞破绽剖析。
                    </p>
                  )}
                </div>
              </div>

              {/* 右侧 1/3：情绪煽动指数对比表 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  文本情绪煽动指数对比
                </h4>

                {/* 信息A 指数 */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-sky-900">
                      信息A（权威来源）
                    </span>
                    <span className="font-mono font-bold text-sky-700 tabular-nums">
                      {currentPreset.infoA.sentimentScore} / 100 · 客观严谨
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${currentPreset.infoA.sentimentScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    用词平实准确，使用“预计”“可达”等科学限定词，零感叹号。
                  </p>
                </div>

                {/* 信息B 指数 */}
                <div className="p-3.5 bg-white rounded-lg border border-rose-200">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-rose-900">
                      信息B（网络热传）
                    </span>
                    <span className="font-mono font-bold text-rose-600 tabular-nums">
                      {currentPreset.infoB.sentimentScore} / 100 · 极度煽动
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${currentPreset.infoB.sentimentScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-rose-700 mt-2 font-medium">
                    ⚠️ 语文之眼结论：大量堆砌感叹号、绝对化形容词与祈使句，属于典型“情绪操控型”文本。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 【模块B：数学与科学之尺 —— 数据极值与逻辑核查】 */}
          {scanStage >= 2 && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-amber-800">
                      解剖维度 02 · 数学统计与科学常识校验
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      模块B：数学与科学之尺 —— 极值标尺与逻辑核查
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
                  数据夸大失真度：{currentPreset.infoB.mathCheck.exaggerationFactor}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：量化数据对比标尺 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="text-sm font-bold text-slate-800">
                    📏 核心数据与科学极值横向比对：
                  </div>

                  {/* 条目1：权威数据 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {currentPreset.infoB.mathCheck.officialLabel}
                      </span>
                      <span className="font-mono font-bold text-sky-700 tabular-nums">
                        {currentPreset.infoB.mathCheck.officialValue}
                        {currentPreset.infoB.mathCheck.claimUnit}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600 rounded-full"
                        style={{
                          width: `${Math.max(
                            8,
                            (currentPreset.infoB.mathCheck.officialValue /
                              Math.max(
                                currentPreset.infoB.mathCheck.claimValue,
                                currentPreset.infoB.mathCheck.historicalMaxValue
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 条目2：历史/制度参照基准 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {currentPreset.infoB.mathCheck.historicalMaxLabel}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {currentPreset.infoB.mathCheck.historicalMaxValue}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (currentPreset.infoB.mathCheck.historicalMaxValue /
                              Math.max(
                                currentPreset.infoB.mathCheck.claimValue,
                                currentPreset.infoB.mathCheck.historicalMaxValue
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 条目3：信息B夸张宣称值 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-rose-800 font-bold">
                        {currentPreset.infoB.mathCheck.claimLabel}（异常越界）
                      </span>
                      <span className="font-mono font-bold text-rose-600 tabular-nums">
                        {currentPreset.infoB.mathCheck.claimValue}
                        {currentPreset.infoB.mathCheck.claimUnit}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-950 font-medium">
                    🔬 科学检验判定：{currentPreset.infoB.mathCheck.scientificVerdict}
                  </div>
                </div>

                {/* 右侧：三大逻辑谬误清单 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-3">
                      📐 数学与逻辑之尺检测出的三大漏洞：
                    </div>
                    <ul className="space-y-3">
                      {currentPreset.infoB.mathCheck.logicFlaws.map((flaw, i) => (
                        <li
                          key={i}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed"
                        >
                          {flaw}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 【模块C：信源与社会之镜 —— 溯源链与破绽取证】 */}
          {scanStage >= 3 && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-cyan-800">
                      解剖维度 03 · 信源权威度与传播动机溯源
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      模块C：信源与社会之镜 —— 谁在发？为了什么而发？
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 信息A 溯源链 */}
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                  <div className="text-sm font-bold text-sky-900">
                    🛡️ 信息A（权威来源）生产与审核链路：
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {currentPreset.infoA.provenanceChain.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 font-semibold text-sky-950">
                          {idx + 1}. {step}
                        </span>
                        {idx < currentPreset.infoA.provenanceChain.length - 1 && (
                          <span className="text-sky-500 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-xs text-sky-800 pt-1">
                    <strong>发布动机：</strong>
                    {currentPreset.infoA.motive}
                  </div>
                </div>

                {/* 信息B 溯源链 */}
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="text-sm font-bold text-rose-900">
                    🕸️ 信息B（网络热传）造假与扩散链路：
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {currentPreset.infoB.provenanceChain.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-semibold text-rose-950">
                          {idx + 1}. {step}
                        </span>
                        {idx < currentPreset.infoB.provenanceChain.length - 1 && (
                          <span className="text-rose-500 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-xs text-rose-800 pt-1">
                    <strong>真实动机：</strong>
                    {currentPreset.infoB.motive}
                  </div>
                </div>
              </div>

              {/* 互动取证勾选区 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-sm font-bold text-slate-900 mb-2">
                  🕵️ 小组取证打卡：请勾选你们在【信息B】中揪出的伪信息破绽证据（可多选，已选{' '}
                  {data.selectedFlags.length} 项）：
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                  {RED_FLAG_OPTIONS.map((flag) => {
                    const checked = data.selectedFlags.includes(flag.id);
                    return (
                      <button
                        key={flag.id}
                        type="button"
                        onClick={() => toggleFlag(flag.id)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          checked
                            ? 'bg-cyan-950 text-white border-cyan-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-1 accent-cyan-400"
                        />
                        <div className="text-sm">
                          <span
                            className={`text-xs font-mono block ${
                              checked ? 'text-cyan-300' : 'text-slate-400'
                            }`}
                          >
                            [{flag.category}]
                          </span>
                          <span className="font-semibold">{flag.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* 3. 任务二实验结论填空区（实时保存到 localStorage） */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
              <span>实验记录单 02</span>
              <span aria-hidden="true">·</span>
              <span>实时自动保存至本地</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              任务二实验结论：真伪宣判与特征归纳
            </h3>
          </div>

          {isTask2Completed ? (
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              本任务结论已填写完成
            </span>
          ) : (
            <span className="text-sm text-amber-700 font-medium">
              ● 请先点击“🔬开始解剖”并完成下方鉴定结论
            </span>
          )}
        </div>

        <div className="space-y-5 text-base text-slate-800">
          {/* Q1: 真伪宣判单选 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-medium">
              <span className="font-mono font-bold text-cyan-800 mr-2">Q1.</span>
              综合语文、数学科学及信源三维度解剖，本组判定<strong>【信息B·网络热传】</strong>属于：
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {[
                { val: 'true', label: '真实可靠信息' },
                { val: 'fake', label: '伪信息（夸大/捏造谣言）' },
                { val: 'partial', label: '客观权威公文' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`px-4 py-2 rounded-lg border font-semibold cursor-pointer transition-all ${
                    data.verdictChoice === opt.val
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="verdictChoice"
                    value={opt.val}
                    checked={data.verdictChoice === opt.val}
                    onChange={() =>
                      onChange((prev) => ({
                        ...prev,
                        verdictChoice: opt.val as Task2Data['verdictChoice'],
                      }))
                    }
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Q2: 伪信息成因填空 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q2.</span>
              <span>解剖发现，网络伪信息产生的原因主要是传播者出于</span>
              <input
                type="text"
                value={data.causePurposeInput}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    causePurposeInput: e.target.value,
                  }))
                }
                placeholder="如：博取流量 / 商业牟利 / 制造恐慌"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 min-w-[240px]"
              />
              <span>的目的故意造假，或在传递过程中因</span>
              <input
                type="text"
                value={data.causeProcessInput}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    causeProcessInput: e.target.value,
                  }))
                }
                placeholder="如：断章取义 / 移花接木 / 认知局限"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 min-w-[240px]"
              />
              <span>导致信息失真。</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入思考词：</span>
              {[
                { p: '博取眼球赚取流量与商业变现', c: '断章取义、夸大数字' },
                { p: '售卖焦虑推销商品/课程', c: '移花接木、以偏概全' },
              ].map((pair, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      causePurposeInput: pair.p,
                      causeProcessInput: pair.c,
                    }))
                  }
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-800 transition-colors cursor-pointer"
                >
                  + 填入：“{pair.p}” & “{pair.c}”
                </button>
              ))}
            </div>
          </div>

          {/* Q3: 信息特征与鉴别方法填空 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q3.</span>
              <span>本实验证明信息具有</span>
              <input
                type="text"
                value={data.characteristicInput}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    characteristicInput: e.target.value,
                  }))
                }
                placeholder="填写信息特征（如：真伪性）"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 w-44"
              />
              <span>特征。面对网络海量信息，我们应当</span>
              <input
                type="text"
                value={data.actionInput}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, actionInput: e.target.value }))
                }
                placeholder="如：核查权威信源、运用科学常识理性思辨"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 min-w-[280px] flex-1"
              />
              <span>。</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入思考词：</span>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    characteristicInput: '真伪性',
                    actionInput: '追溯权威信源、结合多学科常识交叉核验，不信谣不传谣',
                  }))
                }
                className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-800 transition-colors cursor-pointer"
              >
                + 填入：“真伪性” & “追溯权威信源、结合多学科常识交叉核验”
              </button>
            </div>
          </div>
        </div>

        {/* 底部操作栏：查看参考答案 + 前往任务三 */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowAnswerKey((s) => !s)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            {showAnswerKey ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span>隐藏参考答案</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-cyan-700" />
                <span>查看参考答案（教师点评用）</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextTask}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>完成解剖，前往【任务三·建构】</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {showAnswerKey && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950 text-white border border-cyan-800">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>课堂点评参考答案（任务二·真伪解剖）</span>
            </div>
            <p className="text-base leading-relaxed">
              1. 信息B属于 <strong className="text-cyan-300">伪信息（夸大/捏造谣言）</strong>。
              <br />
              2. 失真原因：传播者常出于 <strong className="text-cyan-300">博取流量/商业变现牟利</strong> 故意造假，或在传播中因 <strong className="text-cyan-300">断章取义/移花接木/认知偏差</strong> 导致失真。
              <br />
              3. 体现了信息的 <strong className="text-cyan-300">真伪性</strong> 特征；鉴别方法包括：<strong className="text-cyan-300">查验官方权威信源、用科学常识核对极端数据、审视是否存在商业诱导动机</strong>。
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
