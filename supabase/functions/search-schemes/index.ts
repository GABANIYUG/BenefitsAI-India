// @ts-nocheck - Tell standard TypeScript to ignore this Deno file
// (Supabase handles the actual compilation)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { query } = await req.json()
    if (!query) throw new Error("Query is required")

    // 1. Get the Gemini API Key from environment variables securely
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set")

    // 2. Call Gemini API to generate the vector embedding
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/gemini-embedding-2",
        content: { parts: [{ text: query }] },
        outputDimensionality: 1536
      })
    })
    
    const geminiData = await geminiRes.json()
    const embedding = geminiData.embedding.values // This is the mathematical vector [0.01, -0.05, ...]

    // 3. Connect to Supabase to search the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 4. Call our match_schemes SQL function
    const { data: schemes, error } = await supabaseClient.rpc('match_schemes', {
      query_embedding: embedding,
      match_threshold: 0.7, // Adjust this threshold (0.0 to 1.0) to make it more/less strict
      match_count: 5 // Return top 5 schemes
    })

    if (error) throw error

    // 5. Return the matching schemes to your React frontend!
    return new Response(JSON.stringify({ schemes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
