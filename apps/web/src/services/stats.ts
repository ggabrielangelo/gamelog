import { api } from './api';
import type { BacklogStats } from '../types';

export async function fetchStats(): Promise<BacklogStats> {
  const { data } = await api.get<{ stats: BacklogStats }>('/stats');
  return data.stats;
}
