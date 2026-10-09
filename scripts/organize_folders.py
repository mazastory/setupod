import os
import re
import shutil

files_to_move = {
    "kakao.html": "kakao/index.html",
    "memopod.html": "memopod/index.html",
    "multilink.html": "multilink/index.html",
    "planner.html": "planner/index.html",
    "planner_2027.html": None, # Just delete if planner.html is moved
    "bizcard_maker.html": "bizcard/maker.html",
    "bizcard_public.html": "bizcard/card.html",
    "bizcard_viewer.html": "bizcard/index.html",
    "sns_marketing/insta_slides.html": "insta/index.html"
}

for old_path, new_path in files_to_move.items():
    if not os.path.exists(old_path):
        continue
        
    if new_path is None:
        os.remove(old_path)
        continue
    
    # Create dir
    new_dir = os.path.dirname(new_path)
    if new_dir:
        os.makedirs(new_dir, exist_ok=True)
    
    # Read content
    with open(old_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace relative paths:
    # "assets/" -> "../assets/"
    # "css/" -> "../css/"
    # "js/" -> "../js/"
    # "cards/" -> "../cards/"
    # "themes/" -> "../themes/"
    content = re.sub(r'(href|src)=["\']/?(assets|css|js|cards|themes)/', r'\1="../\2/', content)
    content = re.sub(r'url\(["\']?/?(assets|css|js|cards|themes)/([^)"\']+)["\']?\)', r'url(../\1/\2)', content)
    
    # Fix internal links (e.g. index.html -> ../index.html)
    content = content.replace('"index.html"', '"../index.html"')
    content = content.replace('"./index.html"', '"../index.html"')
    content = content.replace('"bizcard_maker.html"', '"maker.html"')
    content = content.replace('"bizcard_public.html"', '"card.html"')
    content = content.replace('"bizcard_viewer.html"', '"index.html"')
    
    # Write to new path
    with open(new_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    # Remove old file
    os.remove(old_path)
    print(f"Moved {old_path} -> {new_path}")

# Now update index.html to point to new folders
if os.path.exists("index.html"):
    with open("index.html", "r", encoding="utf-8") as f:
        idx_content = f.read()
        
    idx_content = idx_content.replace('"kakao.html"', '"kakao/"')
    idx_content = idx_content.replace('"memopod.html"', '"memopod/"')
    idx_content = idx_content.replace('"multilink.html"', '"multilink/"')
    idx_content = idx_content.replace('"planner.html"', '"planner/"')
    idx_content = idx_content.replace('"bizcard_maker.html"', '"bizcard/maker.html"')
    idx_content = idx_content.replace('"sns_marketing/insta_slides.html"', '"insta/"')
    idx_content = idx_content.replace('"insta_slides.html"', '"insta/"')
    
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(idx_content)
    print("Updated index.html links")
