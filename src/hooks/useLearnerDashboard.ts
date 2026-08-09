import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLearnerDashboard, markModuleProgress, saveLearnerProfile } from "@/lib/dashboard.functions";
import { buildLearnerModel, type LearnerModel } from "@/lib/dashboard-model";

export const dashboardQueryKey = ["learner-dashboard"] as const;

export function useLearnerDashboard() {
  const fetchDashboard = useServerFn(getLearnerDashboard);
  const query = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => fetchDashboard(),
    staleTime: 30_000,
  });
  const model: LearnerModel | null = query.data ? buildLearnerModel(query.data) : null;
  return { ...query, model };
}

export function useLearnerActions() {
  const qc = useQueryClient();
  const progressFn = useServerFn(markModuleProgress);
  const profileFn = useServerFn(saveLearnerProfile);
  return {
    async startModule(slug: string) {
      await progressFn({ data: { module_slug: slug, completed: false } });
      qc.invalidateQueries({ queryKey: dashboardQueryKey });
    },
    async saveProfile(input: { full_name?: string | null; city?: string | null }) {
      await profileFn({ data: input });
      qc.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  };
}
