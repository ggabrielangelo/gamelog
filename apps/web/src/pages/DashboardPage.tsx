import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchStats } from '../services/stats';
import { listGames } from '../services/games';
import { StatusBadge } from '../components/StatusBadge';
import { statusLabel } from '../utils/game-status-labels';

function StatCard({ label, value }: { label: string; value: string | number }): JSX.Element {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const topRatedQuery = useQuery({
    queryKey: ['games', { status: 'COMPLETED', top: true }],
    queryFn: () => listGames({ status: 'COMPLETED' }),
  });

  if (statsQuery.isLoading) {
    return <div className="text-slate-500">Carregando estatísticas...</div>;
  }
  if (statsQuery.isError || !statsQuery.data) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Erro ao carregar estatísticas.</div>;
  }

  const stats = statsQuery.data;
  const topRated = (topRatedQuery.data ?? [])
    .filter((g) => g.rating !== null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <Link to="/games" className="text-sm text-brand-700 hover:underline">
          Ver todos os jogos →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div data-cy="dashboard-stat-total-games">
          <StatCard label="Total" value={stats.totalGames} />
        </div>
        <div data-cy="dashboard-stat-backlog">
          <StatCard label={statusLabel('BACKLOG')} value={stats.backlog} />
        </div>
        <div data-cy="dashboard-stat-playing">
          <StatCard label={statusLabel('PLAYING')} value={stats.playing} />
        </div>
        <div data-cy="dashboard-stat-completed">
          <StatCard label={statusLabel('COMPLETED')} value={stats.completed} />
        </div>
        <div data-cy="dashboard-stat-abandoned">
          <StatCard label={statusLabel('ABANDONED')} value={stats.abandoned} />
        </div>
        <div data-cy="dashboard-stat-total-hours">
          <StatCard label="Horas" value={stats.totalHours.toFixed(0)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-sm font-semibold text-slate-900">Avaliação média</h2>
          <p className="mt-2 text-4xl font-bold text-brand-700" data-cy="dashboard-stat-avg-rating">
            {stats.avgRating === null ? '0.0' : stats.avgRating.toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Média das notas dos jogos concluídos (1 casa decimal).
          </p>
        </section>

        <section className="card" data-cy="dashboard-top-rated">
          <h2 className="text-sm font-semibold text-slate-900">Melhores avaliados</h2>
          {topRatedQuery.isLoading ? (
            <p className="mt-2 text-sm text-slate-500">Carregando...</p>
          ) : topRated.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Nenhum jogo avaliado ainda.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {topRated.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2 text-sm">
                  <Link to={`/games/${g.id}`} className="text-slate-800 hover:text-brand-700">
                    {g.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.status} />
                    <span className="font-semibold text-slate-900">{g.rating}/10</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
