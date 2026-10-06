# Nexgen Facility Management — website

Marketing site and enquiry dashboard for Nexgen Facility Management, rebuilt from the client's single-file HTML design into a production Next.js application. The public site follows the original layout, colours, typography and copy. The changes made are listed under [Changes from the original](#changes-from-the-original).

## What is in here

| Part | Where | Notes |
|---|---|---|
| Public website | `/` | Static, served from the CDN. |
| Enquiry form | `/#contact` | Saves each enquiry to Supabase. |
| Sign-in and sign-up | `/admin/login`, `/admin/signup` | Supabase Auth, email and password. A normal sign-in for anyone. |
| Enquiry dashboard | `/admin/dashboard` | Only for accounts whose role is `admin`. |

## Stack

| Part | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | Public pages are rendered to HTML at build time, so they load fast and search engines can read them. Admin pages render per request. |
| Styling | CSS Modules plus design tokens in `src/app/globals.css` | Keeps the client's CSS almost unchanged, so the design matches the original. |
| Fonts | Self-hosted Inter, Space Grotesk, IBM Plex Mono | No request to Google, no layout shift when fonts load. |
| Images | `next/image` | Resized per device and served as AVIF or WebP. |
| Database and sign-in | Supabase (Postgres, Auth) | Same as the Tapro and Hospo Fresh projects. |
| Hosting | Vercel | Same as the Tapro and Hospo Fresh projects. |

There is no CMS for page content. It changes a few times a year, so it lives in typed files under `src/content/`.

## Run it locally

Requires Node.js 20.9 or newer (22 recommended).

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values to use the admin area
npm run dev                  # http://localhost:3000
```

With no environment variables set, the public site and the enquiry form still work in development: the lead is printed in the terminal instead of being saved. The admin pages show a "not set up yet" notice.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run check` | Lint, type-check and unit tests (run before every push) |

## Set up Supabase

Use a **new** Supabase project, separate from Tapro.

### 1. Create the tables and rules

Open **SQL Editor**, paste the whole of `supabase/schema.sql`, and run it. It is safe to run again.

### 2. Copy the keys

From **Project Settings → API keys**:

| Supabase value | Environment variable |
|---|---|
| Project URL | `SUPABASE_URL` |
| Publishable key (older projects: `anon`) | `SUPABASE_PUBLISHABLE_KEY` |
| Secret key (older projects: `service_role`) | `SUPABASE_SECRET_KEY` |

### 3. Configure sign-in

Under **Authentication**:

- **URL Configuration → Site URL**: the live site address.
- **URL Configuration → Redirect URLs**: add `https://YOUR-DOMAIN/admin/login`. The confirmation email's link lands there.
- **Sign In / Providers → Email**: keep **Confirm email** on, and set the minimum password length to 10 to match the sign-up form.
- Supabase's built-in email sender is limited to a few messages an hour. For real use, add custom SMTP under **Authentication → Emails**.

### 4. Make someone an admin

1. The person creates a login at `/admin/signup` and confirms their email. That gives them a row in the `users` table with the role `user`.
2. Change their role to `admin`. Either open **Table Editor → users** and edit the `role` cell, or run this in the SQL Editor:

```sql
update public.users set role = 'admin'
where email = 'person@nexgenfm.com.au';
```

The next time they load the site while signed in, an **Admin dashboard** button appears in the header.

To remove access, set the role back to `user`:

```sql
update public.users set role = 'user'
where email = 'person@nexgenfm.com.au';
```

### 5. Close sign-up when the team is in

Once every staff member has an account, consider turning off **Allow new users to sign up** (Authentication → Sign In / Providers). The sign-up page then says that new accounts are switched off. An open sign-up page is not a data risk, because a new account has the role `user` and can see nothing, but closing it stops strangers creating accounts and triggering confirmation emails.

## How access is controlled

Sign-in is a normal sign-in. Everyone lands back on the website afterwards. What they see next depends on their role in the `users` table:

| Role | Header shows | Dashboard |
|---|---|---|
| Not signed in | Sign in | Sent to the sign-in page |
| `user` (every new account) | Sign out | Sent back to the website |
| `admin` | Admin dashboard, Sign out | Opens |

The button is only a convenience. Hiding a button is not security, so three separate layers stand between a login and the enquiries, and the last one does not depend on this codebase being correct:

