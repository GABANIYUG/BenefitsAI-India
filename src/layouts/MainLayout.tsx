import { Outlet, Link } from "react-router-dom"
import { useState } from "react"

export default function MainLayout() {
  const [lang, setLang] = useState('EN')
  const [voiceActive, setVoiceActive] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLanguageToggle = () => {
    setLang(lang === 'EN' ? 'HI' : 'EN')
    alert(`Language changed to ${lang === 'EN' ? 'Hindi' : 'English'}`)
  }

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive)
    alert(voiceActive ? 'Voice assistant deactivated' : 'Voice assistant activated')
  }

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) alert('No new notifications at this time.')
  }

  return (
    <div className="flex-grow flex flex-col relative z-0">
      <header className="bg-background/80 backdrop-blur-xl docked full-width top-0 sticky z-50 border-b border-outline-variant/10 shadow-sm flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20">
        <Link to="/" className="font-display-lg-mobile text-display-lg-mobile font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          BenefitAI India
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 px-3 py-2 rounded-lg font-label-sm text-label-sm">Home</Link>
          <Link to="/copilot" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 px-3 py-2 rounded-lg font-label-sm text-label-sm">Copilot</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={handleLanguageToggle} aria-label="language" className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full relative">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>language</span>
            <span className="absolute -top-1 -right-1 bg-surface-container-highest text-[10px] px-1 rounded font-bold">{lang}</span>
          </button>
          <button onClick={handleVoiceToggle} aria-label="settings_voice" className={`text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full ${voiceActive ? 'text-primary bg-primary/10' : ''}`}>
            <span className="material-symbols-outlined">settings_voice</span>
          </button>
          <button onClick={handleNotificationsToggle} aria-label="notifications" className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full relative">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer">
            {/* Placeholder avatar */}
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">U</div>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col relative z-0">
        <Outlet />
      </main>

      <footer className="bg-surface-container-lowest text-primary font-body-md text-body-md font-label-sm text-label-sm full-width py-stack-lg mt-auto border-t border-outline-variant flat no shadows">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 items-center gap-stack-md">
          <div>
            <span className="text-on-surface font-bold text-lg">BenefitAI India</span>
            <p className="text-on-surface-variant mt-2 text-sm">© 2024 BenefitAI India. Government of India Trust Certified.</p>
          </div>
          <nav className="flex flex-wrap md:justify-end gap-4 md:gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded" href="#">Terms of Service</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
