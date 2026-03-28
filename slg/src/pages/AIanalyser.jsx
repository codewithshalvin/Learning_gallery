import { useState, useEffect } from "react";
import BASE from "../api";  // goes up one folder to src/
const API = BASE;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);

// ── THEME (matches Smart Learning dashboard) ──────────────────────────────────
const T = {
  bg:         "#0d1f2d",
  surface:    "#0f2535",
  surface2:   "#142d3f",
  border:     "#1a3a50",
  borderGlow: "#20d9b8",
  teal:       "#20d9b8",
  tealDim:    "rgba(32,217,184,0.12)",
  tealMid:    "rgba(32,217,184,0.25)",
  text:       "#e8f4f0",
  textMuted:  "#7a9aaa",
  textDim:    "#4a7080",
  high:       { bg:"rgba(239,68,68,0.15)",  border:"#ef4444", text:"#fca5a5", label:"High"   },
  medium:     { bg:"rgba(245,158,11,0.15)", border:"#f59e0b", text:"#fcd34d", label:"Medium" },
  low:        { bg:"rgba(32,217,184,0.15)", border:"#20d9b8", text:"#20d9b8", label:"Low"    },
};

const COLORS = [
  { label:"Teal",   bg:"rgba(32,217,184,0.15)", border:"#20d9b8", text:"#20d9b8" },
  { label:"Blue",   bg:"rgba(56,189,248,0.15)",  border:"#38bdf8", text:"#38bdf8" },
  { label:"Purple", bg:"rgba(167,139,250,0.15)", border:"#a78bfa", text:"#a78bfa" },
  { label:"Rose",   bg:"rgba(251,113,133,0.15)", border:"#fb7185", text:"#fb7185" },
  { label:"Amber",  bg:"rgba(251,191,36,0.15)",  border:"#fbbf24", text:"#fbbf24" },
  { label:"Green",  bg:"rgba(74,222,128,0.15)",  border:"#4ade80", text:"#4ade80" },
];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ type }) {
  const s = T[type] || T.medium;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{s.label}</span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 16, backdropFilter: "blur(4px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: T.surface2, borderRadius: 16,
        border: `1px solid ${T.border}`,
        boxShadow: `0 0 0 1px ${T.border}, 0 24px 64px rgba(0,0,0,0.5)`,
        padding: "24px 28px", width: "100%", maxWidth: 460,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
            fontSize: 16, color: T.textMuted, width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "9px 12px", fontSize: 13,
  border: `1px solid ${T.border}`,
  borderRadius: 8, outline: "none",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  background: T.bg, color: T.text,
  transition: "border-color 0.15s",
};

const btnPrimary = {
  padding: "8px 16px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer",
  border: "none", background: `linear-gradient(135deg, #20d9b8, #1a9a84)`,
  color: "#0d1f2d", whiteSpace: "nowrap", letterSpacing: "0.02em",
  boxShadow: "0 0 12px rgba(32,217,184,0.25)", transition: "all 0.15s",
};

const btnGhost = {
  padding: "7px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer",
  border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.04)",
  color: T.textMuted, whiteSpace: "nowrap", transition: "all 0.15s",
};

// ── BACK BUTTON ───────────────────────────────────────────────────────────────
function BackButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", fontSize: 12, fontWeight: 600,
        borderRadius: 8, cursor: "pointer",
        border: `1px solid ${hovered ? T.teal : T.border}`,
        background: hovered ? T.tealDim : "rgba(255,255,255,0.04)",
        color: hovered ? T.teal : T.textMuted,
        transition: "all 0.2s",
      }}
    >
      {/* Left arrow icon */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back to Dashboard
    </button>
  );
}

