import { api, parseSuccessResponse } from "@shared/routes";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export const adminService = {
  async getVocabularyExport() {
    const response = await apiClient.get(buildApiUrl(api.admin.vocabExport.path));
    return parseSuccessResponse(api.admin.vocabExport.responses[200], response.data);
  },
};
