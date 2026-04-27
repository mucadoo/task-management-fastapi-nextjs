import * as z from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_REGEX = /^[a-zA-Z_]+$/;

const getPasswordSchema = (t: any) =>
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, t('profile.password_min'))
    .regex(/[A-Z]/, t('profile.password_uppercase'))
    .regex(/[a-z]/, t('profile.password_lowercase'))
    .regex(/[0-9]/, t('profile.password_number'))
    .regex(/[^A-Za-z0-9]/, t('profile.password_special'));

export const getTaskSchema = (t: any) =>
  z.object({
    title: z
      .string()
      .min(1, t('common.error_required', { field: t('common.title') }))
      .max(100),
    description: z.string().max(1000).optional(),
    status: z.enum(['pending', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.date().optional().nullable(),
    due_date_has_time: z.boolean().default(false),
  });

export const getLoginSchema = (t: any) =>
  z.object({
    identifier: z
      .string()
      .min(1, t('common.error_required', { field: t('auth.email_or_username') })),
    password: z.string().min(1, t('common.error_required', { field: t('auth.password') })),
  });

export const getRegisterSchema = (t: any) =>
  z
    .object({
      name: z
        .string()
        .min(1, t('common.error_required', { field: t('auth.name') }))
        .max(100),
      email: z.string().email(t('auth.invalid_email')).max(255),
      password: getPasswordSchema(t),
      confirmPassword: z
        .string()
        .min(1, t('common.error_required', { field: t('auth.confirm_password') })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.error_password_match'),
      path: ['confirmPassword'],
    });

export const getPersonalSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t('profile.name_required')).max(100),
    email: z.string().email(t('profile.email_invalid')).max(255),
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH, t('profile.username_invalid'))
      .max(30)
      .regex(USERNAME_REGEX, t('profile.username_invalid'))
      .transform((val) => val.toLowerCase())
      .optional()
      .or(z.literal('')),
  });

export const getSecuritySchema = (t: any) =>
  z
    .object({
      current_password: z.string().min(1, t('profile.current_password_required')),
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, t('profile.password_match')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('profile.password_match'),
      path: ['confirmPassword'],
    });
