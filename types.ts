export enum View {
  FIELD_SELECTION = 'FIELD_SELECTION',
  ALL_QUESTIONS = 'ALL_QUESTIONS',
  QUESTION_FLOW = 'QUESTION_FLOW',
  CUSTOM_DESCRIPTION = 'CUSTOM_DESCRIPTION',
  CUSTOM_ADD = 'CUSTOM_ADD',
  PRACTICE_START = 'PRACTICE_START',
}

export enum QuestionCategory {
  UX_DESIGN = 'UX Design',
  ENGINEERING = 'Engineering',
  DATA_ANALYTICS = 'Data Analytics',
  CYBERSECURITY = 'Cybersecurity',
  CUSTOM = 'Custom field of your practice here',
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  type: 'Background' | 'Situational' | 'Technical' | 'Custom question';
  answer?: string; // Optional answer for custom questions
}

export interface Recording {
  id: string;
  questionId: string;
  questionText: string;
  date: Date;
  transcript: string;
  type: 'Video' | 'Audio' | 'Text';
  durationSeconds?: number;
}
