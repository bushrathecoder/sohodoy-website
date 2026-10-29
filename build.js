// ============================================================
//  BUILD SCRIPT (runs automatically on Vercel; you never run it)
//  It copies the website files into a folder called "dist" and
//  creates config.js from the secret values you typed into
//  Vercel (Environment Variables). That way your connection
//  details are never saved inside GitHub.
// ============================================================
const fs = require("fs");

const files = ["index.html", "heroes.html", "admin.html", "site.js", "heroes.js", "admin.js", "style.css", "logo.png"];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add both in Vercel: Project Settings > Environment Variables.");
  process.exit(1);
}

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");
files.forEach((f) => fs.copyFileSync(f, "dist/" + f));
fs.writeFileSync(
  "dist/config.js",
  "const SUPABASE_URL = " + JSON.stringify(url) + ";\nconst SUPABASE_ANON_KEY = " + JSON.stringify(key) + ";\n"
);
console.log("Built " + files.length + " files into dist/");
