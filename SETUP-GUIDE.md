# Sohodoy website: setup guide

You do this **once**. It takes about 30 minutes and costs nothing. You do not need to write any code.

You will use two free services:
- **Supabase** keeps your content (projects, blog posts, pictures, donation details, join requests).
- **Netlify** puts the website on the internet.

Before you start, unzip `sohodoy-website.zip` so you have a folder called `sohodoy-website`.

---

## Step 1: Create your Supabase project
1. Go to **supabase.com** and click **Start your project**. Sign up (free).
2. Click **New project**. Name it `sohodoy`. Choose a database password (save it somewhere), choose the region closest to your visitors, and pick the **Free** plan.
3. Wait 1–2 minutes until the project is ready.

## Step 2: Set up the database
1. Open the file `supabase-setup.sql` from the folder in any text editor (Notepad is fine).
2. Find `PUT-YOUR-EMAIL-HERE` and replace it with the email you will use to log in to the admin panel. Keep the quote marks. Save the file.
3. In Supabase, click **SQL Editor** (left menu), then **New query**.
4. Copy everything from `supabase-setup.sql`, paste it in, and click **Run**.
5. You should see "Success". (Run it only once.)
6. Now do the same with the second file, `supabase-heroes.sql` (for the Meet the Heroes page). It has no email to change. Click **New query**, paste it, **Run**. (If you already set up the site earlier, you only need to run this second file.)

## Step 3: Create your admin login
1. In Supabase, click **Authentication**, then **Users**, then **Add user** → **Create new user**.
2. Enter **the same email** you used in Step 2 and a strong password. Tick **Auto Confirm User**. Click **Create user**.
3. Still in Authentication, open **Sign In / Providers** (or **Providers**), and turn **OFF** "Allow new users to sign up". This stops strangers from creating accounts.

## Step 4: Connect the website to Supabase
1. In Supabase, click **Project Settings** (gear icon) → **API Keys** (or **API**).
2. Copy the **Project URL** and the **anon / public key** (the "publishable" key also works). Do **not** copy the secret key.
3. Open `config.js` in Notepad and paste them between the quote marks. Save the file.

## Step 5: Put the website online
1. Go to **netlify.com** and create a free account (sign up first, otherwise the site is deleted after an hour).
2. Open **app.netlify.com/drop**, or in Netlify click **Add new site** → **Deploy manually**.
3. **Drag the whole `sohodoy-website` folder** onto the page.
4. In a minute you get an address like `something.netlify.app`. That is your website. You can rename it in **Site configuration → Change site name**.

## Step 6: Log in and add your content
1. Go to `your-address.netlify.app/admin.html` and log in.
2. Use the tabs:
   - **Projects**: add a title, description and picture.
   - **Blog posts**: add a title, summary, full post and picture.
   - **Meet the heroes**: add the founder, co-founder and core team (photo, name, role, bio, email, portfolio/CV, Facebook, LinkedIn and any other links). There can be only one founder and one co-founder.
   - **Donations**: add each way to donate (name, account details, optional payment link).
   - **Website text**: change the headline, About text, donate text and contact details.
   - **Join requests**: see who filled in the Join Us form.
3. Changes show on the website straight away. You never need to upload the files again.

---

## Later: changing the design
Colors are at the top of `style.css`. If you edit a file, re-upload the folder: in Netlify open your site → **Deploys** → drag the folder onto the deploy area.

## If something goes wrong
- **Login fails:** check the email is exactly the one in Step 2, and the user exists in Step 3.
- **"Could not save" in admin:** the email in `supabase-setup.sql` did not match your login. In Supabase **SQL Editor**, run the `create or replace function public.is_admin()` part again with the right email.
- **Website shows default text only:** `config.js` is not filled in correctly, or you did not re-upload after editing it.
- **Picture will not upload:** keep pictures under 5 MB.

## What each file does
| File | Purpose |
|---|---|
| `index.html` | The public website page |
| `site.js` | Loads your saved content into the page |
| `admin.html` / `admin.js` | The admin panel |
| `heroes.html` / `heroes.js` | The Meet the Heroes page |
| `supabase-heroes.sql` | One-time database setup for the team page |
| `style.css` | Colors, fonts, layout |
| `config.js` | Your two Supabase connection values |
| `supabase-setup.sql` | One-time database setup |
| `logo.png` | Your logo |
