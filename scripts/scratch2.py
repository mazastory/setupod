import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to find section containers. But index.html doesn't have section wrappers.
# It's just:
# <div class="section-title">...</div>
# <p class="section-desc">...</p>
# <div class="services-grid"> ... </div>

# Let's search for this pattern and if the services-grid ONLY contains whitespace or <!-- comments -->, we comment out the whole block.

pattern = re.compile(r'(<div\s+class="section-title">.*?</div>\s*<p\s+class="section-desc">.*?</p>\s*<div\s+class="services-grid">)(.*?)(</div>)', re.DOTALL)

def replacer(match):
    prefix = match.group(1)
    content = match.group(2)
    suffix = match.group(3)
    
    # Strip comments and whitespace from content to see if it's empty
    # Regex to remove HTML comments
    clean_content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    clean_content = clean_content.strip()
    
    if len(clean_content) == 0:
        return f"<!-- [SECTION HIDDEN UNTIL TOOLS ARE READY]\n{prefix}{content}{suffix}\n-->"
    else:
        return match.group(0)

new_html = pattern.sub(replacer, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Done")
