import { z } from 'zod';

export const GAME_STATUSES = ['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];
export const gameStatusSchema = z.enum(GAME_STATUSES);

export const GAME_PLATFORMS = ['PC', 'PS5', 'Switch', 'Xbox', 'Mobile', 'Outros'] as const;
export type GamePlatform = (typeof GAME_PLATFORMS)[number];
export const gamePlatformSchema = z.enum(GAME_PLATFORMS);
