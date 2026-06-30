import { useQuery } from '@tanstack/react-query';
import { getSchemes } from '../services/scheme.service';
import { useAuth } from '../contexts/AuthContext';

export default function SavedSchemesPage() {
  const { token } = useAuth();

  // For MVP, we'll fetch all schemes and pretend the first two are saved
  // In a real app, you'd fetch directly from your user_saved_schemes endpoint
  const { data: schemesData, isLoading } = useQuery({
    queryKey: ['saved-schemes'],
    queryFn: () => getSchemes(token),
  });

  // Mocking saved schemes by slicing the first two from the general response
  const savedSchemes = schemesData?.data ? schemesData.data.slice(0, 2) : [];

  return (
    <div className="py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display-lg font-bold text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary">bookmark</span>
          Saved Schemes
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : savedSchemes.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">bookmark_border</span>
          <p className="text-on-surface-variant">You haven't saved any schemes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((item: any) => {
            const scheme = item.scheme || item; 
            
            return (
              <div key={scheme.id} className="glass-panel p-6 rounded-2xl border border-primary/30 relative flex flex-col h-full shadow-[0_0_15px_rgba(85,141,255,0.1)]">
                <div className="absolute top-4 right-4 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                </div>
                
                <div className="flex-1 mt-2">
                  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold mb-3 inline-block">
                    {scheme.category?.name || 'General'}
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2">{scheme.title}</h3>
                  <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">{scheme.description}</p>
                </div>
                
                <button className="w-full mt-4 py-2 rounded-lg bg-surface-container-highest hover:bg-primary/10 text-primary transition-colors font-semibold">
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
