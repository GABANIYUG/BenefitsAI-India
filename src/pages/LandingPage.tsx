import OrbShader from "../components/canvas/OrbShader"
import IndiaMap3D from "../components/canvas/IndiaMap3D"

export default function LandingPage() {
  return (
    <>
      <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden py-stack-lg px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 z-[-2] pointer-events-none opacity-60">
          <OrbShader />
        </div>
        <div className="absolute inset-0 z-[-1] pointer-events-none opacity-40 mix-blend-screen">
          <IndiaMap3D />
        </div>

        <div className="max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-8 lg:col-start-3 text-center flex flex-col items-center gap-stack-md">
            <h1 className="font-display-lg text-display-lg md:text-[64px] leading-tight text-on-surface drop-shadow-lg">
              Discover Every Government Benefit You're <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Eligible For</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              AI-powered benefit discovery for every Indian citizen. Secure, multilingual, and frictionless access to your entitlements.
            </p>

            
            <div className="glass-panel w-full max-w-3xl rounded-full p-2 flex items-center shadow-2xl mt-8">
              <div className="px-4 text-on-surface-variant">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline h-12 font-body-md text-body-md focus:outline-none" placeholder="I am a farmer from Maharashtra looking for subsidies..." type="text"/>
              <button aria-label="Voice Input" className="p-3 text-primary hover:text-primary-container transition-colors glow-button bg-surface-container-high rounded-full mr-2">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button className="glow-button bg-primary text-on-primary font-label-sm text-label-sm px-8 h-12 rounded-full font-bold shadow-[0_0_15px_rgba(176,198,255,0.4)] transition-all hover:shadow-[0_0_25px_rgba(176,198,255,0.6)]">
                Discover
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
