const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const lines = content.split('\n');

// 1. Add the "Sub-agentes" tab button
let configTabBtnIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("setActiveTab('config')")) {
        configTabBtnIdx = i;
        break;
    }
}

if (configTabBtnIdx !== -1) {
    const subagentsBtn = `              <button onClick={() => setActiveTab('subagents')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'subagents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Sub-agentes (Equipo)
              </button>`;
    lines.splice(configTabBtnIdx, 0, subagentsBtn);
}

// 2. Extract Sub-agentes block from config tab
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<h4 className="text-sm font-semibold">Sub-agentes (Equipo)</h4>')) {
        // the block starts slightly before, at the `<div className="bg-secondary/20 ...">`
        for (let j = i - 1; j >= 0; j--) {
            if (lines[j].includes('className="bg-secondary/20 border border-border rounded-lg p-5"')) {
                startIdx = j;
                break;
            }
        }
        
        // Find the end of this div block
        let depth = 0;
        for (let j = startIdx; j < lines.length; j++) {
            if (lines[j].includes('<div')) depth++;
            if (lines[j].includes('</div')) depth--;
            if (depth === 0) {
                endIdx = j;
                break;
            }
        }
        break;
    }
}

let subagentsBlock = [];
if (startIdx !== -1 && endIdx !== -1) {
    // Extract the block
    subagentsBlock = lines.splice(startIdx, endIdx - startIdx + 1);
}

// 3. Inject it as a new activeTab block after config block
let configTabEndIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'config' && (")) {
        // find the end of config tab
        for (let j = i; j < lines.length; j++) {
            if (lines[j].includes(")}")) {
                 if (lines[j-1].includes("</div>") && lines[j-2].includes("</div>")) {
                     configTabEndIdx = j;
                     break;
                 }
            }
        }
        break;
    }
}

if (configTabEndIdx !== -1 && subagentsBlock.length > 0) {
    const newTabContent = [
        `              {activeTab === 'subagents' && (`,
        `                <div className="space-y-6">`,
        ...subagentsBlock,
        `                </div>`,
        `              )}`,
        ``
    ];
    lines.splice(configTabEndIdx + 1, 0, ...newTabContent);
}

content = lines.join('\n');
fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done extracting subagents');
