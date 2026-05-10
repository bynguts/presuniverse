const fs = require('fs'); 
const puKnowledge = JSON.parse(fs.readFileSync('pu_knowledge_clean.json', 'utf8')); 
const query = 'I know from Google that said President University has something that called impact. What is it? What does it mean?'; 
const stopWords = new Set(["the", "and", "that", "this", "there", "their", "they", "are", "with", "from", "have", "has", "had", "what", "which", "who", "whom", "where", "when", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "nor", "not", "only", "own", "same", "than", "too", "very", "can", "will", "just", "should", "now", "available", "for", "about", "president", "university", "presuniv", "pu", "does", "mean", "is", "it", "said", "called", "know", "google", "something"]);
const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)); 
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
console.log('words:', words);
console.log('df:', docFrequencies);
