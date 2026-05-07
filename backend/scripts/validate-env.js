/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Script de validation des variables d'environnement compatible local et CI/CD (Railway)
 * @updated 2026-05-07
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Charge le .env s'il existe

console.log('🔍 Validation des variables d\'environnement...\n');

const examplePath = path.join(__dirname, '..', '.env.example');
let hasErrors = false;

// Vérifier que .env.example existe pour servir de template
if (!fs.existsSync(examplePath)) {
    console.error('❌ ERREUR: Le fichier .env.example n\'existe pas');
    process.exit(1);
}

// Extraire les clés requises depuis .env.example
const exampleContent = fs.readFileSync(examplePath, 'utf-8');
const requiredKeys = exampleContent
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim());

console.log('📋 Vérification des variables requises...\n');

requiredKeys.forEach(key => {
    const value = process.env[key];
    
    if (!value) {
        console.error(`❌ MANQUANT: ${key}`);
        hasErrors = true;
    } else {
        console.log(`✅ Présent: ${key}`);
    }
});

console.log('\n📊 Vérification des valeurs...\n');

requiredKeys.forEach(key => {
    const value = process.env[key];
    if (!value) return;

    // Ignorer les valeurs vides pour les variables optionnelles si nécessaire
    const optionalVars = ['CORS_ORIGIN', 'SMTP_SECURE', 'VAPID_SUBJECT'];
    if (optionalVars.includes(key)) return;

    if (value.trim() === '') {
        console.error(`❌ VIDE: ${key} doit avoir une valeur`);
        hasErrors = true;
    } else if (value.includes('your_') || value.includes('CHANGE_ME')) {
        console.error(`⚠️  À REMPLACER: ${key} contient une valeur par défaut`);
        hasErrors = true;
    } else {
        console.log(`✅ Configuré: ${key}`);
    }
});

// Vérifications de sécurité spécifiques
console.log('\n🔐 Vérifications de sécurité...\n');

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceRoleKey && serviceRoleKey.length < 20) {
    console.error('❌ CRITIQUE: SUPABASE_SERVICE_ROLE_KEY est trop courte');
    hasErrors = true;
} else if (serviceRoleKey) {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Longueur valide');
}

const jwtSecret = process.env.SUPABASE_JWT_SECRET;
if (jwtSecret && jwtSecret.length < 32) {
    console.error('❌ CRITIQUE: SUPABASE_JWT_SECRET est trop courte (min 32 caractères)');
    hasErrors = true;
} else if (jwtSecret) {
    console.log('✅ SUPABASE_JWT_SECRET: Longueur valide');
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('❌ VALIDATION ÉCHOUÉE');
    process.exit(1);
} else {
    console.log('✅ VALIDATION RÉUSSIE');
    console.log('\n🎉 Toutes les variables sont correctement configurées');
}
