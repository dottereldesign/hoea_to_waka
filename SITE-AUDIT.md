# Hoea tō Waka website audit

Audit date: 20 July 2026
Status: Complete implementation, routing, SEO, and verification pass; ready for content confirmation and production deployment.

## Executive summary

The rebuild now presents Hoea tō Waka as a calm, credible, culturally grounded resilience-training business for professional and organisational buyers.

The public site has a clear journey:

1. Understand the offer.
2. Choose the relevant service.
3. Learn why Anna and the model are credible.
4. Explore supporting resources.
5. Make an enquiry.

The three services are now separated by audience, format, and outcome. The founder story is connected to trust rather than treated as an isolated biography. Books and videos support the core offer instead of competing with it.

## Delivered site map

| Page | Canonical route | Purpose | Primary action |
| --- | --- | --- | --- |
| Home | `/` | Introduce the brand and route visitors to the right service | Explore a service or contact Anna |
| About | `/about/` | Explain Anna's background and the Hoea tō Waka model | Discuss bringing the model into an organisation |
| Services | `/services/` | Compare the three ways to work with Anna | Choose a service or start a conversation |
| In-house workshops | `/services/in-house-workshops/` | Sell tailored half-day team training | Request a workshop conversation |
| Individual coaching | `/services/resilience-one-on-one/` | Explain focused one-to-one support | Discuss a coaching session |
| Support professional training | `/services/workshops-for-support-professionals/` | Explain specialist practice-focused training | Request tailored training |
| Resources | `/resources/` | Present books, waiata-a-ringa, and the English-language song | Order or enquire |
| Contact | `/contact/` | Make direct contact and enquiries straightforward | Prepare and send an email |

The brand-guidelines presentation now lives at `/about/brand-guidelines/`. It remains available from the footer, while `noindex,follow` keeps it out of commercial search results. A concise client-confirmation workspace is available at `/about/jamies-workspace/`; it is excluded from public navigation and marked `noindex,nofollow`.

## Brand and visual audit

### What is working

- The wahine/waka mark is the central visual anchor.
- Deep harbour blues, sky tones, mist surfaces, and a restrained mulberry CTA colour create a calm but confident system.
- Crimson Text gives the site an editorial, human voice; Manrope keeps body copy and controls clear.
- The fully rounded navigation reflects the established design direction and spans the available viewport.
- The portfolio-style day/night control now provides complete light and dark themes, with the visitor's choice retained across pages.
- Large display headings create a recognisable visual rhythm without relying on background video.
- Service pages use consistent composition while retaining their own content and purpose.
- Supplied book, workshop, and illustration assets are integrated where they add meaning.

### Design decisions

- The wave background video was removed from the public hero.
- Animation is not required for content visibility. All content renders immediately.
- Public pages use `site.css`; the internal guideline presentation keeps its existing `styles.css`.
- Source images used publicly were converted to WebP, reducing their combined weight from roughly 1.75 MB to about 108 KB.

## Content and information architecture audit

### Improvements made

- The homepage directly states what the business offers and who it serves.
- In-house workshops, individual coaching, and support professional training now have distinct pages.
- Service copy is organised around audience, format, outcomes, and next steps.
- Repetition from the old site has been consolidated.
- Grammar, spacing, macrons, and inconsistent terminology were cleaned up.
- Calls to action use plain language and lead to a dedicated contact page.
- Resources now have a clear role as post-workshop and wider learning tools.
- Anna's experience, credentials, cultural context, and programme-development rationale are presented together.
- Service URLs now sit beneath `/services/`, matching the visible information architecture.
- Depth-aware relative links keep navigation and assets correct on both a custom domain and the GitHub Pages project path.

### Content requiring client confirmation

These points come from the supplied context or existing website and should be confirmed before public launch:

- Exact preferred wording: “evidence-based” versus “evidence-informed.”
- Anna's final credential styling: `Dip Couns` or `Dip Counselling`.
- Preferred iwi/hapū wording and macrons for Anna's whakapapa.
- Typical workshop duration, participant range, delivery locations, and current pricing.
- Whether one-to-one coaching is purchased by organisations, individuals, or both.
- Whether the statement that $5 from each copy of *Maia Makes Waves* supports NZ Women's Refuge is still current.
- Permission to publish the existing rangatahi testimonial and whether a name, role, or organisation can be attached.
- Current availability, pricing, postage, and purchase links for both books.
- Final social-media profile links.

