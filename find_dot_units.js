const fs = require('fs');
const path = require('path');

// Mock global variables to load units
global.window = global;
global.document = { createElement: () => ({}), head: { appendChild: () => {} } };
global.unitDatabase = [];

// Load units.js
const unitsJsPath = path.resolve('utdx/backend/data/units.js');
const unitsJs = fs.readFileSync(unitsJsPath, 'utf8');
eval(unitsJs);

// Load each unit JS file
const unitsDir = path.resolve('utdx/units');
fs.readdirSync(unitsDir).forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(unitsDir, file), 'utf8');
        eval(content);
    }
});

// Scan all loaded units
const dotUnits = [];

const hasDoT = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    if (Array.isArray(obj)) {
        return obj.some(item => hasDoT(item));
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const lowerKey = key.toLowerCase();
            // Note: Since units.js push method has already processed them, we check if they have a non-zero value now.
            // But wait, if they originally had a non-zero value, they will still have a non-zero value (e.g. 4 -> 3).
            // Let's check if the value is > 0.
            if (lowerKey === 'dotduration' && typeof obj[key] === 'number' && obj[key] > 0) {
                return true;
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (hasDoT(obj[key])) return true;
            }
        }
    }
    return false;
};

global.unitDatabase.forEach(u => {
    if (hasDoT(u)) {
        dotUnits.push(u.id);
    }
});

console.log('DOT_UNITS:', JSON.stringify(dotUnits));
process.exit(0);
