// ============================================================
//  SOHODOY CONTACT PAGE
//  Shows the contact details and social links you saved in the
//  admin dashboard (Contact tab) and sends the message form to
//  your dashboard (Messages tab).
// ============================================================

const $ = (id) => document.getElementById(id);

// Small helper: make an element, optionally with a class and text.
function make(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

// Connect to the database (Supabase). Stays null until config.js is filled in.
const ready = typeof SUPABASE_URL !== "undefined" && !SUPABASE_URL.startsWith("PASTE") && window.supabase;
const db = ready ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// One line in the details list: a small label and a value (a link if href is given).
function addDetail(label, value, href) {
  const row = make("div", "detail");
  row.append(make("small", "", label));
  if (href) {
    const a = make("a", "", value);
    a.href = href;
    row.append(a);
  } else {
    row.append(make("span", "pre", value));
  }
  $("contact-details").append(row);
}

async function loadContact() {
  if (!db) return;
  const [settings, social] = await Promise.all([
    db.from("settings").select("*"),
    db.from("social_links").select("*").order("sort", { ascending: true }),
  ]);

  const s = {};
  (settings.data || []).forEach((r) => (s[r.key] = r.value));
  let shown = 0;

  if (s.contact_intro) $("contact-intro").textContent = s.contact_intro;
  if (s.contact_email) { addDetail("Email", s.contact_email, "mailto:" + encodeURI(s.contact_email)); shown++; }
  if (s.contact_phone) { addDetail("Phone", s.contact_phone, "tel:" + s.contact_phone.replace(/[^\d+]/g, "")); shown++; }
  if (s.contact_whatsapp) { addDetail("WhatsApp", s.contact_whatsapp, "https://wa.me/" + s.contact_whatsapp.replace(/\D/g, "")); shown++; }
  if (s.contact_address) { addDetail("Address", s.contact_address); shown++; }

  // Social links (only normal web links are allowed).
  (social.data || []).forEach((l) => {
    if (!/^https?:\/\//i.test(l.url || "")) return;
    const a = make("a", "pill", l.name);
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener";
    $("contact-social").append(a);
    $("social-block").hidden = false;
    shown++;
  });

  if (shown) $("contact-empty").hidden = true;

  // Footer line (email, phone, address).
  $("contact-line").textContent = [s.contact_email, s.contact_phone, s.contact_address].filter(Boolean).join(" · ");
}

// ---------- Message form ----------
$("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("contact-msg");
  msg.hidden = false;
  if (!db) {
    msg.className = "msg bad";
    msg.textContent = "The form is not connected yet.";
    return;
  }
  const f = e.target;
  const { error } = await db.from("contact_messages").insert({
    name: f.elements.name.value,
    email: f.elements.email.value,
    message: f.elements.message.value,
  });
  if (error) {
    msg.className = "msg bad";
    msg.textContent = "Sorry, something went wrong. Please try again.";
  } else {
    msg.className = "msg good";
    msg.textContent = "Thank you! Your message has been sent.";
    f.reset();
  }
});

loadContact();
