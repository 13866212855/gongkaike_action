import {
  AUDIENCE_META,
  CAMPUS_CASES,
  DISSECTION_PRESETS,
  INFORMATION_FEATURES,
  PLEDGE_ITEMS,
  RED_FLAG_OPTIONS,
  TIME_NODES,
  tokenizeCustomTextB,
} from '../data/labPresets';
import { GroupLabRecord, TaskId } from '../types/lab';

export type WordExportMode = 'blank' | 'filled' | 'teacher';
export type WordExportTarget = TaskId | 'all';

/**
 * Generates an MS Word & WPS Office compatible .doc file with A4 print layout
 * and triggers browser download.
 */
export function exportTaskToWord(
  target: WordExportTarget,
  record: GroupLabRecord,
  mode: WordExportMode = 'blank'
) {
  const htmlContent = buildWordDocumentHtml(target, record, mode);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const modeLabel =
    mode === 'blank'
      ? '学生空白打印版'
      : mode === 'teacher'
      ? '教师参考答案版'
      : `第${record.groupId || '1'}组作答版`;

  const targetNameMap: Record<WordExportTarget, string> = {
    task1: '任务一_问诊_时空罗盘实验单',
    task2: '任务二_解剖_多学科真伪鉴别实验单',
    task3: '任务三_建构_信息特征与行动宣言实验单',
    all: '1.3信息及其特征_随堂实验单全套(任务一至三)',
  };

  const fileName = `《1.3信息及其特征》_${targetNameMap[target]}_${modeLabel}.doc`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildWordDocumentHtml(
  target: WordExportTarget,
  record: GroupLabRecord,
  mode: WordExportMode
): string {
  const sections: string[] = [];

  if (target === 'task1' || target === 'all') {
    sections.push(renderTask1Section(record, mode));
  }
  if (target === 'task2' || target === 'all') {
    sections.push(renderTask2Section(record, mode));
  }
  if (target === 'task3' || target === 'all') {
    sections.push(renderTask3Section(record, mode));
  }

  const bodyHtml = sections.join(
    '<br clear="all" style="page-break-before:always; mso-break-type:section-break" />'
  );

  return `
<html xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>1.3 信息及其特征 - 随堂探究实验单</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: 595.3pt 841.9pt;
      margin: 36.0pt 40.0pt 36.0pt 40.0pt;
      mso-header-margin: 25.0pt;
      mso-footer-margin: 25.0pt;
    }
    div.WordSection1 {
      page: WordSection1;
    }
    body {
      font-family: "Microsoft YaHei", "SimSun", sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
    }
    h1 {
      font-size: 16pt;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 4pt 0;
      text-align: center;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #0e7490;
      margin: 10pt 0 6pt 0;
      border-left: 4pt solid #0891b2;
      padding-left: 6pt;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0f172a;
      margin: 6pt 0 4pt 0;
    }
    p {
      margin: 4pt 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6pt 0;
    }
    th, td {
      border: 1pt solid #94a3b8;
      padding: 5pt 7pt;
      font-size: 10pt;
      vertical-align: middle;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      font-size: 10pt;
      color: #475569;
      margin-bottom: 8pt;
    }
    .meta-bar {
      width: 100%;
      border: 1pt solid #cbd5e1;
      background-color: #f8fafc;
      margin-bottom: 10pt;
    }
    .meta-bar td {
      border: none;
      padding: 5pt 8pt;
      font-size: 10pt;
      font-weight: bold;
    }
    .box {
      border: 1pt solid #cbd5e1;
      background-color: #f8fafc;
      padding: 8pt 10pt;
      margin: 6pt 0;
    }
    .scenario-box {
      border: 1.5pt solid #0891b2;
      background-color: #ecfeff;
      padding: 8pt 10pt;
      margin: 6pt 0;
    }
    .blank-line {
      font-weight: bold;
      color: #0f172a;
      text-decoration: underline;
    }
    .answer-text {
      font-weight: bold;
      color: #be123c;
      text-decoration: underline;
    }
    .teacher-box {
      border: 1pt dashed #0e7490;
      background-color: #f0fdfa;
      padding: 7pt 9pt;
      margin-top: 8pt;
      font-size: 9.5pt;
      color: #115e59;
    }
    .extreme-word {
      font-size: 13pt;
      font-weight: bold;
      color: #be123c;
      background-color: #ffe4e6;
      padding: 1pt 3pt;
    }
    .elevated-word {
      font-size: 11pt;
      font-weight: bold;
      color: #b45309;
      background-color: #fef3c7;
      padding: 1pt 3pt;
    }
    .neutral-word {
      font-size: 9.5pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${bodyHtml}
  </div>
</body>
</html>`.trim();
}

function renderStudentHeader(
  taskTitle: string,
  record: GroupLabRecord,
  mode: WordExportMode
): string {
  const groupText =
    mode === 'filled' && record.groupId
      ? `第 <u>&nbsp;${record.groupId}&nbsp;</u> 小组`
      : mode === 'teacher'
      ? `<u>&nbsp;教师教学参考卷&nbsp;</u>`
      : `第 ________ 小组`;

  return `
    <h1>数字信息鉴别师工作站 · ${taskTitle}</h1>
    <p class="subtitle">高一信息技术《1.3 信息及其特征》随堂探究实验学习单（校园数字信息鉴别师行动）</p>
    <table class="meta-bar">
      <tr>
        <td style="width:28%;">班级：高一（____）班</td>
        <td style="width:24%;">小组编号：${groupText}</td>
        <td style="width:32%;">小组成员：______________________</td>
        <td style="width:16%; text-align:right;">日期：____月____日</td>
      </tr>
    </table>
  `;
}

function renderTask1Section(
  record: GroupLabRecord,
  mode: WordExportMode
): string {
  const { task1 } = record;

  const q1Display =
    mode === 'blank'
      ? '□ 是（价值相同） &nbsp;&nbsp;&nbsp;&nbsp; □ 否（因人而异）'
      : mode === 'teacher'
      ? '□ 是（价值相同） &nbsp;&nbsp;&nbsp;&nbsp; <span class="answer-text">☑ 否（因人而异）</span>'
      : task1.equalValueChoice === 'no'
      ? '□ 是（价值相同） &nbsp;&nbsp;&nbsp;&nbsp; <span class="answer-text">☑ 否（因人而异）</span>'
      : task1.equalValueChoice === 'yes'
      ? '<span class="answer-text">☑ 是（价值相同）</span> &nbsp;&nbsp;&nbsp;&nbsp; □ 否（因人而异）'
      : '□ 是（价值相同） &nbsp;&nbsp;&nbsp;&nbsp; □ 否（因人而异）';

  const q2Display =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;自身需求 / 身份 / 所处阶段与关注点&nbsp;</span>'
      : task1.dependsOnInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task1.dependsOnInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const q3Display =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;随时间递减（越过关键节点后断崖式归零）&nbsp;</span>'
      : task1.timeTrendInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task1.timeTrendInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  return `
    ${renderStudentHeader('【任务一·问诊】时空罗盘实验单', record, mode)}

    <div class="scenario-box">
      <p><strong>📡 探究情境导入（样本编号 #2026-AH-01）：</strong></p>
      <p style="font-size:11pt; font-weight:bold; color:#0f172a;">
        某自媒体发布消息：“安徽省中考改革突发重大调整，部分科目分值全面推倒重来！”
      </p>
      <p style="font-size:9.5pt; color:#334155;">
        实验任务：请结合教室大屏演示或下方【时空罗盘观测数据表】，对比分析这条消息在不同时间节点对三类不同受众的价值变化规律。
      </p>
    </div>

    <h2>步骤一：勾选观察受众并研读时空罗盘数据</h2>
    <p>
      <strong>对比受众群体：</strong>
      ☑ 👨‍🎓 高一学生（已跨过中考） &nbsp;&nbsp;&nbsp;
      ☑ 👨‍👩‍👧 初三学生及家长（正处备考关键期） &nbsp;&nbsp;&nbsp;
      ☑ 🏫 教育机构/培训机构（长线教研跟踪）
    </p>

    <table>
      <thead>
        <tr>
          <th style="width:18%;">受众类别 \\ 时间节点</th>
          ${TIME_NODES.map(
            (n) =>
              `<th style="width:13.6%; ${
                n.isCriticalDivider ? 'background-color:#ffe4e6; color:#9f1239;' : ''
              }">${n.label}<br/><span style="font-size:8.5pt; font-weight:normal;">(${
                n.isCriticalDivider ? '⚡关键分界点' : n.phaseTag
              })</span></th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${(['high1', 'grade9', 'agency'] as const)
          .map((key) => {
            const meta = AUDIENCE_META[key];
            return `
            <tr>
              <td style="font-weight:bold; text-align:center;">${meta.emoji} ${meta.label}</td>
              ${TIME_NODES.map((n) => {
                const v = n.values[key];
                const isPeak = key === 'grade9' && v >= 90;
                const isCliff = key === 'grade9' && n.isCriticalDivider;
                return `<td style="text-align:center; font-weight:bold; ${
                  isPeak
                    ? 'color:#be123c; background-color:#fff1f2;'
                    : isCliff
                    ? 'color:#be123c; background-color:#ffe4e6;'
                    : ''
                }">${v}${isPeak ? ' (峰值)' : isCliff ? ' (断崖下跌!)' : ''}</td>`;
              }).join('')}
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>

    <div class="box">
      <p style="font-size:9.5pt; margin:0;">
        <strong>📈 关键现象观察提示：</strong><br/>
        1. <strong>横向看时间（X轴）：</strong>“初三学生及家长”的信息价值在【中考前一周】攀升至峰值（95），但一旦越过<strong>【⚠️ 中考结束（6月下旬）】</strong>这条关键分界线，数值瞬间断崖式跌至 4 → 2（接近归零）。<br/>
        2. <strong>纵向看受众（Y轴）：</strong>在同一时间节点（如中考前一周），该消息对“初三学生及家长”价值高达 95，对“教育机构”为 70，而对“高一学生”仅为 16。
      </p>
    </div>

    <h2>步骤二：任务一实验结论填空（小组讨论后填写）</h2>
    <div class="box" style="padding:10pt 12pt;">
      <p style="margin:8pt 0; font-size:11pt;">
        <strong>Q1.</strong> 观察同一时间点不同受众的数值差异：<strong>信息是否对所有人都具备同等价值？</strong><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;作答：${q1Display}
      </p>
      <p style="margin:10pt 0; font-size:11pt;">
        <strong>Q2.</strong> 这说明信息的价值具有 <strong><u>相对性</u></strong>，它取决于使用者的 ${q2Display} 。
        <br/><span style="font-size:9pt; color:#64748b;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（思考词提示：自身需求与身份 / 所处阶段与关注点 / 理解与利用能力）</span>
      </p>
      <p style="margin:10pt 0; font-size:11pt;">
        <strong>Q3.</strong> 这同时体现了信息的 <strong><u>时效性</u></strong>：随着时间的推移（尤其是越过关键分界节点后），多数信息的价值呈现 ${q3Display} 趋势。
        <br/><span style="font-size:9pt; color:#64748b;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（思考词提示：随时间递减 / 逐渐衰减甚至断崖式归零）</span>
      </p>
    </div>

    ${
      mode === 'teacher'
        ? `<div class="teacher-box">
            <strong>💡 教师课堂点评要点（任务一）：</strong><br/>
            1. <strong>价值相对性：</strong>“仁者见仁，智者见智”。同一条中考改革消息，因初三考生、高一学生、教培机构的身份与需求不同，其价值截然不同。<br/>
            2. <strong>时效性：</strong>信息具有生命周期。“中考结束”是硬性时间窗口分界线，越过该节点后，信息对当届考生的备考指导价值立刻归零。
          </div>`
        : ''
    }
  `;
}

function renderTask2Section(
  record: GroupLabRecord,
  mode: WordExportMode
): string {
  const { task2 } = record;
  const preset =
    task2.activePresetId === 'zhongkao'
      ? DISSECTION_PRESETS.zhongkao
      : DISSECTION_PRESETS.weather;

  const textA =
    task2.activePresetId === 'custom' && task2.customTextA.trim()
      ? task2.customTextA
      : preset.infoA.content;

  const textB =
    task2.activePresetId === 'custom' && task2.customTextB.trim()
      ? task2.customTextB
      : preset.infoB.content;

  const tokens =
    task2.activePresetId === 'custom' && task2.customTextB.trim()
      ? tokenizeCustomTextB(task2.customTextB)
      : preset.infoB.tokens;

  const verdictDisplay =
    mode === 'blank'
      ? '□ 真实可靠信息 &nbsp;&nbsp;&nbsp; □ 伪信息（夸大/捏造谣言） &nbsp;&nbsp;&nbsp; □ 客观权威公文'
      : mode === 'teacher' || task2.verdictChoice === 'fake'
      ? '□ 真实可靠信息 &nbsp;&nbsp;&nbsp; <span class="answer-text">☑ 伪信息（夸大/捏造谣言）</span> &nbsp;&nbsp;&nbsp; □ 客观权威公文'
      : task2.verdictChoice === 'true'
      ? '<span class="answer-text">☑ 真实可靠信息</span> &nbsp;&nbsp;&nbsp; □ 伪信息（夸大/捏造谣言） &nbsp;&nbsp;&nbsp; □ 客观权威公文'
      : '□ 真实可靠信息 &nbsp;&nbsp;&nbsp; □ 伪信息（夸大/捏造谣言） &nbsp;&nbsp;&nbsp; □ 客观权威公文';

  const causePurpose =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;博取眼球流量 / 商业变现牟利&nbsp;</span>'
      : task2.causePurposeInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task2.causePurposeInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const causeProcess =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;断章取义 / 移花接木 / 夸大数字&nbsp;</span>'
      : task2.causeProcessInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task2.causeProcessInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const charInput =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;真伪性&nbsp;</span>'
      : task2.characteristicInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task2.characteristicInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const actionInput =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;查验权威信源、运用多学科常识交叉核实，不信谣不传谣&nbsp;</span>'
      : task2.actionInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task2.actionInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  return `
    ${renderStudentHeader('【任务二·解剖】多学科真伪鉴别实验单', record, mode)}

    <h2>步骤一：双源快讯样本对照审阅</h2>
    <table>
      <thead>
        <tr>
          <th style="width:50%; background-color:#e0f2fe; color:#0369a1;">🛡️ 信息A · 权威来源（对照基准）</th>
          <th style="width:50%; background-color:#ffe4e6; color:#be123c;">🎯 信息B · 网络热传（待解剖对象）</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="vertical-align:top;">
            <p style="font-size:9pt; color:#475569;"><strong>发布机构：</strong>${escapeHtml(preset.infoA.source)}（${escapeHtml(preset.infoA.publishTime)}）</p>
            <p style="font-size:10.5pt; font-weight:bold; color:#0f172a;">${escapeHtml(textA)}</p>
          </td>
          <td style="vertical-align:top;">
            <p style="font-size:9pt; color:#475569;"><strong>发布来源：</strong>${escapeHtml(preset.infoB.source)}（${escapeHtml(preset.infoB.publishTime)}）</p>
            <p style="font-size:10.5pt; font-weight:bold; color:#881337;">${escapeHtml(textB)}</p>
          </td>
        </tr>
      </tbody>
    </table>

    <h2>步骤二：🔬 三大跨学科解剖模块分析记录</h2>

    <h3>【模块A：语文之眼 —— 分词情绪热力图】（请用笔圈出下方大号加粗的情绪煽动词）</h3>
    <div class="box">
      <p style="line-height:1.9;">
        ${tokens
          .map((t) => {
            if (t.level === 'extreme') {
              return `<span class="extreme-word">【${escapeHtml(t.text)}】</span>`;
            }
            if (t.level === 'elevated') {
              return `<span class="elevated-word">${escapeHtml(t.text)}</span>`;
            }
            return `<span class="neutral-word">${escapeHtml(t.text)}</span>`;
          })
          .join(' ')}
      </p>
      <p style="font-size:9pt; color:#475569; margin-top:4pt;">
        📊 <strong>情绪煽动指数对比：</strong>信息A = <strong>${preset.infoA.sentimentScore}/100（客观平实）</strong> &nbsp;vs&nbsp; 信息B = <strong style="color:#be123c;">${preset.infoB.sentimentScore}/100（极度煽动，滥用感叹号与绝对化词汇）</strong>
      </p>
    </div>

    <h3>【模块B：数学与科学之尺 —— 极值数据与逻辑核查】</h3>
    <table>
      <thead>
        <tr>
          <th style="width:28%;">比对指标</th>
          <th style="width:22%;">权威实测 / 官方基准</th>
          <th style="width:25%;">科学历史 / 制度极值</th>
          <th style="width:25%; background-color:#ffe4e6; color:#be123c;">信息B 夸张宣称值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center; font-weight:bold;">量化数值比对</td>
          <td style="text-align:center; color:#0369a1; font-weight:bold;">${preset.infoB.mathCheck.officialValue}${preset.infoB.mathCheck.claimUnit}</td>
          <td style="text-align:center; color:#047857; font-weight:bold;">${preset.infoB.mathCheck.historicalMaxValue}（${escapeHtml(preset.infoB.mathCheck.historicalMaxLabel)}）</td>
          <td style="text-align:center; color:#be123c; font-weight:bold;">${preset.infoB.mathCheck.claimValue}${preset.infoB.mathCheck.claimUnit}（夸大度：${escapeHtml(preset.infoB.mathCheck.exaggerationFactor)}）</td>
        </tr>
        <tr>
          <td style="text-align:center; font-weight:bold;">科学逻辑漏洞</td>
          <td colspan="3" style="font-size:9.5pt;">
            ${preset.infoB.mathCheck.logicFlaws.map((f) => `• ${escapeHtml(f)}`).join('<br/>')}
          </td>
        </tr>
      </tbody>
    </table>

    <h3>【模块C：信源与社会之镜 —— 传播动机与破绽取证打卡】</h3>
    <div class="box">
      <p style="font-size:9.5pt;">
        • <strong>信息A 权威审核链：</strong>${preset.infoA.provenanceChain.join(' → ')}（动机：${preset.infoA.motive}）<br/>
        • <strong>信息B 造假扩散链：</strong>${preset.infoB.provenanceChain.join(' → ')}（动机：<strong style="color:#be123c;">${preset.infoB.motive}</strong>）
      </p>
      <p style="font-size:9.5pt; margin-top:4pt;">
        <strong>🕵️ 小组取证打卡（请勾选你们在信息B中发现的伪信息破绽）：</strong><br/>
        ${RED_FLAG_OPTIONS.map((f) => {
          const checked =
            mode === 'teacher' ||
            (mode === 'filled' && task2.selectedFlags.includes(f.id));
          return `${checked ? '☑' : '□'} [${f.category}] ${f.label}`;
        }).join(' &nbsp;&nbsp;&nbsp; ')}
      </p>
    </div>

    <h2>步骤三：任务二实验结论填空</h2>
    <div class="box" style="padding:10pt 12pt;">
      <p style="margin:6pt 0; font-size:10.5pt;">
        <strong>Q1. 真伪宣判：</strong>综合语文、数学科学及信源三维度解剖，本组判定<strong>【信息B·网络热传】</strong>属于：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${verdictDisplay}
      </p>
      <p style="margin:8pt 0; font-size:10.5pt;">
        <strong>Q2. 失真成因：</strong>网络伪信息产生的原因主要是传播者出于 ${causePurpose} 的目的故意造假，或在传递过程中因 ${causeProcess} 导致信息失真。
      </p>
      <p style="margin:8pt 0; font-size:10.5pt;">
        <strong>Q3. 特征与对策：</strong>本实验证明信息具有 ${charInput} 特征。面对网络海量信息，我们应当做到 ${actionInput} 。
      </p>
    </div>
  `;
}

function renderTask3Section(
  record: GroupLabRecord,
  mode: WordExportMode
): string {
  const { task3 } = record;

  const q1Display =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;载体依附性&nbsp;</span>'
      : task3.carrierConceptInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task3.carrierConceptInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const q2Display =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;共享性&nbsp;</span>'
      : task3.sharingConceptInput.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task3.sharingConceptInput)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  const sloganDisplay =
    mode === 'blank'
      ? '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'
      : mode === 'teacher'
      ? '<span class="answer-text">&nbsp;溯源求证辨真伪，理性思辨做智者！（合理即可）&nbsp;</span>'
      : task3.groupSlogan.trim()
      ? `<span class="answer-text">&nbsp;${escapeHtml(task3.groupSlogan)}&nbsp;</span>`
      : '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';

  return `
    ${renderStudentHeader('【任务三·建构】信息特征图谱与行动宣言实验单', record, mode)}

    <h2>知识底座：《1.3 信息及其特征》五大核心特征速览</h2>
    <table>
      <thead>
        <tr>
          ${INFORMATION_FEATURES.map(
            (f, i) => `<th style="width:20%;">0${i + 1}. ${f.key}<br/><span style="font-size:8.5pt; font-weight:normal;">(${f.keyword})</span></th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${INFORMATION_FEATURES.map(
            (f) => `<td style="font-size:9pt; vertical-align:top;">${f.desc}</td>`
          ).join('')}
        </tr>
      </tbody>
    </table>

    <h2>步骤一：校园真实情境 · 信息特征对号入座（请勾选或填写对应特征）</h2>
    <table>
      <thead>
        <tr>
          <th style="width:62%;">校园真实情境描述</th>
          <th style="width:38%;">匹配最突出的【信息特征】（五选一）</th>
        </tr>
      </thead>
      <tbody>
        ${CAMPUS_CASES.map((item) => {
          const chosen = task3.caseMatches[item.id];
          let rightCell = '';
          if (mode === 'blank') {
            rightCell = INFORMATION_FEATURES.map((f) => `□ ${f.key}`).join(' &nbsp; ');
          } else if (mode === 'teacher') {
            rightCell = `<span class="answer-text">☑ ${item.correctFeature}</span><br/><span style="font-size:8.5pt; color:#475569;">解析：${item.explanation}</span>`;
          } else {
            rightCell = INFORMATION_FEATURES.map((f) =>
              chosen === f.key
                ? `<span class="answer-text">☑ ${f.key}</span>`
                : `□ ${f.key}`
            ).join(' &nbsp; ');
          }

          return `
            <tr>
              <td><strong>${item.title}：</strong>${item.scenario}</td>
              <td>${rightCell}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <h2>步骤二：核心概念体系补全与本组鉴别行动宣言</h2>
    <div class="box" style="padding:10pt 12pt;">
      <p style="margin:6pt 0; font-size:10.5pt;">
        <strong>Q1.</strong> 书本上的文字、广播里的声音、网页上的图表本身并不是信息，而是信息的载体。信息不能独立存在，必须依附于一定的载体，这体现了信息的 ${q1Display} 。
      </p>
      <p style="margin:8pt 0; font-size:10.5pt;">
        <strong>Q2.</strong> 萧伯纳曾说：“你有一个苹果，我有一个苹果，彼此交换后每人仍是一个苹果；但你有一种思想，我有一种思想，彼此交换后每人便有了两种思想。”这生动体现了信息的 ${q2Display} 。
      </p>
      <p style="margin:8pt 0; font-size:10pt;">
        <strong>Q3. 签署本组《校园数字信息鉴别师·四步行动准则》（请打勾确认）：</strong><br/>
        ${PLEDGE_ITEMS.map((p) => {
          const isChecked =
            mode === 'teacher' ||
            (mode === 'filled' && task3.selectedPledges.includes(p));
          return `${isChecked ? '☑' : '□'} ${p}`;
        }).join('<br/>')}
      </p>
      <p style="margin:10pt 0 4pt 0; font-size:10.5pt;">
        <strong>🏆 撰写本组专属“校园数字信息鉴别行动口号”：</strong><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;“ ${sloganDisplay} ”
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
