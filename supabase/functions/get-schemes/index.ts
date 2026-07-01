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

    if (!schemes || schemes.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const isEligibleCheck = url.searchParams.get('eligible') === 'true'
    const langMap: Record<string, string> = { 'HI': 'Hindi', 'GU': 'Gujarati' }
    const targetLanguage = langMap[lang.toUpperCase()]

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey && (isEligibleCheck || targetLanguage)) {
      throw new Error("GEMINI_API_KEY is not set")
    }
    const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

    if (isEligibleCheck && ai) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized for eligibility check")

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!profile) {
        return new Response(JSON.stringify({ 
          success: true, 
          data: [{
            scheme: { id: 'debug-profile-missing', title: "Profile Missing", description: "You need to fill out your profile first!" },
            evaluation: { isEligible: false, reason: "No profile found" }
          }] 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      const prompt = `You are an expert Government Schemes Eligibility Evaluator.
      User Profile: ${JSON.stringify(profile)}
      Available Schemes: ${JSON.stringify(schemes)}

      Evaluate which of these schemes the user is eligible for based on their profile data (age, income, is_student, is_farmer).
      Return a JSON array containing ONLY the schemes they are eligible for. 
      Format exactly like this:
      [
        {
          "scheme": { ...original scheme object... },
          "evaluation": { "isEligible": true, "reason": "Brief explanation of why they are eligible" }
        }
      ]
      ${targetLanguage ? `IMPORTANT: Translate the "title", "department", and "description" fields of the scheme object, AND the "reason" field into ${targetLanguage}.` : ''}
      Return ONLY raw JSON array. Do not add markdown or text formatting.`;

      const evalResult = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      let text = evalResult.text || "[]";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let finalData = schemes;
      try {
        finalData = JSON.parse(text);
        if (finalData.length === 0) {
          finalData = [{
            scheme: { id: 'debug-empty', title: "No Eligible Schemes Found", description: `Gemini returned an empty array. Profile data: ${JSON.stringify(profile)}` },
            evaluation: { isEligible: false, reason: "AI determined no eligibility" }
          }];
        }
      } catch (e) {
        console.error("AI Eligibility parsing error:", e);
        finalData = [{
            scheme: { id: 'debug-error', title: "JSON Parse Error", description: `Raw text: ${text}` },
            evaluation: { isEligible: false, reason: "Parse failed" }
        }];
      }

      return new Response(JSON.stringify({ success: true, data: finalData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (lang === 'EN' || !targetLanguage || !ai) {
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
