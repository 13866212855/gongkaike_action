import { PLEDGE_ITEMS } from '../data/labPresets';
import { GroupLabRecord } from '../types/lab';

const STORAGE_PREFIX = 'campus_info_appraiser_v1_group_';

/**
 * Reads all group records stored in current browser's localStorage
 */
export function getLocalGroupRecords(): GroupLabRecord[] {
  const list: GroupLabRecord[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as GroupLabRecord;
          if (parsed && parsed.groupId) {
            list.push(parsed);
          }
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return list;
}

/**
 * Syncs a single group's record to backend server and localStorage
 */
export async function syncGroupReportToServer(
  record: GroupLabRecord,
  isExportedReport = false
): Promise<GroupLabRecord> {
  const nowStr = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const cleanId = String(record.groupId || '1').trim() || '1';
  const payload: GroupLabRecord = {
    ...record,
    groupId: cleanId,
    lastUpdated: record.lastUpdated || nowStr,
    submittedAt: isExportedReport ? nowStr : record.submittedAt,
    isExportedReport: Boolean(isExportedReport || record.isExportedReport),
  };

  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${cleanId}`,
      JSON.stringify(payload)
    );
  } catch {
    // Ignore
  }

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.report) return data.report;
    }
  } catch {
    // Offline fallback uses localStorage
  }

  return payload;
}

/**
 * Fetches all group reports from server and merges any local browser records
 */
export async function fetchAllGroupReports(): Promise<GroupLabRecord[]> {
  const localRecords = getLocalGroupRecords();
  const mergedMap: Record<string, GroupLabRecord> = {};

  for (const r of localRecords) {
    mergedMap[r.groupId] = r;
  }

  try {
    // If we have local records, also push them to server so server is up to date
    if (localRecords.length > 0) {
      await fetch('/api/reports/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: localRecords }),
      });
    }

    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.reports)) {
        for (const r of data.reports) {
          if (r && r.groupId) {
            mergedMap[r.groupId] = r;
          }
        }
      }
    }
  } catch {
    // Ignore network error and use localRecords
  }

  return Object.values(mergedMap).sort((a, b) =>
    String(a.groupId).localeCompare(String(b.groupId), 'zh-CN', {
      numeric: true,
    })
  );
}

/**
 * Deletes a single group report from server and localStorage
 */
export async function deleteGroupReport(groupId: string): Promise<void> {
  const cleanId = String(groupId).trim();
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${cleanId}`);
  } catch {
    // Ignore
  }
  try {
    await fetch(`/api/reports/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
    });
  } catch {
    // Ignore
  }
}

/**
 * Clears all group reports from server and localStorage
 */
export async function clearAllGroupReports(): Promise<void> {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore
  }
  try {
    await fetch('/api/reports', { method: 'DELETE' });
  } catch {
    // Ignore
  }
}

/**
 * Generates 6 realistic student group records for classroom demonstration / testing
 */
export async function seedDemoGroupReports(): Promise<GroupLabRecord[]> {
  const demoGroups: GroupLabRecord[] = [
    {
      groupId: '1',
      lastUpdated: '10:15:22',
      submittedAt: '10:15:22',
      isExportedReport: true,
      task1: {
        selectedAudiences: ['high1', 'grade9', 'agency'],
        timeNodeIndex: 4,
        equalValueChoice: 'no',
        dependsOnInput: '自身需求与身份',
        timeTrendInput: '随时间递减（衰减）',
      },
      task2: {
        activePresetId: 'weather',
        customTextA: '',
        customTextB: '',
        isDissected: true,
        selectedFlags: [
          'flag_emotion',
          'flag_data',
          'flag_source',
          'flag_forward',
          'flag_profit',
        ],
        verdictChoice: 'fake',
        causePurposeInput: '博取眼球赚取流量与商业变现',
        causeProcessInput: '断章取义、夸大数字',
        characteristicInput: '真伪性',
        actionInput: '追溯权威信源、结合多学科常识交叉核验，不信谣不传谣',
      },
      task3: {
        caseMatches: {
          case1: '载体依附性',
          case2: '共享性',
          case3: '时效性',
          case4: '价值相对性',
          case5: '真伪性',
        },
        carrierConceptInput: '载体依附性',
        sharingConceptInput: '共享性',
        selectedPledges: [...PLEDGE_ITEMS],
        groupSlogan: '溯源求证辨真伪，理性思辨做智者！',
      },
    },
    {
      groupId: '2',
      lastUpdated: '10:16:05',
      submittedAt: '10:16:05',
      isExportedReport: true,
      task1: {
        selectedAudiences: ['grade9', 'agency'],
        timeNodeIndex: 4,
        equalValueChoice: 'no',
        dependsOnInput: '所处阶段与关注点',
        timeTrendInput: '先升后断崖式下跌',
      },
      task2: {
        activePresetId: 'weather',
        customTextA: '',
        customTextB: '',
        isDissected: true,
        selectedFlags: ['flag_emotion', 'flag_data', 'flag_forward'],
        verdictChoice: 'fake',
        causePurposeInput: '制造恐慌吸引关注',
        causeProcessInput: '移花接木、夸大降温极值',
        characteristicInput: '真伪性',
        actionInput: '查看省气象局等官方发布渠道',
      },
      task3: {
        caseMatches: {
          case1: '载体依附性',
          case2: '共享性',
          case3: '时效性',
          case4: '价值相对性',
          case5: '真伪性',
        },
        carrierConceptInput: '载体依附性',
        sharingConceptInput: '共享性',
        selectedPledges: [PLEDGE_ITEMS[0], PLEDGE_ITEMS[1], PLEDGE_ITEMS[3]],
        groupSlogan: '不畏浮云遮望眼，科学求真破谣言！',
      },
    },
    {
      groupId: '3',
      lastUpdated: '10:16:48',
      submittedAt: '10:16:48',
      isExportedReport: true,
      task1: {
        selectedAudiences: ['high1', 'grade9', 'agency'],
        timeNodeIndex: 5,
        equalValueChoice: 'no',
        dependsOnInput: '需求与角色身份',
        timeTrendInput: '逐渐降低甚至归零',
      },
      task2: {
        activePresetId: 'zhongkao',
        customTextA: '',
        customTextB: '',
        isDissected: true,
        selectedFlags: ['flag_emotion', 'flag_data', 'flag_source', 'flag_profit'],
        verdictChoice: 'fake',
        causePurposeInput: '售卖焦虑推销高价押题卷',
        causeProcessInput: '偷换概念、移花接木',
        characteristicInput: '真伪性',
        actionInput: '以教育厅官网红头文件为准，拒绝焦虑营销',
      },
      task3: {
        caseMatches: {
          case1: '载体依附性',
          case2: '共享性',
          case3: '价值相对性', // Intentional minor mistake on case 3 for realistic analytics
          case4: '价值相对性',
          case5: '真伪性',
        },
        carrierConceptInput: '载体依附性',
        sharingConceptInput: '共享性',
        selectedPledges: [...PLEDGE_ITEMS],
        groupSlogan: '擦亮数字鉴别慧眼，守护清朗智慧校园！',
      },
    },
    {
      groupId: '4',
      lastUpdated: '10:17:19',
      submittedAt: '10:17:19',
      isExportedReport: true,
      task1: {
        selectedAudiences: ['high1', 'grade9', 'agency'],
        timeNodeIndex: 2,
        equalValueChoice: 'no',
        dependsOnInput: '使用者的需求',
        timeTrendInput: '随时间递减',
      },
      task2: {
        activePresetId: 'weather',
        customTextA: '',
        customTextB: '',
        isDissected: true,
        selectedFlags: ['flag_emotion', 'flag_data', 'flag_source', 'flag_forward'],
        verdictChoice: 'fake',
        causePurposeInput: '博取流量补贴',
        causeProcessInput: '断章取义、编造极端数字',
        characteristicInput: '真伪性',
        actionInput: '多学科交叉验证，不盲目转发群聊消息',
      },
      task3: {
        caseMatches: {
          case1: '载体依附性',
          case2: '共享性',
          case3: '时效性',
          case4: '价值相对性',
          case5: '真伪性',
        },
        carrierConceptInput: '载体依附性',
        sharingConceptInput: '共享性',
        selectedPledges: [PLEDGE_ITEMS[0], PLEDGE_ITEMS[2], PLEDGE_ITEMS[3]],
        groupSlogan: '把握信息时效脉搏，做理性负责的数字公民！',
      },
    },
  ];

  try {
    for (const g of demoGroups) {
      window.localStorage.setItem(`${STORAGE_PREFIX}${g.groupId}`, JSON.stringify(g));
    }
    await fetch('/api/reports/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: demoGroups }),
    });
  } catch {
    // Ignore
  }

  return fetchAllGroupReports();
}
