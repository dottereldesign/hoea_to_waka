# Illustrated homepage hero studies

These SVG backgrounds reconstruct the artwork inside the two user-supplied screen references. They use editable cubic and quadratic Bezier paths, literal local colour fills, and separate overlapping layers. They contain no raster screenshot fragments, sample navigation, logos or error text.

- `wander.svg`: violet organic backdrop, white and cyan clouds, a walking figure, a split-colour fern and cropped foreground blades. ViewBox `0 0 708 390`.
- `landscape.svg`: coral sun and trees, dark violet distant ridge, white clouds, cyan/mint hills and an overlapping navy/coral foreground. The original scene occupies `0 0 708 390`; the viewBox extends to `0 -115 708 505` with a continued trunk and quiet sky so the homepage copy has room.
- `grain.svg`: seamless monochrome SVG turbulence, seed 17, layered separately using soft-light blending. The artwork itself contains no grain.

Homepage choices: 03 is the wander scene with grain; 04 uses exactly the same scene and layout without grain; 05 is the landscape with grain. Existing 01 and 02 remain available, and 01 remains the default. The artwork uses its reference colours independently of the site's monochrome design tokens.

`design/hero-illustrations.css` handles the responsive placement. On narrow screens, the complete scene sits below the copy so the original curves retain their proportions. `node scripts/hero-illustrations.cjs` checks the three variants, grain difference, content bounds, accessibility and keyboard controls from 320 to 2560 pixels.
