import { QueryClient } from '@tanstack/react-query';
import { PaginatedResponse } from '@/types/common';

/**
 * Helper to handle optimistic updates for paginated lists
 */
export async function onMutateListUpdate<T>(
  queryClient: QueryClient,
  queryKey: any[],
  updateFn: (page: PaginatedResponse<T>) => PaginatedResponse<T>,
) {
  
  await queryClient.cancelQueries({ queryKey });

  
  const previousQueries = queryClient.getQueriesData({ queryKey });

  
  queryClient.setQueriesData({ queryKey }, (old: any) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map(updateFn),
    };
  });

  return { previousQueries };
}

/**
 * Helper to rollback optimistic updates on error
 */
export function rollbackQueries(queryClient: QueryClient, context: any) {
  if (context?.previousQueries) {
    context.previousQueries.forEach(([queryKey, data]: any) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}
