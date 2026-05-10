const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('pu_knowledge.json', 'utf8'));

// Boilerplate lines to remove
const blacklist = [
    "About Us", "History", "IMPACT", "Leaders", "Academic", "Undergraduate", 
    "Graduate", "Professional", "Fast Track", "Admission", "Campus Life", 
    "Student and Alumni Support", "Internship Career Center", "International Office", 
    "Student Affairs", "Setsail", "Sustainability", "Library", "SPMI", "Ecampus", 
    "Endowment Fund", "Research", "News", "Search", "Your Journey Begins Here!", 
    "Apply Now!", "TIAS Scholarship", "Click to schedule a meeting with our education consultant", 
    "Home", "Jl. Ki Hajar Dewantara", "Kota Jababeka", "Cikarang Baru", 
    "Bekasi 17550", "Indonesia", "081510023999", "081510040999", "info@president.ac.id",
    "President University Virtual Tour", "See More", "Explore the right study programme for you."
];

// Determine Topic based on URL
function getTopic(url) {
    if (url.includes('/academic/undergraduate')) return 'Academic - Undergraduate';
    if (url.includes('/academic/graduate')) return 'Academic - Graduate';
    if (url.includes('/academic/professional')) return 'Academic - Professional';
    if (url.includes('/academic')) return 'Academic - General';
    if (url.includes('/admission')) return 'Admission & Scholarships';
    if (url.includes('/campus-life') || url.includes('/facility')) return 'Campus Life & Facilities';
    if (url.includes('/research')) return 'Research & Grants';
    if (url.includes('/news')) return 'News & Updates';
    if (url.includes('/leaders') || url.includes('/about') || url.includes('/history') || url.includes('/impact')) return 'About Us & Leaders';
    if (url.includes('/internship') || url.includes('/career')) return 'Internship & Career';
    if (url.includes('/international')) return 'International Office';
    return 'General Information';
}

const structuredKnowledge = {};

rawData.forEach(doc => {
    // Basic filter
    if (doc.title.includes('500 Internal') || doc.title.includes('Undefined offset')) return;

    const topic = getTopic(doc.url);
    if (!structuredKnowledge[topic]) {
        structuredKnowledge[topic] = [];
    }

    const lines = doc.content.split('\n');
    let cleanedLines = lines.map(l => l.trim()).filter(l => {
        // Remove empty lines
        if (l.length === 0) return false;
        
        // Remove if perfectly matches blacklist
        if (blacklist.includes(l)) return false;
        
        // Remove if contains specific boilerplate
        if (l.includes('Jl. Ki Hajar Dewantara') || l.includes('Bekasi 17550')) return false;

        // Remove very short lines (often UI buttons like "Read More", "Detail", dates like "12 Aug 2023")
        const wordCount = l.split(/\s+/).length;
        if (wordCount < 4 && !l.includes('Rector') && !l.includes('Dean') && !l.includes('Faculty')) {
            return false;
        }

        return true;
    });

    // Remove duplicates from the same page (sometimes UI repeats)
    cleanedLines = [...new Set(cleanedLines)];

    const finalContent = cleanedLines.join(' ');
    
    // Only add if there is meaningful content
    if (finalContent.length > 50) {
        structuredKnowledge[topic].push({
            title: doc.title.replace('President University - ', '').trim(),
            url: doc.url,
            content: finalContent
        });
    }
});

// Convert object to flat array, but heavily grouped/structured
let finalArray = [];
for (const [topic, docs] of Object.entries(structuredKnowledge)) {
    docs.forEach(doc => {
        finalArray.push({
            topic: topic,
            title: doc.title,
            url: doc.url,
            content: doc.content
        });
    });
}

// Save as new clean knowledge base
fs.writeFileSync('pu_knowledge_clean.json', JSON.stringify(finalArray, null, 2));
console.log('Cleaned knowledge base generated: ' + finalArray.length + ' documents.');
