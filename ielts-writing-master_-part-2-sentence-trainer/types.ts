
export enum EssaySection {
  INTRODUCTION = 'Introduction',
  BODY_1 = 'Body Paragraph 1',
  BODY_2 = 'Body Paragraph 2',
  CONCLUSION = 'Conclusion'
}

export interface WritingTask {
  vietnamese: string;
  topic: string;
  section: EssaySection;
  context: string;
}

export interface Feedback {
  originalTranslation: string;
  band7Suggestion: string;
  band8PlusSuggestion: string;
  grammaticalAnalysis: string[];
  vocabularyUpgrades: { word: string; improvement: string; explanation: string }[];
  cohesionAdvice: string;
}

export interface HistoryItem {
  id: string;
  task: WritingTask;
  userTranslation: string;
  feedback: Feedback;
  timestamp: number;
}
