import type { GameStatus } from '../types';

// Mapeamento fixo enum (banco/API em inglês) → rótulo em PT na UI.
// Fonte de verdade: Seção 4 do CLAUDE.md.
export const GAME_STATUS_LABEL: Record<GameStatus, string> = {
  BACKLOG: 'A jogar',
  PLAYING: 'Jogando',
  COMPLETED: 'Concluído',
  ABANDONED: 'Abandonado',
};

export const GAME_STATUSES: ReadonlyArray<GameStatus> = [
  'BACKLOG',
  'PLAYING',
  'COMPLETED',
  'ABANDONED',
];

export function statusLabel(status: GameStatus): string {
  return GAME_STATUS_LABEL[status];
}
