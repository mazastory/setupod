from slice_stickers import slice_stickers
import shutil
import os

if os.path.exists('stickers_output'):
    shutil.rmtree('stickers_output')

slice_stickers('ai_functional_stickers.jpg', 'stickers_kmong/functional')
slice_stickers('ai_premium_stickers.jpg', 'stickers_kmong/premium')
slice_stickers('ai_character_stickers.jpg', 'stickers_kmong/character')
slice_stickers('ai_sticker_sheet.jpg', 'stickers_kmong/basic')

slice_stickers('ai_bear_stickers.jpg', 'stickers_kakao/bear')
slice_stickers('ai_cat_stickers.jpg', 'stickers_kakao/cat')
