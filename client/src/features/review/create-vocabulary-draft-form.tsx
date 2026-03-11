import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PendingButton } from "@/components/ui/pending-button";
import { InlineLoading } from "@/components/ui/page-states";
import { VocabularyDraftExamples } from "@/components/review/vocabulary-draft-examples";
import { useCreateVocabularyDraftForm } from "./use-create-vocabulary-draft-form";
import { LanguageEnum } from "@shared/domain/enums";
import { PART_OF_SPEECH_OPTIONS } from "@shared/domain/part-of-speech";
import { VOCABULARY_TAG_OPTIONS } from "@shared/domain/vocabulary-tags";

export type CreateVocabularyDraftFormViewModel = ReturnType<typeof useCreateVocabularyDraftForm>;

export function CreateVocabularyDraftFormContent({
  viewModel,
}: {
  viewModel: CreateVocabularyDraftFormViewModel;
}) {
  const {
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
    isSubmitting,
  } = viewModel;

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-4 md:p-6">
      <div>
        <h2 className="text-xl font-semibold">Create Vocabulary Draft</h2>
        <p className="text-sm text-muted-foreground">
          New entries are created as <code>draft</code> and routed into normal review workflow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
          {availableClustersQuery.isLoading ? <InlineLoading label="Loading clusters..." /> : null}
          {availableClustersQuery.isError ? (
            <p className="text-sm text-status-error">Failed to load clusters.</p>
          ) : null}
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

      <VocabularyDraftExamples
        draftExamples={draftExamples}
        updateExample={updateExample}
        addExample={addExample}
        removeExample={removeExample}
      />

      {createError ? <p className="text-sm text-status-error">{createError}</p> : null}
      {createSuccess ? <p className="text-sm text-status-success">{createSuccess}</p> : null}

      <PendingButton
        onClick={submitDraft}
        pending={isSubmitting}
        pendingLabel="Creating..."
        className="w-full sm:w-auto"
      >
        Create Draft
      </PendingButton>
    </div>
  );
}

export function CreateVocabularyDraftForm() {
  const viewModel = useCreateVocabularyDraftForm();

  return <CreateVocabularyDraftFormContent viewModel={viewModel} />;
}
