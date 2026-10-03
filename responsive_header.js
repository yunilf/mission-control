const fs = require('fs');
const file = 'src/app/agents/page.tsx';
let c = fs.readFileSync(file, 'utf8');
let count = 0;
function rep(a, b) {
  if (!c.includes(a)) { console.log('NOT FOUND: ' + a.slice(0, 80)); return; }
  c = c.replace(a, b); count++;
}

// Header wrapper
rep('<div className="p-6 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between bg-gradient-to-r from-secondary/20 to-transparent gap-6">',
    '<div className="p-4 sm:p-6 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between bg-gradient-to-r from-secondary/20 to-transparent gap-4 sm:gap-6">');
rep('<div className="flex flex-wrap items-center justify-between xl:justify-start gap-8 flex-1">',
    '<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between xl:justify-start gap-4 sm:gap-8 flex-1 min-w-0">');

// Avatar & name
rep('<div className="flex items-start gap-4">\n                  <div className={`w-16 h-16 rounded-xl',
    '<div className="flex items-center sm:items-start gap-3 sm:gap-4 min-w-0">\n                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl');
rep('<div className="flex flex-col items-start gap-1">\n                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>',
    '<div className="flex flex-col items-start gap-1 min-w-0">\n                    <h2 className="text-xl sm:text-2xl font-bold break-words">{selectedAgent.name}</h2>');

// Info grid
rep('<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-border bg-secondary/10 rounded-lg p-3 xl:ml-8 flex-1 max-w-2xl">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-border bg-secondary/10 rounded-lg p-3 xl:ml-8 flex-1 w-full sm:w-auto min-w-0 max-w-2xl">');
rep('<div className="flex flex-col gap-2">\n                    <span className="text-muted-foreground flex items-center gap-2 text-sm">\n                      <ShieldCheck',
    '<div className="flex flex-col gap-2 min-w-0">\n                    <span className="text-muted-foreground flex items-center gap-2 text-sm min-w-0">\n                      <ShieldCheck');
rep('ID: <span className="text-foreground">{selectedAgent.id}</span>',
    'ID: <span className="text-foreground truncate">{selectedAgent.id}</span>');
rep('<span className="text-muted-foreground flex items-center gap-2 text-sm">\n                      <Sparkles size={14} className="text-purple-500" />',
    '<span className="text-muted-foreground flex items-center gap-2 text-sm min-w-0">\n                      <Sparkles size={14} className="text-purple-500 shrink-0" />');
rep('className="bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ml-2 max-w-[220px] truncate"',
    'className="bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-w-0 sm:flex-none sm:max-w-[220px] truncate"');
rep('<div className="flex flex-col gap-2">\n                    <span className="text-muted-foreground flex items-center gap-2 text-sm">\n                      <User size={14} className="text-primary" />',
    '<div className="flex flex-col gap-2 min-w-0">\n                    <span className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">\n                      <User size={14} className="text-primary shrink-0" />');

// Power toggle
rep('<div className="flex items-center gap-4 xl:justify-end shrink-0">\n                <div className="flex flex-col items-end">\n                  <span className="text-xs text-muted-foreground mb-1 font-medium">Encender / Apagar Nodo</span>',
    '<div className="flex items-center gap-4 xl:justify-end shrink-0 w-full xl:w-auto">\n                <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between w-full xl:w-auto gap-3">\n                  <span className="text-xs text-muted-foreground xl:mb-1 font-medium">Encender / Apagar Nodo</span>');

// Tabs bar + content padding
rep('<div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar">',
    '<div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar shrink-0">');
rep('<div className="flex-1 overflow-y-auto p-6 bg-background">',
    '<div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">');

fs.writeFileSync(file, c, 'utf8');
console.log('Replacements applied: ' + count);
