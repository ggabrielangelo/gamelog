import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createSession,
  deleteGame,
  getGame,
  listSessions,
  updateGame,
} from '../services/games';
import { StatusBadge } from '../components/StatusBadge';
import { extractApiError } from '../services/api';

const sessionSchema = z.object({
  hours: z
    .number({ invalid_type_error: 'Informe um número' })
    .positive('Horas deve ser maior que 0')
    .max(24, 'Máximo 24 horas por sessão'),
});
type SessionForm = z.infer<typeof sessionSchema>;

const ratingSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Informe um número' })
    .int('Avaliação deve ser inteira')
    .min(1, 'Mínimo 1')
    .max(10, 'Máximo 10'),
});
type RatingForm = z.infer<typeof ratingSchema>;

export function GameDetailPage(): JSX.Element {
  const { id } = useParams();
  const gameId = id as string;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);

  const gameQuery = useQuery({ queryKey: ['game', gameId], queryFn: () => getGame(gameId) });
  const sessionsQuery = useQuery({
    queryKey: ['game', gameId, 'sessions'],
    queryFn: () => listSessions(gameId),
  });

  const sessionForm = useForm<SessionForm>({ resolver: zodResolver(sessionSchema) });
  const ratingForm = useForm<RatingForm>({ resolver: zodResolver(ratingSchema) });

  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    await queryClient.invalidateQueries({ queryKey: ['game', gameId, 'sessions'] });
    await queryClient.invalidateQueries({ queryKey: ['games'] });
    await queryClient.invalidateQueries({ queryKey: ['stats'] });
  };

  const addSessionMutation = useMutation({
    mutationFn: (values: SessionForm) => createSession(gameId, values.hours),
    onSuccess: async () => {
      sessionForm.reset({ hours: undefined as unknown as number });
      await invalidate();
    },
    onError: (err) => setServerError(extractApiError(err)),
  });

  const rateMutation = useMutation({
    mutationFn: (values: RatingForm) => updateGame(gameId, { rating: values.rating }),
    onSuccess: async () => {
      setShowRateForm(false);
      await invalidate();
    },
    onError: (err) => setServerError(extractApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGame(gameId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      navigate('/games', { replace: true });
    },
    onError: (err) => setServerError(extractApiError(err)),
  });

  if (gameQuery.isLoading) {
    return <div className="text-slate-500">Carregando jogo...</div>;
  }
  if (gameQuery.isError || !gameQuery.data) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Erro ao carregar jogo.</div>;
  }

  const game = gameQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const hoursTotal = game.hoursTotal ?? 0;

  return (
    <div className="space-y-6" data-cy="game-detail">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900" data-cy="game-detail-title">{game.title}</h1>
            <span data-cy="game-detail-status-badge">
              <StatusBadge status={game.status} />
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {game.platform}
            {game.genre ? ` · ${game.genre}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/games/${game.id}/edit`} className="btn-secondary" data-cy="game-detail-edit-button">
            Editar
          </Link>
          <button
            type="button"
            className="btn-danger"
            onClick={() => setConfirmingDelete(true)}
            data-cy="game-detail-delete-button"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-slate-500">Avaliação</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900" data-cy="game-detail-rating">
            {game.rating === null ? '—' : `${game.rating}/10`}
          </div>
          {game.status === 'COMPLETED' && (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-brand-700 hover:underline"
              onClick={() => setShowRateForm((v) => !v)}
              data-cy="game-detail-rate-button"
            >
              {game.rating === null ? 'Avaliar' : 'Alterar avaliação'}
            </button>
          )}
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-slate-500">Horas jogadas</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900" data-cy="game-detail-hours-total">{hoursTotal.toFixed(1)}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-slate-500">Concluído em</div>
          <div className="mt-1 text-sm text-slate-800">
            {game.finishedAt ? new Date(game.finishedAt).toLocaleDateString('pt-BR') : '—'}
          </div>
        </div>
      </div>

      {showRateForm && game.status === 'COMPLETED' && (
        <form
          onSubmit={ratingForm.handleSubmit((v) => rateMutation.mutate(v))}
          className="card flex flex-wrap items-end gap-3"
          data-cy="game-detail-rate-form"
        >
          <div>
            <label className="label" htmlFor="rating">
              Nota (1 a 10)
            </label>
            <input
              id="rating"
              type="number"
              min={1}
              max={10}
              className="input w-28"
              data-cy="game-detail-rate-input"
              {...ratingForm.register('rating', { valueAsNumber: true })}
            />
            {ratingForm.formState.errors.rating && (
              <p className="mt-1 text-xs text-red-600" data-cy="game-detail-rate-error">
                {ratingForm.formState.errors.rating.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={rateMutation.isPending}
            data-cy="game-detail-rate-submit"
          >
            {rateMutation.isPending ? 'Salvando...' : 'Salvar avaliação'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowRateForm(false)}>
            Cancelar
          </button>
        </form>
      )}

      {game.notes && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Notas</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{game.notes}</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold text-slate-900">Sessões de jogo</h2>

        {(game.status === 'PLAYING' || game.status === 'COMPLETED') ? (
          <form
            onSubmit={sessionForm.handleSubmit((v) => addSessionMutation.mutate(v))}
            className="mt-3 flex flex-wrap items-end gap-3"
            data-cy="session-form"
          >
            <div>
              <label className="label" htmlFor="hours">
                Horas desta sessão
              </label>
              <input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                className="input w-32"
                data-cy="session-hours-input"
                {...sessionForm.register('hours', { valueAsNumber: true })}
              />
              {sessionForm.formState.errors.hours && (
                <p className="mt-1 text-xs text-red-600">
                  {sessionForm.formState.errors.hours.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={addSessionMutation.isPending}
              data-cy="session-submit-button"
            >
              {addSessionMutation.isPending ? 'Registrando...' : 'Registrar sessão'}
            </button>
          </form>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Só é possível registrar sessões em jogos com status Jogando ou Concluído.
          </p>
        )}

        <div className="mt-4">
          {sessionsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Carregando sessões...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma sessão registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100" data-cy="sessions-list">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm" data-cy="session-item">
                  <span className="text-slate-700">
                    {new Date(s.playedAt).toLocaleString('pt-BR')}
                  </span>
                  <span className="font-semibold text-slate-900">{s.hours.toFixed(2)} h</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Excluir este jogo?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Esta ação é permanente. Todas as sessões associadas a <strong>{game.title}</strong>{' '}
              também serão removidas.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmingDelete(false)}
                data-cy="game-detail-delete-cancel"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                data-cy="game-detail-delete-confirm"
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