// ── TAB BAR ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 2, padding: 4,
      background: T.surface, borderRadius: 12, marginBottom: 28,
      border: `1px solid ${T.border}`,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, padding: "9px 0", fontSize: 13,
          fontWeight: active === t.id ? 700 : 400,
          border: "none", borderRadius: 9, cursor: "pointer", transition: "all 0.2s",
          background: active === t.id
            ? `linear-gradient(135deg, rgba(32,217,184,0.18), rgba(32,217,184,0.08))`
            : "transparent",
          color: active === t.id ? T.teal : T.textMuted,
          boxShadow: active === t.id ? `inset 0 0 0 1px ${T.tealMid}` : "none",
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
function Timetable({ userId }) {
  const [slots, setSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subject: "", day: "Mon", startHour: "8:00", endHour: "9:00", color: 0, room: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    try {
      const r = await fetch(`${API}/timetable/${userId}`);
      const d = await r.json();
      setSlots(Array.isArray(d) ? d : []);
    } catch { setSlots([]); }
  };

  const save = async () => {
    if (!form.subject.trim()) return;
    setLoading(true);
    try {
      const url = editing ? `${API}/timetable/${editing._id}` : `${API}/timetable`;
      await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      await fetchSlots(); setShowModal(false); setEditing(null);
    } finally { setLoading(false); }
  };

  const remove = async (id) => {
    await fetch(`${API}/timetable/${id}`, { method: "DELETE" });
    await fetchSlots();
  };

  const openEdit = (slot) => {
    setEditing(slot);
    setForm({ subject: slot.subject, day: slot.day, startHour: slot.startHour, endHour: slot.endHour, color: slot.color || 0, room: slot.room || "" });
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ subject: "", day: "Mon", startHour: "8:00", endHour: "9:00", color: 0, room: "" });
    setShowModal(true);
  };

  const getSlotStyle = (slot) => {
    const c = COLORS[slot.color || 0];
    const startIdx = HOURS.indexOf(slot.startHour);
    const endIdx   = HOURS.indexOf(slot.endHour);
    return { ...c, span: Math.max(1, endIdx - startIdx) };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Your weekly class timetable</p>
        <button onClick={openNew} style={btnPrimary}>+ Add Class</button>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ background: T.surface2 }}>
              <th style={thS(72)}>Time</th>
              {DAYS.map(d => <th key={d} style={thS()}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour, hIdx) => (
              <tr key={hour} style={{ background: hIdx % 2 === 0 ? T.surface : "rgba(20,45,63,0.5)" }}>
                <td style={{
                  padding: "6px 12px", fontSize: 11, color: T.textDim,
                  borderBottom: `1px solid ${T.border}`, fontWeight: 600,
                  whiteSpace: "nowrap", fontFamily: "monospace",
                }}>{hour}</td>
                {DAYS.map(day => {
                  const slot = slots.find(s => s.day === day && s.startHour === hour);
                  if (!slot) return (
                    <td key={day} style={{ borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`, height: 38 }} />
                  );
                  const { bg, border, text, span } = getSlotStyle(slot);
                  return (
                    <td key={day} rowSpan={span} style={{ borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`, padding: 4, verticalAlign: "top" }}>
                      <div style={{
                        background: bg, borderLeft: `3px solid ${border}`,
                        borderRadius: 6, padding: "5px 7px", height: "100%",
                        cursor: "pointer", position: "relative",
                        boxShadow: `0 0 8px ${border}22`,
                      }} onClick={() => openEdit(slot)}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: text }}>{slot.subject}</div>
                        {slot.room && <div style={{ fontSize: 10, color: text, opacity: 0.7 }}>{slot.room}</div>}
                        <button onClick={e => { e.stopPropagation(); remove(slot._id); }} style={{
                          position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.3)",
                          border: "none", cursor: "pointer", fontSize: 9, color: text,
                          borderRadius: 3, width: 14, height: 14, display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Class" : "Add Class"} onClose={() => setShowModal(false)}>
          <Field label="Subject">
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" style={inputStyle} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Day">
              <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} style={inputStyle}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Room / Location">
              <input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="Room 204" style={inputStyle} />
            </Field>
            <Field label="Start Time">
              <select value={form.startHour} onChange={e => setForm(p => ({ ...p, startHour: e.target.value }))} style={inputStyle}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="End Time">
              <select value={form.endHour} onChange={e => setForm(p => ({ ...p, endHour: e.target.value }))} style={inputStyle}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Color">
            <div style={{ display: "flex", gap: 10 }}>
              {COLORS.map((c, i) => (
                <div key={i} onClick={() => setForm(p => ({ ...p, color: i }))} style={{
                  width: 26, height: 26, borderRadius: "50%", background: c.border,
                  cursor: "pointer", boxShadow: form.color === i ? `0 0 0 2px ${T.bg}, 0 0 0 4px ${c.border}` : "none",
                  transition: "box-shadow 0.15s",
                }} />
              ))}
            </div>
          </Field>
          <button onClick={save} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "11px", fontSize: 13, marginTop: 4 }}>
            {loading ? "Saving…" : "Save Class"}
          </button>
        </Modal>
      )}
    </div>
  );
}

