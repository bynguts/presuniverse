import json
import time
import urllib.parse
from scrapling import Fetcher

START_URL = "https://president.ac.id/"
BASE_DOMAIN = "president.ac.id"
MAX_PAGES = 150  # Prevent infinite loops and keep it reasonable

visited = set()
to_visit = [START_URL]
knowledge_base = []

def clean_text(text):
    # Split into lines, strip each line, keep only non-empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    # Join with newlines
    return '\n'.join(lines)

def crawl():
    print(f"Starting crawl from {START_URL}...")
    pages_crawled = 0
    
    while to_visit and pages_crawled < MAX_PAGES:
        url = to_visit.pop(0)
        
        # Normalize URL to avoid duplicates (remove fragments)
        url = url.split('#')[0].strip('/')
        
        if url in visited:
            continue
            
        visited.add(url)
        pages_crawled += 1
        print(f"[{pages_crawled}/{MAX_PAGES}] Fetching: {url}")
        
        try:
            page = Fetcher.get(url)
            
            # Extract links
            links = page.css('a')
            for link in links:
                href = link.attrib.get('href')
                if not href:
                    continue
                
                # Resolve relative URLs
                full_url = urllib.parse.urljoin(url, href)
                
                # Filter to only include president.ac.id pages
                if BASE_DOMAIN in full_url and full_url.startswith('http'):
                    clean_url = full_url.split('#')[0].strip('/')
                    if clean_url not in visited and clean_url not in to_visit:
                        # Avoid fetching raw files
                        if not any(clean_url.lower().endswith(ext) for ext in ['.pdf', '.jpg', '.png', '.doc', '.docx', '.zip']):
                            to_visit.append(clean_url)
            
            # Extract Title
            title_nodes = page.css('title')
            title = title_nodes[0].text if title_nodes else url
            
            # Extract Text
            raw_text = page.get_all_text()
            cleaned_content = clean_text(raw_text)
            
            # Skip if practically empty
            if len(cleaned_content) > 100:
                knowledge_base.append({
                    "url": url,
                    "title": title.strip(),
                    "content": cleaned_content
                })
            
            # Polite delay
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error fetching {url}: {e}")

    print(f"\nCrawl complete! Scraped {len(knowledge_base)} useful pages.")
    print("Saving to pu_knowledge.json...")
    
    # Save to JSON
    with open('pu_knowledge.json', 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        
    print("Saved successfully.")

if __name__ == "__main__":
    crawl()
