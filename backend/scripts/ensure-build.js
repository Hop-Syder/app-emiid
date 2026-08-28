#!/usr/bin/env node
/**
 * Filet de sécurité au démarrage : compile TypeScript si `dist/` est absent.
 *
 * Le blueprint render.yaml prévoit `pnpm install && pnpm run build`, mais un
 * service Render créé manuellement peut n'avoir que `pnpm install` dans son
 * buildCommand — le démarrage échoue alors sur
 * « Cannot find module dist/server.js ».
 *
 * Ce garde est intégré au script `start` (et non à un `prestart`, que pnpm
 * n'exécute pas par défaut). No-op quand la compilation a déjà eu lieu.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const entry = path.join(__dirname, '..', 'dist', 'server.js');

if (fs.existsSync(entry)) process.exit(0);

console.warn('[ensure-build] dist/server.js absent — compilation TypeScript…');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (err) {
  console.error('[ensure-build] Compilation impossible.', err && err.message);
  console.error('[ensure-build] Corrigez le buildCommand Render :');
  console.error('               pnpm install --no-frozen-lockfile && pnpm run build');
  process.exit(1);
}

if (!fs.existsSync(entry)) {
  console.error('[ensure-build] dist/server.js toujours absent après compilation.');
  process.exit(1);
}
console.warn('[ensure-build] Compilation terminée.');
