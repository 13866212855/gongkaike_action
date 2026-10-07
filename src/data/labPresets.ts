import { AudienceKey, DissectionPreset, TimeNodeInfo, WordToken } from '../types/lab';

export const AUDIENCE_META: Record<
  AudienceKey,
  {
    key: AudienceKey;
    label: string;
    emoji: string;
    roleDesc: string;
    colorHex: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    activeRingClass: string;
  }
> = {
  high1: {
    key: 'high1',
    label: '高一学生',
    emoji: '👨‍🎓',
    roleDesc: '已跨过中考阶段，正在就读高中一年级',
    colorHex: '#0284c7', // Sky 600
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-700',
    activeRingClass: 'ring-2 ring-sky-500 bg-sky-50 border-sky-600 text-sky-900',
  },
  grade9: {
    key: 'grade9',
    label: '初三学生及家长',
    emoji: '👨‍👩‍👧',
    roleDesc: '正处于备战中考关键期，切身利益高度相关',
    colorHex: '#e11d48', // Rose 600
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-700',
    activeRingClass: 'ring-2 ring-rose-500 bg-rose-50 border-rose-600 text-rose-900',
  },
  agency: {
    key: 'agency',
    label: '教育机构/培训机构',
    emoji: '🏫',
    roleDesc: '需长期追踪考情变化以调整教研与课程体系',
    colorHex: '#059669', // Emerald 600
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-700',
    activeRingClass: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-600 text-emerald-900',
  },
};

export const TIME_NODES: TimeNodeInfo[] = [
  {
    index: 0,
    label: '现在（3月）',
    shortDate: '3月中旬',
    phaseTag: '消息初传期',
    values: {
      high1: 15,
      grade9: 60,
      agency: 50,
    },
    descriptions: {
      high1: '高一学生已完成中考，仅作为校园茶余饭后的谈资，价值指数维持低位（15）。',
      grade9: '初三学生与家长高度敏感，密切关注是否影响今年复习方向，价值指数较高（60）。',
      agency: '教研团队开始收集风向信息，评估是否需要储备新教案，价值指数中等（50）。',
    },
  },
  {
    index: 1,
    label: '中考前一个月（5月）',
    shortDate: '5月中旬',
    phaseTag: '一模冲刺期',
    values: {
      high1: 18,
      grade9: 78,
      agency: 63,
    },
    descriptions: {
      high1: '偶尔听说学弟学妹备考动态，对自身学习规划几乎无实质影响（18）。',
      grade9: '进入志愿填报与冲刺复习阶段，对分值调整相关消息极度渴望核实（78）。',
      agency: '需要针对考前冲刺班调整押题与复习配比，信息参考价值持续上升（63）。',
    },
  },
  {
    index: 2,
    label: '中考前一周（6月）',
    shortDate: '6月上旬',
    phaseTag: '考前峰值期',
    values: {
      high1: 16,
      grade9: 95,
      agency: 70,
    },
    descriptions: {
      high1: '学校准备布置考点，高一学生仅关注放假调休安排，对改革内容本身关注度低（16）。',
      grade9: '临考前夕焦虑与关注度达到顶点！任何考纲与分值变动都牵动全家神经（95·峰值）。',
      agency: '考前最后阶段教研辅导密集调用相关政策分析，价值达到阶段高点（70）。',
    },
  },
  {
    index: 3,
    label: '中考进行中（6月中）',
    shortDate: '6月14-16日',
    phaseTag: '实战检验期',
    values: {
      high1: 14,
      grade9: 85,
      agency: 66,
    },
    descriptions: {
      high1: '高一学生居家自习，偶有浏览相关新闻（14）。',
      grade9: '正在考场应试，结合实际试卷验证此前传闻，关注度依然处于高位（85）。',
      agency: '实时跟进各科真题分值结构，准备发布考后试卷解析（66）。',
    },
  },
  {
    index: 4,
    label: '中考结束（6月下旬）',
    shortDate: '6月下旬',
    phaseTag: '关键分界点',
    isCriticalDivider: true,
    values: {
      high1: 12,
      grade9: 4,
      agency: 42,
    },
    descriptions: {
      high1: '高一面临期末统考，中考改革消息几乎无人问津（12）。',
      grade9: '⚠️ 越过“中考结束”分界线！考试大局已定，该消息对本届初三考生的指导价值瞬间断崖式归零（4）！',
      agency: '本届考试虽结束，但机构需复盘今年政策以规划下一届暑期课程，仍具研究价值（42）。',
    },
  },
  {
    index: 5,
    label: '中考后一个月（7月）',
    shortDate: '7月下旬',
    phaseTag: '尘埃落定期',
    values: {
      high1: 10,
      grade9: 2,
      agency: 30,
    },
    descriptions: {
      high1: '即将升入高二，该条旧消息已彻底沦为历史背景（10）。',
      grade9: '录取结果已出，准高一新生转向高中衔接，旧中考传闻价值趋近于零（2）。',
      agency: '沉淀为历年政策案例库资料，供长线教研参考，保留基础研究价值（30）。',
    },
  },
];

