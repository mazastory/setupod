import json
import os
import glob

vercel_path = '/Volumes/M/GitHub/setupod/vercel.json'
with open(vercel_path, 'r') as f:
    config = json.load(f)

# Find all HTML files in subdirectories
file_locations = {}
for category in ['planners', 'sns_marketing', 'business_cards', 'sales_funnel', 'pre_launch', 'product_planning', 'core']:
    for filepath in glob.glob(f'/Volumes/M/GitHub/setupod/{category}/*.html'):
        filename = os.path.basename(filepath)
        file_locations[filename] = f"/{category}/{filename}"
        # Also map without .html if needed
        basename = filename.replace('.html', '')
        file_locations[basename] = f"/{category}/{filename}"

# Update Vercel rewrites
if 'rewrites' in config:
    for rewrite in config['rewrites']:
        dest = rewrite.get('destination', '')
        # Handle cases like "/instagram_slides.html" or "/instagram_slides.html/$1"
        for key, new_path in file_locations.items():
            if dest == f"/{key}":
                rewrite['destination'] = new_path
            elif dest == f"/{key}/$1":
                rewrite['destination'] = f"{new_path}/$1"
            # Some routes map clean urls to .html files, or clean urls to clean urls
            # example: source: /instagram-slides, destination: /instagram-slides
            # But the actual file was instagram-slides.html or similar. Let's be careful.
            
            # If the destination exactly matches a filename we moved, update it
            if dest == f"/{key}":
                rewrite['destination'] = new_path

# Write back
with open(vercel_path, 'w') as f:
    json.dump(config, f, indent=2)

print("Updated vercel.json routes successfully.")
