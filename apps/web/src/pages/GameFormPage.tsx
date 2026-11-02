import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGame, getGame, updateGame } from '../services/games';
import { GAME_STATUSES, statusLabel } from '../utils/game-status-labels';
import { GAME_PLATFORMS } from '../utils/game-platforms';
import { extractApiError } from '../services/api';
import type { GamePlatform, GameStatus } from '../types';

const schema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(120, 'Máximo 120 caracteres'),
  platform: z.enum(['PC', 'PS5', 'Switch', 'Xbox', 'Mobile', 'Outros']),
  genre: z.string().trim().max(60).optional().or(z.literal('')),
  status: z.enum(['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED']),
  coverUrl: z.string().trim().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function GameFormPage(): JSX.Element {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const existingQuery = useQuery({
    queryKey: ['game', id],
    queryFn: () => getGame(id as string),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      platform: 'PC',
      genre: '',
      status: 'BACKLOG',
      coverUrl: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (existingQuery.data) {
      const g = existingQuery.data;
      reset({
        title: g.title,
        platform: g.platform,
        genre: g.genre ?? '',
        status: g.status,
        coverUrl: g.coverUrl ?? '',
        notes: g.notes ?? '',
      });
    }
  }, [existingQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        platform: values.platform as GamePlatform,
        genre: values.genre?.trim() ? values.genre : null,
        status: values.status as GameStatus,
        coverUrl: values.coverUrl?.trim() ? values.coverUrl : null,
        notes: values.notes?.trim() ? values.notes : null,
      };
      if (isEdit && id) {
        return updateGame(id, payload);
      }
      return createGame(payload);
    },
    onSuccess: async (game) => {
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      await queryClient.invalidateQueries({ queryKey: ['game', game.id] });
      await queryClient.invalidateQueries({ queryKey: ['game', game.id, 'sessions'] });
      navigate(`/games/${game.id}`, { replace: true });
    },
    onError: (err) => setServerError(extractApiError(err)),
  });

  async function onSubmit(values: FormValues): Promise<void> {
    setServerError(null);
    await mutation.mutateAsync(values);
  }

  if (isEdit && existingQuery.isLoading) {
    return <div className="text-slate-500">Carregando jogo...</div>;
  }
  if (isEdit && existingQuery.isError) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Erro ao carregar jogo.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">
        {isEdit ? 'Editar jogo' : 'Adicionar jogo'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card space-y-4" noValidate data-cy="game-form">
        <div>
          <label className="label" htmlFor="title">
            Título
          </label>
          <input id="title" className="input" data-cy="game-form-title-input" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="platform">
              Plataforma
            </label>
            <select id="platform" className="input" data-cy="game-form-platform-select" {...register('platform')}>
              {GAME_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.platform && (
              <p className="mt-1 text-xs text-red-600">{errors.platform.message}</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" className="input" data-cy="game-form-status-select" {...register('status')}>
              {GAME_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="genre">
            Gênero (opcional)
          </label>
          <input id="genre" className="input" placeholder="Ex.: RPG, Indie..." data-cy="game-form-genre-input" {...register('genre')} />
        </div>

        <div>
          <label className="label" htmlFor="coverUrl">
            URL da capa (opcional)
          </label>
          <input id="coverUrl" className="input" placeholder="https://..." data-cy="game-form-cover-input" {...register('coverUrl')} />
          {errors.coverUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.coverUrl.message}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Notas (opcional)
          </label>
          <textarea id="notes" rows={4} className="input" data-cy="game-form-notes-input" {...register('notes')} />
        </div>

        {serverError && (
          <div data-cy="game-form-error-message" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary" data-cy="game-form-cancel-button">
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || mutation.isPending} data-cy="game-form-submit-button">
            {isSubmitting || mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
