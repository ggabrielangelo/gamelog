export type GameStatus = 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED';
export type GamePlatform = 'PC' | 'PS5' | 'Switch' | 'Xbox' | 'Mobile' | 'Outros';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Game {
  id: string;
  userId: string;
  title: string;
  platform: GamePlatform;
  genre: string | null;
  status: GameStatus;
  rating: number | null;
  coverUrl: string | null;
  notes: string | null;
  addedAt: string;
  finishedAt: string | null;
  hoursTotal?: number;
}

export interface PlaySession {
  id: string;
  userId: string;
  gameId: string;
  hours: number;
  playedAt: string;
}

export interface BacklogStats {
  totalGames: number;
  completed: number;
  playing: number;
  backlog: number;
  abandoned: number;
  totalHours: number;
  avgRating: number | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | undefined>;
  };
}
