import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Usa fileURLToPath pra decodificar URL escapes (ex.: %20 em "GAMELOG") e
// normalizar separadores. Essencial em paths do Windows com espaços.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const E2E_DIR = path.resolve(SCRIPT_DIR, '..');
const REPO_ROOT = path.resolve(E2E_DIR, '..');
const RUNS = 10;

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: true });
  if (r.error) {
    console.error(`[run-10x] spawn error (${cmd} ${args.join(' ')} em ${cwd}):`, r.error.message);
  }
  return r.status ?? 1;
}

const results = [];
const started = Date.now();

for (let i = 1; i <= RUNS; i += 1) {
  console.log(`\n=== Rodada ${i}/${RUNS} ===`);
  const resetCode = run('npm', ['run', 'prisma:reset-test'], REPO_ROOT);
  if (resetCode !== 0) {
    results.push({ i, phase: 'reset', code: resetCode });
    continue;
  }
  const t0 = Date.now();
  const cyCode = run('npx', ['cypress', 'run'], E2E_DIR);
  const elapsed = Date.now() - t0;
  results.push({ i, phase: 'cypress', code: cyCode, elapsedMs: elapsed });
}

const total = Date.now() - started;
console.log('\n=== Resumo 10x ===');
console.log(JSON.stringify(results, null, 2));
console.log(`Tempo total: ${(total / 1000).toFixed(1)}s`);
const failed = results.filter((r) => r.code !== 0).length;
process.exit(failed === 0 ? 0 : 1);
