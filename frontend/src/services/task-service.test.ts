import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from './task-service';
import { request } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  request: vi.fn(),
}));

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('calls request with correct parameters', async () => {
      const mockResponse = { items: [], total: 0, page: 1, pages: 0, size: 50 };
      vi.mocked(request).mockResolvedValue(mockResponse);

      const params = { status: 'pending' as const, priority: 'high' as const, q: 'test' };
      const result = await taskService.getTasks(params);

      expect(request).toHaveBeenCalledWith('/tasks/', expect.objectContaining({
        params: { status: 'pending', priority: 'high', q: 'test' },
      }));
      expect(result).toEqual(mockResponse);
    });

    it('passes token if provided', async () => {
      vi.mocked(request).mockResolvedValue({ items: [] });
      await taskService.getTasks({ token: 'test-token' });
      expect(request).toHaveBeenCalledWith('/tasks/', expect.objectContaining({
        token: 'test-token',
      }));
    });
  });

  describe('getTask', () => {
    it('calls request for specific task id', async () => {
      const mockTask = { id: '1', title: 'Task 1' };
      vi.mocked(request).mockResolvedValue(mockTask);

      const result = await taskService.getTask('1');

      expect(request).toHaveBeenCalledWith('/tasks/1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('calls request with POST and body', async () => {
      const taskData = { title: 'New Task', status: 'pending' as const, priority: 'medium' as const };
      const mockTask = { id: '2', ...taskData };
      vi.mocked(request).mockResolvedValue(mockTask);

      const result = await taskService.createTask(taskData);

      expect(request).toHaveBeenCalledWith('/tasks/', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(taskData),
      }));
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('calls request with PUT and body', async () => {
      const updateData = { title: 'Updated Task' };
      const mockTask = { id: '1', title: 'Updated Task' };
      vi.mocked(request).mockResolvedValue(mockTask);

      const result = await taskService.updateTask('1', updateData);

      expect(request).toHaveBeenCalledWith('/tasks/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData),
      }));
      expect(result).toEqual(mockTask);
    });
  });

  describe('toggleTaskStatus', () => {
    it('calls request for toggle endpoint', async () => {
      const mockTask = { id: '1', status: 'completed' };
      vi.mocked(request).mockResolvedValue(mockTask);

      const result = await taskService.toggleTaskStatus('1');

      expect(request).toHaveBeenCalledWith('/tasks/1/toggle', expect.objectContaining({
        method: 'POST',
      }));
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('calls request with DELETE', async () => {
      vi.mocked(request).mockResolvedValue(undefined);

      await taskService.deleteTask('1');

      expect(request).toHaveBeenCalledWith('/tasks/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