## UX and conversion audit

### What is working

- Shared navigation is consistent on every page.
- The theme control is consistent on every page and does not disturb the centred desktop navigation or mobile menu.
- Desktop service dropdown and full-screen mobile menu both work.
- Desktop dropdowns are centred under their parent, remain open across the 8px hover gap, and keep all service names on one line.
- Visible breadcrumbs reinforce the page hierarchy on every non-home public page.
- Every major section has a relevant next action.
- Service CTAs preselect the matching interest on the contact page.
- Email and phone links are usable directly.
- The contact form explains what happens when it is submitted.
- The site is responsive at 390, 780, 820, 1024, and 1440 pixel widths.
- No horizontal overflow was found at the tested widths.

### Current conversion limitation

The website is static. The form currently opens a pre-addressed email in the visitor's email application. This is transparent and functional for many users, but it is not a production-grade form service.

Before launch, connect the form to one of:

- the final hosting platform's form handler;
- Formspree, Basin, Netlify Forms, or an equivalent service;
- a CRM or booking system chosen by Anna.

A real endpoint should include spam protection, consent wording, a success state, and a privacy policy.

## Accessibility audit

Implemented and checked:

- One `h1` on every public page and on the brand-guidelines presentation.
- No heading-level jumps detected.
- Semantic `header`, `nav`, `main`, `section`, `article`, and `footer` landmarks.
- Skip-to-content link.
- Keyboard-operable navigation and Escape-to-close mobile menu.
- Correct labels for all contact fields.
- Accessible names for links and buttons.
- Alt text for meaningful images and empty alt text for decorative marks.
- Visible focus treatments.
- Reduced-motion support.
- Light and dark text, controls, cards, forms, dropdowns, and navigation were checked in both themes.
- Automated contrast checks pass across the tested public and reference pages in both themes.
- Mobile menu content is removed from keyboard interaction while closed.
- No duplicate IDs detected.

This is a strong implementation baseline, but it is not a formal WCAG certification. A final production audit should still include testing with VoiceOver on macOS/iOS.

## Technical and performance audit

### Passed checks

- All eight canonical public routes return HTTP 200 locally.
- All tested internal navigation and CTA destinations resolve successfully.
- Previous flat `.html` URLs are covered by permanent redirect rules; lightweight fallback documents are retained where appropriate for static hosts.
- No broken images were detected.
- No JavaScript console errors remain.
- No duplicate IDs were detected.
- All indexable public pages and the 404 page pass the HTML validator with zero errors.
- JavaScript syntax check passes.
- Git whitespace check passes.
- Unique titles, descriptions, canonical links, crawl directives, social metadata, favicon, and semantic headings are present.
- Every indexable page contains valid, parseable JSON-LD suited to its content: Organisation, WebSite, AboutPage/Person, Service, CollectionPage, Book, ContactPage, and BreadcrumbList.
- Desktop and mobile visual checks pass at 1440px, 390px, and the 320px minimum width in light and dark themes.
- Public pages do not load the removed hero video.
- Public image assets use lightweight WebP files and lazy loading below the fold.

### Production SEO implemented

- Clean, descriptive, lower-case directory routes with a consistent trailing-slash policy.
- Self-referencing canonical URLs on all public and reference pages.
- Permanent redirect rules for the original Wix URLs, the previous flat `.html` build, useful aliases, and the common `in-house-workshps` misspelling.
- Lightweight redirect documents and route-aware 404 recovery for static hosts that do not process `_redirects`.
- Canonical-only XML sitemap and a `robots.txt` file that advertises it.
- Unique search titles and meta descriptions aligned with each page's intent.
- Open Graph and social-card metadata using a dedicated 1200×630 branded image.
- Visible and structured breadcrumbs.
- Organisation, person, service, resource/book, and contact structured data.
- `en-NZ` language declaration and `max-image-preview:large` crawl settings.
- Internal working/reference HTML marked `noindex`, with host-level `X-Robots-Tag` fallbacks so crawlers can process the exclusion correctly.
- A useful, branded, `noindex` 404 page with recovery links.

