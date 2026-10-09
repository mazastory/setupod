import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove all HTML comments (which includes all the hidden tools and sections)
# Be careful not to remove essential comments like <!-- Google tag (gtag.js) -->
# We specifically targeted our hiding with `<!-- [HIDDEN FOR NOW]` and `<!-- [SECTION HIDDEN UNTIL TOOLS ARE READY]`
# Let's remove only the ones we added for hiding tools.
pattern = re.compile(r'<!-- \[HIDDEN FOR NOW\].*?-->\s*', re.DOTALL)
html = pattern.sub('', html)

pattern2 = re.compile(r'<!-- \[SECTION HIDDEN UNTIL TOOLS ARE READY\].*?-->\s*', re.DOTALL)
html = pattern2.sub('', html)

# 2. Clean up multiple empty lines
html = re.sub(r'\n{3,}', '\n\n', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Cleaned!")
