#!/usr/bin/env node
/**
 * Génère les icônes PWA aux tailles exactes attendues par les navigateurs.
 *
 * Chrome n'émet `beforeinstallprompt` que si le manifeste déclare au moins une
 * icône 192×192 et une 512×512. La source haute définition est donc déclinée
 * ici, plutôt que de laisser le navigateur redimensionner à chaque affichage un
 * fichier de plus de cent kilo-octets.
 *
 * Usage : cd frontend-user && node scripts/generate-pwa-icons.js
 * Requiert `sharp`, déjà présent dans les dépendances du projet.
 */

const path = require('path');
const fs = require('fs');

// Malgré son nom, ce fichier fait 3000×3000 (le 32x32 est à la racine de public/).
const SOURCE = path.join(__dirname, '..', 'public', 'logo', 'icon-light-32x32.png');
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');
const SIZES = [192, 256, 384, 512];

(async () => {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('❌ sharp introuvable. Lancez `pnpm install` dans frontend-user.');
    process.exit(2);
  }

  if (!fs.existsSync(SOURCE)) {
    console.error(`❌ Source absente : ${SOURCE}`);
    process.exit(2);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const out = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ quality: 90 })
      .toFile(out);
    console.log(`  ✅ icon-${size}.png`);
  }

  // Version « maskable » : Android rogne les icônes adaptatives en cercle, en ne
  // garantissant que ~80 % du carré. Le logo est donc rétréci sur un aplat de
  // marque, faute de quoi ses bords seraient coupés.
  const inner = Math.round(512 * 0.78);
  const pad = (512 - inner) >> 1;
  await sharp(SOURCE)
    .resize(inner, inner, { fit: 'contain', background: { r: 1, g: 63, b: 244, alpha: 1 } })
    .extend({
      top: pad,
      bottom: 512 - inner - pad,
      left: pad,
      right: 512 - inner - pad,
      background: { r: 1, g: 63, b: 244, alpha: 1 },
    })
    .png({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'icon-maskable-512.png'));
  console.log('  ✅ icon-maskable-512.png');

  console.log('\n✔ Icônes générées dans public/icons/');
})();
