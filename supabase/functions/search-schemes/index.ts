// @ts-nocheck - Tell standard TypeScript to ignore this Deno file
// (Supabase handles the actual compilation)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, language = 'EN' } = await req.json()
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set")

    const genAI = new GoogleGenerativeAI(geminiApiKey)

    // 1. Generate embedding for the user's query
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const embeddingResult = await model.embedContent(query)
    const embedding = embeddingResult.embedding.values

    // 2. Search Supabase using match_schemes RPC
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: schemes, error } = await supabase.rpc('match_schemes', {
      query_embedding: embedding,
      match_threshold: 0.70, // Relaxed threshold to catch more
      match_count: 5
    })

    if (error) {
      console.error('Supabase search error:', error)
      throw error
    }

    // Prepare prompt context based on language
    const langMap: Record<string, string> = {
      'EN': 'English',
      'HI': 'Hindi',
      'GU': 'Gujarati',
    }
    const targetLanguage = langMap[language.toUpperCase()] || 'English'

    const schemeContext = schemes && schemes.length > 0 
      ? schemes.map((s: any) => `Title: ${s.title}\nDept: ${s.department}\nDesc: ${s.description}`).join('\n\n')
      : "No schemes found matching the query."

    const prompt = `You are a helpful assistant for Indian citizens looking for government schemes. 
The user is asking: "${query}"

Here are the top matching schemes from our database:
${schemeContext}

Answer the user's question clearly, suggesting the best schemes from the context above. Be concise and friendly.
CRITICAL INSTRUCTION: You MUST respond entirely in ${targetLanguage}. Do not use English unless translating a specific proper noun that has no translation.`

    // 3. Generate response using Gemini
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await chatModel.generateContent(prompt)
    const responseText = result.response.text()
    
    // 4. Translate the schemes array if needed
    let translatedSchemes = schemes;
    if (language.toUpperCase() !== 'EN' && schemes && schemes.length > 0) {
      const translatePrompt = `Translate the following JSON array of government schemes into ${targetLanguage}. Keep the exact JSON array structure and keys ("id", "title", "department", "description"). Only translate the string values for "title", "department", and "description". Do not add any markdown or explanation, return only the raw JSON array.
      JSON: ${JSON.stringify(schemes)}`;
      try {
        const translateResult = await chatModel.generateContent(translatePrompt);
        let text = translateResult.response.text() || "[]";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        translatedSchemes = JSON.parse(text);
      } catch (e) {
        console.error("Failed to translate schemes", e);
      }
    }

    return new Response(JSON.stringify({ response: responseText, schemes: translatedSchemes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
