from fontTools.ttLib import TTFont
from fontTools import subset
from pathlib import Path
# Run with: python scripts/subset-inter.py (requires fonttools and brotli).
source=Path(__file__).resolve().parent.parent/'assets/fonts/themes'
font=TTFont(source/'inter-latin-ext-2.woff2')
options=subset.Options();options.flavor='woff2';options.layout_features=['*']
subsetter=subset.Subsetter(options=options)
# Preserve spacing glyphs as well as the Latin Extended A outlines/variation data.
subsetter.populate(unicodes=list(range(0x100,0x180))+[0x20,0xA0])
subsetter.subset(font)
font.save(source/'inter-latin-extended-a.woff2')
