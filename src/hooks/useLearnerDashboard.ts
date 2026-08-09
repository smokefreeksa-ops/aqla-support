import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getLearnerDashboard, markModuleProgress, saveLearnerProfile } from "@/lib/dashboard.functions";
import { buildLearnerModel, type LearnerModel } from "@/lib/dashboard-model";

export const dashboardQueryKey = ["learner-dashboard"] as const;

export function useLearnerDashboard() {
  const fetchDashboard = useServerFn(getLearnerDashboard);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const query = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => fetchDashboard(),
    staleTime: 30_000,
    enabled: hasSession,
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
