type LogLevel = 'info' | 'warn' | 'error';

function emit(level: LogLevel, msg: string, meta?: unknown): void {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level.toUpperCase()} ${msg}`;
  // Logger isolado conforme Seção 9 do CLAUDE.md (sem console.log espalhado).
  // eslint-disable-next-line no-console
  if (meta !== undefined) console[level](line, meta);
  // eslint-disable-next-line no-console
  else console[level](line);
}

export const logger = {
  info: (msg: string, meta?: unknown) => emit('info', msg, meta),
  warn: (msg: string, meta?: unknown) => emit('warn', msg, meta),
  error: (msg: string, meta?: unknown) => emit('error', msg, meta),
};
