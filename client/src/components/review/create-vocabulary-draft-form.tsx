import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useCreateReviewDraft } from "@/hooks/use-review";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { PART_OF_SPEECH_OPTIONS } from "@shared/domain/part-of-speech";
import { VOCABULARY_TAG_OPTIONS } from "@shared/domain/vocabulary-tags";
import { api } from "@shared/routes";
import { toApiUrl } from "@/lib/api-base";

type DraftExample = {
  originalScript: string;
  pronunciation: string;
  englishSentence: string;
  contextTag: string;
  difficulty: number;
};

const DEFAULT_EXAMPLE: DraftExample = {
  originalScript: "",
  pronunciation: "",
  englishSentence: "",
  contextTag: "general",
  difficulty: 1,
};

export function CreateVocabularyDraftForm() {
  const createDraft = useCreateReviewDraft();

  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [draftLanguage, setDraftLanguage] = useState<LanguageEnum>(LanguageEnum.TELUGU);
  const [draftOriginalScript, setDraftOriginalScript] = useState("");
  const [draftPronunciation, setDraftPronunciation] = useState("");
  const [draftEnglish, setDraftEnglish] = useState("");
  const [draftPartOfSpeech, setDraftPartOfSpeech] = useState<PartOfSpeechEnum>(PartOfSpeechEnum.NOUN);
  const [draftAudioUrl, setDraftAudioUrl] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [draftSourceUrl, setDraftSourceUrl] = useState("");
  const [draftTags, setDraftTags] = useState<VocabularyTagEnum[]>([VocabularyTagEnum.MANUAL_DRAFT]);
  const [draftClusterIds, setDraftClusterIds] = useState<string[]>([]);
  const [draftExamples, setDraftExamples] = useState<DraftExample[]>([{ ...DEFAULT_EXAMPLE }]);
  const { data: availableClusters = [] } = useQuery({
    queryKey: [api.clusters.list.path, draftLanguage, "draft-form"],
    queryFn: async () => {
      const params = new URLSearchParams({ language: draftLanguage });
      const res = await fetch(toApiUrl(`${api.clusters.list.path}?${params.toString()}`), { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to load clusters");
      }
      return api.clusters.list.responses[200].parse(await res.json());
    },
  });
  const clusterOptions = availableClusters.map((cluster) => ({
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
          return { ...row, difficulty: Number.isFinite(parsed) ? Math.min(5, Math.max(1, parsed)) : 1 };
        }
        return { ...row, [key]: value };
      }),
    );
  };

  const addExample = () => {
    setDraftExamples((prev) => [...prev, { ...DEFAULT_EXAMPLE }]);
  };

  const removeExample = (index: number) => {
    setDraftExamples((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const submitDraft = async () => {
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const payload = {
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
      };

      const result = await createDraft.mutateAsync(payload);
      setCreateSuccess(`Draft #${result.id} created (${result.examplesCreated} example(s)).`);
      setDraftOriginalScript("");
      setDraftPronunciation("");
      setDraftEnglish("");
      setDraftPartOfSpeech(PartOfSpeechEnum.NOUN);
      setDraftAudioUrl("");
      setDraftImageUrl("");
      setDraftSourceUrl("");
      setDraftTags([VocabularyTagEnum.MANUAL_DRAFT]);
      setDraftClusterIds([]);
      setDraftExamples([{ ...DEFAULT_EXAMPLE }]);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create draft");
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create Vocabulary Draft</h2>
        <p className="text-sm text-muted-foreground">
          New entries are created as <code>draft</code> and routed into normal review workflow.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="draft-language">Language</Label>
          <select
            id="draft-language"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draftLanguage}
            onChange={(event) => setDraftLanguage(event.target.value as LanguageEnum)}
          >
            {Object.values(LanguageEnum).map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-part-of-speech">Part of Speech</Label>
          <SearchableSelect
            id="draft-part-of-speech"
            value={draftPartOfSpeech}
            options={PART_OF_SPEECH_OPTIONS}
            onChange={setDraftPartOfSpeech}
            placeholder="Choose part of speech"
            searchPlaceholder="Search part of speech..."
            ariaLabel="Part of Speech"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-original-script">Source Script</Label>
          <Input
            id="draft-original-script"
            value={draftOriginalScript}
            onChange={(event) => setDraftOriginalScript(event.target.value)}
            placeholder="Original script word/phrase"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-pronunciation">Pronunciation (English)</Label>
          <Input
            id="draft-pronunciation"
            value={draftPronunciation}
            onChange={(event) => setDraftPronunciation(event.target.value)}
            placeholder="Romanized pronunciation"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-english">English Meaning</Label>
          <Input
            id="draft-english"
            value={draftEnglish}
            onChange={(event) => setDraftEnglish(event.target.value)}
            placeholder="Meaning in English"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-audio-url">Audio URL (Optional)</Label>
          <Input
            id="draft-audio-url"
            value={draftAudioUrl}
            onChange={(event) => setDraftAudioUrl(event.target.value)}
            placeholder="https://.../audio.mp3"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-image-url">Image URL (Optional)</Label>
          <Input
            id="draft-image-url"
            value={draftImageUrl}
            onChange={(event) => setDraftImageUrl(event.target.value)}
            placeholder="https://.../image.jpg"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="draft-source-url">Source URL (Optional)</Label>
          <Input
            id="draft-source-url"
            value={draftSourceUrl}
            onChange={(event) => setDraftSourceUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="draft-tags">Tags</Label>
          <SearchableMultiSelect
            id="draft-tags"
            values={draftTags}
            options={VOCABULARY_TAG_OPTIONS}
            onChange={setDraftTags}
            placeholder="Select one or more tags"
            searchPlaceholder="Search tags..."
            ariaLabel="Tags"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="draft-clusters">Clusters (Optional)</Label>
          <SearchableMultiSelect
            id="draft-clusters"
            values={draftClusterIds}
            options={clusterOptions}
            onChange={setDraftClusterIds}
            placeholder="Link this word to one or more clusters"
            searchPlaceholder="Search clusters..."
            ariaLabel="Clusters"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Examples</h3>
          <Button variant="outline" size="sm" onClick={addExample}>
            Add Example
          </Button>
        </div>
        {draftExamples.map((example, index) => (
          <div key={`example-${index}`} className="rounded-xl border border-border/40 p-3 space-y-2">
            <div className="grid md:grid-cols-2 gap-2">
              <Input
                value={example.originalScript}
                onChange={(event) => updateExample(index, "originalScript", event.target.value)}
                placeholder="Example sentence in source script"
              />
              <Input
                value={example.pronunciation}
                onChange={(event) => updateExample(index, "pronunciation", event.target.value)}
                placeholder="Example pronunciation"
              />
              <Input
                value={example.englishSentence}
                onChange={(event) => updateExample(index, "englishSentence", event.target.value)}
                placeholder="Example meaning in English"
              />
              <Input
                value={example.contextTag}
                onChange={(event) => updateExample(index, "contextTag", event.target.value)}
                placeholder="Context tag (general, travel, greetings...)"
              />
              <Input
                type="number"
                min={1}
                max={5}
                value={String(example.difficulty)}
                onChange={(event) => updateExample(index, "difficulty", event.target.value)}
                placeholder="Difficulty (1-5)"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeExample(index)}
                disabled={draftExamples.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {createError ? <p className="text-sm text-red-600">{createError}</p> : null}
      {createSuccess ? <p className="text-sm text-emerald-600">{createSuccess}</p> : null}

      <Button onClick={submitDraft} disabled={createDraft.isPending}>
        {createDraft.isPending ? "Creating..." : "Create Draft"}
      </Button>
    </div>
  );
}
