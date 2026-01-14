import fs from 'fs';
import path from 'path';

const envExamplePath = path.resolve(process.cwd(), '.env.example');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envExamplePath)) process.exit(0);

const parseEnv = (content) => content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split('=')[0]);
const exampleKeys = parseEnv(fs.readFileSync(envExamplePath, 'utf-8'));

if (!fs.existsSync(envLocalPath)) {
    console.error('⛔ ERROR: Falta .env.local. Copia .env.example.');
    process.exit(1);
}

const localKeys = parseEnv(fs.readFileSync(envLocalPath, 'utf-8'));
const missingKeys = exampleKeys.filter(key => !localKeys.includes(key));

if (missingKeys.length > 0) {
    console.log('⚠️  Nuevas variables detectadas. Sincronizando...');
    const exampleLines = fs.readFileSync(envExamplePath, 'utf-8').split('\n');
    const linesToAdd = [];
    missingKeys.forEach(key => {
        const line = exampleLines.find(l => l.trim().startsWith(`${key}=`));
        if (line) linesToAdd.push(line);
    });
    if (linesToAdd.length > 0) {
        fs.appendFileSync(envLocalPath, '\n# --- Auto-merged ---\n' + linesToAdd.join('\n') + '\n');
        console.log('✅ Variables añadidas a .env.local. Por favor, EDITA sus valores.');
        process.exit(1);
    }
}
