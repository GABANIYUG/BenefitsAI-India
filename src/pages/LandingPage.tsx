import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, Mic } from "lucide-react"
import OrbShader from "../components/canvas/OrbShader"
import IndiaMap3D from "../components/canvas/IndiaMap3D"

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
              {t('hero.title1')} <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('hero.title2')}</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            
            <form onSubmit={handleSearch} className="glass-panel w-full max-w-3xl rounded-full p-2 flex items-center shadow-2xl mt-8">
              <div className="px-4 text-on-surface-variant">
                <Search className="h-6 w-6" />
              </div>
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline h-12 font-body-md text-body-md focus:outline-none" 
                placeholder={isListening ? t('hero.listening') : t('hero.searchPlaceholder')}
                type="text"
              />
              <button 
                type="button" 
                onClick={startListening}
                aria-label="Voice Input" 
                className={`p-3 transition-all glow-button rounded-full mr-2 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-surface-container-high text-primary hover:text-primary-container'}`}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button type="submit" className="glow-button bg-primary text-on-primary font-label-sm text-label-sm px-8 h-12 rounded-full font-bold shadow-[0_0_15px_rgba(176,198,255,0.4)] transition-all hover:shadow-[0_0_25px_rgba(176,198,255,0.6)]">
                {t('hero.discoverBtn')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
