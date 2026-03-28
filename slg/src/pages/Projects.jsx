import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

const PROJECT_COLORS = [
  { bg: "#1a2a4a", accent: "#5980f5" },
  { bg: "#2a1a4a", accent: "#9b59f5" },
  { bg: "#1a3a2a", accent: "#42c98a" },
  { bg: "#3a2a1a", accent: "#f5a342" },
  { bg: "#3a1a1a", accent: "#f55959" },
  { bg: "#1a3a3a", accent: "#42c9c9" },
];

const PROJECT_ICONS = ["🗂", "📐", "🧪", "💡", "🛠", "🚀"];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/projects/${userId}`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (!form.title.trim()) return alert("Enter project title");
    setAdding(true);
    try {
      await fetch(`${BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form }),
      });
      setForm({ title: "", description: "" });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.log(err);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (userId) fetchProjects();
    else alert("Please login again");
  }, []);

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes slide-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        @keyframes drop-in {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .proj-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: slide-up 0.4s ease both;
        }
        .proj-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateX(-2px);
        }
        .back-btn { transition: background 0.15s, transform 0.15s; }

        .search-wrap:focus-within {
          border-color: rgba(32,217,184,0.5) !important;
          box-shadow: 0 0 0 3px rgba(32,217,184,0.08);
        }

        .shimmer-card {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 16px;
          height: 160px;
        }

        .new-proj-form {
          animation: drop-in 0.25s ease both;
        }

        .add-btn-main {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .add-btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(32,217,184,0.3) !important;
        }

        .open-tag {
          transition: background 0.15s;
        }
        .open-tag:hover {
          background: rgba(255,255,255,0.08) !important;
        }
      `}</style>

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="back-btn" style={S.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <div>
            <p style={S.headerSub}>SMART LEARNING</p>
            <h1 style={S.headerTitle}>
              Your <span style={S.titleAccent}>Projects</span>
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Search */}
          <div className="search-wrap" style={S.searchWrap}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
            <input
              style={S.searchInput}
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={S.clearBtn}>✕</button>
            )}
          </div>

          {/* New project toggle */}
          <button
            className="add-btn-main"
            style={S.newBtn}
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? "✕ Cancel" : "+ New Project"}
          </button>
        </div>
      </header>

      {/* ── New Project Form ── */}
      {showForm && (
        <div className="new-proj-form" style={S.formCard}>
          <h3 style={S.formTitle}>New Project</h3>
          <div style={S.formRow}>
            <div style={S.formField}>
              <label style={S.formLabel}>Title *</label>
              <input
                style={S.formInput}
                placeholder="e.g. Machine Learning Notes"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                onKeyDown={e => e.key === "Enter" && addProject()}
                autoFocus
              />
            </div>
            <div style={{ ...S.formField, flex: 2 }}>
              <label style={S.formLabel}>Description</label>
              <input
                style={S.formInput}
                placeholder="Short description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                onKeyDown={e => e.key === "Enter" && addProject()}
              />
            </div>
            <button
              style={{ ...S.submitBtn, opacity: adding ? 0.7 : 1 }}
              onClick={addProject}
              disabled={adding}
              className="add-btn-main"
            >
              {adding ? "Adding..." : "Create →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div style={S.statsBar}>
        <div style={S.statPill}>
          <span style={S.statNum}>{projects.length}</span>
          <span style={S.statLabel}>Total Projects</span>
        </div>
        {search && (
          <div style={{ ...S.statPill, borderColor: "rgba(32,217,184,0.3)" }}>
            <span style={S.statNum}>{filtered.length}</span>
            <span style={S.statLabel}>Results for "{search}"</span>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={S.body}>
        {loading ? (
          <div style={S.grid}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <span style={{ fontSize: 56 }}>🗂</span>
            <p style={S.emptyTitle}>
              {search ? `No projects matching "${search}"` : "No projects yet"}
            </p>
            <p style={S.emptyDesc}>
              {search ? "Try a different search term" : "Create your first project to get started"}
            </p>
            {!search && (
              <button style={S.emptyBtn} onClick={() => setShowForm(true)}>
                + Create Project
              </button>
            )}
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map((p, i) => {
              const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
              const icon = PROJECT_ICONS[i % PROJECT_ICONS.length];
              return (
                <div
                  key={p._id}
                  className="proj-card"
                  style={{
                    ...S.card,
                    background: color.bg,
                    animationDelay: `${i * 0.06}s`,
                  }}
                  onClick={() => navigate(`/project/${p._id}`)}
                >
                  {/* Accent bar */}
                  <div style={{ ...S.cardAccent, background: color.accent }} />

                  {/* Index badge */}
                  <div style={{ ...S.indexBadge, color: color.accent, borderColor: `${color.accent}40` }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div style={S.cardIcon}>{icon}</div>

                  {/* Title */}
                  <p style={S.cardTitle}>{p.title}</p>

                  {/* Description */}
                  {p.description && (
                    <p style={S.cardDesc}>{p.description}</p>
                  )}

                  {/* Footer */}
                  <div style={S.cardFooter}>
                    <span
                      className="open-tag"
                      style={{ ...S.openTag, color: color.accent, borderColor: `${color.accent}50` }}
                      onClick={e => { e.stopPropagation(); navigate(`/project/${p._id}`); }}
                    >
                      Open →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#0d2137",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#fff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    padding: "28px 36px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(10,20,35,0.6)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 16px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  headerSub: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#20d9b8",
    fontWeight: 600,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  titleAccent: { color: "#20d9b8" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 16px",
    width: 260,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
  },
  newBtn: {
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    border: "none",
    borderRadius: 12,
    padding: "10px 20px",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 16px rgba(32,217,184,0.2)",
  },

  // Form
  formCard: {
    margin: "0 36px",
    marginTop: 20,
    background: "rgba(10,22,38,0.9)",
    border: "1px solid rgba(32,217,184,0.2)",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  formTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: "#20d9b8",
    marginBottom: 16,
  },
  formRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 180,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  formInput: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    border: "none",
    borderRadius: 10,
    padding: "11px 24px",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    alignSelf: "flex-end",
    boxShadow: "0 4px 16px rgba(32,217,184,0.2)",
  },

  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 36px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(32,217,184,0.08)",
    border: "1px solid rgba(32,217,184,0.15)",
    borderRadius: 20,
    padding: "6px 16px",
  },
  statNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: "#20d9b8",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },

  body: {
    padding: "28px 36px 48px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20,
  },
  card: {
    borderRadius: 16,
    padding: "22px 20px 18px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
  cardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    borderRadius: "16px 16px 0 0",
  },
  indexBadge: {
    position: "absolute",
    top: 14, right: 14,
    fontSize: 11,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    border: "1px solid",
    borderRadius: 6,
    padding: "2px 6px",
    letterSpacing: 1,
  },
  cardIcon: {
    fontSize: 34,
    marginBottom: 12,
    display: "block",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    lineHeight: 1.4,
    marginBottom: 6,
    paddingRight: 28,
  },
  cardDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.5,
    marginBottom: 16,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    marginTop: 14,
  },
  openTag: {
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 20,
    padding: "3px 12px",
    cursor: "pointer",
    letterSpacing: 0.3,
  },

  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    gap: 12,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
  emptyBtn: {
    marginTop: 12,
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    border: "none",
    borderRadius: 10,
    padding: "11px 24px",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default Projects;