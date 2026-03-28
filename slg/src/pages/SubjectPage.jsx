import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TYPE_CONFIG = {
  note:  { icon: "📝", color: "#1a7a6e", accent: "#20d9b8", label: "Note" },
  link:  { icon: "🔗", color: "#1a5c7a", accent: "#20b8d9", label: "Link" },
  pdf:   { icon: "📄", color: "#7a3a1a", accent: "#d97020", label: "PDF" },
  image: { icon: "🖼️", color: "#5c1a7a", accent: "#b820d9", label: "Image" },
};

function MaterialCard({ m, baseUrl }) {
  const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.note;
  return (
    <div style={{ ...styles.card, background: cfg.color }}>
      <div style={{ ...styles.cardBar, background: cfg.accent }} />
      <div style={styles.cardHead}>
        <span style={styles.cardIcon}>{cfg.icon}</span>
        <span style={{ ...styles.cardBadge, borderColor: cfg.accent, color: cfg.accent }}>
          {cfg.label}
        </span>
      </div>
      <p style={styles.cardTitle}>{m.title}</p>
      <div style={styles.cardBody}>
        {m.type === "note" && (
          <p style={styles.cardText}>{m.content}</p>
        )}
        {m.type === "link" && (
          <a href={m.content} target="_blank" rel="noreferrer" style={styles.cardLink}>
            🌐 Open Link →
          </a>
        )}
        {m.type === "image" && (
          <img
            src={`${baseUrl}/${m.content}`}
            alt={m.title}
            style={styles.cardImg}
          />
        )}
        {m.type === "pdf" && (
          <a
            href={`${baseUrl}/${m.content}`}
            target="_blank"
            rel="noreferrer"
            style={styles.cardLink}
          >
            📄 View PDF →
          </a>
        )}
      </div>
    </div>
  );
}

function SubjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", type: "note", file: null });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const username = localStorage.getItem("username") || "User";
  const initials = username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/materials/${id}`);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return alert("Enter a title");
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append("subjectId", id);
      formData.append("title", form.title);
      formData.append("type", form.type);
      if (form.type === "note" || form.type === "link") {
        formData.append("content", form.content);
      } else {
        if (!form.file) { setAdding(false); return alert("Please select a file"); }
        formData.append("file", form.file);
      }
      await fetch(`${BASE_URL}/materials`, { method: "POST", body: formData });
      setForm({ title: "", content: "", type: "note", file: null });
      setShowForm(false);
      fetchMaterials();
    } catch (err) {
      console.log(err);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const filtered = filter === "all" ? materials : materials.filter((m) => m.type === filter);
  const counts = { all: materials.length, ...Object.fromEntries(Object.keys(TYPE_CONFIG).map((t) => [t, materials.filter((m) => m.type === t).length])) };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 72 }}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><span style={{ fontSize: 18 }}>🎓</span></div>
          {sidebarOpen && <span style={styles.logoText}>Smart Learning</span>}
        </div>
        <div style={styles.divider} />
        <nav style={styles.nav}>
          {[
            { icon: "⊞", label: "Dashboard", path: "/dashboard" },
            { icon: "📚", label: "Subjects", path: "/subjects" },
            { icon: "🗂", label: "Projects", path: "/projects" },
            { icon: "🏆", label: "Leaderboard", path: "/leaderboard" },
          ].map(({ icon, label, path }) => (
            <button key={label} onClick={() => navigate(path)} style={{ ...styles.navItem, color: "rgba(255,255,255,0.6)" }}>
              <span style={styles.navIcon}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={styles.profileCard}>
          <div style={styles.avatarCircle}><span style={styles.avatarText}>{initials}</span></div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <p style={styles.profileName}>{username}</p>
              <p style={styles.profileRole}>Student</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen((o) => !o)}>☰</button>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <div style={styles.headerSearch}>
            <span>🔍</span>
            <input style={styles.searchInput} placeholder="Search materials..." />
          </div>
          <div style={styles.headerRight}>
            <button style={styles.notifBtn}>🔔</button>
            <div style={styles.avatarSmall}><span style={styles.avatarSmallText}>{initials}</span></div>
          </div>
        </header>

        <div style={styles.body}>
          {/* Page header */}
          <div style={styles.banner}>
            <div>
              <p style={styles.bannerSub}>SUBJECT MATERIALS</p>
              <h1 style={styles.bannerTitle}>📂 Your <span style={styles.bannerAccent}>Materials</span></h1>
              <p style={styles.bannerDesc}>Upload notes, links, PDFs and images for this subject.</p>
            </div>
            <div style={styles.statsRow}>
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} style={styles.statCard}>
                  <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                  <span style={styles.statValue}>{counts[type] || 0}</span>
                  <span style={styles.statLabel}>{cfg.label}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={styles.tabs}>
            {["all", "note", "link", "pdf", "image"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  ...styles.tab,
                  background: filter === t ? "rgba(32,217,184,0.15)" : "transparent",
                  color: filter === t ? "#20d9b8" : "rgba(255,255,255,0.5)",
                  borderBottom: filter === t ? "2px solid #20d9b8" : "2px solid transparent",
                }}
              >
                {t === "all" ? `All (${counts.all})` : `${TYPE_CONFIG[t].icon} ${TYPE_CONFIG[t].label} (${counts[t] || 0})`}
              </button>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <button style={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
                {showForm ? "✕ Cancel" : "+ Add Material"}
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showForm && (
            <div style={styles.formCard}>
              <div style={styles.formBar} />
              <p style={styles.formTitle}>Add New Material</p>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Title</label>
                  <input
                    style={styles.fieldInput}
                    placeholder="Enter material title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Type</label>
                  <select
                    style={styles.fieldInput}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value, content: "", file: null })}
                  >
                    <option value="note">📝 Note</option>
                    <option value="link">🔗 Link</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="image">🖼️ Image</option>
                  </select>
                </div>
              </div>

              {(form.type === "note" || form.type === "link") && (
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>{form.type === "link" ? "URL" : "Content"}</label>
                  <textarea
                    style={{ ...styles.fieldInput, height: 80, resize: "vertical" }}
                    placeholder={form.type === "link" ? "https://..." : "Write your note here..."}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
              )}

              {(form.type === "image" || form.type === "pdf") && (
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Upload File</label>
                  <div style={styles.fileWrap}>
                    <input
                      type="file"
                      accept={form.type === "pdf" ? ".pdf" : "image/*"}
                      style={{ display: "none" }}
                      id="fileInput"
                      onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                    />
                    <label htmlFor="fileInput" style={styles.fileLabel}>
                      {form.file ? `✅ ${form.file.name}` : `📁 Choose ${form.type === "pdf" ? "PDF" : "Image"}`}
                    </label>
                  </div>
                </div>
              )}

              <button style={{ ...styles.addBtn, marginTop: 8 }} onClick={handleAdd} disabled={adding}>
                {adding ? "Adding..." : "✓ Save Material"}
              </button>
            </div>
          )}

          {/* Materials Grid */}
          {loading ? (
            <div style={styles.empty}>Loading materials...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: 48 }}>📭</span>
              <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
                No {filter === "all" ? "" : filter} materials yet.
              </p>
              <button style={{ ...styles.addBtn, marginTop: 16 }} onClick={() => setShowForm(true)}>
                + Add your first material
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((m) => (
                <MaterialCard key={m._id} m={m} baseUrl={BASE_URL} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#0d2137", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff" },

  sidebar: { background: "#0a1e2e", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 16px" },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontWeight: 700, fontSize: 15, color: "#20d9b8", whiteSpace: "nowrap" },
  divider: { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "0 16px 16px" },
  nav: { display: "flex", flexDirection: "column", gap: 4, padding: "0 8px" },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.15s", background: "transparent", textAlign: "left", whiteSpace: "nowrap" },
  navIcon: { fontSize: 16, flexShrink: 0 },
  profileCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", margin: "0 8px", borderRadius: 12, background: "rgba(255,255,255,0.05)", overflow: "hidden" },
  avatarCircle: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(32,217,184,0.4)" },
  avatarText: { fontSize: 14, fontWeight: 700, color: "#fff" },
  profileName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  profileRole: { margin: 0, fontSize: 11, color: "#20d9b8" },

  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", background: "rgba(10,30,46,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 10 },
  menuBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer" },
  backBtn: { background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  headerSearch: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", maxWidth: 420 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, width: "100%" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" },
  notifBtn: { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 16 },
  avatarSmall: { width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(32,217,184,0.5)", cursor: "pointer" },
  avatarSmallText: { fontSize: 13, fontWeight: 700, color: "#fff" },

  body: { padding: "28px 32px", flex: 1 },
  banner: { background: "linear-gradient(135deg,#0d3d30 0%,#0d2137 100%)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 18, padding: "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 },
  bannerSub: { margin: "0 0 6px", fontSize: 11, letterSpacing: 2, color: "#20d9b8", fontWeight: 600 },
  bannerTitle: { margin: "0 0 8px", fontSize: 28, fontWeight: 700 },
  bannerAccent: { color: "#20d9b8" },
  bannerDesc: { margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)" },
  statsRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  statCard: { display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(32,217,184,0.1)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 12, padding: "10px 18px", minWidth: 72, gap: 2 },
  statValue: { fontSize: 20, fontWeight: 700, color: "#20d9b8" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)" },

  tabs: { display: "flex", alignItems: "center", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" },
  tab: { padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", transition: "all 0.15s", whiteSpace: "nowrap" },
  addBtn: { background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" },

  formCard: { background: "#0a1e2e", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 16, padding: "24px", marginBottom: 28, position: "relative", overflow: "hidden" },
  formBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#20d9b8,#1a7a9a)" },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#20d9b8" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  fieldInput: { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" },
  fileWrap: { display: "flex" },
  fileLabel: { background: "rgba(255,255,255,0.07)", border: "1px dashed rgba(32,217,184,0.4)", borderRadius: 10, padding: "11px 20px", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", flex: 1, textAlign: "center" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 },
  card: { borderRadius: 16, padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
  cardBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "16px 16px 0 0" },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardIcon: { fontSize: 28 },
  cardBadge: { fontSize: 11, fontWeight: 600, border: "1px solid", borderRadius: 20, padding: "2px 10px" },
  cardTitle: { margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.4 },
  cardBody: {},
  cardText: { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 },
  cardLink: { fontSize: 13, color: "#20d9b8", fontWeight: 500, textDecoration: "none" },
  cardImg: { width: "100%", borderRadius: 8, maxHeight: 140, objectFit: "cover" },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)", fontSize: 15, textAlign: "center" },
};

export default SubjectPage;