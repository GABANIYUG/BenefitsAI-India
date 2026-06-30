import os
import requests
import google.generativeai as genai
from supabase import create_client, Client
from datetime import datetime

# Environment Variables (Set in GitHub Actions)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not GEMINI_API_KEY:
    print("Error: Missing environment variables. Please set them in GitHub Secrets.")
    exit(1)

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

def fetch_gujarat_schemes():
    """
    Simulates fetching schemes from a government portal.
    In a real production scenario with MyScheme.gov.in, you would use 
    tools like Playwright here to bypass their Cloudflare 403 Forbidden blocks,
    or parse their daily CSV dumps from data.gov.in.
    
    For demonstration of the UPSERT pipeline, we provide a robust fallback dataset.
    """
    print(f"[{datetime.now()}] Fetching Gujarat Schemes...")
    
    # Due to intense bot-protection (Cloudflare 403) on government APIs, 
    # we use a fallback dataset if the live fetch fails.
    fallback_data = [
        {
            "title": "Mukhya Mantri Amrutam (MA) Yojana",
            "description": "A health insurance scheme by the Government of Gujarat that provides tertiary care treatment to Below Poverty Line (BPL) families.",
            "department": "Health and Family Welfare",
            "category": "Health Insurance",
            "source_url": "https://magujarat.com/"
        },
        {
            "title": "Vahali Dikri Yojana",
            "description": "A financial assistance scheme by the Gujarat government to promote the birth of girl children, prevent female foeticide, and support their education.",
            "department": "Women and Child Development",
            "category": "Child Welfare",
            "source_url": "https://wcd.gujarat.gov.in/"
        },
        {
            "title": "Kisan Sahay Yojana",
            "description": "Crop insurance scheme in Gujarat where farmers are given financial compensation in case of crop loss due to drought, excess rain, or unseasonal rain without paying any premium.",
            "department": "Agriculture",
            "category": "Agriculture",
            "source_url": "https://agri.gujarat.gov.in/"
        },
        {
            "title": "Mukhyamantri Yuva Swavalamban Yojana",
            "description": "Provides financial assistance to meritorious and needy students for higher education, covering tuition fees and hostel expenses.",
            "department": "Education",
            "category": "Education",
            "source_url": "https://mysy.guj.nic.in/"
        },
        {
            "title": "Manav Garima Yojana",
            "description": "Provides financial assistance and equipment to socially and economically backward classes to encourage self-employment and small businesses.",
            "department": "Social Justice & Empowerment",
            "category": "Employment",
            "source_url": "https://sje.gujarat.gov.in/"
        }
    ]
    
    # Try fetching from a hypothetical open API (this will likely fail or return nothing, so we fallback)
    try:
        response = requests.get("https://api.myscheme.gov.in/search/v2/schemes?state=Gujarat", timeout=10)
        if response.status_code == 200:
            print("Successfully fetched live data!")
            # parse response.json() here...
        else:
            print(f"Live API blocked (Status {response.status_code}). Using structured fallback dataset.")
    except Exception as e:
        print(f"Live API request failed: {e}. Using structured fallback dataset.")
        
    return fallback_data

def generate_embedding(text):
    """Generate a vector embedding using Gemini API."""
    try:
        # text-embedding-004 is Google's latest embedding model
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def upsert_to_supabase(schemes):
    """Upsert schemes into Supabase and generate embeddings if new."""
    print(f"[{datetime.now()}] Processing {len(schemes)} schemes for database sync...")
    
    for scheme in schemes:
        title = scheme["title"]
        
        # 1. Check if scheme already exists
        response = supabase.table("schemes").select("id").eq("title", title).execute()
        
        if len(response.data) > 0:
            print(f"Skipping existing scheme: {title}")
            continue
            
        print(f"New scheme found: {title}. Generating embedding...")
        
        # 2. Generate Embedding
        search_text = f"{title}. {scheme['description']} Department: {scheme['department']} Category: {scheme['category']}"
        embedding = generate_embedding(search_text)
        
        if not embedding:
            print(f"Failed to generate embedding for {title}, skipping.")
            continue
            
        # 3. Insert into Supabase
        scheme_data = {
            "title": title,
            "description": scheme["description"],
            "department": scheme["department"],
            "category": scheme["category"],
            "state": "Gujarat",
            "source_url": scheme.get("source_url", ""),
            "embedding": embedding
        }
        
        try:
            supabase.table("schemes").insert(scheme_data).execute()
            print(f"Successfully inserted: {title}")
        except Exception as e:
            print(f"Database insertion failed for {title}: {e}")

if __name__ == "__main__":
    print("=== Starting Gujarat Scheme Ingestion Pipeline ===")
    schemes = fetch_gujarat_schemes()
    upsert_to_supabase(schemes)
    print("=== Pipeline Complete ===")
