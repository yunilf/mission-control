const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const searchStr = 'const selectedAgent = agents.find(a => a.id === selectedAgentId);';
const idx = content.indexOf(searchStr);
if (idx !== -1) {
    const newBlock = `const selectedAgent = agents.find(a => a.id === selectedAgentId);

  if (!selectedAgent) {
    return (
      <div className="flex h-full w-full bg-background text-foreground items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Bot size={48} className="mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold">Esperando telemetría...</h2>
          <p className="text-muted-foreground max-w-md text-sm mx-auto">
            La base de datos de Firebase ha excedido su cuota gratuita diaria de escritura.<br/><br/>
            Al eliminar y renombrar las carpetas, el puente de telemetría intentó registrarlos de nuevo pero Firebase rechazó la petición por exceso de cuota. El servicio se restablecerá automáticamente a la medianoche (PT), o puedes actualizar tu plan de Firebase.
          </p>
        </div>
      </div>
    );
  }`;
    content = content.replace(searchStr, newBlock);
    fs.writeFileSync('src/app/agents/page.tsx', content);
    console.log('done');
}
