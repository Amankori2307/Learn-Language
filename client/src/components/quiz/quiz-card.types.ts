import type { LanguageEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizExample {
  originalScript: string;
  pronunciation: string;
  meaning: string;
}

export interface QuizResult {
  isCorrect: boolean;
  correctAnswer: {
    id?: number;
    originalScript: string;
    english: string;
    transliteration: string;
    audioUrl?: string | null;
    exampleSentences: string[];
  };
  examples: QuizExample[];
}

export interface QuizPromptPanelProps {
  wordId?: number;
  question: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  language?: LanguageEnum;
  imageUrl?: string | null;
  type: QuizQuestionTypeEnum;
  effectsEnabled: boolean;
  activeAudioKey: string | null;
  onToggleEffects: () => void;
  onPlayQuestionAudio: () => void;
}

export interface QuizAnswerPanelProps {
  options: QuizOption[];
  selectedOption: number | null;
  isSubmitting: boolean;
  confidenceLevel: 1 | 2 | 3;
  onSelectOption: (optionId: number) => void;
  onSubmitSelection: (optionId: number, confidenceLevel: 1 | 2 | 3) => void;
}
