import { useEffect, useState } from "react";
import BASE from "../api";  // goes up one folder to src/

// ── helpers ────────────────────────────────────────────────
function generateDays(checkins = []) {
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checked = checkins.some((c) => c.date === dateStr);
    days.push({ date: dateStr, checked, month: d.getMonth(), day: d.getDay() });
  }
  return days;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMonthPositions(days) {
  const seen = new Set();
  const positions = [];
  days.forEach((d, i) => {
    const week = Math.floor(i / 7);
    if (!seen.has(d.month)) {
      seen.add(d.month);
      positions.push({ month: d.month, week });
    }
  });
  return positions;
}

const RANK_STYLES = [
  { bg: "linear-gradient(135deg,#FFD700,#FFA500)", shadow: "#FFD70066", icon: "🥇" },
  { bg: "linear-gradient(135deg,#C0C0C0,#A0A0A0)", shadow: "#C0C0C066", icon: "🥈" },
  { bg: "linear-gradient(135deg,#CD7F32,#A0522D)", shadow: "#CD7F3266", icon: "🥉" },
];

// ── component ──────────────────────────────────────────────
export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [myPoints, setMyPoints] = useState(0);
  const [myName, setMyName] = useState("You");
  const [checkedToday, setCheckedToday] = useState(false);
  const [animFlash, setAnimFlash] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchLeaders = async () => {
    try {
      const res = await fetch(`${BASE}/leaderboard`);
      const data = await res.json();
      setLeaders(data.slice(0, 10));
    } catch (e) { console.error(e); }
  };

  const fetchCheckins = async () => {
    try {
      const res = await fetch(`${BASE}/checkins/${userId}`);
      const data = await res.json();
      setCheckins(data);
      const today = new Date().toISOString().split("T")[0];
      setCheckedToday(data.some((c) => c.date === today));
    } catch (e) { console.error(e); }
  };

  const fetchMyPoints = async () => {
    try {
      const res = await fetch(`${BASE}/user/${userId}`);
      const data = await res.json();
      setMyPoints(data.points ?? 0);
      setMyName(data.name ?? localStorage.getItem("username") ?? "You");
    } catch (e) {
      setMyName(localStorage.getItem("username") ?? "You");
    }
  };

  const handleCheckin = async () => {
    if (checkedToday) return;
    try {
      const res = await fetch(`${BASE}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setAnimFlash(true);
      setTimeout(() => setAnimFlash(false), 800);
      alert(data.message);
      fetchCheckins();
      fetchLeaders();
      fetchMyPoints();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchLeaders();
    fetchCheckins();
    fetchMyPoints();
  }, []);

  const days = generateDays(checkins);
  // pad so week starts on Sunday
  const firstDayOfWeek = new Date(days[0].date).getDay();
  const paddedDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  const monthPositions = getMonthPositions(days);
  const totalCheckins = checkins.length;
  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (checkins.some((c) => c.date === ds)) s++;
      else break;
    }
    return s;
  })();

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a52; border-radius: 3px; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes flash-green {
          0%,100% { background: #0d2137; }
          50%      { background: #0d3d30; }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes count-bounce {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.15); }
        }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important; }
        .cell-hover:hover { transform: scale(1.4); z-index: 10; cursor: pointer; }
      `}</style>

      {/* ── Header ── */}
      <header style={S.header}>
        <div>
          <p style={S.headerSub}>SMART LEARNING</p>
          <h1 style={S.headerTitle}>
            Leaderboard <span style={S.titleAccent}>&amp; Activity</span>
          </h1>
        </div>
        <div style={S.headerBadge}>
          <span style={S.badgeIcon}>⚡</span>
          <div>
            <p style={S.badgePoints}>{myPoints}</p>
            <p style={S.badgeLabel}>your points</p>
          </div>
        </div>
      </header>

      <div style={S.layout}>
        {/* ── LEFT: Heatmap + check-in ── */}
        <div style={{ flex: "1 1 600px", minWidth: 0 }}>

          {/* Stats row */}
          <div style={S.statsRow}>
            {[
              { label: "Total Check-ins", value: totalCheckins, icon: "📅" },
              { label: "Current Streak", value: `${streak}🔥`, icon: "⚡" },
              { label: "Points Earned", value: myPoints, icon: "🏅" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={S.statCard} className="card-hover">
                <span style={S.statIcon}>{icon}</span>
                <span style={{ ...S.statValue, animation: animFlash ? "count-bounce 0.4s ease" : "none" }}>
                  {value}
                </span>
                <span style={S.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Heatmap card */}
          <div style={{ ...S.card, animation: "slide-up 0.5s ease 0.1s both" }}>
            <div style={S.cardHeader}>
              <div>
                <h2 style={S.cardTitle}>Activity Heatmap</h2>
                <p style={S.cardSub}>{totalCheckins} check-ins in the last year</p>
              </div>
              {/* Check-in button */}
              <button
                onClick={handleCheckin}
                disabled={checkedToday}
                style={{
                  ...S.checkinBtn,
                  opacity: checkedToday ? 0.5 : 1,
                  cursor: checkedToday ? "not-allowed" : "pointer",
                  position: "relative",
                  overflow: "visible",
                }}
              >
                {checkedToday ? "✅ Checked In" : "⚡ Check In  +2"}
                {animFlash && (
                  <span style={S.pulseRing} />
                )}
              </button>
            </div>

            {/* Month labels */}
            <div style={S.monthRow}>
              {monthPositions.map(({ month, week }) => (
                <span
                  key={month}
                  style={{ ...S.monthLabel, gridColumnStart: week + 1 }}
                >
                  {MONTH_LABELS[month]}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {week.map((d, di) =>
                    d === null ? (
                      <div key={di} style={{ width: 13, height: 13 }} />
                    ) : (
                      <div
                        key={di}
                        className="cell-hover"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ date: d.date, checked: d.checked, x: rect.left, y: rect.top });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: 3,
                          transition: "transform 0.15s",
                          background: d.checked
                            ? `rgba(32,217,184,${0.4 + (Math.random() * 0.6 | 0) * 0.4})`
                            : "rgba(255,255,255,0.06)",
                          boxShadow: d.checked ? "0 0 4px rgba(32,217,184,0.5)" : "none",
                        }}
                      />
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={S.legend}>
              <span style={S.legendText}>Less</span>
              {[0.08, 0.3, 0.55, 0.75, 1].map((o) => (
                <div
                  key={o}
                  style={{
                    width: 13, height: 13, borderRadius: 3,
                    background: o < 0.15 ? "rgba(255,255,255,0.06)" : `rgba(32,217,184,${o})`,
                  }}
                />
              ))}
              <span style={S.legendText}>More</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Top 10 Leaderboard ── */}
        <div style={{ flex: "0 0 340px", minWidth: 280 }}>
          <div style={{ ...S.card, animation: "slide-up 0.5s ease 0.2s both" }}>
            <div style={S.cardHeader}>
              <div>
                <h2 style={S.cardTitle}>Top 10</h2>
                <p style={S.cardSub}>All-time rankings</p>
              </div>
              <span style={S.trophyBig}>🏆</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {leaders.map((u, i) => {
                const isMe = u._id === userId || u.userId === userId;
                const rs = RANK_STYLES[i] ?? null;
                return (
                  <div
                    key={i}
                    className="card-hover"
                    style={{
                      ...S.leaderRow,
                      background: isMe
                        ? "rgba(32,217,184,0.12)"
                        : i < 3
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.03)",
                      border: isMe
                        ? "1px solid rgba(32,217,184,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* rank badge */}
                    <div
                      style={{
                        ...S.rankBadge,
                        background: rs ? rs.bg : "rgba(255,255,255,0.08)",
                        boxShadow: rs ? `0 0 12px ${rs.shadow}` : "none",
                        color: rs ? "#fff" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {rs ? rs.icon : i + 1}
                    </div>

                    {/* avatar */}
                    <div style={{
                      ...S.avatar,
                      background: isMe
                        ? "linear-gradient(135deg,#20d9b8,#1a7a9a)"
                        : `hsl(${(i * 53) % 360},55%,40%)`,
                    }}>
                      {(u.name ?? "?")[0].toUpperCase()}
                    </div>

                    {/* name + mini heatmap dots */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        ...S.leaderName,
                        color: isMe ? "#20d9b8" : "#fff",
                      }}>
                        {u.name}{isMe && <span style={S.youTag}> you</span>}
                      </p>
                      {/* tiny last-7-day dots */}
                      <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                        {(u.recentDays ?? Array(7).fill(false)).map((active, di) => (
                          <div key={di} style={{
                            width: 7, height: 7, borderRadius: 2,
                            background: active ? "#20d9b8" : "rgba(255,255,255,0.1)",
                          }} />
                        ))}
                      </div>
                    </div>

                    {/* points */}
                    <div style={S.pointsBox}>
                      <span style={S.pointsVal}>{u.points}</span>
                      <span style={S.pointsPts}>pts</span>
                    </div>
                  </div>
                );
              })}

              {leaders.length === 0 && (
                <div style={S.emptyLeader}>
                  No data yet — be the first to check in!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 18,
          top: tooltip.y - 10,
          background: "#0a1e2e",
          border: "1px solid rgba(32,217,184,0.3)",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 12,
          color: "#fff",
          pointerEvents: "none",
          zIndex: 999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          <span style={{ color: "#20d9b8", fontWeight: 600 }}>{tooltip.date}</span>
          <br />
          {tooltip.checked ? "✅ Checked in" : "❌ No check-in"}
        </div>
      )}
    </div>
  );
}

// ── styles ─────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0d2137",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    color: "#fff",
    padding: "28px 32px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#20d9b8",
    fontWeight: 600,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  titleAccent: { color: "#20d9b8" },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgba(32,217,184,0.1)",
    border: "1px solid rgba(32,217,184,0.25)",
    borderRadius: 14,
    padding: "12px 20px",
  },
  badgeIcon: { fontSize: 28 },
  badgePoints: {
    fontSize: 26,
    fontWeight: 700,
    color: "#20d9b8",
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1,
  },
  badgeLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },

  layout: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  statsRow: {
    display: "flex",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 120px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#20d9b8",
    fontFamily: "'JetBrains Mono', monospace",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
  },

  card: {
    background: "rgba(10,20,35,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "22px 24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    marginBottom: 20,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 12,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },

  checkinBtn: {
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  pulseRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 10,
    border: "2px solid #20d9b8",
    animation: "pulse-ring 0.7s ease-out",
    pointerEvents: "none",
  },

  monthRow: {
    display: "grid",
    gridAutoFlow: "column",
    marginBottom: 6,
    marginLeft: 0,
  },
  monthLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "'JetBrains Mono', monospace",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    justifyContent: "flex-end",
  },
  legendText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },

  // leaderboard
  trophyBig: { fontSize: 28 },
  leaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  youTag: {
    fontSize: 10,
    background: "rgba(32,217,184,0.2)",
    color: "#20d9b8",
    borderRadius: 4,
    padding: "1px 5px",
    marginLeft: 4,
    fontWeight: 600,
  },
  pointsBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0,
  },
  pointsVal: {
    fontSize: 15,
    fontWeight: 700,
    color: "#20d9b8",
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1,
  },
  pointsPts: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },
  emptyLeader: {
    textAlign: "center",
    padding: "30px 0",
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
};