1. **Proxy** (`src/proxy.ts`) sends signed-out visitors to the sign-in page and keeps sessions fresh.
2. **Server check** (`src/lib/admin/session.ts`): every admin page and action verifies the session with Supabase and confirms the role is `admin`. Anyone else is sent back to the website.
3. **Database rules** (`supabase/schema.sql`): row level security lets a login read or change enquiries only if its row in `public.users` has the role `admin`. Nobody can change their own role from the website; roles are changed in Supabase.

Other points:

- The dashboard reads data as the signed-in person, not with the secret key, so layer 3 applies to every query.
- Admins can change an enquiry's status and notes only. The enquirer's details are read-only at the database level.
- Every status change, notes change and deletion is written to `enquiry_events` by a database trigger, with who did it and when. The website cannot edit or delete that history.
- Session cookies are HttpOnly, so page scripts cannot read them.
- The secret key is used in one place: saving a new enquiry from the public form.

### How the header knows who is signed in

The public pages are static files, so they cannot know who is looking at them. Signing in sets a small marker cookie (`nx_signed_in`) that holds no token. The header checks for it in the browser, and only if it is present asks the server (`/api/session`) for the real answer. Visitors who have never signed in cause no extra request, and the site stays fully static for them. Forging the marker achieves nothing: the answer still comes from the server.

## The dashboard

- **Pipeline**: New → Contacted → Quoted → Won, with a count for each. Click a stage to filter. Lost and Spam are separate views.
- **Search**: by name, company, email, phone, suburb or reference.
- **Enquiry page**: contact details with reply-by-email and call buttons, the message, the estimate the visitor saw, status, internal notes, and the change history.
- **Export CSV**: downloads the current view. Cells that a spreadsheet would run as a formula are neutralised.
- **Delete**: permanently removes an enquiry, for privacy requests. For junk, use the Spam status instead.

Dates are shown in Sydney time. Change `timeZone` in `src/content/site.ts` if the client prefers another.

## Environment variables

All are listed with comments in `.env.example`.

| Variable | Needed for |
|---|---|
| `SUPABASE_URL` | Saving enquiries and sign-in |
| `SUPABASE_PUBLISHABLE_KEY` | Sign-in and the dashboard |
| `SUPABASE_SECRET_KEY` | Saving enquiries from the public form. Server only. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, social cards, and the link in confirmation emails. Set when the real domain is connected. |
| `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_TO_EMAIL` | Phase 2. Emails staff when an enquiry arrives. Leave unset for now. |
| `SHOW_PLACEHOLDER_CONTENT` | Preview deployments only. |

In production, if the enquiry cannot be saved anywhere, the form tells the visitor it could not send and shows the phone number. It never reports success for a lead that went nowhere.

**Email notification is phase 2.** Until it is switched on, nobody is told when an enquiry arrives; someone has to open the dashboard to find out.

## Deploy to Vercel

