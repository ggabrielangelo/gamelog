/// <reference types="cypress" />

const TOKEN_STORAGE_KEY = 'gamelog.token';

type UserInput = { name: string; email: string; password: string };

type GamePayload = {
  title: string;
  platform: string;
  genre?: string | null;
  status?: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED';
  rating?: number | null;
  coverUrl?: string | null;
  notes?: string | null;
};

type Game = {
  id: string;
  userId: string;
  title: string;
  platform: string;
  genre: string | null;
  status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED';
  rating: number | null;
  coverUrl: string | null;
  notes: string | null;
  addedAt: string;
  finishedAt: string | null;
  hoursTotal?: number;
};

type SessionCreated = {
  id: string;
  userId: string;
  gameId: string;
  hours: number;
  playedAt: string;
};

type RegisterResult = { user: unknown; token: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<string>;
      loginApi(email: string, password: string): Chainable<string>;
      registerUser(input: UserInput): Chainable<RegisterResult>;
      createGame(token: string, payload: GamePayload): Chainable<Game>;
      createSession(
        token: string,
        gameId: string,
        payload: { hours: number },
      ): Chainable<SessionCreated>;
      setGameStatus(token: string, gameId: string, status: Game['status']): Chainable<Game>;
      setGameRating(token: string, gameId: string, rating: number): Chainable<Game>;
      resetDatabase(): Chainable<null>;
      apiRequest(
        method: Cypress.HttpMethod,
        path: string,
        options?: Partial<Cypress.RequestOptions> & { token?: string },
      ): Chainable<Cypress.Response<any>>;
    }
  }
}

function extractToken(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.token === 'string') return b.token;
  if (b.data && typeof b.data === 'object') {
    const d = b.data as Record<string, unknown>;
    if (typeof d.token === 'string') return d.token;
  }
  return null;
}

function unwrapGame(body: unknown): Game {
  const b = body as Record<string, unknown>;
  if (b.game) return b.game as Game;
  if (b.data && typeof b.data === 'object' && (b.data as Record<string, unknown>).game) {
    return (b.data as Record<string, unknown>).game as Game;
  }
  return body as Game;
}

function unwrapSession(body: unknown): SessionCreated {
  const b = body as Record<string, unknown>;
  if (b.session) return b.session as SessionCreated;
  if (b.data && typeof b.data === 'object' && (b.data as Record<string, unknown>).session) {
    return (b.data as Record<string, unknown>).session as SessionCreated;
  }
  return body as SessionCreated;
}

Cypress.Commands.add('apiRequest', (method, path, options = {}) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  const { token, headers, ...rest } = options as Partial<Cypress.RequestOptions> & {
    token?: string;
  };
  return cy.request({
    method,
    url: `${apiUrl}${path}`,
    failOnStatusCode: false,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    ...rest,
  });
});

Cypress.Commands.add('loginApi', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  return cy
    .request('POST', `${apiUrl}/auth/login`, { email, password })
    .then((res) => {
      const token = extractToken(res.body);
      if (!token) {
        throw new Error(`loginApi failed: no token in response ${JSON.stringify(res.body)}`);
      }
      return cy.wrap(token);
    });
});

Cypress.Commands.add('login', (email: string, password: string) => {
  return cy.loginApi(email, password).then((token) => {
    // Garantir que o localStorage seja gravado na origem correta do app
    // (http://localhost:5173), não no about:blank onde um cy.window() direto
    // antes de qualquer cy.visit resolveria. Visitamos /login primeiro porque
    // é a rota pública mais barata (não bate em /users/me do AuthContext).
    cy.visit('/login');
    cy.window().then((win) => {
      win.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    });
    return cy.wrap(token);
  });
});

Cypress.Commands.add('registerUser', (input: UserInput) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  return cy
    .request('POST', `${apiUrl}/auth/register`, {
      name: input.name,
      email: input.email,
      password: input.password,
      passwordConfirmation: input.password,
    })
    .then((res) => {
      const token = extractToken(res.body);
      if (!token) {
        throw new Error(`registerUser failed: no token in response ${JSON.stringify(res.body)}`);
      }
      const b = res.body as Record<string, unknown>;
      const user = (b.user ?? (b.data as Record<string, unknown> | undefined)?.user) as unknown;
      return cy.wrap({ user, token } as RegisterResult);
    });
});

Cypress.Commands.add('createGame', (token: string, payload: GamePayload) => {
  return cy
    .apiRequest('POST', '/games', { token, body: payload })
    .then((res) => {
      expect([200, 201], 'createGame status').to.include(res.status);
      return cy.wrap(unwrapGame(res.body));
    });
});

Cypress.Commands.add(
  'createSession',
  (token: string, gameId: string, payload: { hours: number }) => {
    return cy
      .apiRequest('POST', `/games/${gameId}/sessions`, { token, body: payload })
      .then((res) => {
        expect([200, 201], 'createSession status').to.include(res.status);
        return cy.wrap(unwrapSession(res.body));
      });
  },
);

Cypress.Commands.add(
  'setGameStatus',
  (token: string, gameId: string, status: Game['status']) => {
    return cy
      .apiRequest('PATCH', `/games/${gameId}`, { token, body: { status } })
      .then((res) => {
        expect(res.status, 'setGameStatus status').to.eq(200);
        return cy.wrap(unwrapGame(res.body));
      });
  },
);

Cypress.Commands.add(
  'setGameRating',
  (token: string, gameId: string, rating: number) => {
    return cy
      .apiRequest('PATCH', `/games/${gameId}`, { token, body: { rating } })
      .then((res) => {
        expect(res.status, 'setGameRating status').to.eq(200);
        return cy.wrap(unwrapGame(res.body));
      });
  },
);

Cypress.Commands.add('resetDatabase', () => {
  return cy.task<null>('resetDatabase', null, { timeout: 60000 }).then(() => null);
});

export {};