const thS = (w) => ({
  padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted,
  borderBottom: `2px solid ${T.border}`, width: w || "auto",
});

// ── SCHEDULE ──────────────────────────────────────────────────────────────────
function Schedule({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", subject: "", duration: 30, priority: "medium", notes: "" });
  const [filter, setFilter] = useState("upcoming");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const r = await fetch(`${API}/schedule/${userId}`);
      const d = await r.json();
      setTasks(Array.isArray(d) ? d : []);
    } catch { setTasks([]); }
  };

  const save = async () => {
    if (!form.title.trim() || !form.date) return;
    setLoading(true);
    try {
      await fetch(`${API}/schedule`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      await fetchTasks(); setShowModal(false);
      setForm({ title: "", date: "", time: "", subject: "", duration: 30, priority: "medium", notes: "" });
    } finally { setLoading(false); }
  };

  const remove = async (id) => {
    await fetch(`${API}/schedule/${id}`, { method: "DELETE" });
    await fetchTasks();
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = tasks.filter(t => {
    if (filter === "today")    return t.date === today;
    if (filter === "upcoming") return t.date >= today;
    if (filter === "past")     return t.date < today;
    return true;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const grouped = {};
  filtered.forEach(t => { if (!grouped[t.date]) grouped[t.date] = []; grouped[t.date].push(t); });

  const formatDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const filters = ["today","upcoming","past","all"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", fontSize: 12, borderRadius: 8, cursor: "pointer",
              fontWeight: filter === f ? 700 : 400,
              border: `1px solid ${filter === f ? T.teal : T.border}`,
              background: filter === f ? T.tealDim : "transparent",
              color: filter === f ? T.teal : T.textMuted,
              transition: "all 0.15s",
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>+ Add Session</button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 0", color: T.textDim,
          fontSize: 14, background: T.surface, borderRadius: 12,
          border: `1px dashed ${T.border}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗓️</div>
          No sessions scheduled. Click <strong style={{ color: T.teal }}>+ Add Session</strong> to get started.
        </div>
      )}

      {Object.entries(grouped).map(([date, dateTasks]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.teal, letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 24, height: 1, background: T.tealMid, display: "inline-block" }} />
            {formatDate(date)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dateTasks.map(task => (
              <div key={task._id} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "13px 16px",
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 10, position: "relative",
                transition: "border-color 0.15s",
              }}>
                <div style={{
                  minWidth: 50, fontSize: 12, fontWeight: 700,
                  color: T.teal, paddingTop: 2, fontFamily: "monospace",
                }}>{task.time || "—"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{task.title}</span>
                    <Badge type={task.priority} />
                  </div>
                  {task.subject && <div style={{ fontSize: 12, color: T.textMuted }}>{task.subject}</div>}
                  {task.notes   && <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{task.notes}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {task.duration && (
                    <span style={{
                      fontSize: 11, color: T.textMuted, background: T.surface2,
                      border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px",
                    }}>{task.duration}m</span>
                  )}
                  <button onClick={() => remove(task._id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: T.textDim, padding: "2px 4px",
                    transition: "color 0.15s",
                  }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <Modal title="Add Study Session" onClose={() => setShowModal(false)}>
          <Field label="Title">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 5 Review" style={inputStyle} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Time">
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Subject">
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Mathematics" style={inputStyle} />
            </Field>
            <Field label="Duration (min)">
              <input type="number" min="15" step="15" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} style={inputStyle} />
            </Field>
          </div>
          <Field label="Priority">
            <div style={{ display: "flex", gap: 8 }}>
              {["low","medium","high"].map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                  flex: 1, padding: "7px 0", fontSize: 12, borderRadius: 8, cursor: "pointer",
                  fontWeight: form.priority === p ? 700 : 400,
                  border: `1px solid ${form.priority === p ? T[p].border : T.border}`,
                  background: form.priority === p ? T[p].bg : "transparent",
                  color: form.priority === p ? T[p].text : T.textMuted,
                  transition: "all 0.15s",
                }}>{T[p].label}</button>
              ))}
            </div>
          </Field>
          <Field label="Notes (optional)">
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any notes…" style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
          <button onClick={save} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "11px", fontSize: 13, marginTop: 4 }}>
            {loading ? "Saving…" : "Schedule Session"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── CHECKLIST ─────────────────────────────────────────────────────────────────
function Checklist({ userId }) {
  const [lists, setLists] = useState([]);
  const [showListModal, setShowListModal] = useState(false);
  const [activeList, setActiveList] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDue, setNewDue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLists(); }, []);

  const fetchLists = async () => {
    try {
      const r = await fetch(`${API}/checklists/${userId}`);
      const d = await r.json();
      if (Array.isArray(d)) { setLists(d); if (!activeList && d.length > 0) setActiveList(d[0]._id); }
    } catch { setLists([]); }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/checklists`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: newListName }),
      });
      const d = await r.json();
      setLists(p => [...p, { ...d, items: [] }]);
      setActiveList(d._id); setNewListName(""); setShowListModal(false);
    } finally { setLoading(false); }
  };

  const deleteList = async (id) => {
    await fetch(`${API}/checklists/${id}`, { method: "DELETE" });
    const remaining = lists.filter(l => l._id !== id);
    setLists(remaining); setActiveList(remaining[0]?._id || null);
  };

  const addItem = async () => {
    if (!newTask.trim() || !activeList) return;
    const r = await fetch(`${API}/checklist-items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: activeList, text: newTask, priority: newPriority, dueDate: newDue, completed: false }),
    });
    const item = await r.json();
    setLists(p => p.map(l => l._id === activeList ? { ...l, items: [...(l.items||[]), item] } : l));
    setNewTask(""); setNewDue(""); setNewPriority("medium");
  };

  const toggleItem = async (listId, itemId, completed) => {
    await fetch(`${API}/checklist-items/${itemId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    setLists(p => p.map(l => l._id === listId
      ? { ...l, items: l.items.map(i => i._id === itemId ? { ...i, completed: !completed } : i) } : l));
  };

  const removeItem = async (listId, itemId) => {
    await fetch(`${API}/checklist-items/${itemId}`, { method: "DELETE" });
    setLists(p => p.map(l => l._id === listId ? { ...l, items: l.items.filter(i => i._id !== itemId) } : l));
  };

  const current = lists.find(l => l._id === activeList);
  const items = current?.items || [];
  const done = items.filter(i => i.completed).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, minHeight: 400 }}>
      {/* Sidebar */}
      <div>
        <button onClick={() => setShowListModal(true)} style={{ ...btnPrimary, width: "100%", marginBottom: 14, fontSize: 12 }}>+ New List</button>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {lists.map(list => {
            const cnt = (list.items||[]).length;
            const doneCnt = (list.items||[]).filter(i => i.completed).length;
            const isActive = activeList === list._id;
            return (
              <div key={list._id} onClick={() => setActiveList(list._id)} style={{
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: isActive ? T.tealDim : "transparent",
                border: `1px solid ${isActive ? T.tealMid : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: isActive ? T.teal : T.text }}>{list.name}</div>
                  <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{doneCnt}/{cnt} done</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteList(list._id); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: T.textDim, padding: 2,
                }}>✕</button>
              </div>
            );
          })}
          {lists.length === 0 && <div style={{ fontSize: 12, color: T.textDim, padding: "10px 4px" }}>No lists yet</div>}
        </div>
      </div>

      {/* Main */}
      <div>
        {!current ? (
          <div style={{
            textAlign: "center", padding: "60px 0",
            color: T.textDim, fontSize: 14,
            background: T.surface, borderRadius: 12,
            border: `1px dashed ${T.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            Select or create a list to get started
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{
              marginBottom: 20, padding: "16px 18px",
              background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>{current.name}</h3>
                <span style={{ fontSize: 13, color: T.teal, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${T.teal}, #38bdf8)`,
                  borderRadius: 3, transition: "width 0.4s ease",
                  boxShadow: `0 0 8px ${T.teal}66`,
                }} />
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                {done} of {items.length} tasks completed
              </div>
            </div>

            {/* Add item */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()}
                placeholder="Add a task…" style={{ ...inputStyle, flex: "1 1 160px", minWidth: 120 }} />
              <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                style={{ ...inputStyle, width: 140 }} />
              <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ ...inputStyle, width: 110 }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button onClick={addItem} style={btnPrimary}>Add</button>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {items.length === 0 && (
                <div style={{ fontSize: 13, color: T.textDim, padding: "20px 0", textAlign: "center" }}>
                  No tasks yet. Add one above!
                </div>
              )}
              {items.map(item => {
                const overdue = item.dueDate && item.dueDate < new Date().toISOString().split("T")[0] && !item.completed;
                return (
                  <div key={item._id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                    background: item.completed ? "rgba(20,45,63,0.4)" : T.surface,
                    borderRadius: 10, border: `1px solid ${T.border}`,
                    opacity: item.completed ? 0.65 : 1, transition: "all 0.2s",
                  }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <input type="checkbox" checked={item.completed}
                        onChange={() => toggleItem(activeList, item._id, item.completed)}
                        style={{ width: 17, height: 17, accentColor: T.teal, cursor: "pointer" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: T.text, textDecoration: item.completed ? "line-through" : "none" }}>
                        {item.text}
                      </span>
                      {item.dueDate && (
                        <span style={{ marginLeft: 10, fontSize: 11, color: overdue ? "#ef4444" : T.textDim }}>
                          {overdue ? "⚠ " : ""}Due: {item.dueDate}
                        </span>
                      )}
                    </div>
                    <Badge type={item.priority} />
                    <button onClick={() => removeItem(activeList, item._id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, color: T.textDim, padding: "2px 4px",
                    }}>✕</button>
                  </div>
                );
              })}

              {items.length > 0 && done > 0 && (
                <button onClick={async () => {
                  for (const i of items.filter(i => i.completed)) await removeItem(activeList, i._id);
                }} style={{
                  marginTop: 4, fontSize: 12, color: T.textMuted,
                  background: "none", border: `1px dashed ${T.border}`,
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  transition: "border-color 0.15s",
                }}>Clear {done} completed</button>
              )}
            </div>
          </>
        )}
      </div>

      {showListModal && (
        <Modal title="New Checklist" onClose={() => setShowListModal(false)}>
          <Field label="List Name">
            <input value={newListName} onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createList()}
              placeholder="e.g. Exam Prep – Physics" style={inputStyle} autoFocus />
          </Field>
          <button onClick={createList} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "11px", fontSize: 13, marginTop: 4 }}>
            {loading ? "Creating…" : "Create List"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function SmartStudyPlanner() {
  const userId = localStorage.getItem("userId") || "demo-user";
  const [tab, setTab] = useState("timetable");

  const tabs = [
    { id: "timetable", icon: "📅", label: "Timetable" },
    { id: "schedule",  icon: "🗓️",  label: "Schedule"  },
    { id: "checklist", icon: "✅", label: "Checklists" },
  ];

  // ── Back navigation handler ──────────────────────────────────────────────
  // Adjust this to match your router setup:
  //   React Router  →  import { useNavigate } from "react-router-dom"; const navigate = useNavigate(); navigate("/dashboard");
  //   Next.js       →  import { useRouter }   from "next/router";       const router = useRouter();     router.push("/dashboard");
  //   Plain history →  window.history.back() or window.location.href = "/dashboard"
  const handleBack = () => {
    window.history.back();
    // Or replace with: navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: T.text,
    }}>
      {/* Page wrapper */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          {/* Back button row */}
          <div style={{ marginBottom: 16 }}>
            <BackButton onClick={handleBack} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.teal}, #1a9a84)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: `0 0 16px ${T.teal}44`,
            }}>📚</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.teal, textTransform: "uppercase" }}>
                Smart Learning
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.1 }}>
                Study Planner
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0, paddingLeft: 46 }}>
            Organise your timetable, schedule study sessions &amp; track tasks
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.teal}44, transparent)`, marginBottom: 24 }} />

        <TabBar tabs={tabs} active={tab} onChange={setTab} />

        {/* Content card */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
        }}>
          {tab === "timetable" && <Timetable userId={userId} />}
          {tab === "schedule"  && <Schedule  userId={userId} />}
          {tab === "checklist" && <Checklist userId={userId} />}
        </div>
      </div>
    </div>
  );
}