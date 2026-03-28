import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

const SUBJECT_COLORS = [
  { bg: "#1a7a6e", accent: "#20d9b8" },
  { bg: "#1a5c7a", accent: "#20b8d9" },
  { bg: "#5c1a7a", accent: "#b820d9" },
  { bg: "#7a1a3a", accent: "#d92070" },
  { bg: "#1a7a3a", accent: "#20d960" },
  { bg: "#7a5c1a", accent: "#d9b820" },
];

const SUBJECT_ICONS = ["📘", "📗", "📙", "📕", "📓", "📔"];

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/subjects/${userId}`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filtered = subjects.filter(s =>
    s.subjectName.toLowerCase().includes(search.toLowerCase())
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

        .subject-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: slide-up 0.4s ease both;
        }
        .subject-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important;
        }
        .subject-card:active { transform: translateY(-2px) !important; }

        .back-btn {
          transition: background 0.15s, transform 0.15s;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateX(-2px);
        }

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
          height: 140px;
        }
      `}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="back-btn" style={S.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <div>
            <p style={S.headerSub}>SMART LEARNING</p>
            <h1 style={S.headerTitle}>
              All <span style={S.titleAccent}>Subjects</span>
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap" style={S.searchWrap}>
          <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
          <input
            style={S.searchInput}
            placeholder="Search subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={S.clearBtn}>✕</button>
          )}
        </div>
      </header>

      {/* Stats bar */}
      <div style={S.statsBar}>
        <div style={S.statPill}>
          <span style={S.statNum}>{subjects.length}</span>
          <span style={S.statLabel}>Total Subjects</span>
        </div>
        {search && (
          <div style={{ ...S.statPill, borderColor: "rgba(32,217,184,0.3)" }}>
            <span style={S.statNum}>{filtered.length}</span>
            <span style={S.statLabel}>Results for "{search}"</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={S.body}>
        {loading ? (
          // Skeleton
          <div style={S.grid}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <span style={{ fontSize: 56 }}>📭</span>
            <p style={S.emptyTitle}>
              {search ? `No subjects matching "${search}"` : "No subjects yet"}
            </p>
            <p style={S.emptyDesc}>
              {search ? "Try a different search term" : "Add your first subject from the Dashboard"}
            </p>
            {!search && (
              <button style={S.emptyBtn} onClick={() => navigate("/dashboard")}>
                Go to Dashboard →
              </button>
            )}
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map((sub, i) => {
              const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
              const icon = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
              return (
                <div
                  key={sub._id}
                  className="subject-card"
                  style={{
                    ...S.card,
                    background: color.bg,
                    animationDelay: `${i * 0.06}s`,
                  }}
                  onClick={() => navigate(`/subject/${sub._id}`)}
                >
                  {/* Top accent */}
                  <div style={{ ...S.cardAccent, background: color.accent }} />

                  {/* Index badge */}
                  <div style={{ ...S.indexBadge, color: color.accent, borderColor: `${color.accent}40` }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div style={S.cardIcon}>{icon}</div>

                  {/* Name */}
                  <p style={S.cardName}>{sub.subjectName}</p>

                  {/* Footer */}
                  <div style={S.cardFooter}>
                    <span style={{ ...S.openTag, color: color.accent, borderColor: `${color.accent}50` }}>
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
    width: 280,
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
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
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
    marginBottom: 14,
    display: "block",
  },
  cardName: {
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    lineHeight: 1.4,
    marginBottom: 18,
    paddingRight: 28,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
  },
  openTag: {
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 20,
    padding: "3px 12px",
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

export default Subjects;