import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  Award,
  CheckCircle2,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { GroupLabRecord } from '../types/lab';
import {
  AUDIENCE_META,
  CAMPUS_CASES,
  RED_FLAG_OPTIONS,
  TIME_NODES,
} from '../data/labPresets';
import { exportTaskToWord } from '../utils/wordExport';

interface ReportModalProps {
  record: GroupLabRecord;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false);

  const { groupId, task1, task2, task3, lastUpdated } = record;

  const correctCasesCount = CAMPUS_CASES.filter(
    (c) => task3.caseMatches[c.id] === c.correctFeature
  ).length;

  const selectedFlagLabels = RED_FLAG_OPTIONS.filter((f) =>
    task2.selectedFlags.includes(f.id)
  ).map((f) => f.label);

  const handlePrint = () => {
    window.print();
  };

  const generatePlainTextSummary = () => {
    return [
      `================================================`,
      `校园数字信息鉴别师行动 · 小组随堂探究实验报告`,
      `课程章节：《1.3 信息及其特征》`,
      `实验小组：第 ${groupId} 小组`,
      `导出时间：${lastUpdated}`,
      `================================================`,
      ``,
      `【任务一·问诊（时空罗盘：价值相对性与时效性）】`,
      `- 观察受众：${task1.selectedAudiences.map((k) => AUDIENCE_META[k].label).join('、')}`,
      `- 停留时间点：${TIME_NODES[task1.timeNodeIndex]?.label || '现在'}`,
      `- Q1 信息是否对所有人都具备同等价值：${
        task1.equalValueChoice === 'no'
          ? '否（因人而异）'
          : task1.equalValueChoice === 'yes'
          ? '是'
          : '未作答'
      }`,
      `- Q2 信息价值取决于使用者的：${task1.dependsOnInput || '（未填写）'}`,
      `- Q3 随时间推移信息价值呈现趋势：${task1.timeTrendInput || '（未填写）'}`,
      ``,
      `【任务二·解剖（多学科解剖台：真伪性鉴别）】`,
      `- 解剖状态：${task2.isDissected ? '已完成三维度解剖' : '未完成扫描'}`,
      `- 揪出的伪信息破绽：${
        selectedFlagLabels.length > 0 ? selectedFlagLabels.join('；') : '未勾选'
      }`,
      `- Q1 对【信息B·网络热传】的判定：${
        task2.verdictChoice === 'fake'
          ? '伪信息（夸大/捏造谣言）'
          : task2.verdictChoice === 'true'
          ? '真实可靠信息'
          : task2.verdictChoice === 'partial'
          ? '客观权威公文'
          : '未作答'
      }`,
      `- Q2 失真成因：出于【${task2.causePurposeInput || '未填'}】目的，或因【${
        task2.causeProcessInput || '未填'
      }】导致失真`,
      `- Q3 体现特征与对策：体现【${task2.characteristicInput || '未填'}】特征，应当【${
        task2.actionInput || '未填'
      }】`,
      ``,
      `【任务三·建构（信息特征体系与行动宣言）】`,
      `- 校园情境特征辨析得分：${correctCasesCount} / ${CAMPUS_CASES.length}`,
      `- Q1 文字声音等媒介承载体现特征：${task3.carrierConceptInput || '（未填写）'}`,
      `- Q2 萧伯纳交换思想名言体现特征：${task3.sharingConceptInput || '（未填写）'}`,
      `- 本组行动口号：${task3.groupSlogan || '（未填写）'}`,
    ].join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatePlainTextSummary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleDownloadTxt = () => {
    const content = generatePlainTextSummary();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `第${groupId}小组_1.3信息及其特征_探究实验报告.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-auto">
        {/* 顶部工具栏（打印时自动隐藏） */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 no-print border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-base">
              导出本组探究报告（可直接全屏截图、打印或下载存档）
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">已复制报告文本</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制文本</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>下载文本 (.txt)</span>
            </button>

            <button
              type="button"
              onClick={() => exportTaskToWord('all', record, 'filled')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>导出 Word 报告 (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>打印 / 导出 PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="关闭报告窗口"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 报告正文内容区域 */}
        <div className="p-6 md:p-8 space-y-6 bg-white text-slate-900">
          {/* 报告抬头 */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-800 font-semibold mb-1">
                高一信息技术公开课 · 随堂探究实验结项报告单
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                校园数字信息鉴别师行动 · 实验报告
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                对应课题：《1.3 信息及其特征》 — 问诊 · 解剖 · 建构 三阶探究记录
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right shrink-0">
              <div className="flex items-center justify-end gap-2 text-lg font-extrabold text-cyan-900">
                <Users className="w-5 h-5 text-cyan-700" />
                <span>第 {groupId || '未命名'} 小组</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs font-mono text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>生成时间：{lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* 模块一汇总：任务一·问诊（时空罗盘） */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                一、【任务一·问诊】时空罗盘实验结论（价值相对性与时效性）
              </h2>
              <span className="text-xs font-mono text-cyan-800">
                已对比受众：{task1.selectedAudiences.map((k) => AUDIENCE_META[k].label).join(' / ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">
                  Q1. 信息是否对所有人都具备同等价值？
                </div>
                <div className="text-base font-bold text-cyan-900">
                  {task1.equalValueChoice === 'no'
                    ? '✓ 否（不同受众价值截然不同）'
                    : task1.equalValueChoice === 'yes'
                    ? '是（价值相同）'
                    : '— 未作答 —'}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">
                  Q2. 信息价值具有相对性，取决于使用者的：
                </div>
                <div className="text-base font-bold text-cyan-900">
                  {task1.dependsOnInput.trim() || '— 未填写 —'}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">
                  Q3. 随时间推移，多数信息的价值呈现：
                </div>
                <div className="text-base font-bold text-cyan-900">
                  {task1.timeTrendInput.trim()
                    ? `${task1.timeTrendInput} 趋势`
                    : '— 未填写 —'}
                </div>
              </div>
            </div>
          </div>

          {/* 模块二汇总：任务二·解剖（多维解剖台） */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                二、【任务二·解剖】多学科真伪鉴别实验结论（真伪性）
              </h2>
              <span className="text-xs font-mono text-cyan-800">
                取证破绽数：{selectedFlagLabels.length} 项
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">
                  Q1. 对【信息B·网络热传】的真伪宣判：
                </div>
                <div className="text-base font-bold text-rose-700">
                  {task2.verdictChoice === 'fake'
                    ? '✓ 伪信息（夸大/捏造谣言）'
                    : task2.verdictChoice === 'true'
                    ? '真实可靠信息'
                    : task2.verdictChoice === 'partial'
                    ? '客观权威公文'
                    : '— 未宣判 —'}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">
                  Q2. 伪信息失真成因剖析：
                </div>
                <div className="text-sm font-semibold text-slate-800 leading-snug">
                  目的：<strong className="text-cyan-900">{task2.causePurposeInput || '未填写'}</strong>
                  <br />
                  过程偏差：<strong className="text-cyan-900">{task2.causeProcessInput || '未填写'}</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-sm flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Q3. 体现的信息特征：</span>
                <strong className="text-cyan-900 text-base ml-1">
                  {task2.characteristicInput || '— 未填写 —'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">科学应对策略：</span>
                <strong className="text-cyan-900 ml-1">
                  {task2.actionInput || '— 未填写 —'}
                </strong>
              </div>
            </div>
          </div>

          {/* 模块三汇总：任务三·建构（特征体系与行动宣言） */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                三、【任务三·建构】信息特征全景辨析与鉴别师宣言
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-700">
                校园情境辨析得分：{correctCasesCount} / {CAMPUS_CASES.length}
              </span>
            </div>

            {/* 5个案例匹配明细 */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {CAMPUS_CASES.map((c, idx) => {
                const chosen = task3.caseMatches[c.id];
                const isOk = chosen === c.correctFeature;
                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border ${
                      isOk
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-mono font-bold mb-0.5">案例 0{idx + 1}</div>
                    <div className="font-semibold">
                      {chosen ? `${chosen} ${isOk ? '✓' : '×'}` : '未匹配'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">
                  Q1. 文字/声音等媒介承载体现的特征：
                </span>
                <strong className="text-base text-cyan-900">
                  {task3.carrierConceptInput || '— 未填写 —'}
                </strong>
              </div>
              <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">
                  Q2. 萧伯纳“交换思想”体现的特征：
                </span>
                <strong className="text-base text-cyan-900">
                  {task3.sharingConceptInput || '— 未填写 —'}
                </strong>
              </div>
            </div>

            <div className="p-4 bg-cyan-950 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-cyan-300 mb-1">
                  🏆 第 {groupId || '__'} 小组 · 校园数字信息鉴别行动宣言
                </div>
                <div className="text-lg font-bold tracking-wide">
                  “{task3.groupSlogan || '擦亮数字慧眼，理性思辨求真，争当智慧校园信息鉴别师！'}”
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-mono shrink-0">
                <CheckCircle2 className="w-5 h-5" />
                <span>已认证 · 数字信息鉴别师</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
