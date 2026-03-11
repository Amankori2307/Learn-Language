import { useState } from "react";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { useClustersForLanguage } from "@/hooks/use-clusters";
import { useCreateReviewDraft } from "@/hooks/use-review";

export type DraftExample = {
  originalScript: string;
  pronunciation: string;
  englishSentence: string;
  contextTag: string;
  difficulty: number;
};

export const DEFAULT_DRAFT_EXAMPLE: DraftExample = {
  originalScript: "",
  pronunciation: "",
  englishSentence: "",
  contextTag: "general",
  difficulty: 1,
};

export function useCreateVocabularyDraftForm() {
  const createDraft = useCreateReviewDraft();

  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [draftLanguage, setDraftLanguage] = useState<LanguageEnum>(LanguageEnum.TELUGU);
  const [draftOriginalScript, setDraftOriginalScript] = useState("");
  const [draftPronunciation, setDraftPronunciation] = useState("");
  const [draftEnglish, setDraftEnglish] = useState("");
  const [draftPartOfSpeech, setDraftPartOfSpeech] = useState<PartOfSpeechEnum>(
    PartOfSpeechEnum.NOUN,
  );
  const [draftAudioUrl, setDraftAudioUrl] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [draftSourceUrl, setDraftSourceUrl] = useState("");
  const [draftTags, setDraftTags] = useState<VocabularyTagEnum[]>([VocabularyTagEnum.MANUAL_DRAFT]);
  const [draftClusterIds, setDraftClusterIds] = useState<string[]>([]);
  const [draftExamples, setDraftExamples] = useState<DraftExample[]>([{ ...DEFAULT_DRAFT_EXAMPLE }]);

  const availableClustersQuery = useClustersForLanguage(draftLanguage);

  const clusterOptions = (availableClustersQuery.data ?? []).map((cluster) => ({
    value: String(cluster.id),
    label: `${cluster.name} (${cluster.wordCount})`,
  }));

  const updateExample = (
    index: number,
    key: "originalScript" | "pronunciation" | "englishSentence" | "contextTag" | "difficulty",
    value: string,
  ) => {
    setDraftExamples((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (key === "difficulty") {
          const parsed = Number.parseInt(value, 10);
          return {
            ...row,
            difficulty: Number.isFinite(parsed) ? Math.min(5, Math.max(1, parsed)) : 1,
          };
        }
        return { ...row, [key]: value };
      }),
    );
  };

  const addExample = () => {
    setDraftExamples((prev) => [...prev, { ...DEFAULT_DRAFT_EXAMPLE }]);
  };

  const removeExample = (index: number) => {
    setDraftExamples((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const resetForm = () => {
    setDraftOriginalScript("");
    setDraftPronunciation("");
    setDraftEnglish("");
    setDraftPartOfSpeech(PartOfSpeechEnum.NOUN);
    setDraftAudioUrl("");
    setDraftImageUrl("");
    setDraftSourceUrl("");
    setDraftTags([VocabularyTagEnum.MANUAL_DRAFT]);
    setDraftClusterIds([]);
    setDraftExamples([{ ...DEFAULT_DRAFT_EXAMPLE }]);
  };

  const submitDraft = async () => {
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const result = await createDraft.mutateAsync({
        language: draftLanguage,
        originalScript: draftOriginalScript.trim(),
        pronunciation: draftPronunciation.trim(),
        english: draftEnglish.trim(),
        partOfSpeech: draftPartOfSpeech,
        audioUrl: draftAudioUrl.trim() || undefined,
        imageUrl: draftImageUrl.trim() || undefined,
        sourceUrl: draftSourceUrl.trim() || undefined,
        tags: draftTags,
        clusterIds: draftClusterIds.map((id) => Number.parseInt(id, 10)).filter(Number.isFinite),
        examples: draftExamples.map((example) => ({
          originalScript: example.originalScript.trim(),
          pronunciation: example.pronunciation.trim(),
          englishSentence: example.englishSentence.trim(),
          contextTag: example.contextTag.trim() || "general",
          difficulty: example.difficulty,
        })),
      });

      setCreateSuccess(`Draft #${result.id} created (${result.examplesCreated} example(s)).`);
      resetForm();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create draft");
    }
  };

  return {
    createError,
    createSuccess,
    draftLanguage,
    setDraftLanguage,
    draftOriginalScript,
    setDraftOriginalScript,
    draftPronunciation,
    setDraftPronunciation,
    draftEnglish,
    setDraftEnglish,
    draftPartOfSpeech,
    setDraftPartOfSpeech,
    draftAudioUrl,
    setDraftAudioUrl,
    draftImageUrl,
    setDraftImageUrl,
    draftSourceUrl,
    setDraftSourceUrl,
    draftTags,
    setDraftTags,
    draftClusterIds,
    setDraftClusterIds,
    draftExamples,
    clusterOptions,
    availableClustersQuery,
    updateExample,
    addExample,
    removeExample,
    submitDraft,
    isSubmitting: createDraft.isPending,
  };
}
