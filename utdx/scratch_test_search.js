const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.document = {
    getElementById: (id) => {
        return { value: '', style: { display: 'none' } };
    }
};
global.unitDatabase = [];
global.unitSpecificTraits = {};
global.customTraits = [];

// Load state by evaling to put variables in global scope
try {
    const stateText = fs.readFileSync('./backend/state.js', 'utf-8');
    eval(stateText.replace(/let\s+/g, 'global.').replace(/const\s+/g, 'global.'));
} catch(e) {
    console.error('Error loading state:', e);
}

// Load traits by evaling to put variables in global scope
try {
    const traitsText = fs.readFileSync('./shared/traits/traits.js', 'utf-8');
    eval(traitsText.replace(/const\s+traitsList/g, 'global.traitsList'));
} catch(e) {
    console.error('Error loading traits:', e);
}

// Load units
const unitDir = './units';
fs.readdirSync(unitDir).forEach(file => {
    if (file.endsWith('.js') && file !== 'unitjstemplate.txt') {
        try {
            require('./units/' + file);
        } catch(e) {
            console.error('Error loading unit file:', file, e);
        }
    }
});

console.log('Total units loaded:', unitDatabase.length);
console.log('traitsList loaded:', typeof traitsList, traitsList ? traitsList.length : 'undefined');

// Let's implement/isolate the search filter code exactly from rendering.js
function testSearch(searchTerm) {
    searchTerm = (searchTerm || '').trim().toLowerCase();
    
    let filtered = unitDatabase;
    if (searchTerm) {
        filtered = unitDatabase.filter(unit => {
            const title = (unit.name || '').toLowerCase();
            const role = (unit.role || '').toLowerCase();
            const id = (unit.id || '').toLowerCase();
            const placement = (unit.placementType || 'Ground').toLowerCase();
            const element = (unit.stats && unit.stats.element) ? unit.stats.element.toLowerCase() : '';

            let matches = title.includes(searchTerm) ||
                role.includes(searchTerm) ||
                id.includes(searchTerm) ||
                placement.includes(searchTerm) ||
                element.includes(searchTerm);
            if (!matches && (searchTerm === 'ground' || searchTerm === 'hill')) {
                if (placement === 'hybrid') matches = true;
            }
            if (!matches) {
                // Check unit's recommended meta traits (short, long, and note tags)
                const metaShort = (unit.meta && unit.meta.short) ? unit.meta.short.toLowerCase() : '';
                const metaLong = (unit.meta && unit.meta.long) ? unit.meta.long.toLowerCase() : '';
                if (metaShort.includes(searchTerm) || metaLong.includes(searchTerm)) {
                    matches = true;
                }

                // Check custom unit-specific traits assigned by the user
                if (!matches && typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unit.id]) {
                    const specific = Array.isArray(unitSpecificTraits[unit.id]) ? unitSpecificTraits[unit.id] : [];
                    if (specific.some(t => t && t.name && t.name.toLowerCase().includes(searchTerm))) {
                        matches = true;
                    }
                }
            }
            return matches;
        });
    }
    return filtered;
}

// Test with different terms
const terms = ['spade', 'ruler', 'hill', 'ground', 'fire', 'dummy'];
terms.forEach(term => {
    try {
        console.log(`\nTesting search for: "${term}"`);
        const res = testSearch(term);
        console.log(`Found: ${res.length} matches. Names:`, res.map(u => u.name));
    } catch (err) {
        console.error(`ERROR searching for "${term}":`, err);
    }
});
