import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';

export function AuthenticatedLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout(): void {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-brand-700">
            GameLog
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                clsx('text-sm', isActive ? 'font-semibold text-brand-700' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/games"
              className={({ isActive }) =>
                clsx('text-sm', isActive ? 'font-semibold text-brand-700' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Meus jogos
            </NavLink>
          </nav>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="inline-block h-6 w-6 rounded-full bg-brand-600 text-center text-xs font-semibold leading-6 text-white">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </span>
              <span className="hidden sm:inline">{user?.name}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <div className="px-3 py-2 text-xs text-slate-500">{user?.email}</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