export const DISSECTION_PRESETS: Record<'weather' | 'zhongkao', DissectionPreset> = {
  weather: {
    id: 'weather',
    name: '案例一：气象寒潮预警对比（教材经典情境）',
    topicBadge: '气象局快讯 vs 网络热传谣言',
    infoA: {
      source: '安徽省气象台 · 权威政务发布',
      publishTime: '今日 08:00 签发（编号：2026-HC-04）',
      content:
        '【强冷空气消息】受北方强冷空气南下影响，预计未来48小时我市日平均气温将下降8～10℃，偏北风力增至4～5级、阵风7级。21日早晨最低气温可达-2～0℃，请市民注意添衣保暖，相关部门做好农林业防冻及交通保障工作。',
      sentimentScore: 8,
      keyFacts: ['降温幅度：48小时下降 8～10℃', '极端低温：最低 -2～0℃', '风力等级：阵风 7 级'],
      provenanceChain: ['卫星与地面气象站实测', '省市首席预报员联合会商', '国家突发事件预警信息网发布'],
      motive: '公共气象防灾减灾服务 · 严谨客观、零商业利益',
    },
    infoB: {
      source: '“本地百事通快报” · 匿名自媒体账号',
      publishTime: '今日 09:15 群聊疯传',
      content:
        '🔥震惊！百年一遇“超级极寒暴雪”今晚突袭本市！气温狂跌30度瞬间冰封，全城学校紧急停课停工！大家赶紧去超市抢购囤粮，晚了连菜叶都买不到了！速转给相亲相爱一家人，不转不是本地人！',
      sentimentScore: 94,
      tokens: [
        { text: '🔥震惊！', level: 'extreme', category: '情绪煽动', tooltip: '典型标题党感叹词，利用惊叹号制造心理冲击' },
        { text: '百年一遇', level: 'extreme', category: '极端夸大', tooltip: '无气象统计依据的极端定语，渲染罕见恐慌' },
        { text: '“超级极寒暴雪”', level: 'extreme', category: '伪造概念', tooltip: '气象学并无“超级极寒暴雪”这一法定预警等级' },
        { text: '今晚突袭本市！', level: 'elevated', category: '紧迫暗示', tooltip: '制造时间紧迫感，剥夺读者求证时间' },
        { text: '气温', level: 'neutral' },
        { text: '狂跌30度', level: 'extreme', category: '数据造假', tooltip: '将正常的8~10℃降温夸大3倍至30℃，违背气候常识' },
        { text: '瞬间冰封', level: 'extreme', category: '影视化夸张', tooltip: '用灾难片词汇替代科学气象描述' },
        { text: '，', level: 'neutral' },
        { text: '全城学校', level: 'neutral' },
        { text: '紧急停课停工！', level: 'extreme', category: '伪造政令', tooltip: '假冒教育与市政部门发布停课停工指令' },
        { text: '大家', level: 'neutral' },
        { text: '赶紧去超市抢购囤粮', level: 'extreme', category: '行为煽动', tooltip: '直接诱导非理性抢购行为，扰乱社会秩序' },
        { text: '，', level: 'neutral' },
        { text: '晚了连菜叶都买不到了！', level: 'elevated', category: '焦虑贩卖', tooltip: '制造物资匮乏恐慌' },
        { text: '速转给相亲相爱一家人', level: 'elevated', category: '裂变诱导', tooltip: '利用亲情绑架促进微信群病毒式转发' },
        { text: '，', level: 'neutral' },
        { text: '不转不是本地人！', level: 'extreme', category: '道德绑架', tooltip: '经典谣言结尾话术，强迫受众转发' },
      ],
      mathCheck: {
        claimLabel: '信息B宣称降温幅度',
        claimValue: 30,
        claimUnit: '℃',
        officialLabel: '气象局实测预报降温',
        officialValue: 9,
        historicalMaxLabel: '本地近50年单次最大降温极值',
        historicalMaxValue: 14.2,
        exaggerationFactor: '3.3 倍',
        scientificVerdict: '严重违背大气物理与本地气候历史极值规律',
        logicFlaws: [
          '【数据极值谬误】30℃降温意味着从20℃直接跌至-10℃，超过本地50年气象记录极值（14.2℃）两倍以上。',
          '【因果逻辑断裂】仅凭常规冷空气过程便捏造“全城停课停工”，无任何教育局或市政府红头文件编号。',
          '【利益诱导闭环】文末常挂载团购卖菜或羽绒服带货链接，通过制造恐慌收割流量。',
        ],
      },
      provenanceChain: ['截取外地往年暴雪旧图', '自媒体使用夸张话术改写数字', '微信群“熟人转发”裂变扩散'],
      motive: '博取眼球赚取流量补贴 / 诱导超市抢购与直播带货变现',
    },
  },
  zhongkao: {
    id: 'zhongkao',
    name: '案例二：中考改革政策对比（呼应任务一情境）',
    topicBadge: '教育厅官方文件 vs 自媒体焦虑爆文',
    infoA: {
      source: '安徽省教育厅 · 官方网站政策解读专栏',
      publishTime: '2026年3月10日 正式发布',
      content:
        '【省教育厅通知】为稳妥推进初中学业水平考试改革，我省坚持“三年早知道”原则，本届九年级（初三）考试科目与分值保持稳定不变；新一轮实验操作计分调整方案将从新入学七年级新生起逐步实施。',
      sentimentScore: 6,
      keyFacts: ['实施原则：“三年早知道”平稳过渡', '本届初三：科目与总分值 0 变动', '适用对象：新入学七年级起逐步实施'],
      provenanceChain: ['教育部课程标准指导', '省教育厅专家组调研论证', '省教育厅官网实名公开发布'],
      motive: '权威政务信息公开 · 稳定考生与家长预期',
    },
    infoB: {
      source: '“名师升学内幕大揭秘” · 营销号爆文',
      publishTime: '今日凌晨 朋友圈热传',
      content:
        '💥重磅炸弹！安徽中考突发大洗牌，今年所有科目分值全面推倒重来！物理化学暴涨50分，原来的复习全部作废！无数家长彻夜难眠痛哭！最后99份《内部绝密押题卷》限时秒杀，不看孩子彻底掉队！',
      sentimentScore: 96,
      tokens: [
        { text: '💥重磅炸弹！', level: 'extreme', category: '情绪煽动', tooltip: '用爆炸性词汇吸引家长点击' },
        { text: '安徽中考', level: 'neutral' },
        { text: '突发大洗牌', level: 'extreme', category: '制造恐慌', tooltip: '教育政策讲究稳定性，绝不会临考前“突发大洗牌”' },
        { text: '，今年所有科目分值', level: 'neutral' },
        { text: '全面推倒重来！', level: 'extreme', category: '绝对化造假', tooltip: '违背“三年早知道”原则，故意移花接木适用年级' },
        { text: '物理化学', level: 'neutral' },
        { text: '暴涨50分', level: 'extreme', category: '数据造假', tooltip: '捏造具体分值变动数据，增强欺骗性' },
        { text: '，原来的复习', level: 'neutral' },
        { text: '全部作废！', level: 'extreme', category: '焦虑放大', tooltip: '全盘否定学生既有努力，击穿家长心理防线' },
        { text: '无数家长', level: 'neutral' },
        { text: '彻夜难眠痛哭！', level: 'elevated', category: '共情操纵', tooltip: '虚构群体焦虑场景，引发从众恐慌' },
        { text: '最后99份《内部绝密押题卷》', level: 'extreme', category: '商业收割', tooltip: '图穷匕见！造谣的真正目的是售卖高价资料' },
        { text: '限时秒杀，', level: 'elevated', category: '饥饿营销', tooltip: '促成冲动付费转化' },
        { text: '不看孩子彻底掉队！', level: 'extreme', category: '恐吓营销', tooltip: '利用家长望子成龙心理进行恐吓式推销' },
      ],
      mathCheck: {
        claimLabel: '信息B宣称今年分值变动面',
        claimValue: 100,
        claimUnit: '%',
        officialLabel: '官方文件今年初三分值变动',
        officialValue: 0,
        historicalMaxLabel: '重大高考/中考改革提前公示期（月）',
        historicalMaxValue: 36,
        exaggerationFactor: '无中生有（移花接木）',
        scientificVerdict: '违背国家教育考试“三年早知道”法定公示期要求',
        logicFlaws: [
          '【时空偷换谬误】将针对未来七年级新生的远期探讨方案，偷换概念说成“今年初三立刻执行”。',
          '【常识制度冲突】中高考政策调整有严格的36个月（三年）提前公示制度，绝不可能在考前3个月“推倒重来”。',
          '【商业利益暴露】前半篇制造恐慌，后半篇兜售“99份绝密押题卷”，属于典型的焦虑营销闭环。',
        ],
      },
      provenanceChain: ['截取政策文件局部字眼', '偷换适用年级与时间节点', '挂载高价教辅链接群发'],
      motive: '制造升学焦虑 · 推销高价“内部押题卷”与培训课牟利',
    },
  },
};

