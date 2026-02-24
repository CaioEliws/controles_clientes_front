import { apiClient } from "@/services/apiClient";

export const dashboardService = {
  async getTotalEmprestado(): Promise<number> {
    const total = await apiClient.get<number>(
      "/dashboard/total-emprestado"
    );

    return total;
  },
};