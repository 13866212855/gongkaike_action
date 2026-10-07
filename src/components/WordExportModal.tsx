import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Compass,
  Microscope,
  Layers,
  Files,
  CheckCircle2,
} from 'lucide-react';
import { GroupLabRecord } from '../types/lab';
import {
  buildWordDocumentHtml,
  exportTaskToWord,
  WordExportMode,
  WordExportTarget,
} from '../utils/wordExport';

interface WordExportModalProps {
  record: GroupLabRecord;
  initialTarget?: WordExportTarget;
  onClose: () => void;
}

export const WordExportModal: React.FC<WordExportModalProps> = ({
  record,
  initialTarget = 'task1',
  onClose,
}) => {
  const [selectedTarget, setSelectedTarget] =
    useState<WordExportTarget>(initialTarget);
  const [selectedMode, setSelectedMode] = useState<WordExportMode>('blank');
  const [downloadedTip, setDownloadedTip] = useState<string>('');

  const handleDownload = (target: WordExportTarget, mode: WordExportMode) => {
    exportTaskToWord(target, record, mode);
    const labelMap: Record<WordExportTarget, string> = {
      task1: '【任务一·问诊】Word实验单',
      task2: '【任务二·解剖】Word实验单',
      task3: '【任务三·建构】Word实验单',
      all: '【全套任务一至三】Word实验单',
    };
    setDownloadedTip(`已开始下载 ${labelMap[target]} (.doc)`);
    window.setTimeout(() => setDownloadedTip(''), 3000);
  };

  const previewHtml = buildWordDocumentHtml(
    selectedTarget,
    record,
    selectedMode
  );

  const handlePrintPreview = () => {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(previewHtml);
      printWin.document.close();
      printWin.focus();
      window.setTimeout(() => {
        printWin.print();
      }, 250);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* 顶部标题栏 */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                课堂纸质实验单 · Word 单独导出中心
              </h2>
              <p className="text-xs text-slate-300">
                专为普通教室（无学生电脑）授课场景设计，支持将任务一、任务二、任务三单独或合集导出为标准 A4 排版 Word 文档（兼容 Office Word 与 WPS）
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="关闭导出中心"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 控制与一键单独下载区 */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4 shrink-0">
          {/* 第一行：选择导出版本模式（空白学生版 / 教师答案版 / 当前作答版） */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                1. 选择 Word 内容模式：
              </span>
              {[
                {
                  id: 'blank' as WordExportMode,
                  label: '📄 学生空白打印版（留空供手写，推荐课前打印）',
                },
                {
                  id: 'teacher' as WordExportMode,
                  label: '🎓 教师参考答案版（含红字标准答案与点评解析）',
                },
                {
                  id: 'filled' as WordExportMode,
                  label: `📝 当前第 ${record.groupId || '1'} 组已填数据版`,
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMode(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all cursor-pointer ${
                    selectedMode === m.id
                      ? 'bg-cyan-800 text-white border-cyan-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-cyan-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {downloadedTip && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>{downloadedTip}</span>
              </div>
            )}
          </div>

          {/* 第二行：四个单独导出卡片按钮（任务一、任务二、任务三、全套合集） */}
          <div>
            <div className="text-sm font-bold text-slate-800 mb-2">
              2. 点击下方对应任务即可预览或直接单独下载 Word 文档（.doc）：
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 任务一单独导出 */}
              <div
                onClick={() => setSelectedTarget('task1')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedTarget === 'task1'
                    ? 'bg-cyan-50/80 border-cyan-600 ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-800 mb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Compass className="w-3.5 h-3.5" />
                      单独导出 01
                    </span>
                    <span>A4 单页排版</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    【任务一·问诊】实验单
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    含时空罗盘 6 节点数据对照表与相对性/时效性填空
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget('task1');
                    handleDownload('task1', selectedMode);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出【任务一】Word (.doc)</span>
                </button>
              </div>

              {/* 任务二单独导出 */}
              <div
                onClick={() => setSelectedTarget('task2')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedTarget === 'task2'
                    ? 'bg-cyan-50/80 border-cyan-600 ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-800 mb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Microscope className="w-3.5 h-3.5" />
                      单独导出 02
                    </span>
                    <span>A4 单页排版</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    【任务二·解剖】实验单
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    含 A/B 快讯对照、分词热力勾选、科学极值表与真伪宣判
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget('task2');
                    handleDownload('task2', selectedMode);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出【任务二】Word (.doc)</span>
                </button>
              </div>

              {/* 任务三单独导出 */}
              <div
                onClick={() => setSelectedTarget('task3')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedTarget === 'task3'
                    ? 'bg-cyan-50/80 border-cyan-600 ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-800 mb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Layers className="w-3.5 h-3.5" />
                      单独导出 03
                    </span>
                    <span>A4 单页排版</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    【任务三·建构】实验单
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    含五大信息特征速查表、校园五情境配对题与行动口号
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget('task3');
                    handleDownload('task3', selectedMode);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出【任务三】Word (.doc)</span>
                </button>
              </div>

              {/* 全套三合一导出 */}
              <div
                onClick={() => setSelectedTarget('all')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedTarget === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between text-xs font-mono mb-1 ${
                      selectedTarget === 'all' ? 'text-cyan-300' : 'text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-bold">
                      <Files className="w-3.5 h-3.5" />
                      全套合集（自动分页）
                    </span>
                    <span>共 3 页</span>
                  </div>
                  <div
                    className={`text-base font-bold ${
                      selectedTarget === 'all' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    【任务一+二+三】全套合集
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      selectedTarget === 'all' ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    包含三个任务完整导学案，每任务独立一页 A4
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget('all');
                    handleDownload('all', selectedMode);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    selectedTarget === 'all'
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出全套合集 Word (.doc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 实时纸张排版预览区 */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/70">
          <div className="max-w-[780px] mx-auto mb-3 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 font-semibold">
              🖨️ Word 打印排版实时预览（当前预览：
              {selectedTarget === 'task1'
                ? '任务一·问诊'
                : selectedTarget === 'task2'
                ? '任务二·解剖'
                : selectedTarget === 'task3'
                ? '任务三·建构'
                : '任务一至三全套合集'}
              ）
            </span>
            <button
              type="button"
              onClick={handlePrintPreview}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-700" />
              <span>直接连接打印机打印当前预览</span>
            </button>
          </div>

          <div
            className="max-w-[780px] mx-auto bg-white shadow-lg border border-slate-300 p-8 rounded-xs text-slate-900"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
};
