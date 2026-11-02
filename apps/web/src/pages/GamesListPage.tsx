import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listGames, type ListGamesFilters } from '../services/games';
import { GAME_STATUSES, statusLabel } from '../utils/game-status-labels';
import { GAME_PLATFORMS } from '../utils/game-platforms';
import { StatusBadge } from '../components/StatusBadge';
import type { GamePlatform, GameStatus } from '../types';

export function GamesListPage(): JSX.Element {
  const [status, setStatus] = useState<GameStatus | ''>('');
  const [platform, setPlatform] = useState<GamePlatform | ''>('');
  const [search, setSearch] = useState('');

  const filters: ListGamesFilters = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [status, platform, search],
  );

  const { data: games, isLoading, isError } = useQuery({
    queryKey: ['games', filters],
    queryFn: () => listGames(filters),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Meus jogos</h1>
        <Link to="/games/new" className="btn-primary" data-cy="games-add-button">
          + Adicionar jogo
        </Link>
      </div>

      <div className="card">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="filter-status">
              Status
            </label>
            <select
              id="filter-status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as GameStatus | '')}
              data-cy="games-filter-status"
            >
              <option value="">Todos</option>
              {GAME_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="filter-platform">
              Plataforma
            </label>
            <select
              id="filter-platform"
              className="input"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as GamePlatform | '')}
              data-cy="games-filter-platform"
            >
              <option value="">Todas</option>
              {GAME_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="search">
              Buscar
            </label>
            <input
              id="search"
              className="input"
              placeholder="Título do jogo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-cy="games-search-input"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div data-cy="games-list-loading" className="text-slate-500">Carregando jogos...</div>
      ) : isError ? (
        <div data-cy="games-list-error" className="rounded-md bg-red-50 p-4 text-sm text-red-700">Erro ao carregar jogos.</div>
      ) : !games || games.length === 0 ? (
        <div data-cy="games-list-empty" className="card text-center text-sm text-slate-500">
          Nenhum jogo encontrado com estes filtros.
        </div>
      ) : (
        <ul data-cy="games-list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <li key={g.id} data-cy="game-card" className="card flex flex-col gap-2">
              <Link
                to={`/games/${g.id}`}
                className="text-base font-semibold text-slate-900 hover:text-brand-700"
                data-cy="game-card-title"
              >
                {g.title}
              </Link>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span data-cy="game-card-platform">{g.platform}</span>
                <span data-cy="game-card-status">
                  <StatusBadge status={g.status} />
                </span>
              </div>
              {g.rating !== null && (
                <div data-cy="game-card-rating" className="text-sm font-semibold text-slate-900">
                  Nota {g.rating}/10
                </div>
              )}
              {g.genre && <div className="text-xs text-slate-500">{g.genre}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
