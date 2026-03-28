import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

/* ── helpers ── */
function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}
function AvatarImg({ src, initials, size = 36 }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
      {src && !err
        ? <img src={src} alt="av" onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.3), fontWeight: 700, color: "#fff" }}>{initials}</div>
      }
    </div>
  );
}

const TABS = [
  { id: "overview",    icon: "⊞", label: "Overview"    },
  { id: "users",       icon: "👥", label: "Users"       },
  { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { id: "subjects",    icon: "📚", label: "Subjects"    },
  { id: "projects",    icon: "🗂",  label: "Projects"    },
];

export default function Admin() {
  const navigate  = useNavigate();
  const adminName = localStorage.getItem("username") || "Admin";
  const userId    = localStorage.getItem("userId");

  const [tab,          setTab]          = useState("overview");
  const [users,        setUsers]        = useState([]);
  const [subjects,     setSubjects]     = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  // edit/delete modals
  const [editUser,    setEditUser]    = useState(null);   // {_id, name, email, role, points}
  const [deleteUser,  setDeleteUser]  = useState(null);
  const [editSubject, setEditSubject] = useState(null);
  const [delSubject,  setDelSubject]  = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [delProject,  setDelProject]  = useState(null);
  const [search,      setSearch]      = useState("");

  const showToast = (msg, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3000); };

  /* ── fetch all data ── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, s, p, lb] = await Promise.all([
        fetch("${BASE}/admin/users").then(r => r.json()),
        fetch("${BASE}/admin/subjects").then(r => r.json()),
        fetch("${BASE}/admin/projects").then(r => r.json()),
        fetch("${BASE}/leaderboard").then(r => r.json()),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setSubjects(Array.isArray(s) ? s : []);
      setProjects(Array.isArray(p) ? p : []);
      setLeaderboard(Array.isArray(lb) ? lb : []);
    } catch (e) { showToast("Failed to load data", true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ── user CRUD ── */
  const saveUser = async () => {
    try {
      const res  = await fetch(`${BASE}/admin/users/${editUser._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editUser.name, role: editUser.role, points: Number(editUser.points) }),
      });
      if (res.ok) { showToast("✓ User updated"); setEditUser(null); fetchAll(); }
      else showToast("Failed to update user", true);
    } catch { showToast("Network error", true); }
  };

  const confirmDeleteUser = async () => {
    try {
      const res = await fetch(`${BASE}/admin/users/${deleteUser._id}`, { method: "DELETE" });
      if (res.ok) { showToast("✓ User deleted"); setDeleteUser(null); fetchAll(); }
      else showToast("Failed to delete", true);
    } catch { showToast("Network error", true); }
  };

  /* ── subject CRUD ── */
  const saveSubject = async () => {
    try {
      const res = await fetch(`${BASE}/admin/subjects/${editSubject._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: editSubject.subjectName }),
      });
      if (res.ok) { showToast("✓ Subject updated"); setEditSubject(null); fetchAll(); }
      else showToast("Failed", true);
    } catch { showToast("Network error", true); }
  };

  const confirmDelSubject = async () => {
    try {
      const res = await fetch(`${BASE}/admin/subjects/${delSubject._id}`, { method: "DELETE" });
      if (res.ok) { showToast("✓ Subject deleted"); setDelSubject(null); fetchAll(); }
      else showToast("Failed", true);
    } catch { showToast("Network error", true); }
  };

  /* ── project CRUD ── */
  const saveProject = async () => {
    try {
      const res = await fetch(`${BASE}/admin/projects/${editProject._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editProject.title, description: editProject.description }),
      });
      if (res.ok) { showToast("✓ Project updated"); setEditProject(null); fetchAll(); }
      else showToast("Failed", true);
    } catch { showToast("Network error", true); }
  };

  const confirmDelProject = async () => {
    try {
      const res = await fetch(`${BASE}/admin/projects/${delProject._id}`, { method: "DELETE" });
      if (res.ok) { showToast("✓ Project deleted"); setDelProject(null); fetchAll(); }
      else showToast("Failed", true);
    } catch { showToast("Network error", true); }
  };

  /* ── filtered lists ── */
  const q          = search.toLowerCase();
  const filtUsers  = users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  const filtSubs   = subjects.filter(s => s.subjectName?.toLowerCase().includes(q));
  const filtProjs  = projects.filter(p => p.title?.toLowerCase().includes(q));

  /* ── stats ── */
  const totalXP    = users.reduce((a, u) => a + (u.points || 0), 0);
  const adminCount = users.filter(u => u.role === "admin").length;

  const RANK_ICON = ["🥇","🥈","🥉"];

  /* ── render tab content ── */
  const renderContent = () => {
    if (loading) return <div style={S.center}><div style={S.spinner}/><p style={{ color:"#20d9b8",marginTop:16 }}>Loading...</p></div>;

    if (tab === "overview") return (
      <div>
        <p style={S.sectionSub}>OVERVIEW</p>
        <h2 style={S.sectionTitle}>Platform <span style={{ color:"#20d9b8" }}>Summary</span></h2>
        <div style={S.statsGrid}>
          {[
            { icon:"👥", label:"Total Users",    value: users.length,    color:"#20d9b8" },
            { icon:"📚", label:"Total Subjects",  value: subjects.length, color:"#20b8d9" },
            { icon:"🗂",  label:"Total Projects",  value: projects.length, color:"#9b59f5" },
            { icon:"⚡", label:"Total XP Earned", value: totalXP,         color:"#d9b820" },
            { icon:"🛡️", label:"Admins",          value: adminCount,      color:"#d92070" },
            { icon:"🎓", label:"Students",        value: users.length - adminCount, color:"#20d960" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={S.statCard}>
              <span style={{ fontSize: 28 }}>{icon}</span>
              <div style={{ ...S.statVal, color }}>{value}</div>
              <div style={S.statLbl}>{label}</div>
            </div>
          ))}
        </div>

        <h3 style={{ ...S.sectionTitle, fontSize: 16, marginTop: 32 }}>🕐 Recent Users</h3>
        <div style={S.table}>
          <div style={S.thead}>
            <span style={{ flex: 2 }}>Name</span>
            <span style={{ flex: 2 }}>Email</span>
            <span style={{ flex: 1 }}>Role</span>
            <span style={{ flex: 1 }}>Points</span>
          </div>
          {users.slice(0, 5).map(u => (
            <div key={u._id} style={S.trow}>
              <span style={{ flex: 2, display:"flex", alignItems:"center", gap:10 }}>
                <AvatarImg src={u.avatarUrl} initials={getInitials(u.name)} size={28}/>
                {u.name}
              </span>
              <span style={{ flex: 2, color:"rgba(255,255,255,0.5)", fontSize:13 }}>{u.email}</span>
              <span style={{ flex: 1 }}><span style={{ ...S.roleBadge, background: u.role==="admin"?"rgba(217,32,112,0.15)":"rgba(32,217,184,0.1)", color: u.role==="admin"?"#d92070":"#20d9b8", borderColor: u.role==="admin"?"rgba(217,32,112,0.3)":"rgba(32,217,184,0.25)" }}>{u.role}</span></span>
              <span style={{ flex: 1, color:"#20d9b8", fontWeight:700 }}>{u.points ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (tab === "users") return (
      <div>
        <p style={S.sectionSub}>MANAGE</p>
        <h2 style={S.sectionTitle}>All <span style={{ color:"#20d9b8" }}>Users</span></h2>
        <div style={S.table}>
          <div style={S.thead}>
            <span style={{ flex: 2 }}>Name</span>
            <span style={{ flex: 2 }}>Email</span>
            <span style={{ flex: 1 }}>Role</span>
            <span style={{ flex: 1 }}>Points</span>
            <span style={{ flex: 1 }}>Actions</span>
          </div>
          {filtUsers.length === 0 && <div style={S.empty}>No users found</div>}
          {filtUsers.map(u => (
            <div key={u._id} style={S.trow}>
              <span style={{ flex: 2, display:"flex", alignItems:"center", gap:10 }}>
                <AvatarImg src={u.avatarUrl} initials={getInitials(u.name)} size={30}/>
                <span>{u.name}</span>
              </span>
              <span style={{ flex: 2, color:"rgba(255,255,255,0.5)", fontSize:13 }}>{u.email}</span>
              <span style={{ flex: 1 }}><span style={{ ...S.roleBadge, background: u.role==="admin"?"rgba(217,32,112,0.15)":"rgba(32,217,184,0.1)", color: u.role==="admin"?"#d92070":"#20d9b8", borderColor: u.role==="admin"?"rgba(217,32,112,0.3)":"rgba(32,217,184,0.25)" }}>{u.role}</span></span>
              <span style={{ flex: 1, color:"#20d9b8", fontWeight:700 }}>{u.points ?? 0}</span>
              <span style={{ flex: 1, display:"flex", gap:6 }}>
                <button style={S.editBtn} onClick={() => setEditUser({ ...u })}>✏️</button>
                <button style={S.delBtn}  onClick={() => setDeleteUser(u)}>🗑</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    if (tab === "leaderboard") return (
      <div>
        <p style={S.sectionSub}>RANKINGS</p>
        <h2 style={S.sectionTitle}>Top <span style={{ color:"#20d9b8" }}>Leaderboard</span></h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:20 }}>
          {leaderboard.map((u, i) => (
            <div key={u._id} style={{ ...S.lbRow, background: i===0?"rgba(255,215,0,0.07)":i===1?"rgba(192,192,192,0.05)":i===2?"rgba(205,127,50,0.05)":"rgba(255,255,255,0.03)" }}>
              <div style={{ ...S.lbRank, color: i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:"rgba(255,255,255,0.3)", borderColor: i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:"rgba(255,255,255,0.1)" }}>
                {i < 3 ? RANK_ICON[i] : i + 1}
              </div>
              <AvatarImg src={u.avatarUrl} initials={getInitials(u.name)} size={38}/>
              <div style={{ flex: 1 }}>
                <p style={{ margin:0, fontWeight:700, fontSize:14 }}>{u.name}</p>
                <div style={{ display:"flex", gap:3, marginTop:4 }}>
                  {(u.recentDays ?? Array(7).fill(false)).map((d, di) => (
                    <div key={di} style={{ width:8, height:8, borderRadius:2, background: d?"#20d9b8":"rgba(255,255,255,0.1)" }}/>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, fontSize:20, fontWeight:700, color:"#20d9b8" }}>{u.points}</p>
                <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)" }}>pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (tab === "subjects") return (
      <div>
        <p style={S.sectionSub}>MANAGE</p>
        <h2 style={S.sectionTitle}>All <span style={{ color:"#20d9b8" }}>Subjects</span></h2>
        <div style={S.table}>
          <div style={S.thead}>
            <span style={{ flex: 3 }}>Subject Name</span>
            <span style={{ flex: 2 }}>Owner</span>
            <span style={{ flex: 1 }}>Actions</span>
          </div>
          {filtSubs.length === 0 && <div style={S.empty}>No subjects found</div>}
          {filtSubs.map(s => {
            const owner = users.find(u => u._id === s.userId);
            return (
              <div key={s._id} style={S.trow}>
                <span style={{ flex: 3, fontWeight:600 }}>📚 {s.subjectName}</span>
                <span style={{ flex: 2, color:"rgba(255,255,255,0.5)", fontSize:13 }}>{owner?.name ?? "Unknown"}</span>
                <span style={{ flex: 1, display:"flex", gap:6 }}>
                  <button style={S.editBtn} onClick={() => setEditSubject({ ...s })}>✏️</button>
                  <button style={S.delBtn}  onClick={() => setDelSubject(s)}>🗑</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );

    if (tab === "projects") return (
      <div>
        <p style={S.sectionSub}>MANAGE</p>
        <h2 style={S.sectionTitle}>All <span style={{ color:"#20d9b8" }}>Projects</span></h2>
        <div style={S.table}>
          <div style={S.thead}>
            <span style={{ flex: 3 }}>Title</span>
            <span style={{ flex: 2 }}>Owner</span>
            <span style={{ flex: 2 }}>Description</span>
            <span style={{ flex: 1 }}>Actions</span>
          </div>
          {filtProjs.length === 0 && <div style={S.empty}>No projects found</div>}
          {filtProjs.map(p => {
            const owner = users.find(u => u._id === p.userId);
            return (
              <div key={p._id} style={S.trow}>
                <span style={{ flex: 3, fontWeight:600 }}>🗂 {p.title}</span>
                <span style={{ flex: 2, color:"rgba(255,255,255,0.5)", fontSize:13 }}>{owner?.name ?? "Unknown"}</span>
                <span style={{ flex: 2, color:"rgba(255,255,255,0.4)", fontSize:12 }}>{p.description || "—"}</span>
                <span style={{ flex: 1, display:"flex", gap:6 }}>
                  <button style={S.editBtn} onClick={() => setEditProject({ ...p })}>✏️</button>
                  <button style={S.delBtn}  onClick={() => setDelProject(p)}>🗑</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .action-btn:hover { opacity: 0.8; transform: scale(1.05); }
        input:focus, select:focus, textarea:focus { border-color: rgba(32,217,184,0.5) !important; outline:none; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 240 : 72 }}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}><span style={{ fontSize:18 }}>🛡️</span></div>
          {sidebarOpen && <span style={S.logoText}>Admin Panel</span>}
        </div>
        <div style={S.divider}/>
        <nav style={{ display:"flex", flexDirection:"column", gap:4, padding:"0 8px" }}>
          {TABS.map(({ id, icon, label }) => (
            <button key={id} className="nav-btn" onClick={() => setTab(id)} style={{ ...S.navItem, background: tab===id?"rgba(32,217,184,0.13)":"transparent", color: tab===id?"#20d9b8":"rgba(255,255,255,0.6)", borderLeft: tab===id?"3px solid #20d9b8":"3px solid transparent" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ flex:1 }}/>
        {/* Logout */}
        <button onClick={handleLogout} style={{ ...S.logoutBtn, margin: sidebarOpen?"0 8px 8px":"0 8px 8px", justifyContent: sidebarOpen?"flex-start":"center" }}>
          <span style={{ fontSize:16 }}>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
        <div style={{ ...S.profileCard }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#d92070,#8b1040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
            {getInitials(adminName)}
          </div>
          {sidebarOpen && (
            <div style={{ overflow:"hidden" }}>
              <p style={{ margin:0,fontSize:13,fontWeight:600,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{adminName}</p>
              <p style={{ margin:0,fontSize:11,color:"#d92070" }}>Administrator</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={S.main}>
        {/* Header */}
        <header style={S.header}>
          <button style={{ background:"transparent",border:"none",color:"rgba(255,255,255,0.6)",fontSize:20,cursor:"pointer" }} onClick={() => setSidebarOpen(o=>!o)}>☰</button>
          <div style={{ flex:1,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"8px 14px",maxWidth:400 }}>
            <span style={{ fontSize:14,opacity:0.5 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users, subjects, projects..." style={{ background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:14,width:"100%",fontFamily:"'DM Sans',sans-serif" }}/>
            {search && <button onClick={()=>setSearch("")} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:12 }}>✕</button>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginLeft:"auto" }}>
            <div style={{ background:"rgba(217,32,112,0.15)",border:"1px solid rgba(217,32,112,0.3)",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700,color:"#d92070" }}>🛡️ ADMIN</div>
            <button onClick={handleLogout} style={{ background:"rgba(217,32,112,0.1)",border:"1px solid rgba(217,32,112,0.25)",borderRadius:10,padding:"8px 16px",color:"#d92070",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
              Logout 🚪
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:"28px 32px",flex:1,animation:"slide-up 0.4s ease" }}>
          {renderContent()}
        </div>
      </div>

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setEditUser(null)}>
          <div style={S.modal}>
            <div style={S.modalHeader}><span style={S.modalTitle}>✏️ Edit User</span><button style={S.closeBtn} onClick={()=>setEditUser(null)}>✕</button></div>
            <div style={S.modalBody}>
              {[["Name","name","text"],["Points","points","number"]].map(([label,field,type])=>(
                <div key={field} style={S.formGroup}>
                  <label style={S.formLabel}>{label}</label>
                  <input type={type} value={editUser[field]||""} onChange={e=>setEditUser({...editUser,[field]:e.target.value})} style={S.formInput}/>
                </div>
              ))}
              <div style={S.formGroup}>
                <label style={S.formLabel}>Role</label>
                <select value={editUser.role||"user"} onChange={e=>setEditUser({...editUser,role:e.target.value})} style={S.formInput}>
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setEditUser(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={saveUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirm ── */}
      {deleteUser && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setDeleteUser(null)}>
          <div style={{ ...S.modal, maxWidth:400 }}>
            <div style={S.modalHeader}><span style={S.modalTitle}>🗑 Delete User</span><button style={S.closeBtn} onClick={()=>setDeleteUser(null)}>✕</button></div>
            <div style={S.modalBody}>
              <p style={{ color:"rgba(255,255,255,0.7)",lineHeight:1.6 }}>Are you sure you want to delete <strong style={{ color:"#fff" }}>{deleteUser.name}</strong>? This cannot be undone.</p>
            </div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setDeleteUser(null)}>Cancel</button>
              <button style={{ ...S.saveBtn, background:"linear-gradient(135deg,#d92070,#8b1040)" }} onClick={confirmDeleteUser}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Subject Modal ── */}
      {editSubject && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setEditSubject(null)}>
          <div style={{ ...S.modal, maxWidth:420 }}>
            <div style={S.modalHeader}><span style={S.modalTitle}>✏️ Edit Subject</span><button style={S.closeBtn} onClick={()=>setEditSubject(null)}>✕</button></div>
            <div style={S.modalBody}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Subject Name</label>
                <input value={editSubject.subjectName||""} onChange={e=>setEditSubject({...editSubject,subjectName:e.target.value})} style={S.formInput}/>
              </div>
            </div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setEditSubject(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={saveSubject}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Subject Confirm ── */}
      {delSubject && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setDelSubject(null)}>
          <div style={{ ...S.modal, maxWidth:400 }}>
            <div style={S.modalHeader}><span style={S.modalTitle}>🗑 Delete Subject</span><button style={S.closeBtn} onClick={()=>setDelSubject(null)}>✕</button></div>
            <div style={S.modalBody}><p style={{ color:"rgba(255,255,255,0.7)",lineHeight:1.6 }}>Delete <strong style={{ color:"#fff" }}>{delSubject.subjectName}</strong>? All materials inside will also be removed.</p></div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setDelSubject(null)}>Cancel</button>
              <button style={{ ...S.saveBtn, background:"linear-gradient(135deg,#d92070,#8b1040)" }} onClick={confirmDelSubject}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Project Modal ── */}
      {editProject && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setEditProject(null)}>
          <div style={{ ...S.modal, maxWidth:440 }}>
            <div style={S.modalHeader}><span style={S.modalTitle}>✏️ Edit Project</span><button style={S.closeBtn} onClick={()=>setEditProject(null)}>✕</button></div>
            <div style={S.modalBody}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Title</label>
                <input value={editProject.title||""} onChange={e=>setEditProject({...editProject,title:e.target.value})} style={S.formInput}/>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Description</label>
                <textarea value={editProject.description||""} onChange={e=>setEditProject({...editProject,description:e.target.value})} rows={3} style={{ ...S.formInput, resize:"vertical" }}/>
              </div>
            </div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setEditProject(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={saveProject}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Project Confirm ── */}
      {delProject && (
        <div style={S.overlay} onClick={e => e.target===e.currentTarget&&setDelProject(null)}>
          <div style={{ ...S.modal, maxWidth:400 }}>
            <div style={S.modalHeader}><span style={S.modalTitle}>🗑 Delete Project</span><button style={S.closeBtn} onClick={()=>setDelProject(null)}>✕</button></div>
            <div style={S.modalBody}><p style={{ color:"rgba(255,255,255,0.7)",lineHeight:1.6 }}>Delete <strong style={{ color:"#fff" }}>{delProject.title}</strong>? This cannot be undone.</p></div>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={()=>setDelProject(null)}>Cancel</button>
              <button style={{ ...S.saveBtn, background:"linear-gradient(135deg,#d92070,#8b1040)" }} onClick={confirmDelProject}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, borderColor: toast.err?"#d92070":"#20d9b8" }}>
          <span>{toast.err?"⚠️":"✓"}</span>
          <span style={{ fontSize:14,fontWeight:700,color:"#fff" }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

const S = {
  root:        { display:"flex", minHeight:"100vh", background:"#0d2137", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#fff" },
  sidebar:     { background:"#0a1e2e", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", padding:"20px 0", transition:"width 0.25s ease", overflow:"hidden", flexShrink:0, position:"sticky", top:0, height:"100vh" },
  logoRow:     { display:"flex", alignItems:"center", gap:10, padding:"0 16px 16px" },
  logoIcon:    { width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#d92070,#8b1040)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  logoText:    { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#d92070", whiteSpace:"nowrap" },
  divider:     { height:"0.5px", background:"rgba(255,255,255,0.07)", margin:"0 16px 16px" },
  navItem:     { display:"flex", alignItems:"center", gap:12, padding:"10px 12px", border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:500, transition:"all 0.15s", textAlign:"left", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" },
  logoutBtn:   { display:"flex", alignItems:"center", gap:12, padding:"10px 12px", border:"1px solid rgba(217,32,112,0.2)", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:600, color:"#d92070", background:"rgba(217,32,112,0.08)", fontFamily:"'DM Sans',sans-serif", marginBottom:8 },
  profileCard: { display:"flex", alignItems:"center", gap:10, padding:"12px 16px", margin:"0 8px 8px", borderRadius:12, background:"rgba(255,255,255,0.05)", overflow:"hidden" },
  main:        { flex:1, display:"flex", flexDirection:"column", overflow:"auto" },
  header:      { display:"flex", alignItems:"center", gap:14, padding:"14px 28px", background:"rgba(10,30,46,0.9)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,255,255,0.07)", position:"sticky", top:0, zIndex:10 },

  sectionSub:  { fontSize:11, letterSpacing:3, color:"#20d9b8", fontWeight:600, marginBottom:6 },
  sectionTitle:{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, marginBottom:24 },

  statsGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16 },
  statCard:    { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, textAlign:"center" },
  statVal:     { fontSize:28, fontWeight:700, fontFamily:"'Syne',sans-serif" },
  statLbl:     { fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 },

  table:       { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" },
  thead:       { display:"flex", padding:"12px 16px", background:"rgba(255,255,255,0.05)", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", gap:8 },
  trow:        { display:"flex", alignItems:"center", padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:13, gap:8, transition:"background 0.15s" },
  empty:       { padding:"32px 20px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 },

  roleBadge:   { fontSize:11, fontWeight:700, border:"1px solid", borderRadius:20, padding:"2px 10px", letterSpacing:0.5 },

  lbRow:       { display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)" },
  lbRank:      { width:36, height:36, borderRadius:10, border:"2px solid", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, flexShrink:0 },

  editBtn:     { background:"rgba(32,217,184,0.12)", border:"1px solid rgba(32,217,184,0.25)", borderRadius:8, padding:"5px 10px", color:"#20d9b8", cursor:"pointer", fontSize:13, transition:"all 0.15s" },
  delBtn:      { background:"rgba(217,32,112,0.1)",  border:"1px solid rgba(217,32,112,0.25)", borderRadius:8, padding:"5px 10px", color:"#d92070", cursor:"pointer", fontSize:13, transition:"all 0.15s" },

  center:      { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh" },
  spinner:     { width:36, height:36, border:"3px solid rgba(32,217,184,0.2)", borderTopColor:"#20d9b8", borderRadius:"50%", animation:"spin 0.8s linear infinite" },

  overlay:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal:       { width:"min(520px,100%)", background:"#0a1e2e", borderRadius:18, border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)", overflow:"hidden" },
  modalHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  modalTitle:  { fontSize:15, fontWeight:700, color:"#fff" },
  closeBtn:    { background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.6)", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, fontWeight:700 },
  modalBody:   { padding:"20px", display:"flex", flexDirection:"column", gap:14 },
  modalFooter: { display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.07)" },

  formGroup:   { display:"flex", flexDirection:"column", gap:6 },
  formLabel:   { fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:"0.06em", textTransform:"uppercase" },
  formInput:   { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s" },

  cancelBtn:   { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 20px", color:"rgba(255,255,255,0.6)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  saveBtn:     { background:"linear-gradient(135deg,#20d9b8,#1a7a9a)", border:"none", borderRadius:10, padding:"9px 24px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },

  toast:       { position:"fixed", bottom:28, right:28, background:"#0a1e2e", border:"2px solid", borderRadius:14, padding:"12px 20px", display:"flex", alignItems:"center", gap:10, zIndex:999, minWidth:220, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" },
};