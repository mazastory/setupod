import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to find <div class="services-category">...</div> blocks.
# The structure is:
# <div class="services-category">
# ...
#   <div class="services-grid">
#     ...
#   </div>
# </div>

pattern = re.compile(r'(<div\s+class="services-category">.*?<div\s+class="services-grid">)(.*?)(</div>\s*</div>)', re.DOTALL)

def replacer(match):
    prefix = match.group(1)
    content = match.group(2)
    suffix = match.group(3)
    
    clean_content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL).strip()
    
    if len(clean_content) == 0:
        return f"<!-- [SECTION HIDDEN UNTIL TOOLS ARE READY]\n{prefix}{content}{suffix}\n-->"
    else:
        return match.group(0)

new_html = pattern.sub(replacer, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Done")
