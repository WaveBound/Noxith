const fs = require('fs');

// Mock browser globals
global.window = global;
global.document = {
    getElementById: (id) => {
        return { value: '', style: { display: 'none' } };
    }
};
global.unitSpecificTraits = {};
global.customTraits = [];
global.traitsList = [];

// Load state by evaling
try {
    const stateText = fs.readFileSync('./backend/state.js', 'utf-8');
    eval(stateText.replace(/let\s+/g, 'global.').replace(/const\s+/g, 'global.'));
} catch(e) {}

// Load traits by evaling
try {
    const traitsText = fs.readFileSync('./shared/traits/traits.js', 'utf-8');
    eval(traitsText.replace(/const\s+traitsList/g, 'global.traitsList'));
} catch(e) {}

// Load db_base.js
try {
    const dbText = fs.readFileSync('./databases/db_base.js', 'utf-8');
    // db_base.js expects global.unitDatabase or defines it
    eval(dbText);
} catch(e) {
    console.error('Error loading db_base.js:', e);
}

// Make sure unitDatabase is in global
if (typeof unitDatabase === 'undefined' && typeof global.unitDatabase !== 'undefined') {
    global.unitDatabase = global.unitDatabase;
}

console.log('Total units loaded from db_base.js:', typeof unitDatabase !== 'undefined' ? unitDatabase.length : 'undefined');

if (typeof unitDatabase !== 'undefined') {
    // Validate fields
    unitDatabase.forEach((u, idx) => {
        if (!u) {
            console.log(`Index ${idx} is null/undefined`);
            return;
        }
        if (!u.name) console.log(`Unit at index ${idx} is missing name:`, u);
        if (!u.role) console.log(`Unit at index ${idx} (${u.name || u.id}) is missing role`);
        if (!u.id) console.log(`Unit at index ${idx} is missing id:`, u);
    });

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
                    const uTraits = [
                        ...(typeof traitsList !== 'undefined' ? traitsList : []),
                        ...(typeof customTraits !== 'undefined' ? customTraits : []),
                        ...(typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unit.id] ? unitSpecificTraits[unit.id] : [])
                    ];
                    if (uTraits.some(t => t && t.name && t.name.toLowerCase().includes(searchTerm))) {
                        matches = true;
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
            console.log(`Found: ${res.length} matches.`);
        } catch (err) {
            console.error(`ERROR searching for "${term}":`, err);
        }
    });
}
