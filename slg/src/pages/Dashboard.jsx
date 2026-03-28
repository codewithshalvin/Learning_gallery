import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SUBJECT_COLORS = [
  { bg: "#1a7a6e", accent: "#20d9b8" },
  { bg: "#1a5c7a", accent: "#20b8d9" },
  { bg: "#5c1a7a", accent: "#b820d9" },
  { bg: "#7a1a3a", accent: "#d92070" },
  { bg: "#1a7a3a", accent: "#20d960" },
  { bg: "#7a5c1a", accent: "#d9b820" },
];
const SUBJECT_ICONS = ["📘", "📗", "📙", "📕", "📓", "📔"];

const PROJECT_COLORS = [
  { bg: "#2a1a4a", accent: "#9b59f5" },
  { bg: "#1a2a4a", accent: "#5980f5" },
  { bg: "#1a3a2a", accent: "#42c98a" },
  { bg: "#3a2a1a", accent: "#f5a342" },
  { bg: "#3a1a1a", accent: "#f55959" },
  { bg: "#1a3a3a", accent: "#42c9c9" },
];
const PROJECT_ICONS = ["🗂", "📐", "🧪", "💡", "🛠", "🚀"];

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

/* ── Reusable avatar — shows real photo or initials fallback ── */
function AvatarImg({ src, initials, size = 38, border = "2px solid rgba(32,217,184,0.5)", onClick }) {
  const [err, setErr] = useState(false);
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, cursor: onClick ? "pointer" : "default", border, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {src && !err
        ? <img src={src} alt="avatar" onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.32), fontWeight: 700, color: "#fff" }}>
            {initials}
          </div>
      }
    </div>
  );
}

