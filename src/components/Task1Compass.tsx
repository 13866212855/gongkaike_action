import React, { useEffect, useState } from 'react';
import {
  Compass,
  Clock,
  Users,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { AudienceKey, Task1Data } from '../types/lab';
import { AUDIENCE_META, TIME_NODES } from '../data/labPresets';

interface Task1CompassProps {
  data: Task1Data;
  onChange: (updater: (prev: Task1Data) => Task1Data) => void;
  onNextTask: () => void;
  answerUnlocked?: boolean;
}

export const Task1Compass: React.FC<Task1CompassProps> = ({
  data,
  onChange,
  onNextTask,
  answerUnlocked = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const currentNode = TIME_NODES[data.timeNodeIndex] || TIME_NODES[0];

  // Auto-play timeline simulation
  useEffect(() => {
    if (!isPlaying) return;
    if (data.timeNodeIndex >= TIME_NODES.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      onChange((prev) => ({
        ...prev,
        timeNodeIndex: Math.min(TIME_NODES.length - 1, prev.timeNodeIndex + 1),
      }));
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [isPlaying, data.timeNodeIndex, onChange]);

  const toggleAudience = (key: AudienceKey) => {
    onChange((prev) => {
      const exists = prev.selectedAudiences.includes(key);
      if (exists && prev.selectedAudiences.length === 1) {
        // Keep at least one audience selected so chart is never blank
        return prev;
      }
      const next = exists
        ? prev.selectedAudiences.filter((k) => k !== key)
        : [...prev.selectedAudiences, key];
      return { ...prev, selectedAudiences: next };
    });
  };

  const selectAllAudiences = () => {
    onChange((prev) => ({
      ...prev,
      selectedAudiences: ['high1', 'grade9', 'agency'],
    }));
  };

  const handleTimeChange = (idx: number) => {
    setIsPlaying(false);
    onChange((prev) => ({ ...prev, timeNodeIndex: idx }));
  };

  // SVG Chart Geometry
  const chartWidth = 860;
  const chartHeight = 320;
  const padLeft = 56;
  const padRight = 36;
  const padTop = 38;
  const padBottom = 48;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  const getX = (index: number) =>
    padLeft + (index / (TIME_NODES.length - 1)) * plotWidth;
  const getY = (val: number) =>
    padTop + plotHeight - (Math.max(0, Math.min(100, val)) / 100) * plotHeight;

  const dividerIndex = TIME_NODES.findIndex((n) => n.isCriticalDivider);
  const dividerX = getX(dividerIndex);
  const cursorX = getX(data.timeNodeIndex);

  const isTask1Completed =
    data.equalValueChoice !== '' &&
    data.dependsOnInput.trim().length > 0 &&
    data.timeTrendInput.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* 1. 顶部情境导入横幅 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
                <span>实验模块 01</span>
                <span aria-hidden="true">·</span>
                <span>时空罗盘（探究信息价值的相对性与时效性）</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                任务一·问诊：同一条信息，价值为何千差万别？
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800">实验操作指引：</span>
            <span>① 勾选对比受众</span>
            <span aria-hidden="true">→</span>
            <span>② 拖动时间滑块观察曲线</span>
            <span aria-hidden="true">→</span>
            <span>③ 填写探究结论</span>
          </div>
        </div>

        {/* 情境消息卡片 */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border-l-4 border-cyan-400">
          <div className="text-xs font-mono text-cyan-300 mb-1.5 flex items-center gap-2">
            <span>📡 校园监测站截获热点消息样本 #2026-AH-01</span>
            <span aria-hidden="true">·</span>
            <span>请操作下方时空罗盘，探究这条消息的价值变化规律</span>
          </div>
          <p className="text-lg md:text-xl font-semibold leading-relaxed text-white">
            某自媒体发布消息：“安徽省中考改革突发重大调整，部分科目分值全面推倒重来！”
          </p>
        </div>
      </section>

      {/* 2. 核心交互实验台：受众选择 + 时间轴滑块 + 动态折线图 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* 受众选择区 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1">
              <Users className="w-4 h-4 text-cyan-700" />
              <span>第一步：选择观察受众（支持多选叠加对比，已选 {data.selectedAudiences.length}/3）</span>
            </div>
            <p className="text-sm text-slate-500">
              点击下方受众标签切换显示对应曲线，建议同时勾选 2～3 个受众进行横向对比
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(Object.keys(AUDIENCE_META) as AudienceKey[]).map((key) => {
              const item = AUDIENCE_META[key];
              const isSelected = data.selectedAudiences.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAudience(key)}
                  className={`px-4 py-2.5 rounded-lg border text-base font-semibold transition-all duration-150 flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? item.activeRingClass
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? item.colorHex : '#cbd5e1',
                    }}
                  />
                  <span>
                    {item.emoji} {item.label}
                  </span>
                  <span className="text-xs font-mono">
                    {isSelected ? '● 监测中' : '○ 未选'}
                  </span>
                </button>
              );
            })}

            {data.selectedAudiences.length < 3 && (
              <button
                type="button"
                onClick={selectAllAudiences}
                className="px-3 py-2 text-sm font-medium text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                全选对比三类受众
              </button>
            )}
          </div>
        </div>

        {/* 时间轴滑块控制区 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-cyan-700" />
              <span className="text-base font-bold text-slate-900">
                第二步：拨动时间轴滑块
              </span>
              <span className="text-sm text-slate-600">
                当前时间点：
                <strong className="text-cyan-800 font-bold ml-1">
                  {currentNode.label}（{currentNode.phaseTag}）
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (data.timeNodeIndex >= TIME_NODES.length - 1) {
                    onChange((prev) => ({ ...prev, timeNodeIndex: 0 }));
                  }
                  setIsPlaying((p) => !p);
                }}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-cyan-700 hover:bg-cyan-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>暂停推演</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>自动推演时间轴</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange(0)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置起点</span>
              </button>
            </div>
          </div>

          {/* 水平拖动滑块与关键分界线 */}
          <div className="relative pt-2 pb-1 px-2">
            {/* 滑块轨道背景 */}
            <div className="relative flex items-center">
              <div
                className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-rose-500 transition-all duration-150"
                  style={{
                    width: `${(data.timeNodeIndex / (TIME_NODES.length - 1)) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={TIME_NODES.length - 1}
                step={1}
                value={data.timeNodeIndex}
                onChange={(e) => handleTimeChange(Number(e.target.value))}
                aria-label="时间节点滑块"
                className="lab-slider absolute inset-0 w-full h-full m-0"
              />
            </div>

            {/* 6个时间节点快捷跳转按钮 */}
            <div className="grid grid-cols-6 gap-1.5 mt-4">
              {TIME_NODES.map((node) => {
                const isActive = node.index === data.timeNodeIndex;
                const isDivider = node.isCriticalDivider;
                return (
                  <button
                    key={node.index}
                    type="button"
                    onClick={() => handleTimeChange(node.index)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                      isActive
                        ? isDivider
                          ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/30'
                          : 'bg-cyan-50 border-cyan-600 text-cyan-950 ring-2 ring-cyan-500/20'
                        : isDivider
                        ? 'bg-rose-50/50 border-rose-300 text-rose-900 hover:bg-rose-50'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-mono font-semibold">
                        T{node.index + 1} · {node.shortDate}
                      </span>
                      {isDivider && (
                        <span className="text-xs font-bold text-rose-600">
                          ⚡分界线
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold leading-snug truncate">
                      {node.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 动态折线图（核心可视化区域） */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                信息价值指数动态演化折线图（0 - 100）
              </span>
              <span className="text-xs font-mono text-slate-500">
                （支持直接点击图表任意时间列切换节点）
              </span>
            </div>

            {/* 图例 */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {(Object.keys(AUDIENCE_META) as AudienceKey[]).map((key) => {
                const item = AUDIENCE_META[key];
                const active = data.selectedAudiences.includes(key);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 ${
                      active ? 'opacity-100 font-semibold' : 'opacity-35 line-through'
                    }`}
                  >
                    <span
                      className="w-3.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <span className="text-slate-800">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[680px] select-none"
              role="img"
              aria-label="信息价值指数随时间变化折线图"
            >
              <defs>
                <linearGradient id="cursorGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="dangerZone" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* 中考结束分界线右侧衰减阴影区 */}
              <rect
                x={dividerX}
                y={padTop}
                width={padLeft + plotWidth - dividerX}
                height={plotHeight}
                fill="url(#dangerZone)"
              />

              {/* 水平网格线 & Y轴刻度 (0, 25, 50, 75, 100) */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const y = getY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + plotWidth}
                      y2={y}
                      stroke={tick === 0 ? '#94a3b8' : '#e2e8f0'}
                      strokeDasharray={tick === 0 ? undefined : '4 4'}
                      strokeWidth={1}
                    />
                    <text
                      x={padLeft - 12}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-slate-500 font-mono"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Y轴标题 */}
              <text
                x={16}
                y={padTop + plotHeight / 2}
                transform={`rotate(-90, 16, ${padTop + plotHeight / 2})`}
                textAnchor="middle"
                className="text-xs fill-slate-500 font-semibold"
              >
                信息价值指数 (0-100)
              </text>

              {/* 垂直网格线 & X轴时间标签 */}
              {TIME_NODES.map((node) => {
                const x = getX(node.index);
                const isCurrent = node.index === data.timeNodeIndex;
                return (
                  <g key={node.index}>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + plotHeight}
                      stroke="#f1f5f9"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={padTop + plotHeight + 24}
                      textAnchor="middle"
                      className={`text-xs ${
                        isCurrent
                          ? 'fill-cyan-800 font-bold'
                          : node.isCriticalDivider
                          ? 'fill-rose-700 font-bold'
                          : 'fill-slate-600 font-medium'
                      }`}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}

              {/* 醒目的竖线标注“中考结束”关键分界点 */}
              <g>
                <line
                  x1={dividerX}
                  y1={padTop - 8}
                  x2={dividerX}
                  y2={padTop + plotHeight}
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                />
                <rect
                  x={dividerX - 68}
                  y={6}
                  width={136}
                  height={22}
                  rx={4}
                  fill="#be123c"
                />
                <text
                  x={dividerX}
                  y={21}
                  textAnchor="middle"
                  className="text-xs fill-white font-bold"
                >
                  ⚠️ 关键分界：中考结束
                </text>
              </g>

              {/* 当前滑块位置的动态光标竖带 */}
              <g>
                <rect
                  x={cursorX - 18}
                  y={padTop}
                  width={36}
                  height={plotHeight}
                  fill="url(#cursorGlow)"
                />
                <line
                  x1={cursorX}
                  y1={padTop}
                  x2={cursorX}
                  y2={padTop + plotHeight}
                  stroke="#0891b2"
                  strokeWidth={2}
                />
              </g>

              {/* 绘制选中的受众折线 */}
              {data.selectedAudiences.map((audKey) => {
                const meta = AUDIENCE_META[audKey];
                const points = TIME_NODES.map(
                  (n) => `${getX(n.index)},${getY(n.values[audKey])}`
                ).join(' ');

                return (
                  <g key={audKey}>
                    <polyline
                      fill="none"
                      stroke={meta.colorHex}
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                    {TIME_NODES.map((n) => {
                      const cx = getX(n.index);
                      const cy = getY(n.values[audKey]);
                      const isCurrent = n.index === data.timeNodeIndex;
                      return (
                        <g key={`${audKey}-${n.index}`}>
                          {isCurrent && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill={meta.colorHex}
                              fillOpacity={0.2}
                            />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCurrent ? 6 : 4}
                            fill={isCurrent ? meta.colorHex : '#ffffff'}
                            stroke={meta.colorHex}
                            strokeWidth={2.5}
                          />
                          {isCurrent && (
                            <g transform={`translate(${cx}, ${cy - 14})`}>
                              <rect
                                x={-20}
                                y={-18}
                                width={40}
                                height={20}
                                rx={4}
                                fill={meta.colorHex}
                              />
                              <text
                                x={0}
                                y={-4}
                                textAnchor="middle"
                                className="text-xs fill-white font-mono font-bold"
                              >
                                {n.values[audKey]}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* 透明点击热区，方便鼠标直接点击时间列 */}
              {TIME_NODES.map((node) => {
                const colWidth = plotWidth / TIME_NODES.length;
                const x = getX(node.index) - colWidth / 2;
                return (
                  <rect
                    key={`hit-${node.index}`}
                    x={x}
                    y={padTop}
                    width={colWidth}
                    height={plotHeight + 35}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleTimeChange(node.index)}
                  />
                );
              })}
            </svg>
          </div>

          {/* 图表下方实时显示：当前时间点各受众的信息价值数值 */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800">
                📊 当前时间节点【{currentNode.label}】各受众信息价值实时读数：
              </span>
              {currentNode.isCriticalDivider && (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  注意观察：越过“中考结束”分界点后，初三学生及家长的信息价值发生断崖式下跌！
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(AUDIENCE_META) as AudienceKey[]).map((key) => {
                const meta = AUDIENCE_META[key];
                const isSelected = data.selectedAudiences.includes(key);
                const val = currentNode.values[key];
                const desc = currentNode.descriptions[key];

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (!isSelected) toggleAudience(key);
                    }}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50 cursor-pointer hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-slate-900">
                        {meta.emoji} {meta.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-2xl font-mono font-bold tabular-nums"
                          style={{ color: meta.colorHex }}
                        >
                          {val}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          / 100
                        </span>
                      </div>
                    </div>

                    {/* 数值进度条 */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${val}%`,
                          backgroundColor: meta.colorHex,
                        }}
                      />
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {isSelected ? desc : '（点击上方受众按钮或此处激活该受众曲线）'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. 实验结论填空区（自动保存） */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
              <span>实验记录单 01</span>
              <span aria-hidden="true">·</span>
              <span>实时自动保存至本地</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              第三步：任务一实验结论填空
            </h3>
          </div>

          {isTask1Completed ? (
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              本任务结论已填写完成
            </span>
          ) : (
            <span className="text-sm text-amber-700 font-medium">
              ● 请完成下方 3 处实验结论填写
            </span>
          )}
        </div>

        <div className="space-y-5 text-base text-slate-800">
          {/* 填空 1：单选 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-medium">
              <span className="font-mono font-bold text-cyan-800 mr-2">Q1.</span>
              观察同一时间节点不同受众的折线高度：<strong>信息是否对所有人都具备同等价值？</strong>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label
                className={`px-5 py-2 rounded-lg border font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                  data.equalValueChoice === 'yes'
                    ? 'bg-cyan-700 text-white border-cyan-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="equalValue"
                  value="yes"
                  checked={data.equalValueChoice === 'yes'}
                  onChange={() =>
                    onChange((prev) => ({ ...prev, equalValueChoice: 'yes' }))
                  }
                  className="sr-only"
                />
                <span>是（价值相同）</span>
              </label>

              <label
                className={`px-5 py-2 rounded-lg border font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                  data.equalValueChoice === 'no'
                    ? 'bg-cyan-700 text-white border-cyan-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="equalValue"
                  value="no"
                  checked={data.equalValueChoice === 'no'}
                  onChange={() =>
                    onChange((prev) => ({ ...prev, equalValueChoice: 'no' }))
                  }
                  className="sr-only"
                />
                <span>否（因人而异）</span>
              </label>
            </div>
          </div>

          {/* 填空 2：文本输入 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q2.</span>
              <span>这说明信息的价值具有</span>
              <strong className="text-cyan-800 underline decoration-cyan-400 underline-offset-4">
                相对性
              </strong>
              <span>，它取决于使用者的</span>
              <input
                type="text"
                value={data.dependsOnInput}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, dependsOnInput: e.target.value }))
                }
                placeholder="请输入关键词（如：需求 / 身份 / 关注点）"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 min-w-[260px]"
              />
              <span>。</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入思考词：</span>
              {['自身需求与身份', '所处阶段与关注点', '理解与利用能力'].map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, dependsOnInput: word }))
                  }
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-800 transition-colors cursor-pointer"
                >
                  + {word}
                </button>
              ))}
            </div>
          </div>

          {/* 填空 3：文本输入 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              <span className="font-mono font-bold text-cyan-800">Q3.</span>
              <span>这同时体现了信息的</span>
              <strong className="text-cyan-800 underline decoration-cyan-400 underline-offset-4">
                时效性
              </strong>
              <span>：随着时间的推移（尤其是越过关键节点后），多数信息的价值呈现</span>
              <input
                type="text"
                value={data.timeTrendInput}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, timeTrendInput: e.target.value }))
                }
                placeholder="请输入变化趋势（如：随时间递减 / 衰减）"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 min-w-[260px]"
              />
              <span>趋势。</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-7">
              <span>快捷填入思考词：</span>
              {['随时间递减（衰减）', '先升后断崖式下跌', '逐渐降低甚至归零'].map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, timeTrendInput: word }))
                  }
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-800 transition-colors cursor-pointer"
                >
                  + {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作栏：教师解锁参考答案状态 + 进入下一任务 */}
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
            onClick={onNextTask}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>完成问诊，前往【任务二·解剖】</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 教师机解锁后显示的参考答案面板 */}
        {answerUnlocked && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950 text-white border border-cyan-800">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>课堂点评标准参考结论（1.3 信息及其特征）</span>
            </div>
            <p className="text-base leading-relaxed">
              1. 信息是否对所有人都具备同等价值？<strong className="text-cyan-300">否</strong>。
              <br />
              2. 它取决于使用者的 <strong className="text-cyan-300">需求 / 身份 / 关注点</strong>（体现了信息价值的<strong>相对性</strong>）。
              <br />
              3. 随着时间的推移，多数信息的价值呈现 <strong className="text-cyan-300">随时间递减（或在越过特定分界点后断崖式归零）</strong> 的趋势（体现了信息的<strong>时效性</strong>）。
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
