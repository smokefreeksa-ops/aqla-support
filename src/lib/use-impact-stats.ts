import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicImpactStats, type ImpactStats } from "@/lib/impact.functions";

/** Single shared cache entry for the public impact stats used by several widgets. */
export const PUBLIC_IMPACT_STATS_KEY = ["public-impact-stats"] as const;

export function usePublicImpactStats() {
  const statsFn = useServerFn(getPublicImpactStats);
  return useQuery<ImpactStats>({
    queryKey: PUBLIC_IMPACT_STATS_KEY,
    queryFn: () => statsFn() as Promise<ImpactStats>,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
