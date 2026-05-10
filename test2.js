const fs = require('fs'); 
const puKnowledge = JSON.parse(fs.readFileSync('pu_knowledge.json', 'utf8')); 
const query = 'Is there any scholarship that available?'; 
const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2); 
let docFrequencies = {}; 
words.forEach(w => docFrequencies[w] = 0); 

puKnowledge.forEach(doc => { 
    const text = (doc.title + ' ' + doc.content).toLowerCase(); 
    words.forEach(w => { 
        if (new RegExp('\\b' + w + '\\b').test(text)) { 
            docFrequencies[w]++; 
        } 
    }); 
}); 

const N = puKnowledge.length; 
let scoredDocs = puKnowledge.map(doc => { 
    let score = 0; 
    const text = (doc.title + ' ' + doc.content).toLowerCase(); 
    words.forEach(w => { 
        const matches = text.match(new RegExp('\\b' + w + '\\b', 'g')); 
        const tf = matches ? matches.length : 0; 
        if (tf > 0) { 
            const df = docFrequencies[w]; 
            const idf = Math.log(N / (df || 1)); 
            score += tf * idf; 
        } 
    }); 
    return { doc, score }; 
}); 

scoredDocs.sort((a, b) => b.score - a.score); 
const bestDocs = scoredDocs.filter(d => d.score > 0).slice(0, 4); 
console.log(bestDocs.map(d => ({title: d.doc.title, score: d.score}))); 
console.log('df:', docFrequencies);
