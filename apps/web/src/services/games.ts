import { api } from './api';
import type { Game, GamePlatform, GameStatus, PlaySession } from '../types';

export interface ListGamesFilters {
  status?: GameStatus;
  platform?: GamePlatform;
  search?: string;
}

export async function listGames(filters: ListGamesFilters = {}): Promise<Game[]> {
  const { data } = await api.get<{ games: Game[] }>('/games', { params: filters });
  return data.games;
}

export async function getGame(id: string): Promise<Game> {
  const { data } = await api.get<{ game: Game }>(`/games/${id}`);
  return data.game;
}

export interface CreateGameInput {
  title: string;
  platform: GamePlatform;
  genre?: string | null;
  status?: GameStatus;
  coverUrl?: string | null;
  notes?: string | null;
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const { data } = await api.post<{ game: Game }>('/games', input);
  return data.game;
}

export interface UpdateGameInput {
  title?: string;
  platform?: GamePlatform;
  genre?: string | null;
  status?: GameStatus;
  rating?: number | null;
  coverUrl?: string | null;
  notes?: string | null;
}

export async function updateGame(id: string, input: UpdateGameInput): Promise<Game> {
  const { data } = await api.patch<{ game: Game }>(`/games/${id}`, input);
  return data.game;
}

export async function deleteGame(id: string): Promise<void> {
  await api.delete(`/games/${id}`);
}

export async function listSessions(gameId: string): Promise<PlaySession[]> {
  const { data } = await api.get<{ sessions: PlaySession[] }>(`/games/${gameId}/sessions`);
  return data.sessions;
}

export async function createSession(gameId: string, hours: number): Promise<PlaySession> {
  const { data } = await api.post<{ session: PlaySession }>(`/games/${gameId}/sessions`, { hours });
  return data.session;
}
