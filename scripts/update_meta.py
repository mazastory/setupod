import sys, os
sys.setrecursionlimit(5000)
from pypdf import PdfReader, PdfWriter
import glob

directory = "/Volumes/M/GitHub/planner"
pdf_files = []
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.lower().endswith('.pdf'):
            pdf_files.append(os.path.join(root, file))

updated_count = 0
error_count = 0

for pdf in pdf_files:
    try:
        reader = PdfReader(pdf)
        writer = PdfWriter()
        writer.append_pages_from_reader(reader)
        meta = reader.metadata
        new_meta = {}
        if meta:
            new_meta.update(meta)
            
        # Only update if Author is Claude or empty, or just force update it to SETUPOD
        new_meta['/Author'] = 'SETUPOD'
        if '/Title' not in new_meta or 'Claude' in str(new_meta.get('/Title','')):
            new_meta['/Title'] = '2027 Creator Dashboard'
            
        writer.add_metadata(new_meta)
        
        # Write to temporary file then replace
        temp_pdf = pdf + ".tmp"
        with open(temp_pdf, "wb") as f:
            writer.write(f)
        os.replace(temp_pdf, pdf)
        updated_count += 1
        print(f"Updated: {os.path.basename(pdf)}")
    except Exception as e:
        error_count += 1
        print(f"Error updating {os.path.basename(pdf)}: {e}")

print(f"\\nDone. Successfully updated {updated_count} files, {error_count} errors.")
