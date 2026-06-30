import { useState } from "react"
import { useNavigate } from "react-router-dom"
import OrbShader from "../components/canvas/OrbShader"
import IndiaMap3D from "../components/canvas/IndiaMap3D"
import { useAuth } from "../contexts/AuthContext"

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // For now, auto-login if they try to search to simulate auth flow
      login();
    }
    if (query.trim()) {
      navigate(`/copilot?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/copilot');
    }
  }

  const startListening = () => {
    // @ts-ignore - SpeechRecognition is not fully typed in standard TS yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice search. Please use Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

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

            
            <form onSubmit={handleSearch} className="glass-panel w-full max-w-3xl rounded-full p-2 flex items-center shadow-2xl mt-8">
              <div className="px-4 text-on-surface-variant">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline h-12 font-body-md text-body-md focus:outline-none" 
                placeholder={isListening ? "Listening..." : "I am a farmer from Maharashtra looking for subsidies..."} 
                type="text"
              />
              <button 
                type="button" 
                onClick={startListening}
                aria-label="Voice Input" 
                className={`p-3 transition-all glow-button rounded-full mr-2 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-surface-container-high text-primary hover:text-primary-container'}`}
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button type="submit" className="glow-button bg-primary text-on-primary font-label-sm text-label-sm px-8 h-12 rounded-full font-bold shadow-[0_0_15px_rgba(176,198,255,0.4)] transition-all hover:shadow-[0_0_25px_rgba(176,198,255,0.6)]">
                Discover
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
