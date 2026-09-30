export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low/95 backdrop-blur-xl z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-lowest/60">
          <img alt="yunAi.agent Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1WbkNZklz5RWQY3JlVHEKHwBH0Z-May6EgJAqnW2bQseo_4bPmQoEYOZCMuNBVJ1I2dNUC-tF6W54BCUVQk_4bt11qZC_VLk0urwjwND78LeSs1xxEgENlCmSf9bRW8uCDSmkDtTlQw4FdCdxIvus0BYF6SBRqDq-3sE6BYit_CryJz_S4UUbxE35r_wyO9eLrlC44UVaLpzqYco5ckqOZmn33KmVTQxFVofNIloPbmtAAiis22u_AobnE" />
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight truncate leading-none">yunAi.agent</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mt-1 truncate">Mission Control v2.4</span>
          </div>
        </div>
        <div className="px-space-md pt-space-md pb-space-xs">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Operaciones Fleet</span>
        </div>
        <nav className="px-space-sm flex flex-col gap-1">
          <a aria-current="page" className="flex items-center justify-between px-space-md py-space-sm rounded-lg transition-all group bg-surface-container-high text-primary-container font-semibold shadow-[0_0_12px_-2px_rgba(0,240,255,0.2)]" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg group-hover:text-primary-container transition-colors">grid_view</span>
              <span className="font-body-md text-body-md">Dashboard Central</span>
            </div>
          </a>
          <a className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg group-hover:text-primary-container transition-colors">smart_toy</span>
              <span className="font-body-md text-body-md">Agent Hub</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono-sm text-mono-sm bg-tertiary-container/10 text-tertiary-fixed-dim">6 Activos</span>
          </a>
          <a className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg group-hover:text-primary-container transition-colors">terminal</span>
              <span className="font-body-md text-body-md">Activity Monitor</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono-sm text-mono-sm bg-primary-container/10 text-primary-container flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>Live</span>
          </a>
          <a className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg group-hover:text-primary-container transition-colors">auto_awesome</span>
              <span className="font-body-md text-body-md">Prompt Workshop</span>
            </div>
          </a>
          <a className="flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" href="#">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg group-hover:text-primary-container transition-colors">hub</span>
              <span className="font-body-md text-body-md">Integrations Hub</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono-sm text-mono-sm bg-surface-container-high text-on-surface-variant">5 apps</span>
          </a>
        </nav>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="bg-surface-container/70 rounded-xl p-space-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono-sm text-mono-sm">
            <span className="text-on-surface-variant">Sistema Operativo</span>
            <span className="text-tertiary-fixed-dim font-medium">99.98%</span>
          </div>
          <div className="flex items-center justify-between font-mono-sm text-mono-sm">
            <span className="text-on-surface-variant">Cluster Activo</span>
            <span className="text-primary-fixed-dim font-medium">us-east-ai</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-primary-container h-full w-[99.98%]"></div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm px-space-xs py-space-xs bg-surface-container-lowest/60 rounded-xl">
          <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbxw689lPZP-ROZkJ1yuJdErjNzQ0Ou9U_y6FEQ1dyz9KySUjKlr71ZfhZof5fA13jw5GUfSPpYyNl2BTMzEeazB12Xx1WaYM8zjlnHdQ0Mwuxkf_DNbjJRJiVlJ2QpjS9DY32YyZRb2E7x37Q73MEIFa-TFmyP249q9oYdYaN8tbgfw_ZAuaCovzdOVr4G9FOLm9N8ZMy2UXoodi_s-BGOXnSBQlDZiPETiPLlvJFJL3HT3EcPHL9" />
          <div className="flex flex-col min-w-0">
            <span className="font-body-md text-body-md text-on-surface font-medium truncate leading-tight">Elena Vance</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant truncate">Lead AI Ops</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
