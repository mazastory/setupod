import json

def make_mint(infile, outfile, out_pdf_name):
    with open(infile, 'r') as f:
        data = json.load(f)
    
    data['output'] = out_pdf_name
    
    mint_theme = data['themes']['pastel'].copy()
    mint_theme['bg'] = 'F3FAF7'
    mint_theme['header'] = 'D1F0E5'
    mint_theme['line'] = 'B9E3D3'
    mint_theme['card_line'] = 'B9E3D3'
    mint_theme['rule'] = 'E4EFEC'
    mint_theme['cell_weekend'] = 'E9F7F1'
    mint_theme['cell_border'] = 'D2EBE0'
    mint_theme['daily_line'] = 'BCE3D4'
    
    data['themes']['pastel'] = mint_theme
    
    with open(outfile, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

make_mint('config_binder.json', 'config_binder_mint.json', '{year}_바인더_다이어리_민트.pdf')
make_mint('config_binder_landscape.json', 'config_binder_landscape_mint.json', '{year}_바인더_다이어리_가로_민트.pdf')
