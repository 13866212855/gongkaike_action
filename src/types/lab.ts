export type AudienceKey = 'high1' | 'grade9' | 'agency';

export type TaskId = 'task1' | 'task2' | 'task3';

export interface Task1Data {
  selectedAudiences: AudienceKey[];
  timeNodeIndex: number;
  equalValueChoice: 'yes' | 'no' | '';
  dependsOnInput: string;
  timeTrendInput: string;
}

export interface Task2Data {
  activePresetId: 'weather' | 'zhongkao' | 'custom';
  customTextA: string;
  customTextB: string;
  isDissected: boolean;
  selectedFlags: string[];
  verdictChoice: 'true' | 'fake' | 'partial' | '';
  causePurposeInput: string;
  causeProcessInput: string;
  characteristicInput: string;
  actionInput: string;
}

export interface Task3Data {
  caseMatches: Record<string, string>;
  carrierConceptInput: string;
  sharingConceptInput: string;
  selectedPledges: string[];
  groupSlogan: string;
}

export interface GroupLabRecord {
  groupId: string;
  task1: Task1Data;
  task2: Task2Data;
  task3: Task3Data;
  lastUpdated: string;
}

export interface TimeNodeInfo {
  index: number;
  label: string;
  shortDate: string;
  phaseTag: string;
  isCriticalDivider?: boolean;
  values: Record<AudienceKey, number>;
  descriptions: Record<AudienceKey, string>;
}

export interface WordToken {
  text: string;
  level: 'extreme' | 'elevated' | 'neutral';
  category?: string;
  tooltip?: string;
}

export interface DissectionPreset {
  id: 'weather' | 'zhongkao';
  name: string;
  topicBadge: string;
  infoA: {
    source: string;
    publishTime: string;
    content: string;
    sentimentScore: number;
    keyFacts: string[];
    provenanceChain: string[];
    motive: string;
  };
  infoB: {
    source: string;
    publishTime: string;
    content: string;
    sentimentScore: number;
    tokens: WordToken[];
    mathCheck: {
      claimLabel: string;
      claimValue: number;
      claimUnit: string;
      officialLabel: string;
      officialValue: number;
      historicalMaxLabel: string;
      historicalMaxValue: number;
      exaggerationFactor: string;
      scientificVerdict: string;
      logicFlaws: string[];
    };
    provenanceChain: string[];
    motive: string;
  };
}
