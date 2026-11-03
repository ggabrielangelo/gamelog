import { z } from 'zod';

// Senha: mínimo 8, deve conter letra e número (Seção 7.1 do CLAUDE.md).
const strongPassword = z
  .string()
  .min(1, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Za-z]/, 'Senha deve conter ao menos uma letra')
  .regex(/[0-9]/, 'Senha deve conter ao menos um número');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: strongPassword,
  passwordConfirmation: z.string(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
