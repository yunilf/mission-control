export default function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-low/85 backdrop-blur-xl z-40 flex items-center justify-between px-gutter shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-space-md w-96">
        <div className="relative w-full flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">search</span>
          <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" placeholder="Buscar agentes, tareas, trazas de ejecución..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="hidden lg:flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container font-mono-sm text-mono-sm text-tertiary-fixed-dim">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
          <span>Flota Sincronizada</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm transition-colors" type="button">
            <span className="material-symbols-outlined text-base text-secondary">rocket_launch</span>
            <span>Desplegar</span>
          </button>
          <button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary font-body-sm text-body-sm font-semibold transition-colors shadow-[0_0_12px_-2px_rgba(0,240,255,0.35)]" type="button">
            <span className="material-symbols-outlined text-base">add</span>
            <span>Nuevo Agente</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative" type="button">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
