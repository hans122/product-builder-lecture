const fs = require('fs');
const path = require('path');

function bumpVersion(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const versionRegex = /v(\d+)\.(\d+)/;
    const match = content.match(versionRegex);
    
    if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]);
        const newVersion = `v${major}.${minor + 1}`;
        content = content.replace(versionRegex, newVersion);
        fs.writeFileSync(filePath, content, 'utf8');
        return newVersion;
    }
    return null;
}

const files = ['GEMINI.md', 'PRD.md', 'SDD.md', 'DATA_SCHEMA.md'];
files.forEach(f => {
    const fullPath = path.join(process.cwd(), f);
    const result = bumpVersion(fullPath);
    if (result) console.log(`Bumped ${f} to ${result}`);
});
