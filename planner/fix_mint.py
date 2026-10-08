import json

def fix_mint(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    binder_theme = data['themes']['binder']
    # Mint replacements for the binder theme
    binder_theme['bg'] = 'E0F2F1'
    binder_theme['header'] = 'D1F2EB'
    binder_theme['line'] = 'C1E7E3'
    binder_theme['card'] = 'FAFEFD'
    binder_theme['card_line'] = 'B2DFDB'
    binder_theme['page'] = 'FAFEFD'
    binder_theme['page_edge'] = 'B2DFDB'
    binder_theme['dot'] = 'D0EBE5'
    binder_theme['layer1'] = 'C1E7E3'
    binder_theme['layer2'] = 'A7D7D1'
    binder_theme['banner'] = 'D1F2EB'
    # Keeping text/fonts the same
    
    data['themes']['binder'] = binder_theme
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

fix_mint('config_binder_mint.json')
fix_mint('config_binder_landscape_mint.json')
