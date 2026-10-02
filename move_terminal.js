const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// 1. Remove "Terminal en vivo" tab button
content = content.replace(/\s*<button onClick=\{\(\) => setActiveTab\('terminal'\)\} className=\{`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \$\{activeTab === 'terminal' \? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'\}`\}>\s*Terminal en vivo\s*<\/button>/, "");

// 2. Extract terminal content
const terminalRegex = /\s*\{activeTab === 'terminal' && \(\s*<div className="h-full flex flex-col">\s*<div className="flex items-center justify-between mb-2">([\s\S]*?)<\/div>\s*\)\}/;

const match = content.match(terminalRegex);
if (match) {
    // The full matched block
    const terminalBlock = `                  <div className="flex flex-col mt-6 h-[400px]">
                    <div className="flex items-center justify-between mb-2">` + match[1] + `</div>`;

    // Remove the old block
    content = content.replace(match[0], "");

    // Insert it into the monitor tab
    // Finding the end of the monitor tab is tricky with regex, but we know it ends with:
    //                   </div>
    //                 </div>
    //               )}
    // Let's inject it right before `                )}`
    
    // Actually, looking at the code, it ends with:
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               )}
    
    // I can just replace the end of the monitor block:
    const monitorEndRegex = /\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;
    // Wait, let's just find `// End of monitor block` or replace a specific part.
    // In the code:
    /*
                            <div className="bg-secondary/20 p-2 rounded-lg border border-border flex flex-col">
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Salida</span>
                              <span className="font-mono font-medium">65.6K</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
    */
    
    const monitorEnd = `                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`;
                    
    content = content.replace(monitorEnd, monitorEnd + "\n" + terminalBlock);
} else {
    console.log("Terminal block not found");
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done moving terminal');
