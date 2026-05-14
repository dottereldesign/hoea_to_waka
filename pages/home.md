# Home

Current homepage block map for `https://www.hoeatowaka.co.nz/`, based on the existing Wix homepage structure.

This is a practical classification, not a literal Wix export. Some sections could fit more than one block type, but this version is the cleanest way to rebuild the page later.

## Block Library List

- General (1662)
- Hero (228)
- Kickstart (70)
- Step Box (111)
- Image Box (241)
- Icon Box (140)
- Call To Action (47)
- Content (23)
- Counter (109)
- Email Optin (31)
- Features (66)
- Heading (34)
- Faq (23)
- Full Width Duo (38)
- Gallery (42)
- List (25)
- Logo Grid (20)
- Price List (27)
- Pricing Table (56)
- Social (14)
- Team Grid (74)
- Testimonial (100)
- Text Box (16)
- Timeline (16)
- Video (33)
- Working Hours (3)
- Contact (75)
- Sliders (1162)
- Site Parts (173)
- Shop (40)
- Blog (190)
- Portfolio (60)
- Tabs (7)

## Homepage Block Sequence

| Order | Homepage section | Best-fit block | Supporting block types | Headings | Buttons / links |
| --- | --- | --- | --- | --- | --- |
| 1 | Header and main navigation | Site Parts | Heading | Site title shown as `h3` | `Home`, `About Hoea tō Waka`, `Services`, `In-house Workshops`, `Resilience One on One`, `Workshops for Support Professionals`, `Resources`, `Contact` |
| 2 | Opening banner | Hero | Content, Image Box | `h1` "Hoea tō Waka: Strength in Aotearoa", `h4` "Resilience training, and resources for organisations and individuals" | No hero CTA button currently |
| 3 | Services intro line | Heading | Content | `h3` "Resilience training set in Aotearoa's unique cultural context." | None |
| 4 | Three service offer columns | Features | Content, Call To Action | Three service headings, each styled as `h3` | `Go to inhouse workshops`, `Go to individual coaching`, `More for support professionals` |
| 5 | Testimonial carousel | Testimonial | Sliders | No clear section heading visible in the current design | Slider arrows and slider dots |
| 6 | Resources and book promo | Full Width Duo | Content, Image Box, Call To Action | `h3` "Resources", `h2` "NEW BOOK out now", `h2` "$5 from each copy of 'Maia Makes Waves' goes to NZ Women's Refuge" | `See resources` |
| 7 | Contact area with details and form | Contact | Content | `h4` "Contact" | `Send` |
| 8 | Social icon row | Social | Site Parts | No heading | Facebook, Twitter/X, Instagram, YouTube icons |
| 9 | Footer legal strip | Site Parts | Text Box | No heading | None |

## Detailed Section Map

### 1. Header and navigation

- Block type: `Site Parts`
- Includes:
  - Brand/title link: `Hoea tō Waka`
  - Tagline text: `Strength in Aotearoa`
  - Primary navigation
  - Services dropdown
- Heading use:
  - Site title is rendered as `h3`
- Interactive items:
  - Standard nav links, not buttons

### 2. Hero

- Block type: `Hero`
- Supporting blocks:
  - `Content`
  - `Image Box`
- Content:
  - `h1`: `Hoea tō Waka: Strength in Aotearoa`
  - `h4`: `Resilience training, and resources for organisations and individuals`
- Background:
  - Full-width hero image
- Buttons:
  - None

### 3. Services intro

- Block type: `Heading`
- Supporting block:
  - `Content`
- Content:
  - `h3`: `Resilience training set in Aotearoa's unique cultural context.`
- Buttons:
  - None

### 4. Services row

- Best-fit block type: `Features`
- Why:
  - It is a three-column section made of repeatable offer cards with copy plus CTA buttons

#### Service card 1

- Heading:
  - `h3`: `In-house resilience training for your organisation`
- Button:
  - `Go to inhouse workshops`

#### Service card 2

- Heading:
  - `h3`: `Individual coaching for your team members`
- Button:
  - `Go to individual coaching`

#### Service card 3

- Heading:
  - `h3`: `The Hoea tō Waka model for support professionals`
- Button:
  - `More for support professionals`

### 5. Testimonial slider

- Block type: `Testimonial`
- Supporting block:
  - `Sliders`
- Content:
  - Rotating quote cards / testimonials
- Controls:
  - Previous arrow
  - Next arrow
  - Slider dots
- Headings:
  - No visible heading detected in this section

### 6. Resources and book section

- Best-fit block type: `Full Width Duo`
- Supporting blocks:
  - `Content`
  - `Image Box`
  - `Call To Action`
- Left/content side:
  - `h3`: `Resources`
  - Body copy about books, waiata-a-ringa, and supporting material
  - Button: `See resources`
- Right/promo side:
  - Book cover image
  - `h2`: `NEW BOOK out now`
  - `h2`: `$5 from each copy of 'Maia Makes Waves' goes to NZ Women's Refuge`

### 7. Contact section

- Block type: `Contact`
- Includes:
  - Contact details
  - Contact form
- Heading:
  - `h4`: `Contact`
- Static text:
  - `Hoea tō Waka: Strength in Aotearoa`
  - `Based in Ōtautahi Christchurch.`
  - Email address
  - Phone number
- Form fields:
  - Name
  - Email
  - Phone
  - Message
- Button:
  - `Send`

### 8. Social row

- Block type: `Social`
- Items:
  - Facebook
  - Twitter/X
  - Instagram
  - YouTube
- Note:
  - These appear to be standard social icons in the footer/contact area

### 9. Footer strip

- Block type: `Site Parts`
- Content:
  - Copyright text
- Example:
  - `©2023 Hoea to Waka Training Ltd.`

## Clean Rebuild Order

If this homepage is rebuilt as a modular page, the sequence is:

1. `Site Parts` header
2. `Hero`
3. `Heading`
4. `Features`
5. `Testimonial` + `Sliders`
6. `Full Width Duo`
7. `Contact`
8. `Social`
9. `Site Parts` footer
