// ============================================================
//  SOHODOY PUBLIC WEBSITE
//  This file fills the page with the content you saved in the
//  admin panel. If it cannot connect, the page still shows the
//  default text already written inside index.html.
// ============================================================

const $ = (id) => document.getElementById(id);

// Small helper: make an element, optionally with a class and text.
// (We always use "text", never HTML, so nobody can inject code.)
function make(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

// Connect to the database (Supabase). Stays null until config.js is filled in.
const ready = typeof SUPABASE_URL !== "undefined" && !SUPABASE_URL.startsWith("PASTE") && window.supabase;
const db = ready ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---------- Text settings (headline, about, contact, donate text) ----------
function showSettings(s) {
  const set = (id, key) => { if (s[key]) $(id).textContent = s[key]; };
  set("hero-headline", "hero_headline");
  set("hero-text", "hero_text");
  set("about-1", "about_1");
  set("about-2", "about_2");
  set("donate-heading", "donate_heading");
  set("donate-text", "donate_text");

  const parts = [s.contact_email, s.contact_phone, s.contact_address].filter(Boolean);
  $("contact-line").textContent = parts.join(" · ");
}

// ---------- Projects ----------
function showProjects(rows) {
  if (!rows.length) return;
  const box = $("projects-list");
  box.innerHTML = "";
  rows.forEach((p) => {
    const card = make("article", "card");
    if (p.image_url) {
      const img = make("img");
      img.src = p.image_url;
      img.alt = p.title;
      card.append(img);
    } else {
      card.append(make("div", "noimg"));
    }
    const body = make("div", "body");
    body.append(make("h3", "", p.title), make("p", "pre", p.description || ""));
    card.append(body);
    box.append(card);
  });
}

// ---------- Blog posts ----------
function showPosts(rows) {
  if (!rows.length) return;
  const box = $("blogs-list");
  box.innerHTML = "";
  rows.forEach((b) => {
    const post = make("article", "post");
    const date = new Date(b.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    post.append(make("div", "date", date));
    const main = make("div", "main");
    main.append(make("h3", "", b.title));
    if (b.image_url) {
      const img = make("img");
      img.src = b.image_url;
      img.alt = b.title;
      main.append(img);
    }
    if (b.summary) main.append(make("p", "pre", b.summary));
    if (b.body) {
      const more = make("details");
      more.append(make("summary", "", "Read more"), make("div", "full pre", b.body));
      main.append(more);
    }
    post.append(main);
    box.append(post);
  });
}

// ---------- Donation methods ----------
function showMethods(rows) {
  const box = $("donate-methods");
  box.innerHTML = "";
  rows.forEach((m) => {
    const card = make("div", "method");
    card.append(make("strong", "", m.name));
    if (m.details) card.append(make("div", "pre", m.details));
    if (m.link) {
      const a = make("a", "btn btn-gold", m.button_label || "Donate here");
      a.href = m.link;
      a.target = "_blank";
      a.rel = "noopener";
      card.append(a);
    }
    box.append(card);
  });
}

// ---------- Load everything ----------
async function loadSite() {
  if (!db) return; // not connected yet: default text stays on screen
  try {
    const [settings, projects, posts, methods] = await Promise.all([
      db.from("settings").select("*"),
      db.from("projects").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false }),
      db.from("posts").select("*").order("published_at", { ascending: false }),
      db.from("donation_methods").select("*").order("sort", { ascending: true }),
    ]);
    const s = {};
    (settings.data || []).forEach((r) => (s[r.key] = r.value));
    showSettings(s);
    showProjects(projects.data || []);
    showPosts(posts.data || []);
    showMethods(methods.data || []);
  } catch (err) {
    console.error("Could not load the site content", err);
  }
}

// ---------- Join Us form ----------
$("join-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("join-msg");
  msg.hidden = false;
  if (!db) {
    msg.className = "msg bad";
    msg.textContent = "The form is not connected yet.";
    return;
  }
  const f = e.target;
  const { error } = await db.from("join_requests").insert({
    name: f.name.value,
    email: f.email.value,
    message: f.message.value,
  });
  if (error) {
    msg.className = "msg bad";
    msg.textContent = "Sorry, something went wrong. Please try again.";
  } else {
    msg.className = "msg good";
    msg.textContent = "Thank you! We will contact you soon.";
    f.reset();
  }
});

loadSite();