export const RED_FLAG_OPTIONS = [
  { id: 'flag_emotion', label: '滥用震惊/感叹号等极端情绪词', category: '语言特征' },
  { id: 'flag_data', label: '数据违背科学常识或历史极值', category: '数据逻辑' },
  { id: 'flag_source', label: '无权威机构署名，信源模糊匿名', category: '信源核查' },
  { id: 'flag_forward', label: '包含“速转/不转不是中国人”等道德绑架话术', category: '传播话术' },
  { id: 'flag_profit', label: '暗藏抢购、秒杀、卖课等商业利益诱导', category: '动机透视' },
];

export interface CampusCaseItem {
  id: string;
  title: string;
  scenario: string;
  correctFeature: string;
  explanation: string;
}

export const INFORMATION_FEATURES = [
  {
    key: '载体依附性',
    desc: '信息不能独立存在，必须依附于文字、声音、图像、电磁波等具体载体才能表现和传播。',
    keyword: '必有媒介承载',
  },
  {
    key: '价值相对性',
    desc: '信息具有价值，但同一条信息对不同身份、不同需求的使用者而言，其价值大小截然不同。',
    keyword: '因人因需而异',
  },
  {
    key: '时效性',
    desc: '信息的价值往往随时间推移而衰减，一旦超过特定时间节点，信息可能瞬间失去原有效用。',
    keyword: '随时间动态变化',
  },
  {
    key: '共享性',
    desc: '信息不同于物质与能量，它可以被多个接收者同时共用而不会产生损耗，甚至在交流中增值。',
    keyword: '无损复制与分享',
  },
  {
    key: '真伪性',
    desc: '由于认知局限、传递失误或人为捏造，信息存在真实与虚假之分，需要多维交叉核验。',
    keyword: '去伪存真需鉴别',
  },
];

