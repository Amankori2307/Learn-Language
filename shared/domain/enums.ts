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
  TELUGU_TO_ENGLISH = "telugu_to_english",
  ENGLISH_TO_TELUGU = "english_to_telugu",
}

export enum QuizQuestionTypeEnum {
  TELUGU_TO_ENGLISH = "telugu_to_english",
  ENGLISH_TO_TELUGU = "english_to_telugu",
}

export enum TutorChatRoleEnum {
  USER = "user",
  TUTOR = "tutor",
}
