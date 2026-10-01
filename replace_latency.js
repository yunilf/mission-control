const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const searchStr = '{/* 1. Latency Chart */}';
const endStr = '{/* 2. Connection States */}';
const startIdx = content.indexOf(searchStr);
const endIdx = content.indexOf(endStr);
if (startIdx !== -1 && endIdx !== -1) {
    const newBlock = `{/* 1. Latency Chart */}
                    <div className="bg-card border border-border rounded-lg p-5 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Latencia de Inferencia (Últimos 30m)</h3>
                      <div className="flex-1 flex items-end gap-1 opacity-80 min-h-[80px]">
                        {(selectedAgent.latencyHistory?.length > 0 ? selectedAgent.latencyHistory : [...Array(15).fill(0)]).slice(-15).map((lat, i) => {
                          const height = lat === 0 ? 5 : Math.min(100, Math.max(10, (lat / 5000) * 100));
                          const isHigh = lat > 3000;
                          return (
                            <div 
                              key={i} 
                              className={\`flex-1 rounded-t-sm \${lat === 0 ? 'bg-primary/20' : (isHigh ? 'bg-orange-500' : 'bg-emerald-500')} hover:opacity-100 transition-colors cursor-crosshair relative group\`}
                              style={{ height: \`\${height}%\` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                {lat}ms
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                        <span>Hace 30m</span>
                        <span>Ahora</span>
                      </div>
                    </div>

                    `;
    content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
    fs.writeFileSync('src/app/agents/page.tsx', content);
    console.log('done');
} else {
    console.log('Not found');
}
