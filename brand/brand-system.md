# Brand System

Working brand system extracted from the current Hoea tō Waka website. This is a source document for design and development, not a final rebrand.

## Brand Summary

- Brand name: `Hoea tō Waka`
- Core line in current use: `Strength in Aotearoa`
- Overall feel:
  - calm
  - supportive
  - practical
  - grounded in Aotearoa
  - people-first rather than corporate
- Current site mood:
  - light
  - oceanic
  - airy
  - service-led

## Core Palette

### Primary colors

| Token | Name | Hex | Current use |
| --- | --- | --- | --- |
| `brand-primary` | Ocean Blue | `#3D9BE9` | testimonial background, key brand color |
| `brand-primary-soft` | Sky Blue | `#A3D9F6` | light accents, softer surfaces |
| `brand-accent` | Harbour Magenta | `#A6033F` | primary CTA buttons |
| `brand-accent-hover` | Bright Magenta | `#E40255` | CTA hover state |

### Neutrals

| Token | Name | Hex | Current use |
| --- | --- | --- | --- |
| `bg-base` | Cloud Mist | `#F1F6F8` | default light section and page background |
| `bg-soft` | Mist Gray | `#F2F2F2` | light surfaces and soft contrast |
| `border-muted` | Stone Gray | `#B1B4B5` | low-emphasis borders and support color |
| `text-muted` | Charcoal Gray | `#605E5E` | secondary body text |
| `text-strong` | Deep Black | `#000000` | primary text |

### Extended theme colors

These exist in the current Wix theme variables, even though they are not dominant on the homepage:

| Name | Hex | Suggested role |
| --- | --- | --- |
| Fern Green | `#44C26D` | positive states, success, wellbeing accents |
| Kelp Green | `#2D8149` | darker support green |
| Warm Gold | `#DEC328` | highlights, small emphasis |
| Clay Orange | `#DE5021` | sparing accent use only |

## Suggested Dev Tokens

```css
:root {
  --color-brand-primary: #3D9BE9;
  --color-brand-primary-soft: #A3D9F6;
  --color-brand-accent: #A6033F;
  --color-brand-accent-hover: #E40255;

  --color-bg: #F1F6F8;
  --color-surface: #F2F2F2;
  --color-border: #B1B4B5;

  --color-text: #000000;
  --color-text-muted: #605E5E;
}
```

## Typography

### Current type system

- Primary heading family:
  - `Helvetica W01 Bold`, with Arial/Helvetica fallback
- Primary body family:
  - `Helvetica W01 Roman`, with Arial/Helvetica fallback
- Navigation family:
  - `DIN Next W01 Light`

### Approximate type scale from the live site

| Role | Approx size | Weight | Notes |
| --- | --- | --- | --- |
| Hero title | `42px` | bold | used for the `h1` |
| Section title large | `36px` | bold | close to current `h2` styling |
| Section title | `24px` | bold | current `h3` size |
| Small section title | `20px` | bold | current `h4` size |
| Button / small heading | `16px` | bold | CTA and support headings |
| Body | `15px` | regular | standard paragraph text |
| Nav | `16px` | light | top navigation |

### Suggested dev tokens

```css
:root {
  --font-display: "Helvetica W01 Bold", Arial, Helvetica, sans-serif;
  --font-body: "Helvetica W01 Roman", Arial, Helvetica, sans-serif;
  --font-nav: "DIN Next W01 Light", Arial, Helvetica, sans-serif;

  --font-size-h1: 42px;
  --font-size-h2: 36px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-body: 15px;
  --font-size-button: 16px;
}
```

## Buttons

### Primary CTA

- Background: `#A6033F`
- Text: `#FFFFFF`
- Hover background: `#E40255`
- Style:
  - solid fill
  - high contrast
  - fairly straightforward, not ornamental

### Current button labels on the homepage

- `Go to inhouse workshops`
- `Go to individual coaching`
- `More for support professionals`
- `See resources`
- `Send`

## Layout Patterns

The current homepage uses these recurring structural patterns:

- Full-width image hero
- Centered section intro
- Three-column service grid
- Full-width testimonial band in blue
- Split content-and-image promo block
- Contact details paired with form

These are useful patterns to keep as reusable components when the site is rebuilt.

## Imagery Direction

Current visual direction suggests:

- water
- movement
- journey
- resilience
- Aotearoa context

Useful imagery cues already aligned with the brand:

- waka / waterway associations
- coastal or open-sky tones
- human, practical, non-corporate imagery
- resource-led imagery, such as books and workshop material

From earlier project context, imagery continuity should stay close to:

- kayak / waka associations
- wahine-led visual identity
- calm but strong emotional tone

## Voice And Tone

The current brand voice should stay:

- warm
- respectful
- clear
- grounded
- supportive
- locally rooted

It should avoid sounding:

- overly clinical
- generic corporate wellness
- overly spiritual without practical grounding

## Components To Standardise Later

When development starts, these should become reusable system parts:

- header and navigation
- hero block
- service card / feature card
- testimonial slider
- content-image promo section
- contact section
- primary CTA button

## Notes

- The current social icons exist, but the footer links should be checked before reuse.
- This document reflects the live site's existing system, not a polished future design system.
- If the brand is refreshed later, this file should become the baseline comparison point.
