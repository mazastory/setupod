import json
import os

# Get all html files and dirs in root
ignored_paths = ['assets', 'js', 'themes', 'cards', 'supabase', 'node_modules', '.git', '.vercel', 'dashboard']
for f in os.listdir('.'):
    if f.endswith('.html'):
        ignored_paths.append(f[:-5]) # remove .html
        ignored_paths.append(f)

# Add other known paths
ignored_paths.extend(['maker', 'studio', 'planner', 'memopod', 'memo', 'semolake', 'kakao', 'instagram-teaser', 'instagram-slides', 'instagram-3grid', 'scorecard', 'scorecard-maker', 'waitlist', 'waitlist-maker', 'proposal', 'proposal-maker', 'proof', 'proof-maker', 'profile-studio', '10k-studio', 'detail-studio', 'hook-maker', 'product-studio', 'roi-calculator', 'brewoak', 'privacy', 'terms', 'robots.txt', 'sitemap.xml', 'sitemap', 'rss.xml', 'rss', 'feed.xml', 'feed', 'l', 'c', 'card', 'api', '_vercel'])

# Remove duplicates
ignored_paths = list(set(ignored_paths))

with open('vercel.json', 'r') as f:
    config = json.load(f)

new_rewrites = []

# Subdomain rewrites (keep as is)
for r in config.get('rewrites', []):
    if 'has' in r:
        new_rewrites.append(r)

# Explicit rewrites for all ignored paths
for path in ignored_paths:
    new_rewrites.append({ "source": f"/{path}", "destination": f"/{path}" })
    new_rewrites.append({ "source": f"/{path}/(.*)", "destination": f"/{path}/$1" })

# Catch-all for Custom URL (Option A)
new_rewrites.append({ "source": "/:slug", "destination": "/card.html?id=$slug" })
new_rewrites.append({ "source": "/:company/:slug", "destination": "/card.html?id=$company/$slug" })

config['rewrites'] = new_rewrites

with open('vercel.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Updated vercel.json with Custom URL routing")