export const CAMPUS_CASES: CampusCaseItem[] = [
  {
    id: 'case1',
    title: '案例 01 · 校园广播与电子班牌通知',
    scenario:
      '学校教务处发布“周五下午开展春季社团招新”的通知，既通过校园广播播放语音，又在教学楼电子班牌显示文字海报。',
    correctFeature: '载体依附性',
    explanation:
      '通知内容（信息）不能凭空存在，必须依附于广播声波、屏幕文字与图像（载体）才能被师生接收，体现了信息的【载体依附性】。',
  },
  {
    id: 'case2',
    title: '案例 02 · 班级学霸笔记网盘共享',
    scenario:
      '高一（3）班信息技术课代表将整理好的《Python算法思维导图》上传至班级共享云盘，全班48名同学全部下载学习，原文件依然完好无损。',
    correctFeature: '共享性',
    explanation:
      '苹果分给别人自己就少了，但数字信息分享给全班同学后，原持有者并未失去它，体现了信息区别于物质的【共享性】。',
  },
  {
    id: 'case3',
    title: '案例 03 · 食堂二楼今日特价窗口播报',
    scenario:
      '中午11:50校园群播报“二楼3号窗口糖醋排骨今日半价且无需排队”，但王同学下午14:30才看到这条消息赶去食堂，窗口早已收餐。',
    correctFeature: '时效性',
    explanation:
      '路况、气象、餐饮排队等信息具有极强的生命周期，一旦越过时间窗口，信息价值便大幅衰减甚至归零，体现了【时效性】。',
  },
  {
    id: 'case4',
    title: '案例 04 · 高三百日誓师与高一选科讲座',
    scenario:
      '学校公告栏同时张贴了《高三高考志愿填报指南》和《高一新高考3+1+2选科指导》，高一同学纷纷驻足细读后者，对前者则匆匆略过。',
    correctFeature: '价值相对性',
    explanation:
      '同一公告栏上的信息，因高一与高三学生的当前阶段需求不同，产生的价值截然不同，“仁者见仁、智者见智”体现了【价值相对性】。',
  },
  {
    id: 'case5',
    title: '案例 05 · 朋友圈疯传“下周全校连放七天假”',
    scenario:
      '某同学将往年国庆放假通知截图P图修改日期后发到群里，引发轰动；班主任引导大家登录学校官网核对校历，当场识破该虚假截图。',
    correctFeature: '真伪性',
    explanation:
      '经过人为篡改或断章取义的信息会变为伪信息，必须通过权威渠道交叉核实，体现了信息的【真伪性】。',
  },
];

