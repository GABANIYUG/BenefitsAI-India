import { Outlet, Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTranslation } from "react-i18next"

// Mock notifications (would normally come from DB)
const MOCK_NOTIFICATIONS = [
  { id: 1, title: "New Scheme Launched", message: "PM KISAN scheme updated with new benefits.", time: "10 mins ago", isUnread: true },
  { id: 2, title: "Application Status", message: "Your application for Crop Insurance was approved.", time: "2 hours ago", isUnread: false }
]

export default function MainLayout() {
  const { user, login, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language.toUpperCase() || 'EN')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false)
  
  const langMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (selectedLang: string) => {
    setLang(selectedLang)
    i18n.changeLanguage(selectedLang)
    setIsLangMenuOpen(false)
  }

  const handleCopilotClick = (e: React.MouseEvent) => {
    // Navigation is now handled by the Link component directly,
    // and the route is unprotected for MVP, so we don't need to force login here.
  }

  return (
    <div className="flex-grow flex flex-col relative z-0">
      <header className="bg-background/80 backdrop-blur-xl docked full-width top-0 sticky z-50 border-b border-outline-variant/10 shadow-sm flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20">
        <Link to="/" className="font-display-lg-mobile text-display-lg-mobile font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          BenefitAI India
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 px-3 py-2 rounded-lg font-label-sm text-label-sm">{t('nav.home')}</Link>
          <Link onClick={handleCopilotClick} to="/copilot" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 px-3 py-2 rounded-lg font-label-sm text-label-sm">{t('nav.copilot')}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} aria-label="language" className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full relative">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>language</span>
              <span className="absolute -top-1 -right-1 bg-surface-container-highest text-[10px] px-1 rounded font-bold">{lang}</span>
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-surface-container-low border border-outline-variant/20 divide-y divide-outline-variant/10 focus:outline-none z-50 overflow-hidden">
                <div className="py-1">
                  <button onClick={() => handleLanguageSelect('EN')} className={`group flex items-center px-4 py-3 text-sm w-full text-left hover:bg-surface-container-highest hover:text-primary transition-colors ${lang === 'EN' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}>
                    English (EN)
                  </button>
                  <button onClick={() => handleLanguageSelect('HI')} className={`group flex items-center px-4 py-3 text-sm w-full text-left hover:bg-surface-container-highest hover:text-primary transition-colors ${lang === 'HI' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}>
                    हिंदी (HI)
                  </button>
                  <button onClick={() => handleLanguageSelect('GU')} className={`group flex items-center px-4 py-3 text-sm w-full text-left hover:bg-surface-container-highest hover:text-primary transition-colors ${lang === 'GU' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}>
                    ગુજરાતી (GU)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notificationsMenuRef}>
            <button onClick={() => setIsNotificationsMenuOpen(!isNotificationsMenuOpen)} aria-label="notifications" className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 p-2 rounded-full relative">
              <span className="material-symbols-outlined">notifications</span>
              {MOCK_NOTIFICATIONS.some(n => n.isUnread) && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {isNotificationsMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-surface-container-low border border-outline-variant/20 focus:outline-none z-50 overflow-hidden">
                <div className="p-4 border-b border-outline-variant/10">
                  <h3 className="font-bold text-on-surface">{t('nav.notifications')}</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {MOCK_NOTIFICATIONS.length > 0 ? (
                    <div className="divide-y divide-outline-variant/10">
                      {MOCK_NOTIFICATIONS.map(notification => (
                        <div key={notification.id} className={`p-4 hover:bg-surface-container-highest transition-colors cursor-pointer ${notification.isUnread ? 'bg-primary/5' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${notification.isUnread ? 'font-bold text-primary' : 'font-medium text-on-surface'}`}>{notification.title}</h4>
                            <span className="text-[10px] text-on-surface-variant">{notification.time}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-on-surface-variant text-sm">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center hover:bg-primary/20 transition-colors">
                {user.email?.[0].toUpperCase() || 'U'}
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-surface-container-low border border-outline-variant/20 divide-y divide-outline-variant/10 focus:outline-none z-50 overflow-hidden">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-on-surface truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link onClick={() => setIsProfileMenuOpen(false)} to="/profile" className="group flex items-center px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors">
                      <span className="material-symbols-outlined mr-3 text-[18px]">person</span>
                      Profile
                    </Link>
                    <button onClick={() => { logout(); setIsProfileMenuOpen(false) }} className="group flex w-full items-center px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                      <span className="material-symbols-outlined mr-3 text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="bg-primary text-on-primary hover:opacity-90 transition-opacity px-6 py-2 rounded-full font-label-md font-bold shadow-md shadow-primary/20">
              {t('nav.signIn')}
            </button>
          )}
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
