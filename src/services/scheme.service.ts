import { supabase } from '../lib/supabase';

const N8N_ELIGIBILITY_WEBHOOK = import.meta.env.VITE_N8N_ELIGIBILITY_WEBHOOK_URL;

export const getSchemes = async (token: string | null, lang: string = 'EN') => {
  const { data, error } = await supabase.from('schemes').select('*');
  if (error) throw error;
  
  return { success: true, data };
};

export const getEligibleSchemes = async (token: string | null, lang: string = 'EN') => {
  if (!N8N_ELIGIBILITY_WEBHOOK) {
    console.warn("N8N_ELIGIBILITY_WEBHOOK_URL is not set.");
    return { success: true, data: [] };
  }

  // Fetch the user's profile to send to n8n
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  // Also fetch all schemes to send to n8n for evaluation
  const { data: schemes } = await supabase.from('schemes').select('*');

  const res = await fetch(N8N_ELIGIBILITY_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      profile: profile || {},
      schemes: schemes || [],
      language: lang
    })
  });
  
  // Assuming n8n returns { success: true, data: [...] }
  return res.json();
};

export const getSchemeById = async (id: string, token: string | null) => {
  // Can just fetch from Supabase JS client directly for single scheme, but edge function is okay too
  // We'll leave this unimplemented as it's not heavily used in this view
  return null;
};
