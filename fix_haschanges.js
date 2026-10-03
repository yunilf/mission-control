const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

if (!pageContent.includes('const [hasChanges, setHasChanges]')) {
    pageContent = pageContent.replace(
        'const [isSaving, setIsSaving] = useState(false);',
        'const [isSaving, setIsSaving] = useState(false);\n  const [hasChanges, setHasChanges] = useState(false);'
    );
}

// Replace the dependency on JSON.stringify
pageContent = pageContent.replace(
    /\{editingAgent && JSON\.stringify\(editingAgent\) !== JSON\.stringify\(selectedAgent\) && \(/,
    '{editingAgent && hasChanges && ('
);

// We need to change every `setEditingAgent(something)` to ALSO call `setHasChanges(true)` EXCEPT when initializing from selectedAgent!
// Actually, it's easier to just wrap `setEditingAgent` into a custom function `updateEditingAgent` for UI changes.
// But doing that across the whole file might be error-prone with regex.
// Instead, what if we use an effect?
/*
  useEffect(() => {
    if (!selectedAgent || !editingAgent) return;
    if (editingAgent.id !== selectedAgent.id) return; // Different agent entirely
    
    // Simple deep equal check but order-independent
    const isDifferent = JSON.stringify(editingAgent) !== JSON.stringify(selectedAgent);
    // Actually order independent check:
    const checkChanges = () => {
        const keys = new Set([...Object.keys(editingAgent), ...Object.keys(selectedAgent)]);
        for (let k of keys) {
            if (JSON.stringify(editingAgent[k]) !== JSON.stringify(selectedAgent[k])) return true;
        }
        return false;
    };
    setHasChanges(checkChanges());
  }, [editingAgent, selectedAgent]);
*/
const effectCode = `  useEffect(() => {
    if (!selectedAgent || !editingAgent) return;
    if (editingAgent.id !== selectedAgent.id) return;
    
    const keys = new Set([...Object.keys(editingAgent), ...Object.keys(selectedAgent)]);
    let different = false;
    for (let k of Array.from(keys)) {
        // Ignorar campos que firebase agrega u ordena raro
        if (JSON.stringify(editingAgent[k]) !== JSON.stringify(selectedAgent[k])) {
            different = true;
            break;
        }
    }
    setHasChanges(different);
  }, [editingAgent, selectedAgent]);`;

if (!pageContent.includes('let different = false;')) {
    pageContent = pageContent.replace(
        'const ROLE_OPTIONS = ["Asistente de Ventas"',
        effectCode + '\n\n  const ROLE_OPTIONS = ["Asistente de Ventas"'
    );
}

// In handleSaveEdit, after success, we could setHasChanges(false) but the effect will do it anyway when selectedAgent updates.

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing hasChanges logic');