export const PLEDGE_ITEMS = [
  '【查信源】遇到突发夸张消息，第一时间核查政务官网、权威媒体或学校官方通知，不轻信匿名截图。',
  '【看逻辑】运用多学科常识审视文中的数据与因果关系，警惕“百年一遇”“100%作废”等绝对化极端词汇。',
  '【辨动机】识别文章末尾是否暗藏“限时秒杀”“付费进群”“强制转发”等流量变现与情绪操纵陷阱。',
  '【止谣言】坚持“未知全貌、不予置评”，做到不造谣、不信谣、不传谣，争当理性负责的校园数字公民。',
];

/**
 * Helper to dynamically tokenize custom text B if the teacher enters custom text in class.
 */
export function tokenizeCustomTextB(rawText: string): WordToken[] {
  const extremeKeywords = [
    '震惊',
    '百年一遇',
    '狂跌',
    '暴涨',
    '瞬间冰封',
    '紧急停课',
    '抢购',
    '速转',
    '推倒重来',
    '全部作废',
    '重磅炸弹',
    '绝密',
    '秒杀',
    '彻底掉队',
    '不转不是',
    '突发重大',
    '大洗牌',
    '恐慌',
    '必看',
    '惊天',
  ];

  // Split by regex preserving matched keywords and punctuation chunks
  const pattern = new RegExp(`(${extremeKeywords.join('|')}|[，。！？；、“”])`, 'g');
  const parts = rawText.split(pattern).filter(Boolean);

  return parts.map((part) => {
    const isExtreme = extremeKeywords.some((kw) => part.includes(kw));
    if (isExtreme) {
      return {
        text: part,
        level: 'extreme',
        category: '高危夸大/煽动词',
        tooltip: '系统检测到情绪煽动或绝对化夸张表述',
      };
    }
    if (part.includes('！') || part.includes('!')) {
      return {
        text: part,
        level: 'elevated',
        category: '情绪强化标点',
        tooltip: '密集使用感叹号强化焦虑情绪',
      };
    }
    return {
      text: part,
      level: 'neutral',
    };
  });
}
