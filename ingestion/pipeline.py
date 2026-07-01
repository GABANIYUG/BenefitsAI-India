import os
import requests
import json
import time
from supabase import create_client, Client
from datetime import datetime

# Environment Variables (Set in GitHub Actions)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def fetch_schemes_live_in_blocks():
    """Fetch schemes from the live API using pagination and delays (blocks)."""
    print("Fetching Schemes from live government API in blocks...")
    all_schemes = []
    offset = 0
    limit = 10 # Block size
    max_schemes = 400 # Failsafe
    
    # Headers to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.myscheme.gov.in/'
    }

    while offset < max_schemes:
        url = f"https://api.myscheme.gov.in/search/v2/schemes?state=Gujarat&offset={offset}&limit={limit}"
        print(f"Fetching block: offset {offset} to {offset+limit}...")
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                schemes = data.get('data', {}).get('schemes', [])
                if not schemes:
                    print("No more schemes found. Finished fetching.")
                    break
                    
                all_schemes.extend(schemes)
                print(f"Successfully fetched {len(schemes)} schemes in this block.")
                
            elif response.status_code == 403:
                print("\n[CRITICAL ERROR] The Government's Cloudflare Firewall blocked the request (403 Forbidden).")
                print("The server detected this script as an automated bot and instantly refused connection.")
                print(f"Response snippet: {response.text[:200]}")
                print("\nStopping ingestion process.")
                return []
            else:
                print(f"Error fetching data: {response.status_code}")
                print(response.text[:200])
                break
                
        except Exception as e:
            print(f"Network error: {e}")
            break
            
        offset += limit
        
        if offset < max_schemes:
            print(f"Sleeping for 5 seconds to avoid rate-limiting...")
            time.sleep(5)
            
    print(f"Successfully fetched {len(all_schemes)} total schemes from live API.")
    return all_schemes

def generate_embedding(text):
    """Generate a vector embedding using Gemini REST API to ensure exact 1536 dimensionality."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_API_KEY}"
        payload = {
            "model": "models/gemini-embedding-2",
            "content": {
                "parts": [{"text": text}]
            },
            "outputDimensionality": 1536
        }
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()['embedding']['values']
        else:
            print(f"Gemini API Error: {response.text}")
            return None
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def main():
    print("=== Starting Internet Block Ingestion Pipeline ===")
    
    if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY]):
        print("Error: Missing required environment variables.")
        return

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # 1. Fetch from Internet
    schemes = fetch_schemes_live_in_blocks()

    if not schemes:
        print("No schemes found to process (Likely blocked by Cloudflare).")
        return

    # 2. Process and Upsert
    print(f"Processing {len(schemes)} schemes for database sync...")
    
    for scheme in schemes:
        title = scheme.get('schemeName', 'Unknown')
        desc = scheme.get('briefDescription', 'No description available.')
        dept = scheme.get('nodalMinistryName', 'General')
        state = 'Gujarat'
        
        # Check if already exists based on title to avoid duplicating
        existing = supabase.table('schemes').select("id").eq("title", title).execute()
        
        if existing.data:
             print(f"Skipping existing scheme: {title}")
             continue
             
        print(f"New scheme found: {title}. Generating embedding...")
        
        # Generate semantic string for embedding
        embedding_text = f"Title: {title}\nCategory: {dept}\nState: {state}\nDescription: {desc}"
        
        embedding_vector = generate_embedding(embedding_text)
        
        if not embedding_vector:
            print(f"Failed to generate embedding for {title}, skipping.")
            continue
            
        # Prepare row data
        row = {
            "title": title,
            "description": desc,
            "department": dept,
            "state": state,
            "embedding": embedding_vector
        }
        
        # Insert into Supabase
        try:
            supabase.table('schemes').insert(row).execute()
            print(f"Successfully inserted: {title}")
        except Exception as e:
            print(f"Error inserting {title} into database: {e}")

    print("=== Pipeline Complete ===")

if __name__ == "__main__":
    main()
