import { Layout } from "@/components/layout";
import { useMemo, useState } from "react";
import {
  useReviewQueue,
  useTransitionReview,
  useBulkTransitionReview,
  useReviewHistory,
  useCreateReviewDraft,
  type ReviewStatus,
} from "@/hooks/use-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { LanguageEnum, ReviewStatusEnum, UserTypeEnum } from "@shared/domain/enums";

const STATUS_OPTIONS: ReviewStatus[] = [
  ReviewStatusEnum.PENDING_REVIEW,
  ReviewStatusEnum.DRAFT,
  ReviewStatusEnum.APPROVED,
  ReviewStatusEnum.REJECTED,
];
function formatDate(value?: string | null) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ReviewPage() {
  const { user } = useAuth();
  const canReview = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;

  const [status, setStatus] = useState<ReviewStatus>(ReviewStatusEnum.PENDING_REVIEW);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeWordId, setActiveWordId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const { data, isLoading, isError, refetch } = useReviewQueue(status, 100);
  const history = useReviewHistory(activeWordId);
  const transition = useTransitionReview();
  const bulk = useBulkTransitionReview();
  const createDraft = useCreateReviewDraft();
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [draftLanguage, setDraftLanguage] = useState<LanguageEnum>(LanguageEnum.TELUGU);
  const [draftOriginalScript, setDraftOriginalScript] = useState("");
  const [draftPronunciation, setDraftPronunciation] = useState("");
  const [draftEnglish, setDraftEnglish] = useState("");
  const [draftPartOfSpeech, setDraftPartOfSpeech] = useState("noun");
  const [draftAudioUrl, setDraftAudioUrl] = useState("");
  const [draftSourceUrl, setDraftSourceUrl] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftExamples, setDraftExamples] = useState<Array<{
    originalScript: string;
    pronunciation: string;
    englishSentence: string;
    contextTag: string;
    difficulty: number;
  }>>([
    {
      originalScript: "",
      pronunciation: "",
      englishSentence: "",
      contextTag: "general",
      difficulty: 1,
    },
  ]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const runBulk = async (toStatus: ReviewStatus) => {
    if (selectedIds.length === 0) return;
    await bulk.mutateAsync({ ids: selectedIds, toStatus, notes: notes || undefined });
    setSelectedIds([]);
  };

  const updateExample = (index: number, key: "originalScript" | "pronunciation" | "englishSentence" | "contextTag" | "difficulty", value: string) => {
    setDraftExamples((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      if (key === "difficulty") {
        const parsed = Number.parseInt(value, 10);
        return { ...row, difficulty: Number.isFinite(parsed) ? Math.min(5, Math.max(1, parsed)) : 1 };
      }
      return { ...row, [key]: value };
    }));
  };

  const addExample = () => {
    setDraftExamples((prev) => [
      ...prev,
      { originalScript: "", pronunciation: "", englishSentence: "", contextTag: "general", difficulty: 1 },
    ]);
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
        partOfSpeech: draftPartOfSpeech.trim(),
        audioUrl: draftAudioUrl.trim() || undefined,
        sourceUrl: draftSourceUrl.trim() || undefined,
        tags: draftTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
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
      setDraftPartOfSpeech("noun");
      setDraftAudioUrl("");
      setDraftSourceUrl("");
      setDraftTags("");
      setDraftExamples([{ originalScript: "", pronunciation: "", englishSentence: "", contextTag: "general", difficulty: 1 }]);
      setStatus(ReviewStatusEnum.DRAFT);
      await refetch();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create draft");
    }
  };

  if (!canReview) {
    return (
      <Layout>
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Review Access Required</h1>
          <p className="text-muted-foreground mt-2">Only reviewer/admin roles can access vocabulary review tools.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">Approve or reject vocabulary before learner exposure.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button key={s} variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Create Vocabulary Draft</h2>
            <p className="text-sm text-muted-foreground">New entries are created as `draft` and routed into normal review workflow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="draft-language">Language</Label>
              <select
                id="draft-language"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draftLanguage}
                onChange={(e) => setDraftLanguage(e.target.value as LanguageEnum)}
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
              <Input id="draft-part-of-speech" value={draftPartOfSpeech} onChange={(e) => setDraftPartOfSpeech(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draft-original-script">Source Script</Label>
              <Input id="draft-original-script" value={draftOriginalScript} onChange={(e) => setDraftOriginalScript(e.target.value)} placeholder="Original script word/phrase" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draft-pronunciation">Pronunciation (English)</Label>
              <Input id="draft-pronunciation" value={draftPronunciation} onChange={(e) => setDraftPronunciation(e.target.value)} placeholder="Romanized pronunciation" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draft-english">English Meaning</Label>
              <Input id="draft-english" value={draftEnglish} onChange={(e) => setDraftEnglish(e.target.value)} placeholder="Meaning in English" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draft-audio-url">Audio URL (Optional)</Label>
              <Input id="draft-audio-url" value={draftAudioUrl} onChange={(e) => setDraftAudioUrl(e.target.value)} placeholder="https://.../audio.mp3" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="draft-source-url">Source URL (Optional)</Label>
              <Input id="draft-source-url" value={draftSourceUrl} onChange={(e) => setDraftSourceUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="draft-tags">Tags (comma separated)</Label>
              <Input id="draft-tags" value={draftTags} onChange={(e) => setDraftTags(e.target.value)} placeholder="manual, beginner, reviewer-added" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Examples</h3>
              <Button variant="outline" size="sm" onClick={addExample}>Add Example</Button>
            </div>
            {draftExamples.map((example, index) => (
              <div key={`example-${index}`} className="rounded-xl border border-border/40 p-3 space-y-2">
                <div className="grid md:grid-cols-2 gap-2">
                  <Input
                    value={example.originalScript}
                    onChange={(e) => updateExample(index, "originalScript", e.target.value)}
                    placeholder="Example sentence in source script"
                  />
                  <Input
                    value={example.pronunciation}
                    onChange={(e) => updateExample(index, "pronunciation", e.target.value)}
                    placeholder="Example pronunciation"
                  />
                  <Input
                    value={example.englishSentence}
                    onChange={(e) => updateExample(index, "englishSentence", e.target.value)}
                    placeholder="Example meaning in English"
                  />
                  <Input
                    value={example.contextTag}
                    onChange={(e) => updateExample(index, "contextTag", e.target.value)}
                    placeholder="Context tag (general, travel, greetings...)"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={String(example.difficulty)}
                    onChange={(e) => updateExample(index, "difficulty", e.target.value)}
                    placeholder="Difficulty (1-5)"
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => removeExample(index)} disabled={draftExamples.length <= 1}>
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

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-3">
          <Label htmlFor="review-notes">Review Notes (applied to bulk action)</Label>
          <Input
            id="review-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for audit trail"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runBulk(ReviewStatusEnum.APPROVED)} disabled={selectedIds.length === 0 || bulk.isPending}>
              Bulk Approve
            </Button>
            <Button variant="destructive" onClick={() => runBulk(ReviewStatusEnum.REJECTED)} disabled={selectedIds.length === 0 || bulk.isPending}>
              Bulk Reject
            </Button>
            <Button variant="outline" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              Clear Selection
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Queue Items</div>
            {isLoading ? (
              <div className="p-6 text-muted-foreground">Loading...</div>
            ) : isError ? (
              <div className="p-6">
                <p className="text-red-600">Failed to load queue.</p>
                <Button variant="outline" className="mt-3" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : !data || data.length === 0 ? (
              <div className="p-6 text-muted-foreground">No items in this queue.</div>
            ) : (
              <div className="max-h-[560px] overflow-auto">
                {data.map((word) => (
                  <div
                    key={word.id}
                    className={`p-4 border-b border-border/30 last:border-b-0 ${activeWordId === word.id ? "bg-secondary/50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSet.has(word.id)}
                        onCheckedChange={() => toggleSelected(word.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{word.transliteration} ({word.originalScript})</p>
                        <p className="text-sm text-muted-foreground">{word.english} • {word.partOfSpeech}</p>
                        <p className="text-xs text-muted-foreground mt-1">status: {word.reviewStatus}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          submitted: {word.submittedBy || "n/a"} • {formatDate(word.submittedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          reviewed: {word.reviewedBy || "n/a"} • {formatDate(word.reviewedAt)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => setActiveWordId(word.id)}>
                            View History
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => transition.mutate({ id: word.id, toStatus: ReviewStatusEnum.APPROVED, notes: notes || undefined })}
                            disabled={transition.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => transition.mutate({ id: word.id, toStatus: ReviewStatusEnum.REJECTED, notes: notes || undefined })}
                            disabled={transition.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Review History</div>
            {!activeWordId ? (
              <div className="p-6 text-muted-foreground">Select an item to inspect source and transition history.</div>
            ) : history.isLoading ? (
              <div className="p-6 text-muted-foreground">Loading history...</div>
            ) : history.isError || !history.data ? (
              <div className="p-6 text-red-600">Failed to load history.</div>
            ) : (
              <div className="p-4 space-y-3 max-h-[560px] overflow-auto">
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="font-medium">{history.data.word.transliteration} ({history.data.word.originalScript})</p>
                  <p className="text-sm text-muted-foreground">{history.data.word.english}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Source: {history.data.word.sourceUrl ? (
                      <a className="underline" href={history.data.word.sourceUrl} target="_blank" rel="noreferrer">
                        {history.data.word.sourceUrl}
                      </a>
                    ) : "n/a"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Source captured: {formatDate(history.data.word.sourceCapturedAt)}
                  </p>
                </div>
                {history.data.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No review events yet.</p>
                ) : (
                  history.data.events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border/40 p-3">
                      <p className="text-sm font-medium">
                        {event.fromStatus} {"->"} {event.toStatus}
                      </p>
                      <p className="text-xs text-muted-foreground">by {event.changedBy} • {formatDate(event.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        source: {event.sourceUrl ? (
                          <a className="underline" href={event.sourceUrl} target="_blank" rel="noreferrer">
                            {event.sourceUrl}
                          </a>
                        ) : "n/a"}
                        {" • "}captured: {formatDate(event.sourceCapturedAt)}
                      </p>
                      {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
