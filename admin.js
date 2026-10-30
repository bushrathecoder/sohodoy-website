// ============================================================
//  SOHODOY ADMIN PANEL
//  Reads top to bottom: connect, log in, then one "manager" for
//  each list (projects, posts, donation methods), then the
//  website-text form and the join requests.
// ============================================================

const $ = (id) => document.getElementById(id);
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Show a short message at the bottom of the screen.
function say(text, isError) {
  const box = $("status");
  box.textContent = text;
  box.className = "status " + (isError ? "bad" : "good");
  box.hidden = false;
  clearTimeout(say.timer);
  say.timer = setTimeout(() => (box.hidden = true), 5000);
}

// Make a small button.
function miniButton(label, onClick, extraClass) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "mini " + (extraClass || "");
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

// Upload a picture to storage and return its public web address.
async function uploadImage(file) {
  if (file.size > 5 * 1024 * 1024) {
    say("That picture is over 5 MB. Please use a smaller one.", true);
    return null;
  }
  const name = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const { error } = await db.storage.from("images").upload(name, file);
  if (error) {
    say("Picture upload failed: " + error.message, true);
    return null;
  }
  return db.storage.from("images").getPublicUrl(name).data.publicUrl;
}

// ---------------- Login / logout ----------------
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { error } = await db.auth.signInWithPassword({
    email: $("email").value,
    password: $("password").value,
  });
  if (error) return say("Login failed: " + error.message, true);
  refresh();
});

$("logout").addEventListener("click", async () => {
  await db.auth.signOut();
  refresh();
});

// Show the login box or the admin panel, depending on whether you are logged in.
async function refresh() {
  const { data } = await db.auth.getSession();
  const loggedIn = !!data.session;
  $("login-form").hidden = loggedIn;
  $("app").hidden = !loggedIn;
  $("logout").hidden = !loggedIn;
  if (loggedIn) {
    managers.forEach((m) => m.reload());
    loadSettings();
    loadInbox("join_requests", "request-list");
    loadInbox("contact_messages", "message-list");
    loadOverview();
  }
}

// ---------------- Tabs and buttons that jump to a tab ----------------
// Any button with data-go="projects" (etc.) switches to that tab.
// If it also has data-focus="p-title", that box is selected for typing.
function showTab(name) {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.go === name));
  document.querySelectorAll(".tab").forEach((t) => (t.hidden = t.id !== "tab-" + name));
  window.scrollTo({ top: 0 });
}

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (!go) return;
  showTab(go.dataset.go);
  if (go.dataset.focus) $(go.dataset.focus).focus();
});

// ---------------- Overview (counts, to-do list, latest requests) ----------------
async function loadOverview() {
  const count = async (table) => {
    const { count } = await db.from(table).select("*", { count: "exact", head: true });
    return count || 0;
  };
  const [projects, posts, donate, social, messages] = await Promise.all([count("projects"), count("posts"), count("donation_methods"), count("social_links"), count("contact_messages")]);
  const team = (await db.from("team_members").select("group_name")).data || [];
  const settings = (await db.from("settings").select("*")).data || [];
  const requests = await db.from("join_requests").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5);

  $("stat-projects").textContent = projects;
  $("stat-posts").textContent = posts;
  $("stat-team").textContent = team.length;
  $("stat-donate").textContent = donate;
  $("stat-requests").textContent = requests.count || 0;
  $("stat-messages").textContent = messages;

  // To-do list: only things that are still empty.
  const s = {};
  settings.forEach((r) => (s[r.key] = r.value));
  const has = (g) => team.some((m) => m.group_name === g);
  const todo = [
    [!has("founder"), "Add the founder", "heroes"],
    [!has("cofounder"), "Add the co-founder", "heroes"],
    [!has("core"), "Add your core team", "heroes"],
    [projects === 0, "Add your first project", "projects"],
    [posts === 0, "Write your first blog post", "posts"],
    [donate === 0, "Add your donation details", "donate"],
    [!s.contact_email && !s.contact_phone && !s.contact_whatsapp, "Add your contact email or phone", "contact"],
    [social === 0, "Add your social media links", "contact"],
  ].filter((t) => t[0]);

  const list = $("checklist");
  list.innerHTML = "";
  if (!todo.length) list.textContent = "All set. Everything is filled in.";
  todo.forEach(([, label, tab]) => {
    const item = document.createElement("div");
    item.className = "row-item";
    const text = document.createElement("span");
    text.textContent = label;
    const go = miniButton("Do it", () => {});
    go.dataset.go = tab;
    item.append(text, go);
    list.append(item);
  });

  // Latest join requests.
  const box = $("latest-requests");
  box.innerHTML = "";
  const rows = requests.data || [];
  if (!rows.length) box.textContent = "No requests yet.";
  rows.forEach((r) => {
    const item = document.createElement("div");
    item.className = "row-item";
    const text = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = r.name + " (" + r.email + ")";
    const when = document.createElement("small");
    when.textContent = new Date(r.created_at).toLocaleDateString();
    text.append(name, when);
    item.append(text);
    box.append(item);
  });
}

