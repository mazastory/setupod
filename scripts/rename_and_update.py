import os
import glob

renames = {
    "maker.html": "bizcard_maker.html",
    "viewer.html": "bizcard_viewer.html",
    "card.html": "bizcard_public.html",
    "link.html": "multilink.html",
    "instagram_slides.html": "insta_slides.html"
}

# 1. Rename files
for old, new in renames.items():
    if os.path.exists(old):
        os.rename(old, new)

# 2. Update references in all HTML and JS files
files_to_update = glob.glob("*.html") + glob.glob("js/*.js")

for filepath in files_to_update:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    # Replace old filenames with new ones in hrefs, window.open, window.location, iframe src
    for old, new in renames.items():
        # strict replacements to avoid partial matches
        content = content.replace(f'"{old}"', f'"{new}"')
        content = content.replace(f"'{old}'", f"'{new}'")
        content = content.replace(f'/{old}', f'/{new}')
        content = content.replace(f'{old}?', f'{new}?')
        content = content.replace(f'href="{old}#', f'href="{new}#')
        
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated references in {filepath}")

