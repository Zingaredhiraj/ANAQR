'use client';
import { useQuery } from '@tanstack/react-query';
import { organsApi, systemsApi } from '@/lib/api';

export function useOrgans(params?: {
  systemId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['organs', params],
    queryFn: () => organsApi.list(params),
  });
}

export function useOrgan(slug: string) {
  return useQuery({
    queryKey: ['organ', slug],
    queryFn: () => organsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useAnatomySystems() {
  return useQuery({
    queryKey: ['anatomy-systems'],
    queryFn: () => systemsApi.list(),
  });
}
