const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            const ext = path.extname(file);
            if (['.tsx', '.ts', '.js', '.jsx', '.md', '.sql', '.json'].includes(ext)) {
                results.push(file);
            }
        }
    });
    return results;
};

const files = walk('.');

files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace Nukun with Nukun
    content = content.replace(/Nukun/g, 'Nukun');
    
    // Replace nukun.app with nukun.app
    content = content.replace(/nexus-connect\.vercel\.app/g, 'nukun.app');

    // Replace Nukun with Nukun, but NOT in "@organization Nexus Partners" or "Nexus Partners"
    // We can use a lookahead/lookbehind if supported, or just a temporary marker
    const orgMarker = 'Nexus Partners';
    content = content.replace(/Nexus Partners/g, orgMarker);
    
    // Now replace remaining "Nukun"
    content = content.replace(/Nukun/g, 'Nukun');
    
    // Restore Org
    content = content.replace(new RegExp(orgMarker, 'g'), 'Nexus Partners');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
