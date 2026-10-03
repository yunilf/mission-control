const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

if (!pageContent.includes('const [pairingCode, setPairingCode]')) {
    pageContent = pageContent.replace(
        'const [isSavingSubagent, setIsSavingSubagent] = useState(false);',
        'const [isSavingSubagent, setIsSavingSubagent] = useState(false);\n  const [pairingCode, setPairingCode] = useState("");'
    );
}

if (!pageContent.includes('const handleToolToggle =')) {
    pageContent = pageContent.replace(
        'const handleSaveSubagent = async (e: React.FormEvent) => {',
        `const handleToolToggle = (toolId: string) => {
    if (!editingAgent) return;
    const currentTools = editingAgent.tools || [];
    const newTools = currentTools.includes(toolId) 
      ? currentTools.filter((t: string) => t !== toolId)
      : [...currentTools, toolId];
    setEditingAgent({ ...editingAgent, tools: newTools });
  };

  const handleSaveSubagent = async (e: React.FormEvent) => {`
    );
}

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done adding missing states and functions');
