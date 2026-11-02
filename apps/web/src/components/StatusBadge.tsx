import clsx from 'clsx';
import type { GameStatus } from '../types';
import { statusLabel } from '../utils/game-status-labels';

const STATUS_STYLES: Record<GameStatus, string> = {
  BACKLOG: 'bg-slate-100 text-slate-700 ring-slate-200',
  PLAYING: 'bg-brand-100 text-brand-700 ring-brand-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  ABANDONED: 'bg-amber-100 text-amber-700 ring-amber-200',
};

export function StatusBadge({ status }: { status: GameStatus }): JSX.Element {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        STATUS_STYLES[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
