const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getSchemes = async (token: string | null, lang: string = 'EN') => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-schemes?lang=${lang}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`
    }
  });
  return res.json();
};

export const getEligibleSchemes = async (profileId: string, token: string | null, lang: string = 'EN') => {
  // For now, eligible schemes just hit get-schemes since we haven't implemented full eligibility yet
  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-schemes?lang=${lang}&profileId=${profileId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`
    }
  });
  return res.json();
};

export const getSchemeById = async (id: string, token: string | null) => {
  // Can just fetch from Supabase JS client directly for single scheme, but edge function is okay too
  // We'll leave this unimplemented as it's not heavily used in this view
  return null;
};
