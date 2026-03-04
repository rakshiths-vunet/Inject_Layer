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

        // text-white -> text-text-100
        content = content.replace(/text-white(\/[0-9]+)?/g, 'text-text-100$1');
        content = content.replace(/bg-white(\/[0-9]+)?/g, 'bg-text-100$1'); // Note: white text becomes dark text in light mode, so bg-white becomes bg-text-100 (which is dark)
        content = content.replace(/border-white(\/[0-9]+)?/g, 'border-text-100$1');
        content = content.replace(/ring-white(\/[0-9]+)?/g, 'ring-text-100$1');
        content = content.replace(/text-black(\/[0-9]+)?/g, 'text-bg-900$1');
        content = content.replace(/bg-black(\/[0-9]+)?/g, 'bg-bg-900$1');

        // Hex codes mapping to vars
        content = content.replace(/bg-\[\#0F1114\]/gi, 'bg-panel-800');
        content = content.replace(/bg-\[\#14161A\]/gi, 'bg-panel-700');
        content = content.replace(/bg-\[\#1A1D23\]/gi, 'bg-panel-600');
        content = content.replace(/bg-\[\#1A1D24\]/gi, 'bg-panel-600');
        content = content.replace(/bg-\[\#0A0B0E\]/gi, 'bg-bg-900');
        content = content.replace(/bg-\[\#FFC857\]/gi, 'bg-accent-500');

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated: ' + filePath);
        }
    }
});
