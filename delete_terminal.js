const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const lines = content.split('\n');

const newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'terminal' && (")) {
        skip = true;
    }
    
    if (!skip) {
        newLines.push(lines[i]);
    }

    // We know exactly what the end looks like:
    //                   </div>
    //                 </div>
    //               )}
    if (skip && lines[i].trim() === ")}(" && lines[i-1].trim() === "</div>" && lines[i-2].trim() === "</div>") {
        // Wait, the line is just `              )}`
    }
    
    if (skip && lines[i] === "              )}") {
        skip = false;
    }
}

content = newLines.join('\n');
fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done deleting terminal block');
