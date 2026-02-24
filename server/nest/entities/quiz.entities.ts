import { QuizQuestionTypeEnum } from "@shared/domain/enums";

export class QuizOptionEntity {
  id!: number;
  text!: string;
}

export class QuizQuestionEntity {
  wordId!: number;
  type!: QuizQuestionTypeEnum;
  questionText!: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  options!: QuizOptionEntity[];
}

export class QuizFeedbackExampleEntity {
  originalScript!: string;
  pronunciation!: string;
  meaning!: string;
}

export class QuizSubmitResponseEntity {
  isCorrect!: boolean;
  correctAnswer!: unknown;
  examples!: QuizFeedbackExampleEntity[];
  progressUpdate!: {
    streak: number;
    masteryLevel: number;
    nextReview: string;
  };
}