// ---------------- A "manager" = one form + one list ----------------
// cfg says which table to use, which form and list on the page,
// how to sort, and what to show for each row.
function manager(cfg) {
  const form = $(cfg.form);
  const list = $(cfg.list);

  async function reload() {
    const { data, error } = await db.from(cfg.table).select("*").order(cfg.sortBy, { ascending: cfg.ascending });
    if (error) return say(error.message, true);
    list.innerHTML = "";
    if (!data.length) list.textContent = "Nothing here yet.";
    data.forEach((row) => {
      const item = document.createElement("div");
      item.className = "row-item";
      if (row.image_url) {
        const img = document.createElement("img");
        img.src = row.image_url;
        img.alt = "";
        item.append(img);
      }
      const text = document.createElement("span");
      text.textContent = row[cfg.titleField];
      if (cfg.subField && row[cfg.subField]) {
        const sub = document.createElement("small");
        sub.textContent = row[cfg.subField];
        text.append(sub);
      }
      item.append(text, miniButton("Edit", () => fill(row)), miniButton("Delete", () => remove(row), "danger"));
      list.append(item);
    });
  }

  // Put a row into the form so you can change it.
  function fill(row) {
    for (const el of form.elements) {
      if (el.name && el.type !== "file") el.value = row[el.name] ?? "";
    }
    note(row.image_url ? "A picture is already saved. Choose a new one only if you want to replace it." : "");
    form.scrollIntoView({ behavior: "smooth" });
  }

  function note(text) {
    const n = form.querySelector(".help[id$='-note']");
    if (n) n.textContent = text;
  }

  function clear() {
    for (const el of form.elements) {
      if (el.type === "hidden") el.value = "";
    }
    form.reset();
    note("");
  }

  async function remove(row) {
    if (!confirm("Delete \"" + row[cfg.titleField] + "\"? This cannot be undone.")) return;
    const { error } = await db.from(cfg.table).delete().eq("id", row.id);
    if (error) return say(error.message, true);
    say("Deleted.");
    reload();
    loadOverview();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("[type=submit]");
    button.disabled = true;

    // Collect what you typed into one object.
    const row = {};
    for (const el of form.elements) {
      if (!el.name || el.name === "id" || el.type === "file" || el.type === "submit") continue;
      if (el.type === "number") row[el.name] = Number(el.value || 0);
      else if (el.type === "date" && !el.value) continue;
      else row[el.name] = el.value;
    }

    // Upload a new picture if one was chosen.
    const file = form.elements.image && form.elements.image.files[0];
    if (file) {
      const url = await uploadImage(file);
      if (!url) { button.disabled = false; return; }
      row.image_url = url;
    } else if ("image_url" in row && !row.image_url) {
      row.image_url = null;
    }

    const id = form.elements.id.value;
    const { error } = id
      ? await db.from(cfg.table).update(row).eq("id", id)
      : await db.from(cfg.table).insert(row);

    button.disabled = false;
    if (error && error.code === "23505") {
      return say("There is already a Founder or Co-founder saved. Edit or delete that person first.", true);
    }
    if (error) return say("Could not save: " + error.message, true);
    say("Saved! It is now on your website.");
    clear();
    reload();
    loadOverview();
  });

  form.querySelector("[data-clear]").addEventListener("click", clear);
  return { reload };
}

const managers = [
  manager({ table: "projects", form: "project-form", list: "project-list", titleField: "title", sortBy: "sort", ascending: true }),
  manager({ table: "posts", form: "post-form", list: "post-list", titleField: "title", sortBy: "published_at", ascending: false }),
  manager({ table: "team_members", form: "hero-form", list: "hero-list", titleField: "name", subField: "role", sortBy: "sort", ascending: true }),
  manager({ table: "donation_methods", form: "donate-form", list: "donate-list", titleField: "name", sortBy: "sort", ascending: true }),
  manager({ table: "social_links", form: "social-form", list: "social-list", titleField: "name", subField: "url", sortBy: "sort", ascending: true }),
];

// ---------------- Website text and contact details ----------------
// Both of these are "settings" forms: every box is saved as one setting.
async function loadSettings() {
  const { data, error } = await db.from("settings").select("*");
  if (error) return say(error.message, true);
  document.querySelectorAll(".settings-form").forEach((form) => {
    data.forEach((r) => {
      if (form.elements[r.key]) form.elements[r.key].value = r.value;
    });
  });
}

document.querySelectorAll(".settings-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rows = [];
    for (const el of form.elements) {
      if (el.name) rows.push({ key: el.name, value: el.value });
    }
    const { error } = await db.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return say("Could not save: " + error.message, true);
    say("Saved! It is now on your website.");
    loadOverview();
  });
});

// ---------------- Join requests and contact messages ----------------
// Both lists work the same way, only the table and the place on the page differ.
async function loadInbox(table, listId) {
  const list = $(listId);
  const { data, error } = await db.from(table).select("*").order("created_at", { ascending: false });
  if (error) return say(error.message, true);
  list.innerHTML = "";
  if (!data.length) list.textContent = "Nothing here yet.";
  data.forEach((r) => {
    const item = document.createElement("div");
    item.className = "row-item";
    const text = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = r.name + " (" + r.email + ")";
    const msg = document.createElement("small");
    msg.style.whiteSpace = "pre-line";
    msg.textContent = (r.message || "") + "\n" + new Date(r.created_at).toLocaleDateString();
    text.append(name, msg);
    item.append(text, miniButton("Delete", async () => {
      if (!confirm("Delete this one?")) return;
      await db.from(table).delete().eq("id", r.id);
      loadInbox(table, listId);
      loadOverview();
    }, "danger"));
    list.append(item);
  });
}

refresh();
