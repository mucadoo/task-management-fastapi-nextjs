import * as z from 'zod';

export const getTaskSchema = (t: any) => z.object({
  title: z.string().min(1, t('common.error_required', { field: t('common.title') })),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional().nullable(),
  due_date_has_time: z.boolean().default(false),
});

export const getLoginSchema = (t: any) => z.object({
  identifier: z.string().min(1, t('common.error_required', { field: t('auth.email_or_username') })),
  password: z.string().min(1, t('common.error_required', { field: t('auth.password') })),
});

export const getRegisterSchema = (t: any) => z.object({
  name: z.string().min(1, t('common.error_required', { field: t('auth.name') })),
  email: z.string().email(t('auth.invalid_email')),
  password: z.string().min(6, t('auth.password_too_short')),
  confirmPassword: z.string().min(1, t('common.error_required', { field: t('auth.confirm_password') })),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.error_password_match'),
  path: ['confirmPassword'],
});
