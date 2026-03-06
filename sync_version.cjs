'use strict';

const fs = require('fs');
const path = require('path');

/**
 * AI Vibe Sync Engine v1.0
 * 1. Read SYSTEM_VERSION from core.js
 * 2. Update all .html files with ?v=SYSTEM_VERSION
 * 3. Update all documentation version numbers (vX.X)
 */

function getCoreVersion() {
    const corePath = path.join(process.cwd(), 'core.js');
    if (!fs.existsSync(corePath)) return '11.2';
    const coreContent = fs.readFileSync(corePath, 'utf8');
    const versionMatch = coreContent.match(/SYSTEM_VERSION:\s*'([^']+)'/);
    return versionMatch ? versionMatch[1] : '11.2';
}

function syncHtmlResources(version) {
    const files = fs.readdirSync(process.cwd());
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    htmlFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // CSS/JS 쿼리 파라미터 업데이트 (?v=X.X)
        const resourceRegex = /(\.css|\.js)\?v=[\d.]+/g;
        const newContent = content.replace(resourceRegex, `$1?v=${version}`);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`[Sync] Updated resources in ${file} to v${version}`);
        }
    });
}

function syncDocVersions(version) {
    const docs = ['PRD.md', 'SDD.md', 'DATA_SCHEMA.md', 'GEMINI.md'];
    docs.forEach(doc => {
        const filePath = path.join(process.cwd(), doc);
        if (!fs.existsSync(filePath)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        // 제목이나 내용의 (vX.X) 패턴 업데이트
        const docVersionRegex = /\(v\d+\.\d+\)/g;
        const newContent = content.replace(docVersionRegex, `(v${version})`);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`[Sync] Updated version in ${doc} to v${version}`);
        }
    });
}

const currentVersion = getCoreVersion();
console.log(`\n🚀 Starting AI Vibe Sync (Target Version: v${currentVersion})\n`);
syncHtmlResources(currentVersion);
syncDocVersions(currentVersion);
console.log(`\n✅ Sync Complete! All files are aligned to v${currentVersion}.\n`);