1. Push this folder to a new GitHub repository. Do not commit `node_modules` or `.next`.
2. In Vercel, choose **Add New → Project** and import the repository. The defaults are correct.
3. Under **Settings → Environment Variables**, add the variables above for **Production**. Add `SHOW_PLACEHOLDER_CONTENT=true` for **Preview** only.
4. Deploy. Environment variable changes need a redeploy to take effect.
5. Run the [live checks](#live-checks-after-deploying).

## Hero video and image

Put these two files in the `public/` folder, with exactly these names, and redeploy:

| File | Use |
|---|---|
| `public/hero-banner.jpg` | Still image. At least 2400 px wide. Also shown to visitors who have "reduce motion" switched on. |
| `public/hero-loop.mp4` | Looping background video. H.264, no audio track, ideally under 4 MB. |

The site checks for them when it builds. Either one can be missing: without the image, the hero uses a built-in photo; without the video, it shows the still image only.

## Where to edit content

| To change | Edit |
|---|---|
| Phone, email, ABN, cities, social links, hero stats | `src/content/site.ts` |
| Services (text, photo, order) | `src/content/services.ts` |
| Industries | `src/content/industries.ts` |
| "Why choose us" and process stages | `src/content/why.ts` |
| FAQs | `src/content/faqs.ts` |
| Testimonials, partner logos, team profiles | `src/content/social-proof.ts` |
| Estimator rates | `src/lib/estimator.ts` |
| Photos | `src/assets/images/` |

In `site.ts`, any value set to `null` is treated as "not supplied yet" and is left off the page. For example, the footer shows the ABN only once `abn` is filled in.

### Testimonials, partners and team

These three sections are **hidden on the live site until real content is added**. The client's original file contained invented testimonials and invented partner companies, marked as placeholders. Publishing invented testimonials as customer feedback is misleading, and in Australia it can breach the Australian Consumer Law, so the site does not do it.

To publish a section, add real entries to the matching array at the top of `src/content/social-proof.ts`. The section appears automatically, and the "Team" navigation link appears once there is a team profile.

To review the design with the original placeholder content, set `SHOW_PLACEHOLDER_CONTENT=true`. Each placeholder section is then shown with a visible "Preview only" label, and search engines are blocked. Use this on preview deployments only.

## Before launch: needed from the client

- [ ] `hero-banner.jpg` and `hero-loop.mp4`
- [ ] Written confirmation that Nexgen holds a licence for every photo, and higher-resolution versions where possible (see note below)
- [ ] Real testimonials, with permission to publish them
- [ ] Real partner or client logos, with each company's consent
- [ ] Team names, roles, short bios and photos
- [ ] ABN and year established
- [ ] LinkedIn and Facebook page links
- [ ] Confirmation of the hero figures: 15+ years, 500+ facilities, 100% WHS compliant
- [ ] Confirmation that the estimator rates are current
- [ ] The logo as an SVG file
- [ ] Review of the draft privacy policy (`src/app/privacy/page.tsx`), then set `legal.privacyPolicyApproved` to `true` in `site.ts`
- [ ] Who should have admin access
- [ ] Access to the domain's DNS

**Photo note.** The photos came from the client and their source is unknown. Most are 736 px wide and two are 236 px wide, which are the sizes Pinterest serves, and at least one looks AI-generated. They look soft on large screens. The client is responsible for having the right to use them; get that confirmed in writing before launch.

## How the enquiry form works

1. **In the browser**, each field is checked as the visitor leaves it and again when they press the button. Messages appear under the field, and the first invalid field gets focus.
2. **On the server**, the same rules run again (`src/lib/enquiry.ts`). This is the check that counts, because anyone can post to the server without using the form. Both sides call one file, so they can never disagree.
3. The server also checks a hidden honeypot field and applies a rate limit of five valid submissions per address per ten minutes.
4. If the visitor used the estimator, only the inputs are sent. The server recalculates the figures, so a tampered form cannot inject a price.
5. The enquiry is saved to Supabase. The visitor sees a confirmation with a reference such as `NX-7K2M9Q` only if it was saved.

| Field | Rule |
|---|---|
| Full name | Required. 2 to 100 characters, including at least one letter. |
| Email | Required. Must look like `name@domain.tld`. |
| Phone | Required. Digits, spaces, `+`, `-` and brackets only; 8 to 15 digits. |
| Facility type | Required. One of the listed options. |
| Company, suburb or postcode | Optional. Up to 120 characters. |
| Message | Optional. Up to 2,000 characters. |

The form also works with JavaScript switched off: the browser's built-in checks apply, and the server's messages are shown on the page.

The rate limiter keeps its counts in memory, so on a serverless host it limits each running instance separately. It is a baseline, not a hard cap. If spam becomes a problem, add Cloudflare Turnstile and a shared limiter (Upstash), as on Hospo Fresh.

## Testing

`npm run test` runs 80 unit tests: estimator maths, form validation rules, rate limiter, lead delivery, search escaping, CSV export and date formatting.

Checked before handover, in addition:

| Check | Result |
|---|---|
| Database rules, on a real PostgreSQL 16 server with Supabase's roles recreated | 42 of 42: signed-out visitors and `user` accounts can read and change nothing; nobody can change a role from the website; admins can change only status and notes; history cannot be edited |
| Sign-in and admin area in a real browser: sign-up, sign-in, header for each role, dashboard, search, update, export, delete, session refresh, sign-out, forged cookies | 66 of 66 |
| Public site in a real browser: estimator, form validation, spam protection, no-JavaScript, mobile menu | 45 of 45 |
| Accessibility scan (axe), public and admin pages, desktop and mobile | No violations |
| Lighthouse, public home page, local build | Desktop 100 in all four categories; mobile 90–97 performance across runs, 100 in the other three |
| Fresh install and build from a clean copy | Passes |

**How the admin tests were run, and their limit.** There is no Supabase project available in the build environment. The admin tests ran against a local stand-in: Supabase's real client library, talking to a small test server that executes each query in real PostgreSQL under the caller's role. That proves the application logic and the database rules. It does not prove behaviour that only a live Supabase project has.

### Live checks after deploying

Do these once on the deployed site. They cover what could not be tested locally.

1. Sign up at `/admin/signup`. Confirm the email arrives and its link opens the sign-in page.
2. Sign in. You should land on the home page with **Sign out** in the header and no **Admin dashboard** button.
3. In Supabase, open **Table Editor → users**. Your row should be there with the role `user`. Change it to `admin`.
4. Reload the site. The **Admin dashboard** button should appear. Click it.
5. Send an enquiry through the public form. It should appear in the dashboard.
6. Change its status and add a note. Reload and confirm both were kept and the history shows them.
7. Export the CSV and open it.
8. With the hero files in place, confirm the video plays on a phone and a desktop browser.

## Phase 2 and not included

Planned for phase 2:

- **Email notification.** The code for it is already in the project and switches on when the three `RESEND_*` / `ENQUIRY_*` variables are set (see `.env.example`). Until then, nobody is told when an enquiry arrives; someone has to open the dashboard.
- **Forgotten-password page.** Until it exists, a person who forgets their password has to be deleted in Supabase (Authentication → Users) and sign up again, then be given the admin role again.

Not planned:

- **Sign in with Google.** Tapro has it; this site uses email and password only.
- **Per-service pages.** The data model has slugs ready for when long-form copy exists.

## Changes from the original

| Area | Original | Now | Reason |
|---|---|---|---|
| Enquiries | Main button linked to `#`; no form | Validated form, saved to Supabase, with an admin dashboard | The site could not capture a lead. |
| Header | No account controls | Sign in; then Sign out, plus Admin dashboard for admins | Entry point to the dashboard. |
| Testimonials, partners, team | Invented placeholders, shown as real | Hidden until real; labelled in preview | See above. |
| Hero media | Referenced two files that were not supplied | Picks the files up from `public/` when present | The hero rendered as a blank panel. |
| Hero stats bar | Stray divider lines and double padding | Fixed | A CSS selector matched nested elements. |
| Hero entrance | Whole block faded in from invisible | Headline shows at once; supporting text eases in | The headline is the main content and was unreadable for the first 0.8 s. |
| Page weight | 5.3 MB single file | About 360 KB on first load | Images were base64-embedded; the logo was 2709 px wide for a 32 px slot. |
| Services, industries, gallery | Built by JavaScript in the browser | Server-rendered HTML | Search engines and no-JavaScript visitors saw empty sections. |
| Industries grid | Ran edge to edge, out of line with its heading | Aligned to the page grid | Alignment. |
| Estimator | "Recommended frequency" repeated the visitor's own choice | Labelled "Service frequency"; adds "Get a confirmed quote" | The label was inaccurate, and the estimate led nowhere. |
| Contact section | Centred text and two buttons | Text beside the form | Makes room for the form. |
| About image tab | "EST. — NATIONAL COVERAGE" (year missing) | "NATIONAL COVERAGE" until the year is supplied | Placeholder text. |
| Footer | "ABN placeholder — update before launch"; social links to `#` | Shown only when supplied | Placeholder text and dead links. |
| Footer service links | All pointed to the top of Services | Each jumps to its own service card | Usability. |
| FAQ | JavaScript accordion | Native `<details>` | Works without JavaScript and with find-in-page. |
| Colours | Faint grey and amber small text at about 3:1 contrast | Darkened to pass WCAG AA (4.5:1) | Accessibility. |
| Accessibility | Phone not a link; no menu or FAQ state; no skip link | Added | Keyboard and screen-reader support. |
| Gallery captions | White text directly on photos | Dark gradient behind captions | Captions were unreadable on bright photos. |
| SEO | Title and description only | Adds canonical URL, social card, sitemap, robots.txt and structured data | Search and link previews. |

## Notes

- `npm audit` reports issues in the ESLint toolchain (development only). `npm audit --omit=dev` reports none in what is deployed.
- Fonts are licensed under the SIL Open Font License 1.1, which permits self-hosting.
- The site loads no third-party scripts and sets no cookies for visitors who do not sign in. Signing in sets session cookies and a marker cookie. If analytics are added, update the privacy policy to match.
- Admin pages are excluded from search engines by `robots.txt` and a `noindex` tag.
