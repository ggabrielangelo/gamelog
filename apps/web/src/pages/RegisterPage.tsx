import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractApiError } from '../services/api';

// Regras: Seção 7.1 do CLAUDE.md.
const schema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
    email: z.string().trim().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Za-z]/, 'Senha deve conter ao menos uma letra')
      .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
    passwordConfirmation: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Confirmação de senha não confere',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage(): JSX.Element {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues): Promise<void> {
    setServerError(null);
    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(extractApiError(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-500">Comece a organizar seu backlog.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className="input"
              autoComplete="name"
              data-cy="register-name-input"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="email"
              data-cy="register-email-input"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="new-password"
              data-cy="register-password-input"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres, com letras e números.</p>
          </div>

          <div>
            <label className="label" htmlFor="passwordConfirmation">
              Confirmar senha
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              className="input"
              autoComplete="new-password"
              data-cy="register-password-confirm-input"
              {...register('passwordConfirmation')}
            />
            {errors.passwordConfirmation && (
              <p className="mt-1 text-xs text-red-600">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          {serverError && (
            <div
              data-cy="register-error-message"
              className="rounded-md bg-red-50 p-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
            data-cy="register-submit-button"
          >
            {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
