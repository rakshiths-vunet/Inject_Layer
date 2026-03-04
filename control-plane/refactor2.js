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

        // Remove the hardcoded 'dark' class and `#0B0C0F` from the root of brum page.
        content = content.replace(/className="min-h-screen dark bg-\[\#0B0C0F\]"/g, 'className="min-h-screen bg-bg-900"');
        content = content.replace(/className="min-h-screen bg-\[\#0B0C0F\]"/g, 'className="min-h-screen bg-bg-900"');

        // Replace #0B0C0F (bg-900)
        content = content.replace(/bg-\[\#0B0C0F\]/gi, 'bg-bg-900');
        content = content.replace(/text-\[\#0B0C0F\]/gi, 'text-bg-900');
        content = content.replace(/stroke-\[\#0B0C0F\]/gi, 'stroke-bg-900');
        content = content.replace(/stroke="\#0B0C0F"/gi, 'stroke="currentColor"');
        content = content.replace(/border-\[\#0B0C0F\]/gi, 'border-bg-900');

        // Replace #FFD470 (accent-400 / hover state)
        content = content.replace(/bg-\[\#FFD470\]/gi, 'bg-accent-400');
        content = content.replace(/text-\[\#FFD470\]/gi, 'text-accent-400');

        // Replace #FFC857 (accent-500)
        content = content.replace(/bg-\[\#FFC857\]/gi, 'bg-accent-500');
        content = content.replace(/text-\[\#FFC857\]/gi, 'text-accent-500');
        content = content.replace(/border-\[\#FFC857\]/gi, 'border-accent-500');
        content = content.replace(/shadow-\[\#FFC857\]/gi, 'shadow-accent-500');

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated: ' + filePath);
        }
    }
});
