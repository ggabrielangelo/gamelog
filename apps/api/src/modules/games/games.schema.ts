import { z } from 'zod';
import { gamePlatformSchema, gameStatusSchema } from '../../utils/game-status';

export const createGameSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Título deve ter no máximo 120 caracteres'),
  platform: gamePlatformSchema,
  genre: z.string().trim().max(60).optional().nullable(),
  status: gameStatusSchema.optional(),
  coverUrl: z.string().trim().url('URL de capa inválida').optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateGameSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    platform: gamePlatformSchema.optional(),
    genre: z.string().trim().max(60).optional().nullable(),
    status: gameStatusSchema.optional(),
    rating: z.number().int().min(1, 'Avaliação mínima: 1').max(10, 'Avaliação máxima: 10').optional().nullable(),
    coverUrl: z.string().trim().url('URL de capa inválida').optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Nenhum campo informado' });

export const listGamesQuerySchema = z.object({
  status: gameStatusSchema.optional(),
  platform: gamePlatformSchema.optional(),
  search: z.string().trim().max(120).optional(),
});

export const createSessionSchema = z.object({
  hours: z
    .number({ invalid_type_error: 'Horas deve ser numérico' })
    .positive('Horas deve ser maior que 0')
    .max(24, 'Horas deve ser no máximo 24'),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
