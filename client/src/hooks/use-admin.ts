import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function useDownloadVocabularyExport() {
  return useMutation({
    mutationFn: () => adminService.getVocabularyExport(),
    onSuccess: (result) => {
      downloadJsonFile("words.json", result.words);
      downloadJsonFile("sentences.json", result.sentences);
    },
  });
}
