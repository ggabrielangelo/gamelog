import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`API GameLog ouvindo em http://localhost:${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`Recebido ${signal}, encerrando servidor...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app };
