import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="py-8 max-w-2xl mx-auto w-full">
      <h2 className="text-3xl font-display-lg font-bold text-on-surface mb-8">Settings</h2>
      
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Account Section */}
          <section>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4 border-b border-outline-variant/10 pb-2">Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email Address</label>
                <div className="text-on-surface bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/30 opacity-70">
                  {user?.email || 'Not logged in'}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Your email is managed by your authentication provider.</p>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4 border-b border-outline-variant/10 pb-2">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Theme</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode (Default)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4 border-b border-outline-variant/10 pb-2">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-surface-container-highest transition-colors">
                <div>
                  <span className="text-on-surface block font-medium">Email Notifications</span>
                  <span className="text-on-surface-variant text-xs">Receive emails when new schemes match your profile</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotifs} 
                  onChange={(e) => setEmailNotifs(e.target.checked)} 
                  className="w-5 h-5 accent-primary" 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-surface-container-highest transition-colors">
                <div>
                  <span className="text-on-surface block font-medium">Push Notifications</span>
                  <span className="text-on-surface-variant text-xs">Receive real-time alerts in the web browser</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={pushNotifs} 
                  onChange={(e) => setPushNotifs(e.target.checked)} 
                  className="w-5 h-5 accent-primary" 
                />
              </label>
            </div>
          </section>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full glow-button bg-primary text-on-primary py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(176,198,255,0.4)] hover:shadow-[0_0_25px_rgba(176,198,255,0.6)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
