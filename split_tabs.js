const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// 1. Add the tab button
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

// 2. We need to split the content of 'identidad'.
// The current 'identidad' has a <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// which contains TWO <div className="bg-card border border-border rounded-xl p-6 shadow-sm"> (one for Identity, one for Soul).
// We need to extract the second one and wrap it in `{activeTab === 'tareas' && editingAgent && ( ... )}`

const splitIndex = pageContent.indexOf('<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">\n                        Directivas y Lógica');

if (splitIndex !== -1) {
    // The start of the soul div is a few lines before splitIndex.
    // Let's find the exact <div className="bg-card border border-border rounded-xl p-6 shadow-sm"> before splitIndex.
    const beforeSplit = pageContent.substring(0, splitIndex);
    const lastDivIndex = beforeSplit.lastIndexOf('<div className="bg-card border border-border rounded-xl p-6 shadow-sm">');
    
    // The end of the soul block is at the end of the `grid` div.
    // Then there are two closing divs before `)}` for identidad.
    // Let's find where soul block ends by balancing braces or just looking for the end of the `identidad` block.
    
    const blockEndIndex = pageContent.indexOf('{activeTab === \'conocimiento\' && editingAgent && (', lastDivIndex);
    
    if (lastDivIndex !== -1 && blockEndIndex !== -1) {
        // We know the end of the `identidad` block is something like:
        //               </div>
        //             </div>
        //           )}
        
        let extractedSoul = pageContent.substring(lastDivIndex, blockEndIndex);
        
        // Remove the closing tags of `grid` and `identidad` container from the end of extractedSoul
        // extractedSoul currently contains:
        // <div className="bg-card ..."> ... soul stuff ... </div>
        //   </div>
        // </div>
        // )}
        
        // We only want the inner soul div.
        // Let's just find the closing </div> of the soul block.
        // The soul block is exactly 1 div deep? No, it has nested divs.
        
        // Actually, since we generated it using replace earlier, let's just read the original JSX from my fix script!
        
    }
}
