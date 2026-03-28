import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

const TYPE_META = {
  link:  { icon: "🔗", label: "Link",  color: "#5980f5", bg: "#1a2a4a" },
  note:  { icon: "📝", label: "Note",  color: "#42c98a", bg: "#1a3a2a" },
  image: { icon: "🖼",  label: "Image", color: "#f5a342", bg: "#3a2a1a" },
  pdf:   { icon: "📄", label: "PDF",   color: "#f55959", bg: "#3a1a1a" },
  doc:   { icon: "📝", label: "Word",  color: "#9b59f5", bg: "#2a1a4a" },
};

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [file, setFile]             = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [filter, setFilter]         = useState("all");
  const [showForm, setShowForm]     = useState(false);

  const [form, setForm] = useState({ name: "", type: "link", content: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/project-items/${id}`);
      const data = await res.json();
      setItems(data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchProject = async () => {
    try {
      const res  = await fetch(`${BASE}/project/${id}`);
      const data = await res.json();
      setProjectName(data.title);
    } catch (err) { console.log(err); }
  };

  const handleAdd = async () => {
    if (!form.name) return alert("Enter a name");
    if (["image","pdf","doc"].includes(form.type) && !file) return alert("Please select a file");
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("projectId", id);
      fd.append("name",      form.name);
      fd.append("type",      form.type);
      if (form.type === "link" || form.type === "note") fd.append("content", form.content);
      if (["image","pdf","doc"].includes(form.type))    fd.append("file",    file);
      await fetch("${BASE}/project-items", { method: "POST", body: fd });
      setForm({ name: "", type: "link", content: "" });
      setFile(null);
      setShowForm(false);
      fetchItems();
    } catch (err) { console.log(err); }
    finally { setAdding(false); }
  };

  const handleDelete = async (itemId) => {
    setDeleteId(itemId);
    try {
      await fetch(`${BASE}/project-items/${itemId}`, { method: "DELETE" });
      fetchItems();
    } catch (err) { console.log(err); }
    finally { setDeleteId(null); }
  };

  useEffect(() => { fetchItems(); fetchProject(); }, []);

  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);
  const counts   = Object.keys(TYPE_META).reduce((acc, t) => {
    acc[t] = items.filter(i => i.type === t).length;
    return acc;
  }, {});

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }

        @keyframes slide-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes drop-in {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-600px 0; }
          100% { background-position: 600px 0; }
        }

        .item-card {
          transition: transform 0.2s, box-shadow 0.2s;
          animation: slide-up 0.35s ease both;
        }
        .item-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(0,0,0,0.4) !important; }

        .back-btn { transition: background 0.15s, transform 0.15s; }
        .back-btn:hover { background: rgba(255,255,255,0.1) !important; transform: translateX(-2px); }

        .filter-pill { transition: background 0.15s, border-color 0.15s, color 0.15s; cursor:pointer; }
        .filter-pill:hover { border-color: rgba(32,217,184,0.4) !important; }

        .add-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(32,217,184,0.3) !important; }

        .del-btn { transition: background 0.15s, transform 0.15s; }
        .del-btn:hover { background: rgba(255,77,77,0.25) !important; transform: scale(1.05); }

        .shimmer-card {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size:600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius:14px; height:160px;
        }

        .new-form { animation: drop-in 0.25s ease both; }

        input[type="file"]::file-selector-button {
          background: rgba(32,217,184,0.15);
          border: 1px solid rgba(32,217,184,0.3);
          border-radius: 8px;
          color: #20d9b8;
          padding: 6px 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          margin-right: 10px;
        }

        select option { background: #0e2235; color: #fff; }
      `}</style>

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button className="back-btn" style={S.backBtn} onClick={() => navigate("/projects")}>
            ← Projects
          </button>
          <div>
            <p style={S.headerSub}>PROJECT MATERIALS</p>
            <h1 style={S.headerTitle}>
              📁 <span style={S.titleAccent}>{projectName || "Loading..."}</span>
            </h1>
          </div>
        </div>
        <button
          className="add-btn"
          style={S.newBtn}
          onClick={() => setShowForm(f => !f)}
        >
          {showForm ? "✕ Cancel" : "+ Add Item"}
        </button>
      </header>

      {/* ── Add Form ── */}
      {showForm && (
        <div className="new-form" style={S.formCard}>
          <h3 style={S.formTitle}>New Item</h3>
          <div style={S.formGrid}>

            {/* Type */}
            <div style={S.formField}>
              <label style={S.formLabel}>Type</label>
              <select
                style={S.formSelect}
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value, content: "" })}
              >
                {Object.entries(TYPE_META).map(([val, { icon, label }]) => (
                  <option key={val} value={val}>{icon} {label}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div style={S.formField}>
              <label style={S.formLabel}>Name *</label>
              <input
                style={S.formInput}
                placeholder="e.g. Project Brief"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Content or File */}
            {(form.type === "link" || form.type === "note") && (
              <div style={{ ...S.formField, flex: 2 }}>
                <label style={S.formLabel}>{form.type === "link" ? "URL" : "Note Content"}</label>
                <input
                  style={S.formInput}
                  placeholder={form.type === "link" ? "https://..." : "Write your note here..."}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />
              </div>
            )}

            {["image","pdf","doc"].includes(form.type) && (
              <div style={S.formField}>
                <label style={S.formLabel}>File</label>
                <input
                  type="file"
                  style={{ ...S.formInput, padding: "8px 12px" }}
                  onChange={e => setFile(e.target.files[0])}
                  accept={
                    form.type === "image" ? "image/*"
                    : form.type === "pdf"  ? ".pdf"
                    : ".doc,.docx"
                  }
                />
              </div>
            )}

            <button
              className="add-btn"
              style={{ ...S.submitBtn, opacity: adding ? 0.7 : 1 }}
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div style={S.filterBar}>
        <span style={S.filterLabel}>Filter:</span>
        {["all", ...Object.keys(TYPE_META)].map(t => {
          const active = filter === t;
          const meta   = TYPE_META[t];
          const count  = t === "all" ? items.length : counts[t];
          if (t !== "all" && count === 0) return null;
          return (
            <button
              key={t}
              className="filter-pill"
              onClick={() => setFilter(t)}
              style={{
                ...S.filterPill,
                background:   active ? "rgba(32,217,184,0.15)" : "rgba(255,255,255,0.04)",
                borderColor:  active ? "#20d9b8"               : "rgba(255,255,255,0.1)",
                color:        active ? "#20d9b8"               : "rgba(255,255,255,0.5)",
              }}
            >
              {meta ? meta.icon + " " : ""}{t === "all" ? "All" : meta.label}
              <span style={{
                ...S.filterCount,
                background: active ? "rgba(32,217,184,0.2)" : "rgba(255,255,255,0.08)",
                color:      active ? "#20d9b8"              : "rgba(255,255,255,0.4)",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Items grid ── */}
      <div style={S.body}>
        {loading ? (
          <div style={S.grid}>
            {Array(6).fill(0).map((_,i) => (
              <div key={i} className="shimmer-card" style={{ animationDelay:`${i*0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <span style={{ fontSize: 52 }}>📭</span>
            <p style={S.emptyTitle}>
              {filter === "all" ? "No items yet" : `No ${TYPE_META[filter]?.label} items`}
            </p>
            <p style={S.emptyDesc}>Click "+ Add Item" above to get started</p>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map((item, i) => {
              const meta = TYPE_META[item.type] ?? TYPE_META.doc;
              return (
                <div
                  key={item._id}
                  className="item-card"
                  style={{
                    ...S.card,
                    background: meta.bg,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {/* Accent bar */}
                  <div style={{ ...S.cardAccent, background: meta.color }} />

                  {/* Type badge */}
                  <div style={{ ...S.typeBadge, color: meta.color, borderColor: `${meta.color}40` }}>
                    {meta.icon} {meta.label}
                  </div>

                  {/* Name */}
                  <p style={S.itemName}>{item.name}</p>

                  {/* Content area */}
                  <div style={S.itemBody}>
                    {item.type === "link" && (
                      <a href={item.content} target="_blank" rel="noreferrer"
                        style={{ ...S.actionLink, color: meta.color }}>
                        🔗 Open Link →
                      </a>
                    )}
                    {item.type === "note" && (
                      <p style={S.noteText}>{item.content}</p>
                    )}
                    {item.type === "image" && (
                      <img
                        src={`${BASE}/${item.file}`}
                        alt={item.name}
                        style={S.previewImg}
                      />
                    )}
                    {item.type === "pdf" && (
                      <a href={`${BASE}/${item.file}`} target="_blank" rel="noreferrer"
                        style={{ ...S.actionLink, color: meta.color }}>
                        📄 View PDF →
                      </a>
                    )}
                    {item.type === "doc" && (
                      <a href={`${BASE}/${item.file}`} target="_blank" rel="noreferrer"
                        style={{ ...S.actionLink, color: meta.color }}>
                        📝 Download File →
                      </a>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    className="del-btn"
                    style={S.delBtn}
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteId === item._id}
                  >
                    {deleteId === item._id ? "Deleting..." : "🗑 Delete"}
                  </button>
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
    padding: "24px 36px 20px",
    background: "rgba(10,20,35,0.7)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
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
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  titleAccent: { color: "#20d9b8" },
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
    boxShadow: "0 4px 16px rgba(32,217,184,0.2)",
    whiteSpace: "nowrap",
  },

  // Form
  formCard: {
    margin: "0 36px",
    marginTop: 20,
    background: "rgba(10,22,38,0.92)",
    border: "1px solid rgba(32,217,184,0.2)",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  formTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#20d9b8",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  formGrid: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 160,
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
  formSelect: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
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

  // Filter
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 36px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginRight: 4,
  },
  filterPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  filterCount: {
    borderRadius: 10,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 600,
  },

  // Grid
  body: { padding: "24px 36px 48px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 18,
  },
  card: {
    borderRadius: 14,
    padding: "20px 18px 16px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
  cardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    borderRadius: "14px 14px 0 0",
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 6,
    padding: "3px 8px",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    lineHeight: 1.4,
    marginBottom: 12,
  },
  itemBody: { marginBottom: 14 },
  actionLink: {
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  noteText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    borderRadius: 8,
    objectFit: "cover",
    maxHeight: 120,
  },
  delBtn: {
    background: "rgba(255,77,77,0.15)",
    border: "1px solid rgba(255,77,77,0.25)",
    borderRadius: 8,
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
  },

  // Empty
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
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
  },
};

export default ProjectDetails;