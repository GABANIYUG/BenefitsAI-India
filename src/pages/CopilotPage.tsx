import { useState, useRef, useEffect } from "react"
import OrbShader from "../components/canvas/OrbShader"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "../contexts/AuthContext"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  schemes?: any[];
}

export default function CopilotPage() {
  const { token } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with search query from LandingPage if it exists
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialQuery = searchParams.get('q');
    if (initialQuery && messages.length === 0) {
      setInput(initialQuery);
    }
  }, [location.search]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const mutation = useMutation({
    mutationFn: async (msg: string) => {
      const N8N_CHAT_WEBHOOK = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
      
      if (!N8N_CHAT_WEBHOOK) {
        throw new Error("N8N Chat Webhook URL is not configured.");
      }

      const res = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: msg,
          language: i18n.language,
          history: messages
        })
      });

      if (!res.ok) throw new Error("Failed to connect to AI service");
      return res.json();
    },
    onSuccess: (data) => {
      const foundSchemes = data.schemes || [];
      const replyContent = data.output || data.response || "I couldn't find any specific schemes matching your exact request right now. Try adjusting your search terms!";
        
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: replyContent,
        schemes: foundSchemes
      }]);
    },
    onError: (err: any) => {
      const errMsg = err?.message || "Unknown error";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Sorry, I encountered an error connecting to the AI: ${errMsg}` }]);
    }
  });

  const handleSubmit = (e?: React.FormEvent, presetMessage?: string) => {
    if (e) e.preventDefault();
    const msg = presetMessage || input;
    if (!msg.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    mutation.mutate(msg);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-4xl mx-auto py-6 px-4">
      
      {messages.length === 0 ? (
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
            {t('copilot.greeting')}
          </h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-lg mb-12">
            {t('copilot.subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <button 
              onClick={() => handleSubmit(undefined, "Am I eligible for PM-Kisan?")}
              className="text-left p-4 rounded-2xl glass-panel hover:bg-surface-container-high transition-all border border-outline-variant/10 hover:border-primary/30 group flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="material-symbols-outlined text-primary text-[24px]">agriculture</span>
              <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">{t('copilot.suggestion1')}</span>
            </button>
            <button 
              onClick={() => handleSubmit(undefined, "How do I apply for scholarships?")}
              className="text-left p-4 rounded-2xl glass-panel hover:bg-surface-container-high transition-all border border-outline-variant/10 hover:border-tertiary/30 group flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-tertiary/0 via-tertiary/5 to-tertiary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="material-symbols-outlined text-tertiary text-[24px]">school</span>
              <span className="font-body-md text-on-surface group-hover:text-tertiary transition-colors">{t('copilot.suggestion2')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'glass-panel text-on-surface border border-outline-variant/20 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap font-body-md leading-relaxed">{m.content}</p>
                
                {m.schemes && m.schemes.length > 0 && (
                  <div className="mt-4 flex flex-col gap-3">
                    {m.schemes.map((scheme, idx) => (
                      <div key={idx} className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-headline-sm text-primary font-semibold">{scheme.title}</h4>
                          {scheme.similarity && (
                            <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                              {Math.round(scheme.similarity * 100)}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-on-surface-variant font-body-sm mb-3 line-clamp-3">{scheme.description}</p>
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <span className="text-xs text-on-surface-variant/80 bg-surface-container-highest px-2 py-1 rounded-md">
                            {scheme.department}
                          </span>
                          <div className="flex gap-2">
                            <button className="text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                              Save
                            </button>
                            <a href={scheme.source_url} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:brightness-110 transition-all shadow-md">
                              Apply Now
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="glass-panel text-on-surface border border-outline-variant/20 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full glass-panel rounded-full p-2 flex items-center shadow-lg border border-outline-variant/20 relative z-10 shrink-0">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('copilot.placeholder')}
          className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/70 h-14 px-2 font-body-md text-body-md focus:outline-none"
          disabled={mutation.isPending}
        />
        <button 
          type="submit"
          disabled={mutation.isPending || !input.trim()}
          className="glow-button bg-primary text-on-primary h-10 w-10 md:w-auto md:px-4 flex items-center justify-center rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          <span className="hidden md:inline font-bold ml-2">{t('copilot.searchBtn')}</span>
        </button>
      </form>
    </div>
  )
}
