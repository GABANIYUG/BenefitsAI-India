// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { GoogleGenAI } from 'npm:@google/genai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const lang = url.searchParams.get('lang') || 'EN'
    
    // 1. Fetch schemes from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('*')

    if (error) {
      console.error('Supabase fetch error:', error)
      throw error
    }

    if (!schemes || schemes.length === 0 || lang === 'EN') {
      return new Response(JSON.stringify({ success: true, data: schemes || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Translate if needed
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set")
    const ai = new GoogleGenAI({ apiKey: geminiApiKey })

    const langMap: Record<string, string> = {
      'HI': 'Hindi',
      'GU': 'Gujarati',
    }
    const targetLanguage = langMap[lang.toUpperCase()]
    
    if (!targetLanguage) {
      return new Response(JSON.stringify({ success: true, data: schemes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const translatePrompt = `Translate the following JSON array of government schemes into ${targetLanguage}. Keep the exact JSON array structure and keys ("id", "title", "department", "description"). Only translate the string values for "title", "department", and "description". Do not add any markdown or explanation, return only the raw JSON array.
    JSON: ${JSON.stringify(schemes)}`;

    const translateResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: translatePrompt
    });

    let text = translateResult.text || "[]";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let translatedSchemes = schemes;
    try {
      translatedSchemes = JSON.parse(text);
    } catch (e) {
      console.error("Translation parsing error:", e);
    }

    return new Response(JSON.stringify({ success: true, data: translatedSchemes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
