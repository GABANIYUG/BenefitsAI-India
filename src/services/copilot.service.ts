

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sendCopilotMessage = async (message: string, token: string | null) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/search-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: message })
    });

    if (!res.ok) {
      throw new Error(`Edge function error: ${res.statusText}`);
    }

    const data = await res.json();
    
    // We expect the Edge Function to return { schemes: [...] }
    return {
      schemes: data.schemes || []
    };
  } catch (error) {
    console.error("Copilot Search Error:", error);
    throw error;
  }
}
