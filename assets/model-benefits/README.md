# Model benefits artwork

The four 800 x 800 transparent WebP illustrations were extracted from the user-supplied four-panel artwork with the built-in image generation tool, then cropped and optimised with Sharp.

- `evidence.webp`: researcher, books, charts and magnifying glass.
- `aotearoa.webp`: person with a paddle beside an Aotearoa landscape.
- `applications.webp`: person with branching everyday applications.
- `everyday.webp`: person taking learning from a workshop into daily life.

The cutouts preserve the black linework and white interior fills. All share matching canvas padding and a 180px display size. Desktop images sit within the row padding without making the text rows taller; mobile images occupy a compact dedicated area.

`replacement-prompts.json` records the background-extraction and cleanup prompts. `prompts.json` records the earlier, replaced artwork.

The white-fill revision uses the built-in image generation tool to replace the cream/grey interiors with white while retaining the existing alpha and black linework. The edit prompt is saved in `white-fill-prompt.json`.