function Dashboard() {
  const [subjects,    setSubjects]    = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [name,        setName]        = useState("");
  const [username,    setUsername]    = useState("User");
  const [avatarUrl,   setAvatarUrl]   = useState("");
  const [points,      setPoints]      = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading,     setLoading]     = useState(false);

  const navigate = useNavigate();
  const userId   = localStorage.getItem("userId");
  const initials = getInitials(username);

  /* fetch user — picks up latest avatar even after profile page changes it */
  const fetchUser = async () => {
    try {
      const res  = await fetch(`http://localhost:5000/user/${userId}`);
      const data = await res.json();
      setUsername(data.name || localStorage.getItem("username") || "User");
      setAvatarUrl(data.avatarUrl || "");
      setPoints(data.points || 0);
      localStorage.setItem("username", data.name);
    } catch (err) {
      setUsername(localStorage.getItem("username") || "User");
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/subjects/${userId}`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const res  = await fetch(`http://localhost:5000/projects/${userId}`);
      const data = await res.json();
      setProjects(data);
    } catch (err) { console.log(err); }
  };

  const addSubject = async () => {
    if (!name.trim()) return alert("Enter subject name");
    try {
      await fetch("http://localhost:5000/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subjectName: name }),
      });
      setName("");
      fetchSubjects();
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (!userId) { alert("Please login again"); return; }
    fetchUser();
    fetchSubjects();
    fetchProjects();
  }, []);

  return (
    <div style={S.root}>
      {/* ── Sidebar ── */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 240 : 72 }}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}><span style={{ fontSize: 18 }}>🎓</span></div>
          {sidebarOpen && <span style={S.logoText}>Smart Learning</span>}
        </div>
        <div style={S.sidebarDivider} />
        <nav style={S.nav}>
          {[
            { icon: "⊞", label: "Dashboard",   active: true           },
            { icon: "📚", label: "Subjects",    path: "/subjects"      },
            { icon: "🗂",  label: "Projects",   path: "/projects"      },
            { icon: "🏆", label: "Leaderboard", path: "/leaderboard"   },
            { icon: "🔬", label: "Custom Scheduler", path: "/analyser" },
            { icon: "👤", label: "Profile",     path: "/profile"       },
            {icon:"⬅️",label:"Logout",path:"/Login"},
          ].map(({ icon, label, active, path }) => (
            <button key={label} onClick={() => path && navigate(path)} style={{ ...S.navItem, background: active ? "rgba(32,217,184,0.13)" : "transparent", color: active ? "#20d9b8" : "rgba(255,255,255,0.6)", borderLeft: active ? "3px solid #20d9b8" : "3px solid transparent" }}>
              <span style={S.navIcon}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />

        {/* Sidebar profile card — shows avatar */}
        <div style={{ ...S.profileCard, cursor: "pointer" }} onClick={() => navigate("/profile")}>
          <AvatarImg src={avatarUrl} initials={initials} size={40} border="2px solid rgba(32,217,184,0.4)" />
          {sidebarOpen && (
            <div style={S.profileInfo}>
              <p style={S.profileName}>{username}</p>
              <p style={S.profileRole}>Student · {points} XP</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={S.main}>
        {/* Top Bar */}
        <header style={S.header}>
          <button style={S.menuBtn} onClick={() => setSidebarOpen((o) => !o)}>☰</button>
          <div style={S.headerSearch}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <input style={S.searchInput} placeholder="Search subjects, notes..." />
          </div>
          <div style={S.headerRight}>
            <button style={S.notifBtn}>🔔</button>
            {/* ✅ Header avatar — live from backend, clicks to profile */}
            <AvatarImg src={avatarUrl} initials={initials} size={38} onClick={() => navigate("/profile")} />
            
          </div>
        </header>

        {/* Body */}
        <div style={S.body}>
          {/* Banner */}
          <div style={S.banner}>
            <div>
              <p style={S.bannerSub}>SMART LEARNING</p>
              <h1 style={S.bannerTitle}>
                Welcome back, <span style={S.bannerAccent}>{username.split(" ")[0]}!</span>
              </h1>
              <p style={S.bannerDesc}>Continue where you left off or add a new subject.</p>
            </div>
            <div style={S.statsRow}>
              {[
                { label: "Subjects", value: subjects.length },
                { label: "Projects", value: projects.length },
                { label: "Points",   value: points          },
              ].map(({ label, value }) => (
                <div key={label} style={S.statCard}>
                  <span style={S.statValue}>{value}</span>
                  <span style={S.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Subject */}
          <div style={S.addRow}>
            <input style={S.addInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="New subject name..." onKeyDown={(e) => e.key === "Enter" && addSubject()} />
            <button style={S.addBtn} onClick={addSubject}>+ Add Subject</button>
          </div>

          {/* Subjects */}
          <div style={S.sectionHeader}>
            <h2 style={S.sectionTitle}>Your Subjects</h2>
            <span style={S.sectionCount}>{subjects.length} total</span>
          </div>
          {loading ? (
            <div style={S.emptyState}>Loading your subjects...</div>
          ) : subjects.length === 0 ? (
            <div style={S.emptyState}>
              <span style={{ fontSize: 48 }}>📚</span>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12 }}>No subjects yet. Add your first one above!</p>
            </div>
          ) : (
            <div style={S.grid}>
              {subjects.map((sub, i) => {
                const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                const icon  = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
                return (
                  <div key={sub._id} style={{ ...S.card, background: color.bg }} onClick={() => navigate(`/subject/${sub._id}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}>
                    <div style={{ ...S.cardBar, background: color.accent }} />
                    <div style={S.cardIcon}>{icon}</div>
                    <p style={S.cardName}>{sub.subjectName}</p>
                    <span style={{ ...S.cardTag, borderColor: color.accent, color: color.accent }}>Open →</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Projects */}
          <div style={{ ...S.sectionHeader, marginTop: 40 }}>
            <h2 style={S.sectionTitle}>Recent Projects</h2>
            <span style={S.sectionCount}>{projects.length} total</span>
          </div>
          {projects.length === 0 ? (
            <div style={S.emptyState}>
              <span style={{ fontSize: 48 }}>🗂</span>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12 }}>No projects yet.</p>
            </div>
          ) : (
            <div style={S.grid}>
              {projects.map((p, i) => {
                const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
                const icon  = PROJECT_ICONS[i % PROJECT_ICONS.length];
                return (
                  <div key={p._id} style={{ ...S.card, background: color.bg }} onClick={() => navigate(`/project/${p._id}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}>
                    <div style={{ ...S.cardBar, background: color.accent }} />
                    <div style={S.cardIcon}>{icon}</div>
                    <p style={S.cardName}>{p.title}</p>
                    <span style={{ ...S.cardTag, borderColor: color.accent, color: color.accent }}>Open →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  root:           { display: "flex", minHeight: "100vh", background: "#0d2137", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff" },
  sidebar:        { background: "#0a1e2e", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  logoRow:        { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 16px" },
  logoIcon:       { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText:       { fontWeight: 700, fontSize: 15, color: "#20d9b8", whiteSpace: "nowrap" },
  sidebarDivider: { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "0 16px 16px" },
  nav:            { display: "flex", flexDirection: "column", gap: 4, padding: "0 8px" },
  navItem:        { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap" },
  navIcon:        { fontSize: 16, flexShrink: 0 },
  profileCard:    { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", margin: "0 8px", borderRadius: 12, background: "rgba(255,255,255,0.05)", overflow: "hidden" },
  profileInfo:    { overflow: "hidden" },
  profileName:    { margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  profileRole:    { margin: 0, fontSize: 11, color: "#20d9b8" },
  main:           { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header:         { display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", background: "rgba(10,30,46,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 10 },
  menuBtn:        { background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", flexShrink: 0 },
  headerSearch:   { flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", maxWidth: 420 },
  searchInput:    { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, width: "100%" },
  headerRight:    { display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" },
  notifBtn:       { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 16 },
  body:           { padding: "28px 32px", flex: 1 },
  banner:         { background: "linear-gradient(135deg,#0d3d30 0%,#0d2137 100%)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 18, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 },
  bannerSub:      { margin: "0 0 6px", fontSize: 11, letterSpacing: 2, color: "#20d9b8", fontWeight: 600 },
  bannerTitle:    { margin: "0 0 8px", fontSize: 28, fontWeight: 700, lineHeight: 1.2 },
  bannerAccent:   { color: "#20d9b8" },
  bannerDesc:     { margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 380 },
  statsRow:       { display: "flex", gap: 16, flexWrap: "wrap" },
  statCard:       { display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(32,217,184,0.1)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 12, padding: "12px 20px", minWidth: 80 },
  statValue:      { fontSize: 24, fontWeight: 700, color: "#20d9b8" },
  statLabel:      { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  addRow:         { display: "flex", gap: 12, marginBottom: 28 },
  addInput:       { flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", maxWidth: 480 },
  addBtn:         { background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" },
  sectionHeader:  { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  sectionTitle:   { margin: 0, fontSize: 18, fontWeight: 600 },
  sectionCount:   { fontSize: 12, background: "rgba(32,217,184,0.15)", color: "#20d9b8", borderRadius: 20, padding: "2px 10px" },
  grid:           { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 },
  card:           { borderRadius: 16, padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
  cardBar:        { position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "16px 16px 0 0" },
  cardIcon:       { fontSize: 32, marginBottom: 12, display: "block" },
  cardName:       { margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.4 },
  cardTag:        { fontSize: 12, fontWeight: 600, border: "1px solid", borderRadius: 20, padding: "3px 10px" },
  emptyState:     { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)", fontSize: 15 },
};

export default Dashboard;