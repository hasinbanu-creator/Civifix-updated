import api, { unwrapResponse } from "@/lib/api";

export const complaintsApi = {
  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/complaints/${id}/status`, { status });
    return unwrapResponse(res);
  },
  
  addNote: async (id: string, payload: { text: string }) => {
    const res = await api.put(`/complaints/${id}/note`, payload);
    return unwrapResponse(res);
  }
};
