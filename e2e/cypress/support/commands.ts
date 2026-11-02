/// <reference types="cypress" />

const TOKEN_STORAGE_KEY = 'gamelog.token';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<string>;
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

Cypress.Commands.add('login', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  return cy
    .request('POST', `${apiUrl}/auth/login`, { email, password })
    .then((res) => {
      const token = extractToken(res.body);
      if (!token) {
        throw new Error(`Login failed: no token in response body ${JSON.stringify(res.body)}`);
      }
      cy.window().then((win) => {
        win.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      });
      return cy.wrap(token);
    });
});

Cypress.Commands.add('resetDatabase', () => {
  return cy.task<null>('resetDatabase', null, { timeout: 60000 }).then(() => null);
});

Cypress.Commands.add(
  'apiRequest',
  (method, path, options = {}) => {
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
  },
);

export {};
