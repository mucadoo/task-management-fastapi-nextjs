import { QueryClient } from '@tanstack/react-query';
import { PaginatedResponse } from '@/types/common';

export async function onMutateListUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updateFn: (page: PaginatedResponse<T>) => PaginatedResponse<T>,
) {
  await queryClient.cancelQueries({ queryKey });

  const previousQueries = queryClient.getQueriesData({ queryKey });

  queryClient.setQueriesData({ queryKey }, (old: unknown) => {
    if (!old) return old;
    const oldPaginated = old as { pages: PaginatedResponse<T>[] };
    return {
      ...oldPaginated,
      pages: oldPaginated.pages.map(updateFn),
    };
  });

  return { previousQueries };
}

export function rollbackQueries(queryClient: QueryClient, context: unknown) {
  const ctx = context as { previousQueries?: [readonly unknown[], unknown][] };
  if (ctx?.previousQueries) {
    ctx.previousQueries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}
