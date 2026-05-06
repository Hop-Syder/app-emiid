/**
 * @description Script de validation des variables d'environnement
 * @usage node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation des variables d\'environnement...\n');

const envPath = path.join(__dirname, '..', '.env');
const examplePath = path.join(__dirname, '..', '.env.example');

let hasErrors = false;

// Vérifier que .env existe
if (!fs.existsSync(envPath)) {
    console.error('❌ ERREUR: Le fichier .env n\'existe pas');
    console.log('💡 Solution: Copiez .env.example vers .env et remplissez les valeurs');
    process.exit(1);
}

// Vérifier que .env.example existe
if (!fs.existsSync(examplePath)) {
    console.error('❌ ERREUR: Le fichier .env.example n\'existe pas');
    process.exit(1);
}

// Charger les variables
const envContent = fs.readFileSync(envPath, 'utf-8');
const exampleContent = fs.readFileSync(examplePath, 'utf-8');

const parseEnv = (content) => {
    const lines = content.split('\n');
    const vars = {};
    lines.forEach(line => {
        const match = line.match(/^([^#][^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2]?.trim() || '';
            vars[key] = value;
        }
    });
    return vars;
};

const envVars = parseEnv(envContent);
const exampleVars = parseEnv(exampleContent);

// Vérifier que toutes les variables de .env.example sont dans .env
console.log('📋 Vérification des variables requises...\n');

Object.keys(exampleVars).forEach(key => {
    if (!envVars[key]) {
        console.error(`❌ MANQUANT: ${key}`);
        hasErrors = true;
    } else {
        console.log(`✅ Présent: ${key}`);
    }
});

console.log('\n📊 Vérification des valeurs...\n');

// Vérifier que les valeurs ne sont pas vides
Object.keys(envVars).forEach(key => {
    const value = envVars[key];

    // Ignorer les valeurs vides pour les variables optionnelles
    const optionalVars = ['CORS_ORIGIN'];
    if (optionalVars.includes(key)) return;

    if (!value || value.trim() === '') {
        console.error(`❌ VIDE: ${key} doit avoir une valeur`);
        hasErrors = true;
    } else if (value.includes('your_') || value.includes('CHANGE_ME')) {
        console.error(`⚠️  À REMPLACER: ${key} contient une valeur par défaut`);
        hasErrors = true;
    } else {
        console.log(`✅ Configuré: ${key}`);
    }
});

// Vérifications spécifiques
console.log('\n🔐 Vérifications de sécurité...\n');

if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
    if (envVars.SUPABASE_SERVICE_ROLE_KEY.length < 20) {
        console.error('❌ CRITIQUE: SUPABASE_SERVICE_ROLE_KEY est trop courte');
        hasErrors = true;
    } else {
        console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Longueur valide');
    }
}

if (envVars.SUPABASE_JWT_SECRET) {
    if (envVars.SUPABASE_JWT_SECRET.length < 32) {
        console.error('❌ CRITIQUE: SUPABASE_JWT_SECRET est trop courte (min 32 caractères)');
        hasErrors = true;
    } else {
        console.log('✅ SUPABASE_JWT_SECRET: Longueur valide');
    }
}

// Résultat final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('❌ VALIDATION ÉCHOUÉE');
    console.log('\n💡 Actions requises:');
    console.log('   1. Corrigez les erreurs ci-dessus');
    console.log('   2. Assurez-vous que .env contient toutes les variables requises');
    console.log('   3. Ne commitez JAMAIS .env dans Git');
    process.exit(1);
} else {
    console.log('✅ VALIDATION RÉUSSIE');
    console.log('\n🎉 Toutes les variables sont correctement configurées');
    console.log('\n⚠️  Rappel de sécurité:');
    console.log('   - Ne commitez jamais .env');
    console.log('   - Utilisez .env.example comme template');
    console.log('   - Gardez vos secrets hors de Git');
}
