const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const startStr = "{activeTab === 'identidad' && editingAgent && (";
const endStr = "{activeTab === 'conocimiento' && editingAgent && (";

const start = pageContent.indexOf(startStr);
const end = pageContent.indexOf(endStr);

if (start === -1 || end === -1) {
    console.error("Could not find start or end block");
    process.exit(1);
}

let dump = pageContent.substring(start, end);

const soulRegex = /<div className="bg-card border border-border rounded-xl p-6 shadow-sm">\s*<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">\s*Directivas y Lógica/;
const match = dump.match(soulRegex);

if (!match) {
    console.error("Could not find soul block in dump");
    process.exit(1);
}

const soulStartIndex = match.index;

// Find the last `</div>\n              )}` 
const blockEndIndex = dump.lastIndexOf(')}');

if (blockEndIndex === -1) {
    console.error("Could not find block end in dump");
    process.exit(1);
}

// We want to extract just the HTML for soulContent.
// Since soul block is inside `<div className="grid...">`, the end of the soul div is the `</div>` right before the `</div>` for grid.
// Let's just find the `</div>\n                  </div>\n                </div>\n              )}` and remove it.

const soulContentFull = dump.substring(soulStartIndex, blockEndIndex).trim();
// soulContentFull ends with multiple </div>s. We want to remove the extra wrapper divs.
const soulContent = soulContentFull.replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/, '</div>');

const identityContent = dump.substring(0, soulStartIndex).trim() + '\n                  </div>\n                </div>\n              )}\n';

const finalIdentityContent = identityContent.replace('<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">', '<div className="space-y-8">');

const newTareasTab = `
              {activeTab === 'tareas' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    ${soulContent.replace(/<div className="bg-card border border-border rounded-xl p-6 shadow-sm">\s*<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">\s*Directivas y Lógica\s*<span className="text-xs font-normal text-muted-foreground">SOUL.md<\/span>\s*<\/h3>/, '<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">\n                      Directivas (Tareas y Reglas)\n                      <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>\n                    </h3>').replace(/<\/div>\s*<\/div>\s*$/, '')}
                  </div>
                </div>
              )}
`;

pageContent = pageContent.replace(dump, finalIdentityContent + newTareasTab + '\n              ');

pageContent = pageContent.replace(
    `<button onClick={() => setActiveTab('identidad')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'identidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Identidad
              </button>`,
    `<button onClick={() => setActiveTab('identidad')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'identidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Identidad
              </button>
              <button onClick={() => setActiveTab('tareas')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'tareas' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Tareas
              </button>`
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done splitting tabs');
