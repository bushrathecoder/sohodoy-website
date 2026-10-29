// ============================================================
//  SOHODOY "MEET THE HEROES" PAGE
//  Loads the team you saved in the admin panel and draws one
//  card per person: founder, co-founder, then the core team.
// ============================================================

const $ = (id) => document.getElementById(id);

// Small helper: make an element, optionally with a class and text.
function make(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

// Only allow normal web links (and email links), never anything risky.
function safeUrl(url) {
  return /^(https?:\/\/|mailto:)/i.test(url || "") ? url : null;
}

// Connect to the database (Supabase). Stays null until config.js is filled in.
const ready = typeof SUPABASE_URL !== "undefined" && !SUPABASE_URL.startsWith("PASTE") && window.supabase;
const db = ready ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Build the little link buttons under a person's bio.
function makeLinks(p) {
  const wrap = make("div", "person-links");
  const add = (label, url) => {
    const safe = safeUrl(url);
    if (!safe) return;
    const a = make("a", "pill", label);
    a.href = safe;
    if (!safe.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener"; }
    wrap.append(a);
  };
  if (p.email) add("Email", "mailto:" + p.email);
  add("Portfolio / CV", p.website_url);
  add("Facebook", p.facebook_url);
  add("LinkedIn", p.linkedin_url);

  // Extra links: one per line, written as  Label | https://link
  (p.other_links || "").split("\n").forEach((line) => {
    const [label, url] = line.split("|").map((x) => x.trim());
    if (label && url) add(label, url);
    else if (label && /^https?:\/\//i.test(label)) add("Link", label);
  });
  return wrap;
}

// Draw one person. "big" is used for the founder and co-founder.
function makePerson(p, big) {
  const card = make("article", big ? "person big" : "card person");

  let photo;
  if (p.image_url) {
    photo = make("img", "photo");
    photo.src = p.image_url;
    photo.alt = p.name;
  } else {
    // No photo yet: show the person's initials.
    photo = make("div", "photo initials", p.name.trim().slice(0, 1).toUpperCase());
  }

  const text = make("div", big ? "info" : "body");
  text.append(make("h3", "", p.name));
  if (p.role) text.append(make("p", "role", p.role));
  if (p.bio) text.append(make("p", "pre bio", p.bio));
  text.append(makeLinks(p));

  card.append(photo, text);
  return card;
}

async function loadHeroes() {
  if (!db) return;
  try {
    const { data } = await db.from("team_members").select("*").order("sort", { ascending: true });
    if (!data || !data.length) return;

    const show = (group, boxId, sectionId, big) => {
      const people = data.filter((p) => p.group_name === group);
      if (!people.length) return;
      people.forEach((p) => $(boxId).append(makePerson(p, big)));
      $(sectionId).hidden = false;
    };
    show("founder", "founder-box", "founder-section", true);
    show("cofounder", "cofounder-box", "cofounder-section", true);
    show("core", "core-box", "core-section", false);
    $("heroes-empty").hidden = true;
  } catch (err) {
    console.error("Could not load the team", err);
  }
}

// Footer contact line (same one as the home page).
async function loadContact() {
  if (!db) return;
  const { data } = await db.from("settings").select("*");
  const s = {};
  (data || []).forEach((r) => (s[r.key] = r.value));
  $("contact-line").textContent = [s.contact_email, s.contact_phone, s.contact_address].filter(Boolean).join(" · ");
}

loadHeroes();
loadContact();
