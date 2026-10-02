const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

const oldInput = /<input type="text" value=\{newClientHours\} onChange=\{e => setNewClientHours\(e\.target\.value\)\} placeholder="[^"]*" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary\/50 transition-shadow" \/>/;

const newSelect = `<select value={newClientHours} onChange={e => setNewClientHours(e.target.value)} className="w-full bg-background border border-border rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none text-foreground">
                            <option value="" disabled>Selecciona el horario...</option>
                            <option value="Lunes a Viernes, 8:00 AM - 5:00 PM">Lunes a Viernes, 8:00 AM - 5:00 PM</option>
                            <option value="Lunes a Viernes, 9:00 AM - 6:00 PM">Lunes a Viernes, 9:00 AM - 6:00 PM</option>
                            <option value="Lunes a Sábado, 8:00 AM - 6:00 PM">Lunes a Sábado, 8:00 AM - 6:00 PM</option>
                            <option value="Lunes a Sábado, 9:00 AM - 8:00 PM">Lunes a Sábado, 9:00 AM - 8:00 PM</option>
                            <option value="Lunes a Domingo, 8:00 AM - 10:00 PM">Lunes a Domingo, 8:00 AM - 10:00 PM</option>
                            <option value="Lunes a Domingo (24/7)">Lunes a Domingo (24 Horas)</option>
                            <option value="Horario Nocturno, 6:00 PM - 2:00 AM">Horario Nocturno, 6:00 PM - 2:00 AM</option>
                            <option value="Personalizado (Ver Información del Negocio)">Personalizado (Detallado en Info. Negocio)</option>
                          </select>`;

content = content.replace(oldInput, newSelect);
fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
