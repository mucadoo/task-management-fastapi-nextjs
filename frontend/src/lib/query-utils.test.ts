import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onMutateListUpdate, rollbackQueries } from './query-utils';
import { QueryClient } from '@tanstack/react-query';

describe('query-utils', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  describe('onMutateListUpdate', () => {
    it('cancels queries and returns previous data', async () => {
      const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');
      const getQueriesDataSpy = vi.spyOn(queryClient, 'getQueriesData');

      const queryKey = ['tasks'];
      await onMutateListUpdate(queryClient, queryKey, (page) => page);

      expect(cancelQueriesSpy).toHaveBeenCalledWith({ queryKey });
      expect(getQueriesDataSpy).toHaveBeenCalledWith({ queryKey });
    });
  });

  describe('rollbackQueries', () => {
    it('restores previous queries data', () => {
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const queryKey = ['tasks'];
      const previousData = 'old data';
      const context = { previousQueries: [[queryKey, previousData]] };

      rollbackQueries(queryClient, context);

      expect(setQueryDataSpy).toHaveBeenCalledWith(queryKey, previousData);
    });

    it('does nothing if no context or previousQueries', () => {
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      rollbackQueries(queryClient, {});
      expect(setQueryDataSpy).not.toHaveBeenCalled();
    });
  });
});