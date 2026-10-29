# Sohodoy website

Website and admin dashboard for **Sohodoy**, a youth-led humanitarian initiative promoting peaceful coexistence, human rights and sustainable peace.

## Features
- Public site: About, Projects, Blogs, Meet the Heroes (founder, co-founder, core team), Join Us form and Donate section
- Private admin dashboard (`/admin.html`): manage projects, blog posts, team members, donation methods, website text and join requests, with picture uploads
- Plain HTML, CSS and JavaScript, with no build framework

## How it works
- **Hosting:** Vercel (static site)
- **Content and logins:** Supabase (database, picture storage, authentication)
- **Privacy:** this repository contains **code only**. All content, pictures and visitor sign-ups live in Supabase. Only the admin's login can add, change or delete content, and the Join Us submissions can be read only by the admin (enforced by Supabase row-level security, see `supabase-setup.sql`).
- **Secrets:** the Supabase connection values are set as Vercel environment variables and written into `config.js` at build time (`build.js`). They are not stored in this repository.

## Run your own copy
See `SETUP-GUIDE.md`, then `DEPLOY-GUIDE.md` for GitHub and Vercel.

## Files
| File | Purpose |
|---|---|
| `index.html`, `heroes.html` | Public pages |
| `admin.html`, `admin.js` | Admin dashboard |
| `site.js`, `heroes.js` | Load content into the public pages |
| `style.css` | Look and feel |
| `supabase-setup.sql`, `supabase-heroes.sql` | One-time database setup |
| `build.js`, `vercel.json` | Vercel build settings |
