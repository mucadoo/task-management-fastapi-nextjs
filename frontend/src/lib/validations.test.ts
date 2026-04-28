import { describe, it, expect, vi } from 'vitest';
import {
  getTaskSchema,
  getLoginSchema,
  getRegisterSchema,
  getPersonalSchema,
  getSecuritySchema,
} from './validations';

const mockT = vi.fn((key: string) => key);

describe('validations', () => {
  describe('getTaskSchema', () => {
    const schema = getTaskSchema(mockT);

    it('validates a valid task', () => {
      const validTask = {
        title: 'Valid Task',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(),
        due_date_has_time: false,
      };
      expect(schema.safeParse(validTask).success).toBe(true);
    });

    it('fails if title is empty', () => {
      const invalidTask = {
        title: '',
        status: 'pending',
        priority: 'medium',
      };
      const result = schema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('common.error_required');
      }
    });

    it('fails if status is invalid', () => {
      const invalidTask = {
        title: 'Task',
        status: 'invalid_status',
        priority: 'medium',
      };
      expect(schema.safeParse(invalidTask).success).toBe(false);
    });
  });

  describe('getLoginSchema', () => {
    const schema = getLoginSchema(mockT);

    it('validates a valid login', () => {
      const validLogin = {
        identifier: 'user123',
        password: 'password123',
      };
      expect(schema.safeParse(validLogin).success).toBe(true);
    });

    it('fails if identifier is missing', () => {
      const invalidLogin = {
        password: 'password123',
      };
      expect(schema.safeParse(invalidLogin).success).toBe(false);
    });
  });

  describe('getRegisterSchema', () => {
    const schema = getRegisterSchema(mockT);

    it('validates a valid registration', () => {
      const validReg = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      expect(schema.safeParse(validReg).success).toBe(true);
    });

    it('fails if passwords do not match', () => {
      const invalidReg = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      };
      const result = schema.safeParse(invalidReg);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('auth.error_password_match');
      }
    });

    it('fails if username contains invalid characters', () => {
      const invalidReg = {
        name: 'John Doe',
        username: 'john-doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      expect(schema.safeParse(invalidReg).success).toBe(false);
    });
  });

  describe('getPersonalSchema', () => {
    const schema = getPersonalSchema(mockT);

    it('validates valid personal data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };
      expect(schema.safeParse(validData).success).toBe(true);
    });
  });

  describe('getSecuritySchema', () => {
    const schema = getSecuritySchema(mockT);

    it('validates valid security data', () => {
      const validData = {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      expect(schema.safeParse(validData).success).toBe(true);
    });

    it('fails if new passwords do not match', () => {
      const invalidData = {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
        confirmPassword: 'WrongPassword123!',
      };
      expect(schema.safeParse(invalidData).success).toBe(false);
    });
  });
});