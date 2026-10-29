# Put Sohodoy on GitHub and Vercel (data stays private)

Do `SETUP-GUIDE.md` Steps 1 to 4 first (Supabase), **with these two changes**:
- In Step 2, edit the email **inside the Supabase SQL box after pasting**, not in the file on your computer.
- In Step 4, **do not** put your keys into `config.js`. Keep the Project URL and the public key in a note for Vercel.

## 1. GitHub
1. Sign in at **github.com** and click **New repository**. Name it `sohodoy-website`. Choose **Public** (so it shows on your profile). Do not tick any extra boxes. Click **Create repository**.
2. Click **uploading an existing file**.
3. Unzip the zip on your computer. Open the folder and select **all the files inside it** (not the zip, not the folder itself). Drag them onto the GitHub page.
4. Click **Commit changes**.
5. Check that `config.js` still says `PASTE-YOUR-PROJECT-URL-HERE`. It must never contain real keys.

## 2. Vercel
1. Go to **vercel.com** and sign up with **Continue with GitHub**.
2. Click **Add New… → Project**, find `sohodoy-website`, click **Import**.
3. Leave the settings as they are. Open **Environment Variables** and add two:
   - Name `SUPABASE_URL`, value: your Project URL
   - Name `SUPABASE_ANON_KEY`, value: your public (anon or publishable) key
4. Click **Deploy**. In about a minute you get an address like `sohodoy-website.vercel.app`.
5. Open it. Add `/admin.html` to the address and log in.

## 3. Show it on your GitHub profile
- Open your repository, click the **gear next to About**, add a description and your Vercel address as the website.
- Pin it: go to your profile, click **Customize your pins**, and tick `sohodoy-website`.

## What stays private
- Projects, blog posts, team details, photos, donation details and join requests are in Supabase, not in GitHub.
- Join requests can be read only after logging in as admin.
- Only your admin email can change content.
- Your Supabase **database password** and the **service_role / secret key** must never be pasted anywhere in the website or GitHub. You never need them.
- The public (anon) key is visible to anyone who opens your site; that is normal and safe because of the security rules from `supabase-setup.sql`.

## Changing things later
- Content: use the admin dashboard. No redeploy is needed.
- Design or code: change the file on GitHub (open it, click the pencil icon, **Commit changes**). Vercel redeploys by itself.
