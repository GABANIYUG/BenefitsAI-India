import { useQuery } from '@tanstack/react-query';
import { getSchemes, getEligibleSchemes } from '../services/scheme.service';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SchemesPage() {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'eligible'>('all');

  const { data: schemesData, isLoading } = useQuery({
    queryKey: ['schemes', filter, i18n.language],
    queryFn: () => filter === 'all' 
      ? getSchemes(token, i18n.language) 
      // Using a mock profile ID for eligible schemes, in a real app this comes from the user context/profile API
      : getEligibleSchemes('mock-profile-id', token, i18n.language),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const schemes = schemesData?.data || [];

  return (
    <div className="py-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display-lg font-bold text-on-surface">{t('schemes.availableSchemes')}</h2>
        <div className="flex bg-surface-container-high rounded-lg p-1">
          <button 
            className={`px-4 py-2 rounded-md font-label-sm ${filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            onClick={() => setFilter('all')}
          >
            {t('schemes.allSchemes')}
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-label-sm flex items-center gap-2 ${filter === 'eligible' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            onClick={() => setFilter('eligible')}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {t('schemes.forMe')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-outline-variant/10 flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
                </div>
                <div className="h-7 w-3/4 bg-surface-container-high rounded mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-surface-container-highest rounded"></div>
                  <div className="h-4 w-full bg-surface-container-highest rounded"></div>
                  <div className="h-4 w-2/3 bg-surface-container-highest rounded"></div>
                </div>
              </div>
              <div className="w-full mt-4 h-10 rounded-lg bg-surface-container-highest"></div>
            </div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">inbox</span>
          <p className="text-on-surface-variant">{t('schemes.noSchemes')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((item: any) => {
            const scheme = item.scheme || item; // Handle both /schemes and /schemes/eligible response shapes
            const evaluation = item.evaluation;

            return (
              <div key={scheme.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-colors flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                      {scheme.department || t('schemes.general')}
                    </span>
                    {evaluation?.isEligible && (
                      <span className="text-green-500 material-symbols-outlined" title="You are eligible!">check_circle</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">{scheme.title}</h3>
                  <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">{scheme.description}</p>
                </div>
                
                <button className="w-full mt-4 py-2 rounded-lg bg-surface-container-highest hover:bg-primary/10 text-primary transition-colors font-semibold">
                  {t('schemes.viewDetails')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
