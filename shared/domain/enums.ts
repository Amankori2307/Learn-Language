export enum UserTypeEnum {
  LEARNER = "learner",
  REVIEWER = "reviewer",
  ADMIN = "admin",
}

export enum LanguageEnum {
  TELUGU = "telugu",
  HINDI = "hindi",
  TAMIL = "tamil",
  KANNADA = "kannada",
  MALAYALAM = "malayalam",
  SPANISH = "spanish",
  FRENCH = "french",
  GERMAN = "german",
}

export const DEFAULT_LANGUAGE: LanguageEnum = LanguageEnum.TELUGU;

export enum ReviewStatusEnum {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum QuizModeEnum {
  DAILY_REVIEW = "daily_review",
  NEW_WORDS = "new_words",
  CLUSTER = "cluster",
  WEAK_WORDS = "weak_words",
  COMPLEX_WORKOUT = "complex_workout",
}

export enum QuizDirectionEnum {
  SOURCE_TO_TARGET = "source_to_target",
  TARGET_TO_SOURCE = "target_to_source",
}

export enum QuizQuestionTypeEnum {
  SOURCE_TO_TARGET = "source_to_target",
  TARGET_TO_SOURCE = "target_to_source",
}

export enum TutorChatRoleEnum {
  USER = "user",
  TUTOR = "tutor",
}
