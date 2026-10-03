const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add states
if (!content.includes('const [isGeneratingPairingCode')) {
    content = content.replace('const [pairingCode, setPairingCode] = useState("");', 'const [pairingCode, setPairingCode] = useState("");\n  const [isGeneratingPairingCode, setIsGeneratingPairingCode] = useState(false);');
}

// 2. Add lucide icons if not imported: Copy, Loader2, Smartphone, Check
if (!content.includes('Copy } from "lucide-react"')) {
    content = content.replace('Upload } from "lucide-react"', 'Upload, Copy, Loader2, Smartphone, Check } from "lucide-react"');
}

// 3. Find WhatsApp block
const waStart = content.indexOf('{editingAgent.whatsappEnabled && (');
const nextBlockStart = content.indexOf('<div className="border border-border rounded-lg overflow-hidden">', waStart); 
// wait, Telegram is next. What's the telegram block start?
// `<div className="border border-border rounded-lg overflow-hidden">` (Wait, it's inside space-y-4)
const telegramStart = content.indexOf('{/* Telegram Toggle */}'); // Wait, we don't have this comment.
// Let's look at what's after whatsapp block.
// `                          <div className="p-4 bg-secondary/10 flex items-center justify-between border-t border-border">`
// Wait, no. The telegram block is a separate `div` with `border border-border`.
