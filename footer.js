// ============================================================
//  FOOTER SOCIAL LINKS (used on every public page)
//  Shows the social links you add in the admin dashboard
//  (Contact tab) inside the footer.
// ============================================================
(function () {
  const box = document.getElementById("footer-social");
  const ready = typeof SUPABASE_URL !== "undefined" && !SUPABASE_URL.startsWith("PASTE") && window.supabase;
  if (!box || !ready) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  client.from("social_links").select("*").order("sort", { ascending: true }).then(({ data }) => {
    (data || []).forEach((link) => {
      if (!/^https?:\/\//i.test(link.url || "")) return; // only normal web links
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = link.name;
      box.append(a);
    });
  });
})();
