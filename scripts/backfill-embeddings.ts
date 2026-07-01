import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load variables from Backend/.env
dotenv.config({ path: path.resolve(process.cwd(), 'Backend', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Backend/.env");
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in Backend/.env. Please add it and try again.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function backfillEmbeddings() {
  console.log("Fetching schemes from Supabase...");
  const { data: schemes, error: fetchError } = await supabase.from('schemes').select('id, title, description, department');
  
  if (fetchError || !schemes) {
    console.error("Failed to fetch schemes:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${schemes.length} schemes. Generating embeddings...`);

  for (const scheme of schemes) {
    try {
      // Combine title, department, and description for maximum semantic context
      const contentToEmbed = `Title: ${scheme.title}\nDepartment: ${scheme.department}\nDescription: ${scheme.description}`;
      
      console.log(`Generating embedding for: ${scheme.title}`);
      
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: contentToEmbed
      });

      if (!response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
        console.error(`No embedding returned for ${scheme.title}`);
        continue;
      }
      const embedding = response.embeddings[0].values;

      const { error: updateError } = await supabase
        .from('schemes')
        .update({ embedding })
        .eq('id', scheme.id);

      if (updateError) {
        console.error(`Failed to update ${scheme.title}:`, updateError);
      } else {
        console.log(`Successfully updated ${scheme.title}`);
      }
      
      // Wait slightly to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error processing ${scheme.title}:`, e);
    }
  }
  
  console.log("Finished backfilling all embeddings!");
}

backfillEmbeddings();