Key migration redirects include:

- `/about-hoea-t%C5%8D-waka` → `/about/`
- `/in-house-workshops` → `/services/in-house-workshops/`
- `/resilience-one-on-one` → `/services/resilience-one-on-one/`
- `/workshops-for-support-professionals` → `/services/workshops-for-support-professionals/`
- Every former root-level `.html` page → its matching canonical route

### Launch-only SEO actions

These require access to the production host or business accounts and cannot be completed solely in the static codebase:

- Deploy `_redirects` and `_headers` on a compatible host, or reproduce them in the host's redirect/header settings, then verify each migration response is an HTTP 301.
- Confirm that both `hoeatowaka.co.nz` and `www.hoeatowaka.co.nz` resolve to the canonical `https://www.hoeatowaka.co.nz` origin.
- Add and verify the domain in Google Search Console, then submit `https://www.hoeatowaka.co.nz/sitemap.xml`.
- Connect privacy-conscious analytics only after the measurement and consent approach is chosen.
- Add confirmed social profiles to the Organisation schema once final profile URLs are supplied.
- Upgrade the Organisation markup to LocalBusiness only if a complete publishable address/service-area record and other required business details are confirmed.

## Launch readiness

### Ready

- Responsive public page layouts.
- Shared navigation and footer.
- Core service positioning.
- Founder/model narrative.
- Resources presentation.
- Direct email and phone contact.
- Internal link integrity.
- Lightweight public assets.
- Canonical route hierarchy, redirects, sitemap, metadata, structured data, social previews, and 404 recovery.

### Confirm before launch

- All claims and credentials.
- Workshop logistics and pricing.
- Donation statement.
- Testimonial permission.
- Book order information.
- Social profile URLs.
- Delivery locations.
- Form handling and privacy policy.
- Production-host 301 verification, Search Console, and any chosen analytics.

## Recommended features and ideas

### Priority 1 — strongest commercial impact

1. **Real enquiry form and thank-you flow**
   Capture enquiries reliably without depending on the visitor's email application.

2. **Named proof and client confidence**
   Add three to six approved testimonials with role and organisation, plus client logos where permission exists.

3. **A strong photo of Anna**
   A warm, professional portrait would materially improve trust on the About and Contact pages.

4. **Downloadable workshop overview**
   Turn the in-house flyer into a polished, accessible PDF that HR managers can forward internally.

5. **Clear delivery and pricing guidance**
   Even “from” pricing or a simple explanation of what affects a quote will reduce uncertainty.

6. **Privacy and form foundations**
   Publish a concise privacy policy and connect the enquiry form to a reliable, spam-protected endpoint with a real success state.

### Priority 2 — useful growth features

7. **Book-a-conversation calendar**
   Offer a short discovery call after Anna confirms the hours she wants available.

8. **Service-specific enquiry questions**
   Ask group size, location, role, and desired outcomes only after a visitor chooses a service.

9. **Case studies**
   Show the situation, workshop focus, participant response, and what changed afterward.

10. **FAQ expansion**
   Add delivery format, group size, accessibility, tailoring, travel, cancellation, and what participants receive.

11. **Privacy-friendly video embeds**
    Replace outbound video cards with YouTube no-cookie embeds only after consent/performance behaviour is agreed.

12. **Local discovery profile**
    If local enquiries matter, complete and maintain a Google Business Profile with the same verified name, phone, website, service area, and imagery used on the site.

### Priority 3 — longer-term platform ideas

13. **Resource ordering workflow**
    Add a lightweight order form or ecommerce only if direct book sales justify the administration.

14. **Participant follow-up library**
    Provide workshop attendees with downloadable reminders, reflection prompts, and links to the songs.

15. **Outcome measurement**
    Add optional pre/post workshop questions so organisations can understand perceived value without making clinical claims.

16. **Email resource series**
    A short opt-in sequence could reinforce the model after training and invite future organisational work.

17. **Small content-management layer**
    Add a simple CMS only when Anna needs to update testimonials, resources, or events herself.

## Recommended next decision

Prioritise the production contact form and privacy policy, approved proof, and a professional photo of Anna before adding animation, ecommerce, or a blog. Those items will do the most to improve trust, measurement quality, and enquiries.
