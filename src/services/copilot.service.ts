

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sendCopilotMessage = async (message: string, token: string | null, language: string = 'EN') => {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/search-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: message, language })
    });

    if (!res.ok) {
      let errorMsg = `Edge function error: ${res.statusText}`;
      try {
        const errData = await res.json();
        if (errData.error) errorMsg = errData.error;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const data = await res.json();
    
    // We expect the Edge Function to return { schemes: [...], response: "..." }
    return {
      schemes: data.schemes || [],
      response: data.response
    };
  } catch (error) {
    console.error("Copilot Search Error:", error);
    throw error;
  }
}
