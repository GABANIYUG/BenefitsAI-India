import OrbShader from "../components/canvas/OrbShader"

export default function CopilotPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto my-auto py-12">
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary-container/10 blur-xl animate-pulse"></div>
          <div className="w-full h-full rounded-full overflow-hidden relative z-10 shadow-[0_0_40px_rgba(85,141,255,0.15)] border border-primary/20 glass-panel">
            <div className="absolute inset-0 w-full h-full scale-[2.5]">
              <OrbShader />
            </div>
          </div>
        </div>
        <h3 className="font-display-lg-mobile text-[28px] md:font-display-lg md:text-[36px] font-bold text-center text-on-surface mb-3 tracking-tight">
          How can I assist you today?
        </h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-lg mb-12">
          I can explain government schemes, compare eligibility criteria, or guide you step-by-step through application processes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button className="text-left p-4 rounded-2xl glass-panel hover:bg-surface-container-high transition-all border border-outline-variant/10 hover:border-primary/30 group flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="material-symbols-outlined text-primary text-[24px]">agriculture</span>
            <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">"Am I eligible for PM-Kisan?"</span>
          </button>
          <button className="text-left p-4 rounded-2xl glass-panel hover:bg-surface-container-high transition-all border border-outline-variant/10 hover:border-tertiary/30 group flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-tertiary/0 via-tertiary/5 to-tertiary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="material-symbols-outlined text-tertiary text-[24px]">school</span>
            <span className="font-body-md text-on-surface group-hover:text-tertiary transition-colors">"How do I apply for scholarships?"</span>
          </button>
        </div>
      </div>
    </>
  )
}
