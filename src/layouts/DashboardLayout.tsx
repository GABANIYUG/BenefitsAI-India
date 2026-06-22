import { Outlet } from "react-router-dom"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-dim">
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 p-4 gap-stack-md bg-surface-container-lowest shadow-lg shadow-black/50 border-r border-white/[0.02]">
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center border border-white/10 relative overflow-hidden shadow-[0_0_15px_rgba(85,141,255,0.3)]">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">smart_toy</span>
          </div>
          <div>
            <h1 className="font-headline-md text-[18px] font-bold text-primary tracking-tight">AI Discovery</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Premium Benefit Suite</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex flex-col gap-1 flex-1 mt-4">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-200">analytics</span>
            <span className="font-label-sm text-label-sm">Results</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-200">bookmark</span>
            <span className="font-label-sm text-label-sm">Saved</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-200">group</span>
            <span className="font-label-sm text-label-sm">Family</span>
          </a>
        </div>

        {/* CTA Action */}
        <div className="px-2 py-4">
          <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-[0_0_20px_rgba(85,141,255,0.2)] hover:shadow-[0_0_25px_rgba(85,141,255,0.4)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">Check Eligibility</span>
            <span className="material-symbols-outlined text-[18px] relative z-10">arrow_forward</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col gap-1 border-t border-outline-variant/20 pt-4">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span className="font-label-sm text-label-sm">Help</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-label-sm text-label-sm">Settings</span>
          </a>
        </div>
      </nav>
      
      <main className="flex-1 md:ml-64 flex flex-col relative h-full">
        <header className="h-20 flex-none px-margin-mobile md:px-margin-desktop flex items-center justify-between glass-panel z-20 sticky top-0 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="font-headline-md text-[20px] font-semibold text-on-surface flex items-center gap-2">
                Benefit Copilot
                <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary/20 font-label-sm text-[10px] uppercase tracking-wider">Beta</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">language</span>
              <span className="font-label-sm text-label-sm">EN / HI</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop relative scroll-smooth flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
