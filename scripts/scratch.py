import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We want to comment out ALL <a href="..." class="service-card">...</a>
# EXCEPT those containing "planner.html", "insta_slides.html", or "bizcard".

# Regular expression to match each service-card link block
pattern = re.compile(r'(<a\s+href="([^"]+)"\s+class="service-card".*?</a>)', re.DOTALL)

def replacer(match):
    full_match = match.group(1)
    href = match.group(2)
    
    keep_list = ['planner.html', 'insta_slides.html', 'bizcard_maker.html', 'bizcard_viewer.html', 'card.html']
    
    if any(k in href for k in keep_list):
        return full_match # Keep it
    else:
        # Check if already commented out (starts with <!-- and ends with -->)
        # Actually our regex doesn't capture the comment if it's outside. 
        # So we just wrap it in <!-- [HIDDEN FOR NOW]\n...\n-->
        return f"<!-- [HIDDEN FOR NOW]\n{full_match}\n-->"

new_html = pattern.sub(replacer, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Done")
