const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const lines = content.split('\n');

let buttonStart = -1, buttonEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("onClick={() => setActiveTab('terminal')}")) {
        buttonStart = i;
        buttonEnd = i + 2; // the button has 3 lines
        break;
    }
}

let termBlockStart = -1, termBlockEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'terminal' && (")) {
        termBlockStart = i;
        for (let j = i; j < lines.length; j++) {
            if (lines[j].trim() === ")}" && lines[j-1].includes("</div>") && lines[j-2].includes("</div>")) {
                termBlockEnd = j;
                break;
            }
        }
        break;
    }
}

let terminalInner = [];
for (let i = termBlockStart + 2; i <= termBlockEnd - 2; i++) {
    terminalInner.push(lines[i]);
}

let monitorBlockEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("65.6K")) {
        // Find the div that closes the grid
        for (let j = i; j < lines.length; j++) {
            if (lines[j].includes("</div>") && lines[j+1].includes("</div>") && lines[j+2].trim() === ")}") {
                monitorBlockEnd = j;
                break;
            }
        }
        break;
    }
}

let newLines = [];
for (let i = 0; i < lines.length; i++) {
    if (i >= buttonStart && i <= buttonEnd) continue;
    if (i >= termBlockStart && i <= termBlockEnd) continue;

    newLines.push(lines[i]);
    
    // Inject terminal into the monitor block, right before it closes
    if (i === monitorBlockEnd) {
        newLines.push(`                    {/* Terminal movido */}`);
        newLines.push(`                    <div className="flex flex-col h-[400px]">`);
        newLines.push(...terminalInner);
        newLines.push(`                    </div>`);
    }
}

content = newLines.join('\n');
fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done modifying page.tsx successfully');
