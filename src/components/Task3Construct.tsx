import React from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  FileSpreadsheet,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { Task3Data } from '../types/lab';
import {
  CAMPUS_CASES,
  INFORMATION_FEATURES,
  PLEDGE_ITEMS,
} from '../data/labPresets';

interface Task3ConstructProps {
  data: Task3Data;
  onChange: (updater: (prev: Task3Data) => Task3Data) => void;
  onOpenReport: () => void;
  answerUnlocked?: boolean;
}

export const Task3Construct: React.FC<Task3ConstructProps> = ({
  data,
  onChange,
  onOpenReport,
  answerUnlocked = false,
}) => {

  const handleSelectFeature = (caseId: string, featureKey: string) => {
    onChange((prev) => ({
      ...prev,
      caseMatches: {
        ...prev.caseMatches,
        [caseId]: featureKey,
      },
    }));
  };

  const togglePledge = (pledge: string) => {
    onChange((prev) => {
      const exists = prev.selectedPledges.includes(pledge);
      const next = exists
        ? prev.selectedPledges.filter((p) => p !== pledge)
        : [...prev.selectedPledges, pledge];
      return { ...prev, selectedPledges: next };
    });
  };

  const correctMatchCount = CAMPUS_CASES.filter(
    (c) => data.caseMatches[c.id] === c.correctFeature
  ).length;

  const isTask3Completed =
    correctMatchCount >= 3 &&
    data.carrierConceptInput.trim().length > 0 &&
    data.sharingConceptInput.trim().length > 0 &&
    data.groupSlogan.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* 1. 顶部引导与五大特征全景知识卡 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
                <span>实验模块 03</span>
                <span aria-hidden="true">·</span>
                <span>知识体系建构（统整《1.3 信息及其特征》五大核心特征）</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                任务三·建构：绘制信息特征图谱，发布本组鉴别宣言
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">
              校园情境辨析正确率：
            </span>
            <span className="text-xl font-mono font-bold text-cyan-700 tabular-nums">
              {correctMatchCount} / {CAMPUS_CASES.length}
            </span>
          </div>
        </div>

        {/* 1.3 信息五大核心特征速览矩阵 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INFORMATION_FEATURES.map((feat, idx) => (
            <div
              key={feat.key}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-700 mb-1">
                  <span>特征 0{idx + 1}</span>
                  <span>{feat.keyword}</span>
                </div>
                <div className="text-base font-bold text-slate-900 mb-1.5">
                  {feat.key}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 校园情境特征匹配实验台 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              第一步：校园真实情境 · 信息特征对号入座
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              请阅读以下 5 个发生在我们身边的校园情境，点击右侧按钮为其匹配最突出的【信息特征】
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {CAMPUS_CASES.map((item) => {
            const selected = data.caseMatches[item.id] || '';
            const isCorrect = selected === item.correctFeature;
            const hasAnswered = selected !== '';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all ${
                  !hasAnswered
                    ? 'bg-slate-50/70 border-slate-200'
                    : isCorrect
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-rose-50/40 border-rose-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-cyan-800">
                        {item.title}
                      </span>
                      {hasAnswered && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>匹配正确（{item.correctFeature}）</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>匹配有误，请再思考一下</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-base text-slate-800 font-medium leading-relaxed">
                      {item.scenario}
                    </p>
                  </div>

                  {/* 5个特征选择按钮 */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {INFORMATION_FEATURES.map((feat) => {
                      const active = selected === feat.key;
                      return (
                        <button
                          key={feat.key}
                          type="button"
                          onClick={() => handleSelectFeature(item.id, feat.key)}
                          className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? isCorrect
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-cyan-600 hover:text-cyan-800'
                          }`}
                        >
                          {feat.key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 即时解析反馈 */}
                {hasAnswered && (
                  <div
                    className={`mt-3 pt-3 border-t text-sm flex items-start gap-2 ${
                      isCorrect
                        ? 'border-emerald-200/80 text-emerald-900'
                        : 'border-rose-200/80 text-rose-900'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {isCorrect
                        ? item.explanation
                        : `提示：请仔细留意情境中的关键线索——该案例重点强调的是“${
                            item.id === 'case1'
                              ? '广播声波与屏幕文字等媒介承载'
                              : item.id === 'case2'
                              ? '全班多人共同下载使用且原文件不损耗'
                              : item.id === 'case3'
                              ? '错过午饭时间点后消息失去效用'
                              : item.id === 'case4'
                              ? '高一与高三学生因自身需求不同而关注点各异'
                              : '截图被P图篡改，需去官网核实真假'
                          }”。`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 核心概念补全与校园鉴别师宣言（自动保存） */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
              <span>实验记录单 03</span>
              <span aria-hidden="true">·</span>
              <span>实时自动保存至本地</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              第二步：概念体系补全与小组行动宣言
            </h3>
          </div>

          {isTask3Completed ? (
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              本任务建构已完成，可随时导出报告
            </span>
          ) : (
            <span className="text-sm text-amber-700 font-medium">
              ● 请完成下方核心概念填空与小组行动口号
            </span>
          )}
        </div>

        <div className="space-y-5 text-base text-slate-800">
          {/* 填空 1：载体依附性 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q1.</span>
              <span>
                书本上的文字、广播里的声音、网页上的图表本身并不是信息，而是信息的载体。信息不能独立存在，必须依附于一定的载体，这体现了信息的
              </span>
              <input
                type="text"
                value={data.carrierConceptInput}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    carrierConceptInput: e.target.value,
                  }))
                }
                placeholder="填写信息特征（如：载体依附性）"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 w-52"
              />
              <span>。</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入：</span>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    carrierConceptInput: '载体依附性',
                  }))
                }
                className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 cursor-pointer"
              >
                + 载体依附性
              </button>
            </div>
          </div>

          {/* 填空 2：共享性 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q2.</span>
              <span>
                剧作家萧伯纳曾说：“你有一个苹果，我有一个苹果，彼此交换后每人仍是一个苹果；但你有一种思想，我有一种思想，彼此交换后每人便有了两种思想。”这生动体现了信息的
              </span>
              <input
                type="text"
                value={data.sharingConceptInput}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    sharingConceptInput: e.target.value,
                  }))
                }
                placeholder="填写信息特征（如：共享性）"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 w-52"
              />
              <span>。</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入：</span>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    sharingConceptInput: '共享性',
                  }))
                }
                className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 cursor-pointer"
              >
                + 共享性
              </button>
            </div>
          </div>

          {/* 勾选与撰写：校园数字信息鉴别师行动宣言 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                <span className="font-mono text-cyan-800 mr-2">Q3.</span>
                签署本组《校园数字信息鉴别师·四步行动准则》（请勾选本组承诺践行的准则）：
              </span>
              <span className="text-xs font-mono text-cyan-700">
                已签署 {data.selectedPledges.length} / {PLEDGE_ITEMS.length} 条
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {PLEDGE_ITEMS.map((pledge, i) => {
                const checked = data.selectedPledges.includes(pledge);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePledge(pledge)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all flex items-start gap-2.5 cursor-pointer ${
                      checked
                        ? 'bg-cyan-950 text-white border-cyan-900 font-medium'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-1 accent-cyan-400"
                    />
                    <span>{pledge}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                ✍️ 撰写本组专属的“校园数字信息鉴别行动口号 / 总结寄语”（将展示在最终荣誉报告中）：
              </label>
              <input
                type="text"
                value={data.groupSlogan}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, groupSlogan: e.target.value }))
                }
                placeholder="例如：溯源求证辨真伪，理性思传做智者！"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                <span>灵感口号参考：</span>
                {[
                  '溯源求证辨真伪，理性思辨做智者！',
                  '不畏浮云遮望眼，科学求真破谣言！',
                  '把握信息时效脉搏，擦亮数字鉴别慧眼！',
                ].map((slogan) => (
                  <button
                    key={slogan}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({ ...prev, groupSlogan: slogan }))
                    }
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 cursor-pointer"
                  >
                    + 使用：“{slogan}”
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏：教师解锁参考答案状态 + 提交生成本组探究报告 */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {answerUnlocked ? (
            <span className="text-sm font-bold text-cyan-800 flex items-center gap-1.5 bg-cyan-50 px-3.5 py-2 rounded-lg border border-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>教师机已公布本任务参考结论（请对照下方解析自查）</span>
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>课堂探究进行中 · 教师讲评时将向全班同步解锁参考结论</span>
            </span>
          )}

          <button
            type="button"
            onClick={onOpenReport}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-600 hover:to-teal-600 text-white text-base font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <FileSpreadsheet className="w-5 h-5" />
            <span>提交至教师机并生成本组探究报告</span>
          </button>
        </div>

        {answerUnlocked && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950 text-white border border-cyan-800">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>课堂总结标准参考答案（《1.3 信息及其特征》全景梳理）</span>
            </div>
            <p className="text-base leading-relaxed">
              1. 校园五情境匹配：案例01 → <strong className="text-cyan-300">载体依附性</strong>；案例02 → <strong className="text-cyan-300">共享性</strong>；案例03 → <strong className="text-cyan-300">时效性</strong>；案例04 → <strong className="text-cyan-300">价值相对性</strong>；案例05 → <strong className="text-cyan-300">真伪性</strong>。
              <br />
              2. 概念填空：Q1 为 <strong className="text-cyan-300">载体依附性</strong>；Q2 萧伯纳名言体现了信息的 <strong className="text-cyan-300">共享性</strong>。
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
