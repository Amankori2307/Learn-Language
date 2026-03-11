import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DraftExample } from "@/features/review/use-create-vocabulary-draft-form";

export function VocabularyDraftExamples({
  draftExamples,
  updateExample,
  addExample,
  removeExample,
}: {
  draftExamples: DraftExample[];
  updateExample: (
    index: number,
    key: "originalScript" | "pronunciation" | "englishSentence" | "contextTag" | "difficulty",
    value: string,
  ) => void;
  addExample: () => void;
  removeExample: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Examples</h3>
        <Button variant="outline" size="sm" onClick={addExample}>
          Add Example
        </Button>
      </div>
      {draftExamples.map((example, index) => (
        <div key={`example-${index}`} className="space-y-2 rounded-xl border border-border/40 p-3">
          <div className="grid gap-2 md:grid-cols-2">
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
  );
}
