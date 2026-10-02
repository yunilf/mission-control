const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find terminal button
let buttonStart = -1;
let buttonEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("onClick={() => setActiveTab('terminal')}")) {
        buttonStart = i;
        if (lines[i].includes("</button>")) {
             buttonEnd = i;
        } else if (lines[i+1].includes("</button>")) {
             buttonEnd = i+1;
        } else if (lines[i+2].includes("</button>")) {
             buttonEnd = i+2;
        }
        break;
    }
}

// Find terminal block
let termBlockStart = -1;
let termBlockEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'terminal' && (")) {
        termBlockStart = i;
    }
    // We look for the closing div block of the terminal
    if (termBlockStart !== -1 && i > termBlockStart) {
        if (lines[i].trim() === ")}" && lines[i-1].includes("</div>") && lines[i-2].includes("</div>")) {
            termBlockEnd = i;
            break;
        }
    }
}

// Extract terminal block (inner content, excluding activeTab wrapper)
let terminalInner = [];
if (termBlockStart !== -1 && termBlockEnd !== -1) {
    // skip the first two lines: {activeTab === 'terminal' && ( \n <div className="h-full flex flex-col">
    // skip the last two lines: </div> \n )}
    for (let i = termBlockStart + 2; i <= termBlockEnd - 2; i++) {
        terminalInner.push(lines[i]);
    }
}

// Find the end of the monitor block
let monitorBlockEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("65.6K")) {
        // the 65.6K is around line ~253
        // wait, let's find the `)}` for activeTab === 'monitor'
        for (let j = i; j < lines.length; j++) {
             if (lines[j].trim() === ")}" && lines[j-1].includes("</div>")) {
                 monitorBlockEnd = j;
                 break;
             }
        }
        break;
    }
}

// Construct the new lines array
let newLines = [];
for (let i = 0; i < lines.length; i++) {
    // Skip button
    if (i >= buttonStart && i <= buttonEnd) continue;
    // Skip old terminal block
    if (i >= termBlockStart && i <= termBlockEnd) continue;

    // Inject terminal into monitor
    if (i === monitorBlockEnd) {
        newLines.push(`                    {/* Terminal movido */}`);
        newLines.push(`                    <div className="flex flex-col mt-6 h-[400px]">`);
        newLines.push(...terminalInner);
        newLines.push(`                    </div>`);
    }

    newLines.push(lines[i]);
}

content = newLines.join('\n');
fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done modifying page.tsx perfectly');
