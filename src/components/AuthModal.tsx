import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        closeAuthModal();
        alert("Account created successfully! You are now logged in.");
      } else {
        // Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container glass-panel border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/20">
          <h2 className="font-display-md text-on-surface font-semibold tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button 
            onClick={closeAuthModal}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-on-surface">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block pl-10 p-3 outline-none transition-all" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block pl-10 p-3 outline-none transition-all" 
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block pl-10 p-3 outline-none transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full glow-button bg-primary hover:bg-primary/90 text-on-primary font-medium rounded-xl text-sm px-5 py-3 text-center transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
            
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-sm text-on-surface-variant">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="text-primary font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} className="text-primary font-semibold hover:underline">
                  Sign Up
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
