const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

walk('app', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Fix unquoted var(--...) in styles
        content = content.replace(/:\s+var\(--([a-zA-Z0-9-]+)\)([,}])/g, ": 'var(--$1)'$2");

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed: ' + filePath);
        }
    }
});
