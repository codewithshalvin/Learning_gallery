import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

/* ─── helpers ─── */
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}
function getLevelInfo(points) {
  const levels = [
    { min: 0,    max: 49,   level: 1, title: "Novice",   color: "#94a3b8" },
    { min: 50,   max: 149,  level: 2, title: "Learner",  color: "#20d9b8" },
    { min: 150,  max: 299,  level: 3, title: "Scholar",  color: "#b820d9" },
    { min: 300,  max: 499,  level: 4, title: "Expert",   color: "#20d960" },
    { min: 500,  max: 999,  level: 5, title: "Master",   color: "#d9b820" },
    { min: 1000, max: 9999, level: 6, title: "Champion", color: "#d92070" },
  ];
  const info = levels.find((l) => points >= l.min && points <= l.max) || levels[levels.length - 1];
  const pct  = Math.min(100, Math.round(((points - info.min) / (info.max - info.min)) * 100));
  return { ...info, pct };
}
function buildHeatmap(checkins) {
  const today = new Date();
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (89 - i));
    const ds = d.toISOString().split("T")[0];
    return { date: ds, active: checkins.some((c) => c.date === ds) };
  });
}
function calcStreak(checkins) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (checkins.some((c) => c.date === d.toISOString().split("T")[0])) streak++;
    else break;
  }
  return streak;
}
function getBadges(points, streak, checkins) {
  return [
    { label: "First Step",   icon: "⭐", cond: checkins.length >= 1, color: "#20d9b8", desc: "First check-in"  },
    { label: "3-Day Streak", icon: "🔥", cond: streak >= 3,          color: "#d9b820", desc: "3 days in a row" },
    { label: "7-Day Streak", icon: "🔥", cond: streak >= 7,          color: "#d92070", desc: "Week warrior"    },
    { label: "50 Points",    icon: "⚡", cond: points >= 50,         color: "#b820d9", desc: "Power learner"   },
    { label: "100 Points",   icon: "🏆", cond: points >= 100,        color: "#20b8d9", desc: "Century club"    },
    { label: "Scholar",      icon: "🎓", cond: points >= 150,        color: "#20d960", desc: "True scholar"    },
  ];
}

/* ─────────────────────────────────────────────
   PRESET BITMOJI AVATARS
   Each returns an SVG data URL
───────────────────────────────────────────── */
const PRESET_BITMOJIS = [
  {
    id: "nerd",
    label: "Nerd",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#1e3a5f"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- hair -->
      <ellipse cx="60" cy="28" rx="26" ry="12" fill="#3d2314"/>
      <rect x="34" y="28" width="52" height="10" fill="#3d2314"/>
      <!-- glasses frames -->
      <rect x="38" y="48" width="16" height="11" rx="4" fill="none" stroke="#1a1a2e" stroke-width="2.5"/>
      <rect x="66" y="48" width="16" height="11" rx="4" fill="none" stroke="#1a1a2e" stroke-width="2.5"/>
      <line x1="54" y1="53" x2="66" y2="53" stroke="#1a1a2e" stroke-width="2.5"/>
      <!-- lenses -->
      <rect x="39" y="49" width="14" height="9" rx="3" fill="rgba(180,220,255,0.35)"/>
      <rect x="67" y="49" width="14" height="9" rx="3" fill="rgba(180,220,255,0.35)"/>
      <!-- eyes -->
      <circle cx="46" cy="54" r="2.5" fill="#1a1a2e"/>
      <circle cx="74" cy="54" r="2.5" fill="#1a1a2e"/>
      <!-- smile -->
      <path d="M52 65 Q60 72 68 65" stroke="#c87952" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- body -->
      <ellipse cx="60" cy="98" rx="28" ry="18" fill="#2060c8"/>
      <!-- bow tie -->
      <polygon points="56,80 60,83 56,86" fill="#d92070"/>
      <polygon points="64,80 60,83 64,86" fill="#d92070"/>
      <circle cx="60" cy="83" r="2" fill="#a01050"/>
      <!-- book -->
      <rect x="72" y="82" width="14" height="18" rx="2" fill="#20d9b8"/>
      <rect x="73" y="83" width="6" height="16" fill="#1a9a88"/>
      <line x1="76" y1="86" x2="84" y2="86" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      <line x1="76" y1="89" x2="84" y2="89" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      <line x1="76" y1="92" x2="84" y2="92" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    </svg>`,
  },
  {
    id: "cool",
    label: "Cool Kid",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#1a0a2e"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- hair – spiky -->
      <polygon points="60,18 52,30 56,28 48,35 55,32 45,40 56,37" fill="#1a1a1a"/>
      <polygon points="60,18 68,30 64,28 72,35 65,32 75,40 64,37" fill="#1a1a1a"/>
      <rect x="34" y="34" width="52" height="6" fill="#1a1a1a"/>
      <!-- sunglasses -->
      <rect x="36" y="47" width="19" height="12" rx="6" fill="#0a0a0a"/>
      <rect x="65" y="47" width="19" height="12" rx="6" fill="#0a0a0a"/>
      <line x1="55" y1="53" x2="65" y2="53" stroke="#0a0a0a" stroke-width="3"/>
      <!-- sheen -->
      <ellipse cx="42" cy="51" rx="4" ry="2" fill="rgba(255,255,255,0.15)" transform="rotate(-20,42,51)"/>
      <ellipse cx="71" cy="51" rx="4" ry="2" fill="rgba(255,255,255,0.15)" transform="rotate(-20,71,51)"/>
      <!-- smirk -->
      <path d="M55 65 Q62 70 70 64" stroke="#c87952" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- body – hoodie -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#2d1060"/>
      <!-- hood strings -->
      <line x1="56" y1="82" x2="54" y2="92" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <line x1="64" y1="82" x2="66" y2="92" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <!-- star -->
      <polygon points="60,85 61.5,89 66,89 62.5,91.5 64,96 60,93.5 56,96 57.5,91.5 54,89 58.5,89" fill="#d9b820" opacity="0.9"/>
    </svg>`,
  },
  {
    id: "athlete",
    label: "Athlete",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#0d3020"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#C68642"/>
      <!-- headband -->
      <rect x="34" y="30" width="52" height="9" rx="4" fill="#d92070"/>
      <line x1="34" y1="34" x2="86" y2="34" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <!-- hair under headband -->
      <rect x="34" y="36" width="52" height="5" fill="#1a0a00"/>
      <!-- eyes -->
      <ellipse cx="47" cy="53" rx="5" ry="4.5" fill="white"/>
      <ellipse cx="73" cy="53" rx="5" ry="4.5" fill="white"/>
      <circle cx="47" cy="53" r="2.5" fill="#1a0a00"/>
      <circle cx="73" cy="53" r="2.5" fill="#1a0a00"/>
      <circle cx="48" cy="52" r="1" fill="white"/>
      <circle cx="74" cy="52" r="1" fill="white"/>
      <!-- eyebrows -->
      <path d="M42 47 Q47 44 52 47" stroke="#1a0a00" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M68 47 Q73 44 78 47" stroke="#1a0a00" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- determined mouth -->
      <path d="M52 65 Q60 68 68 65" stroke="#8b4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- body – jersey -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#20d960"/>
      <line x1="60" y1="80" x2="60" y2="116" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <!-- number -->
      <text x="60" y="102" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="14" fill="white">23</text>
      <!-- sweat drop -->
      <ellipse cx="82" cy="52" rx="3" ry="4" fill="rgba(32,217,184,0.6)" transform="rotate(20,82,52)"/>
    </svg>`,
  },
  {
    id: "artist",
    label: "Artist",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#2d0a1e"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- beret -->
      <ellipse cx="60" cy="30" rx="28" ry="10" fill="#b820d9"/>
      <ellipse cx="60" cy="26" rx="22" ry="8" fill="#9010b8"/>
      <circle cx="74" cy="24" r="3" fill="#d940f9"/>
      <!-- curly hair sides -->
      <circle cx="34" cy="42" r="8" fill="#3d1a00"/>
      <circle cx="86" cy="42" r="8" fill="#3d1a00"/>
      <circle cx="36" cy="36" r="6" fill="#3d1a00"/>
      <circle cx="84" cy="36" r="6" fill="#3d1a00"/>
      <!-- eyes – artistic -->
      <ellipse cx="47" cy="53" rx="5" ry="5.5" fill="white"/>
      <ellipse cx="73" cy="53" rx="5" ry="5.5" fill="white"/>
      <circle cx="47" cy="54" r="3" fill="#5a1a8a"/>
      <circle cx="73" cy="54" r="3" fill="#5a1a8a"/>
      <circle cx="48" cy="53" r="1" fill="white"/>
      <circle cx="74" cy="53" r="1" fill="white"/>
      <!-- lashes -->
      <line x1="44" y1="48" x2="43" y2="46" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="47" y1="47" x2="47" y2="45" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="50" y1="48" x2="51" y2="46" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="70" y1="48" x2="69" y2="46" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="73" y1="47" x2="73" y2="45" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="76" y1="48" x2="77" y2="46" stroke="#1a1a1a" stroke-width="1.5"/>
      <!-- rosy cheeks -->
      <circle cx="40" cy="60" r="5" fill="rgba(255,100,150,0.3)"/>
      <circle cx="80" cy="60" r="5" fill="rgba(255,100,150,0.3)"/>
      <!-- smile -->
      <path d="M51 65 Q60 73 69 65" stroke="#c87952" stroke-width="2" fill="rgba(255,200,180,0.4)" stroke-linecap="round"/>
      <!-- body – smock -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#4a1a6a"/>
      <!-- paint splatters -->
      <circle cx="50" cy="90" r="3" fill="#d92070" opacity="0.8"/>
      <circle cx="65" cy="96" r="2" fill="#20d9b8" opacity="0.8"/>
      <circle cx="55" cy="100" r="2.5" fill="#d9b820" opacity="0.8"/>
      <circle cx="72" cy="88" r="2" fill="#20d960" opacity="0.8"/>
      <!-- paintbrush -->
      <line x1="78" y1="76" x2="90" y2="60" stroke="#8b6040" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="91" cy="59" rx="3" ry="5" fill="#d92070" transform="rotate(-40,91,59)"/>
    </svg>`,
  },
  {
    id: "ninja",
    label: "Ninja",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#0a0a1e"/>
      <!-- skin – only eyes visible -->
      <circle cx="60" cy="52" r="26" fill="#1a1a2e"/>
      <!-- mask top -->
      <ellipse cx="60" cy="30" rx="26" ry="12" fill="#1a1a2e"/>
      <!-- eyes band – only part shown -->
      <rect x="34" y="47" width="52" height="18" rx="2" fill="#0a0a14"/>
      <!-- glowing eyes -->
      <ellipse cx="47" cy="56" rx="6" ry="5" fill="#1a1a2e"/>
      <ellipse cx="73" cy="56" rx="6" ry="5" fill="#1a1a2e"/>
      <ellipse cx="47" cy="56" rx="4" ry="3.5" fill="#20d9b8"/>
      <ellipse cx="73" cy="56" rx="4" ry="3.5" fill="#20d9b8"/>
      <ellipse cx="47" cy="56" rx="2" ry="2" fill="#0af0d8"/>
      <ellipse cx="73" cy="56" rx="2" ry="2" fill="#0af0d8"/>
      <!-- eye glow -->
      <ellipse cx="47" cy="56" rx="7" ry="6" fill="none" stroke="rgba(32,217,184,0.3)" stroke-width="2"/>
      <ellipse cx="73" cy="56" rx="7" ry="6" fill="none" stroke="rgba(32,217,184,0.3)" stroke-width="2"/>
      <!-- face wrap -->
      <rect x="34" y="62" width="52" height="16" rx="2" fill="#1a1a2e"/>
      <line x1="34" y1="66" x2="86" y2="66" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <line x1="34" y1="70" x2="86" y2="70" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <!-- body -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#0f0f1e"/>
      <!-- shuriken -->
      <g transform="translate(80,86) rotate(45)">
        <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#94a3b8"/>
        <circle cx="0" cy="0" r="2.5" fill="#1a1a2e"/>
      </g>
      <!-- belt -->
      <rect x="34" y="88" width="52" height="5" rx="2" fill="#20d9b8" opacity="0.8"/>
      <rect x="57" y="87" width="6" height="7" rx="1" fill="#1a9a88"/>
    </svg>`,
  },
  {
    id: "scientist",
    label: "Scientist",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#0a2010"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- hair – wild -->
      <path d="M34,38 Q30,20 44,20 Q50,14 60,16 Q70,14 76,20 Q90,20 86,38" fill="#e8e8e8"/>
      <path d="M34,36 Q28,18 42,18" stroke="#d0d0d0" stroke-width="3" fill="none"/>
      <path d="M86,36 Q92,18 78,18" stroke="#d0d0d0" stroke-width="3" fill="none"/>
      <!-- goggles -->
      <rect x="36" y="45" width="18" height="14" rx="6" fill="rgba(180,240,255,0.4)" stroke="#94a3b8" stroke-width="2.5"/>
      <rect x="66" y="45" width="18" height="14" rx="6" fill="rgba(180,240,255,0.4)" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="54" y1="52" x2="66" y2="52" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="30" y1="52" x2="36" y2="52" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="84" y1="52" x2="90" y2="52" stroke="#94a3b8" stroke-width="2.5"/>
      <!-- eyes -->
      <circle cx="45" cy="52" r="2.5" fill="#1a1a2e"/>
      <circle cx="75" cy="52" r="2.5" fill="#1a1a2e"/>
      <!-- excited mouth -->
      <path d="M50 66 Q60 75 70 66" stroke="#c87952" stroke-width="2" fill="rgba(255,200,180,0.5)" stroke-linecap="round"/>
      <!-- body – lab coat -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#e8f0ff"/>
      <line x1="60" y1="80" x2="60" y2="116" stroke="#c8d0e8" stroke-width="1.5"/>
      <!-- pocket -->
      <rect x="65" y="88" width="10" height="8" rx="2" fill="#c8d0e8"/>
      <!-- pens in pocket -->
      <line x1="67" y1="85" x2="67" y2="90" stroke="#d92070" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="70" y1="85" x2="70" y2="90" stroke="#20d9b8" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="73" y1="85" x2="73" y2="90" stroke="#d9b820" stroke-width="1.5" stroke-linecap="round"/>
      <!-- flask in hand -->
      <path d="M34,86 L34,94 Q34,100 40,100 Q46,100 46,94 L46,86 Z" fill="rgba(32,217,184,0.3)" stroke="#20d9b8" stroke-width="1.5"/>
      <rect x="35" y="83" width="10" height="4" rx="1" fill="#94a3b8"/>
      <ellipse cx="40" cy="96" rx="4" ry="2" fill="rgba(32,217,184,0.6)"/>
      <!-- bubbles -->
      <circle cx="38" cy="90" r="1.5" fill="rgba(255,255,255,0.7)"/>
      <circle cx="42" cy="87" r="1" fill="rgba(255,255,255,0.7)"/>
    </svg>`,
  },
  {
    id: "gamer",
    label: "Gamer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#1a0a30"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- gaming headset -->
      <path d="M34,40 Q34,20 60,20 Q86,20 86,40" fill="none" stroke="#b820d9" stroke-width="5" stroke-linecap="round"/>
      <rect x="28" y="40" width="12" height="16" rx="5" fill="#b820d9"/>
      <rect x="80" y="40" width="12" height="16" rx="5" fill="#b820d9"/>
      <!-- mic boom -->
      <path d="M28,52 Q20,60 24,68" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
      <circle cx="24" cy="69" r="3" fill="#20d9b8"/>
      <!-- LED glow on headset -->
      <rect x="29" y="44" width="10" height="4" rx="2" fill="#20d9b8" opacity="0.8"/>
      <rect x="81" y="44" width="10" height="4" rx="2" fill="#20d9b8" opacity="0.8"/>
      <!-- eyes – screen glow -->
      <ellipse cx="47" cy="53" rx="6" ry="5.5" fill="white"/>
      <ellipse cx="73" cy="53" rx="6" ry="5.5" fill="white"/>
      <!-- pupils with screen reflection -->
      <circle cx="47" cy="53" r="3.5" fill="#1a0a30"/>
      <circle cx="73" cy="53" r="3.5" fill="#1a0a30"/>
      <rect x="45" y="51" width="4" height="3" rx="1" fill="rgba(32,217,184,0.5)"/>
      <rect x="71" y="51" width="4" height="3" rx="1" fill="rgba(32,217,184,0.5)"/>
      <!-- focused eyebrows -->
      <path d="M41 46 Q47 43 53 46" stroke="#1a0a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M67 46 Q73 43 79 46" stroke="#1a0a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- determined mouth -->
      <line x1="52" y1="65" x2="68" y2="65" stroke="#c87952" stroke-width="2.5" stroke-linecap="round"/>
      <!-- body – gaming shirt -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#2d0a50"/>
      <!-- controller icon on shirt -->
      <rect x="48" y="88" width="24" height="14" rx="7" fill="rgba(184,32,217,0.4)" stroke="#b820d9" stroke-width="1.5"/>
      <circle cx="66" cy="94" r="2" fill="#d940f9"/>
      <circle cx="70" cy="91" r="1.5" fill="#20d9b8"/>
      <circle cx="70" cy="97" r="1.5" fill="#20d9b8"/>
      <circle cx="67" cy="94" r="1.5" fill="#d92070"/>
      <!-- d-pad -->
      <rect x="52" y="92" width="6" height="2" rx="1" fill="#94a3b8"/>
      <rect x="54" y="90" width="2" height="6" rx="1" fill="#94a3b8"/>
    </svg>`,
  },
  {
    id: "explorer",
    label: "Explorer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#1a2a0a"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#C68642"/>
      <!-- explorer hat -->
      <ellipse cx="60" cy="34" rx="32" ry="7" fill="#8b6040"/>
      <ellipse cx="60" cy="28" rx="20" ry="10" fill="#a07040"/>
      <rect x="40" y="26" width="40" height="10" rx="2" fill="#a07040"/>
      <!-- hat band -->
      <rect x="40" y="31" width="40" height="5" rx="1" fill="#d9b820"/>
      <!-- eyes – adventurous squint -->
      <ellipse cx="47" cy="53" rx="5.5" ry="4" fill="white"/>
      <ellipse cx="73" cy="53" rx="5.5" ry="4" fill="white"/>
      <circle cx="47" cy="53" r="2.5" fill="#3d2010"/>
      <circle cx="73" cy="53" r="2.5" fill="#3d2010"/>
      <circle cx="48" cy="52" r="1" fill="white"/>
      <circle cx="74" cy="52" r="1" fill="white"/>
      <!-- eyebrows – determined -->
      <path d="M41 47 Q47 45 53 48" stroke="#3d2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M67 48 Q73 45 79 47" stroke="#3d2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- stubble -->
      <circle cx="50" cy="65" r="1" fill="rgba(80,40,10,0.4)"/>
      <circle cx="55" cy="67" r="1" fill="rgba(80,40,10,0.4)"/>
      <circle cx="60" cy="68" r="1" fill="rgba(80,40,10,0.4)"/>
      <circle cx="65" cy="67" r="1" fill="rgba(80,40,10,0.4)"/>
      <circle cx="70" cy="65" r="1" fill="rgba(80,40,10,0.4)"/>
      <!-- smile -->
      <path d="M51 64 Q60 72 69 64" stroke="#8b4513" stroke-width="2.5" fill="rgba(255,200,150,0.3)" stroke-linecap="round"/>
      <!-- body – khaki shirt -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#a09060"/>
      <!-- pockets -->
      <rect x="44" y="88" width="8" height="8" rx="2" fill="#8a7040" stroke="#7a6030" stroke-width="1"/>
      <rect x="68" y="88" width="8" height="8" rx="2" fill="#8a7040" stroke="#7a6030" stroke-width="1"/>
      <!-- compass -->
      <circle cx="60" cy="84" r="6" fill="#c8a060" stroke="#8b6040" stroke-width="1.5"/>
      <circle cx="60" cy="84" r="4" fill="#e8d090"/>
      <polygon points="60,80 61.5,84 60,88 58.5,84" fill="#d92070" opacity="0.9"/>
      <polygon points="56,84 60,82.5 64,84 60,85.5" fill="#94a3b8" opacity="0.9"/>
    </svg>`,
  },
  {
    id: "wizard",
    label: "Wizard",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#0a0820"/>
      <!-- skin -->
      <circle cx="60" cy="56" r="24" fill="#FDBCB4"/>
      <!-- wizard hat -->
      <polygon points="60,4 40,42 80,42" fill="#2d0060"/>
      <ellipse cx="60" cy="42" rx="26" ry="7" fill="#3d0080"/>
      <!-- hat stars -->
      <circle cx="55" cy="18" r="1.5" fill="#d9b820"/>
      <circle cx="65" cy="24" r="2" fill="#20d9b8"/>
      <circle cx="50" cy="28" r="1.5" fill="#d92070"/>
      <circle cx="62" cy="32" r="1" fill="#d9b820"/>
      <!-- long beard -->
      <path d="M40,70 Q35,85 40,100 Q50,110 60,108 Q70,110 80,100 Q85,85 80,70" fill="#e8e8e8"/>
      <path d="M44,70 Q40,82 44,94" stroke="#d0d0d0" stroke-width="1.5" fill="none"/>
      <path d="M60,70 Q60,85 58,100" stroke="#d0d0d0" stroke-width="1.5" fill="none"/>
      <path d="M76,70 Q80,82 76,94" stroke="#d0d0d0" stroke-width="1.5" fill="none"/>
      <!-- bushy brows -->
      <ellipse cx="47" cy="47" rx="7" ry="3" fill="#c8c8c8"/>
      <ellipse cx="73" cy="47" rx="7" ry="3" fill="#c8c8c8"/>
      <!-- glowing eyes -->
      <ellipse cx="47" cy="54" rx="5.5" ry="5" fill="white"/>
      <ellipse cx="73" cy="54" rx="5.5" ry="5" fill="white"/>
      <circle cx="47" cy="54" r="3" fill="#6020c0"/>
      <circle cx="73" cy="54" r="3" fill="#6020c0"/>
      <circle cx="47" cy="54" r="1.5" fill="#d9b820"/>
      <circle cx="73" cy="54" r="1.5" fill="#d9b820"/>
      <!-- magic sparkles -->
      <circle cx="88" cy="44" r="3" fill="#d9b820" opacity="0.9"/>
      <line x1="88" y1="38" x2="88" y2="50" stroke="#d9b820" stroke-width="1.5" opacity="0.6"/>
      <line x1="82" y1="44" x2="94" y2="44" stroke="#d9b820" stroke-width="1.5" opacity="0.6"/>
      <line x1="84" y1="40" x2="92" y2="48" stroke="#d9b820" stroke-width="1.5" opacity="0.6"/>
      <line x1="92" y1="40" x2="84" y2="48" stroke="#d9b820" stroke-width="1.5" opacity="0.6"/>
    </svg>`,
  },
  {
    id: "chef",
    label: "Chef",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#1e0a00"/>
      <!-- skin -->
      <circle cx="60" cy="54" r="26" fill="#C68642"/>
      <!-- chef hat -->
      <ellipse cx="60" cy="30" rx="22" ry="8" fill="white"/>
      <rect x="38" y="22" width="44" height="16" rx="2" fill="white"/>
      <ellipse cx="60" cy="20" rx="16" ry="14" fill="white"/>
      <ellipse cx="60" cy="20" rx="14" ry="13" fill="#f0f0f0"/>
      <!-- hat seam -->
      <rect x="38" y="29" width="44" height="3" fill="#e0e0e0"/>
      <!-- eyebrows – focused chef -->
      <path d="M42 46 Q47 44 52 46" stroke="#3d1a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M68 46 Q73 44 78 46" stroke="#3d1a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- eyes -->
      <ellipse cx="47" cy="52" rx="5" ry="5" fill="white"/>
      <ellipse cx="73" cy="52" rx="5" ry="5" fill="white"/>
      <circle cx="47" cy="52" r="3" fill="#3d1a00"/>
      <circle cx="73" cy="52" r="3" fill="#3d1a00"/>
      <circle cx="48" cy="51" r="1" fill="white"/>
      <circle cx="74" cy="51" r="1" fill="white"/>
      <!-- moustache -->
      <path d="M50 63 Q55 60 60 63 Q65 60 70 63" stroke="#3d1a00" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- smile under moustache -->
      <path d="M54 67 Q60 72 66 67" stroke="#8b4513" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- chef body -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="white"/>
      <!-- double-breasted buttons -->
      <circle cx="54" cy="86" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <circle cx="54" cy="93" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <circle cx="54" cy="100" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <circle cx="66" cy="86" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <circle cx="66" cy="93" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <circle cx="66" cy="100" r="2.5" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="1"/>
      <!-- spoon -->
      <line x1="80" y1="78" x2="88" y2="60" stroke="#a08060" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="89" cy="58" rx="4" ry="5" fill="#c0a070" transform="rotate(-20,89,58)"/>
    </svg>`,
  },
  {
    id: "astronaut",
    label: "Astronaut",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#00001a"/>
      <!-- stars bg -->
      <circle cx="20" cy="20" r="1" fill="white" opacity="0.8"/>
      <circle cx="90" cy="15" r="1.5" fill="white" opacity="0.6"/>
      <circle cx="100" cy="50" r="1" fill="white" opacity="0.7"/>
      <circle cx="15" cy="80" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="95" cy="90" r="1" fill="white" opacity="0.8"/>
      <circle cx="30" cy="100" r="1" fill="white" opacity="0.6"/>
      <!-- helmet outer -->
      <circle cx="60" cy="50" r="32" fill="#c8d8e8"/>
      <!-- helmet inner -->
      <circle cx="60" cy="50" r="27" fill="#1a2a3a"/>
      <!-- visor -->
      <ellipse cx="60" cy="52" rx="20" ry="17" fill="#d9b820" opacity="0.3"/>
      <ellipse cx="60" cy="52" rx="20" ry="17" fill="url(#visorGrad)" opacity="0.7"/>
      <defs>
        <radialGradient id="visorGrad" cx="40%" cy="35%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#d9b820" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <!-- skin inside visor -->
      <circle cx="60" cy="52" r="17" fill="#FDBCB4" opacity="0.95"/>
      <!-- eyes -->
      <ellipse cx="52" cy="50" rx="4.5" ry="4" fill="white"/>
      <ellipse cx="68" cy="50" rx="4.5" ry="4" fill="white"/>
      <circle cx="52" cy="50" r="2.5" fill="#1a2a3a"/>
      <circle cx="68" cy="50" r="2.5" fill="#1a2a3a"/>
      <circle cx="53" cy="49" r="1" fill="white"/>
      <circle cx="69" cy="49" r="1" fill="white"/>
      <!-- happy smile -->
      <path d="M53 58 Q60 64 67 58" stroke="#c87952" stroke-width="2" fill="rgba(255,200,180,0.4)" stroke-linecap="round"/>
      <!-- suit collar -->
      <ellipse cx="60" cy="80" rx="32" ry="10" fill="#c8d8e8"/>
      <!-- suit body -->
      <ellipse cx="60" cy="100" rx="30" ry="16" fill="#c8d8e8"/>
      <!-- NASA-style patch -->
      <circle cx="60" cy="96" r="8" fill="#2060c8" stroke="#c8d8e8" stroke-width="1.5"/>
      <text x="60" y="99" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="6" fill="white">NASA</text>
      <!-- suit details -->
      <rect x="36" y="86" width="8" height="6" rx="2" fill="#a0b0c0"/>
      <rect x="76" y="86" width="8" height="6" rx="2" fill="#a0b0c0"/>
    </svg>`,
  },
  {
    id: "rockstar",
    label: "Rockstar",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="58" fill="#200010"/>
      <!-- skin -->
      <circle cx="60" cy="52" r="26" fill="#FDBCB4"/>
      <!-- wild long hair -->
      <path d="M34,40 Q28,30 30,18 Q38,8 52,10 Q60,8 68,10 Q82,8 90,18 Q92,30 86,40" fill="#1a1a1a"/>
      <!-- hair sides flowing down -->
      <path d="M34,40 Q26,55 28,75 Q30,85 36,90" fill="#1a1a1a"/>
      <path d="M86,40 Q94,55 92,75 Q90,85 84,90" fill="#1a1a1a"/>
      <!-- face on skin -->
      <!-- rocker eye makeup – left -->
      <ellipse cx="47" cy="52" rx="6.5" ry="6" fill="white"/>
      <path d="M41,48 Q47,45 53,48" stroke="#1a1a1a" stroke-width="1.5" fill="#1a1a1a" opacity="0.8"/>
      <circle cx="47" cy="52" r="3.5" fill="#1a1a1a"/>
      <circle cx="48.5" cy="50.5" r="1.2" fill="white"/>
      <!-- star under left eye -->
      <polygon points="42,58 43,61 46,61 43.5,63 44.5,66 42,64 39.5,66 40.5,63 38,61 41,61" fill="#d92070" transform="scale(0.5) translate(42,58)"/>
      <!-- rocker eye makeup – right -->
      <ellipse cx="73" cy="52" rx="6.5" ry="6" fill="white"/>
      <path d="M67,48 Q73,45 79,48" stroke="#1a1a1a" stroke-width="1.5" fill="#1a1a1a" opacity="0.8"/>
      <circle cx="73" cy="52" r="3.5" fill="#1a1a1a"/>
      <circle cx="74.5" cy="50.5" r="1.2" fill="white"/>
      <!-- lightning bolt right eye -->
      <path d="M76,56 L78,60 L75,60 L77,64" stroke="#d9b820" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- smirk -->
      <path d="M54 65 Q62 70 70 64" stroke="#c87952" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- body – leather jacket -->
      <ellipse cx="60" cy="98" rx="30" ry="18" fill="#1a1a1a"/>
      <!-- lapels -->
      <polygon points="60,80 48,84 44,100 54,100" fill="#2a2a2a"/>
      <polygon points="60,80 72,84 76,100 66,100" fill="#2a2a2a"/>
      <!-- band tee peek -->
      <rect x="54" y="84" width="12" height="14" rx="1" fill="#d92070"/>
      <!-- studs on jacket -->
      <circle cx="46" cy="88" r="1.5" fill="#d9b820"/>
      <circle cx="50" cy="85" r="1.5" fill="#d9b820"/>
      <circle cx="74" cy="88" r="1.5" fill="#d9b820"/>
      <circle cx="70" cy="85" r="1.5" fill="#d9b820"/>
      <!-- guitar neck peek -->
      <rect x="82" y="76" width="5" height="30" rx="2" fill="#8b6040"/>
      <line x1="82" y1="80" x2="87" y2="80" stroke="#d9b820" stroke-width="1"/>
      <line x1="82" y1="85" x2="87" y2="85" stroke="#d9b820" stroke-width="1"/>
      <line x1="82" y1="90" x2="87" y2="90" stroke="#d9b820" stroke-width="1"/>
    </svg>`,
  },
];

function svgToDataUrl(svgStr) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
}

/* ─────────────────────────────────────────────
   AVATAR CUSTOMIZER MODAL
   Three tabs: 1) Upload photo  2) Build avatar  3) Bitmoji
───────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: "linear-gradient(135deg,#20d9b8,#1a7a9a)", name: "Teal"    },
  { bg: "linear-gradient(135deg,#b820d9,#6a1ab8)", name: "Purple"  },
  { bg: "linear-gradient(135deg,#d92070,#8b1040)", name: "Pink"    },
  { bg: "linear-gradient(135deg,#20d960,#158040)", name: "Green"   },
  { bg: "linear-gradient(135deg,#d9b820,#a07800)", name: "Gold"    },
  { bg: "linear-gradient(135deg,#2070d9,#103880)", name: "Blue"    },
  { bg: "linear-gradient(135deg,#d95020,#802010)", name: "Orange"  },
  { bg: "linear-gradient(135deg,#9020d9,#500890)", name: "Violet"  },
];

const AVATAR_PATTERNS = [
  { id: "none",    label: "Solid"    },
  { id: "dots",    label: "Dots"     },
  { id: "grid",    label: "Grid"     },
  { id: "rings",   label: "Rings"    },
];

const AVATAR_SHAPES = [
  { id: "circle",   label: "Circle"   },
  { id: "rounded",  label: "Rounded"  },
  { id: "hex",      label: "Hexagon"  },
];

function buildAvatarDataUrl(initials, colorIdx, patternId, shapeId) {
  const grad = AVATAR_COLORS[colorIdx];
  const match = grad.bg.match(/#[0-9a-fA-F]{6}/g);
  const c1 = match?.[0] ?? "#20d9b8";
  const c2 = match?.[1] ?? "#1a7a9a";

  let patternEl = "";
  if (patternId === "dots") {
    patternEl = `<pattern id="p" patternUnits="userSpaceOnUse" width="18" height="18"><circle cx="9" cy="9" r="2" fill="rgba(255,255,255,0.18)"/></pattern><rect width="120" height="120" fill="url(#p)"/>`;
  } else if (patternId === "grid") {
    patternEl = `<pattern id="p" patternUnits="userSpaceOnUse" width="16" height="16"><path d="M16 0H0v16" stroke="rgba(255,255,255,0.12)" stroke-width="1" fill="none"/></pattern><rect width="120" height="120" fill="url(#p)"/>`;
  } else if (patternId === "rings") {
    patternEl = `<circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="none"/><circle cx="60" cy="60" r="36" stroke="rgba(255,255,255,0.09)" stroke-width="1.5" fill="none"/><circle cx="60" cy="60" r="24" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" fill="none"/>`;
  }

  let clipPath = "";
  let mask = "";
  if (shapeId === "circle") {
    clipPath = `<clipPath id="cl"><circle cx="60" cy="60" r="58"/></clipPath>`;
    mask = `clip-path="url(#cl)"`;
  } else if (shapeId === "rounded") {
    clipPath = `<clipPath id="cl"><rect x="4" y="4" width="112" height="112" rx="28"/></clipPath>`;
    mask = `clip-path="url(#cl)"`;
  } else if (shapeId === "hex") {
    clipPath = `<clipPath id="cl"><polygon points="60,4 112,32 112,88 60,116 8,88 8,32"/></clipPath>`;
    mask = `clip-path="url(#cl)"`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      ${clipPath}
    </defs>
    <g ${mask}>
      <rect width="120" height="120" fill="url(#g)"/>
      ${patternEl}
      <text x="60" y="72" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-weight="700" font-size="40" fill="rgba(255,255,255,0.95)">${initials}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function AvatarModal({ initials, onSave, onClose }) {
  const [tab,           setTab]           = useState("bitmoji"); // "bitmoji" | "build" | "upload"
  const [colorIdx,      setColorIdx]      = useState(0);
  const [patternId,     setPatternId]     = useState("none");
  const [shapeId,       setShapeId]       = useState("circle");
  const [uploadPrev,    setUploadPrev]    = useState(null);
  const [uploadFile,    setUploadFile]    = useState(null);
  const [dragging,      setDragging]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [selectedBitmoji, setSelectedBitmoji] = useState(null);
  const fileRef = useRef();

  const buildPreviewUrl = buildAvatarDataUrl(initials, colorIdx, patternId, shapeId);

  const currentPreview = () => {
    if (tab === "bitmoji")  return selectedBitmoji ? svgToDataUrl(selectedBitmoji.svg) : null;
    if (tab === "build")    return buildPreviewUrl;
    return uploadPrev || buildPreviewUrl;
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setUploadPrev(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    if (tab === "bitmoji") {
      if (!selectedBitmoji) { setSaving(false); return; }
      onSave(svgToDataUrl(selectedBitmoji.svg), null);
    } else if (tab === "build") {
      onSave(buildPreviewUrl, null);
    } else {
      if (!uploadFile && !uploadPrev) { setSaving(false); return; }
      if (uploadFile) {
        const fd = new FormData();
        fd.append("avatar", uploadFile);
        const userId = localStorage.getItem("userId");
        try {
          const res  = await fetch(`${BASE}/user/${userId}/avatar-upload`, { method: "POST", body: fd });
          const data = await res.json();
          if (res.ok) onSave(data.avatarUrl, null);
          else        onSave(uploadPrev, null);
        } catch {
          onSave(uploadPrev, null);
        }
      } else {
        onSave(uploadPrev, null);
      }
    }
    setSaving(false);
  };

  const preview = currentPreview();

  return (
    <div style={m.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        {/* Header */}
        <div style={m.mHeader}>
          <span style={m.mHeaderTitle}>✏️ Customize Avatar</span>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={m.tabs}>
          {[["bitmoji","🧑 Bitmoji"],["build","🎨 Build Avatar"],["upload","📷 Upload Photo"]].map(([id, label]) => (
            <button key={id} style={{ ...m.tab, ...(tab === id ? m.tabActive : {}) }} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <div style={m.body}>
          {/* Preview */}
          <div style={m.previewCol}>
            <p style={m.previewLabel}>PREVIEW</p>
            <div style={m.previewRing}>
              {preview
                ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(32,217,184,0.08)", color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", padding: 8 }}>
                    Pick a bitmoji
                  </div>
              }
            </div>
            <p style={m.previewHint}>
              {tab === "bitmoji" ? (selectedBitmoji ? selectedBitmoji.label : "None selected") : tab === "build" ? "Designed avatar" : uploadPrev ? "Your photo" : "No photo yet"}
            </p>

            <button
              style={{ ...m.saveBtn, opacity: (saving || (tab === "bitmoji" && !selectedBitmoji) || (tab === "upload" && !uploadPrev)) ? 0.4 : 1 }}
              onClick={handleSave}
              disabled={saving || (tab === "bitmoji" && !selectedBitmoji) || (tab === "upload" && !uploadPrev)}
            >
              {saving ? "Saving..." : "✓ Save Avatar"}
            </button>
          </div>

          {/* Controls */}
          <div style={m.controlsCol}>

            {/* ── BITMOJI TAB ── */}
            {tab === "bitmoji" && (
              <>
                <p style={m.ctrlLabel}>CHOOSE YOUR CHARACTER</p>
                <div style={m.bitmojiGrid}>
                  {PRESET_BITMOJIS.map((bm) => {
                    const isSelected = selectedBitmoji?.id === bm.id;
                    return (
                      <div
                        key={bm.id}
                        onClick={() => setSelectedBitmoji(bm)}
                        style={{
                          ...m.bitmojiCard,
                          borderColor: isSelected ? "#20d9b8" : "rgba(255,255,255,0.08)",
                          background: isSelected ? "rgba(32,217,184,0.12)" : "rgba(255,255,255,0.03)",
                          boxShadow: isSelected ? "0 0 16px rgba(32,217,184,0.25)" : "none",
                          transform: isSelected ? "scale(1.06)" : "scale(1)",
                        }}
                      >
                        <img
                          src={svgToDataUrl(bm.svg)}
                          alt={bm.label}
                          style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", display: "block" }}
                        />
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isSelected ? "#20d9b8" : "rgba(255,255,255,0.5)",
                          marginTop: 6,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}>
                          {bm.label}
                        </span>
                        {isSelected && (
                          <div style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#20d9b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#0a1e2e" }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── BUILD TAB ── */}
            {tab === "build" && (
              <>
                <p style={m.ctrlLabel}>BACKGROUND COLOR</p>
                <div style={m.colorGrid}>
                  {AVATAR_COLORS.map((c, i) => (
                    <div key={i}
                      style={{ ...m.colorSwatch, background: c.bg, border: colorIdx === i ? "3px solid #fff" : "3px solid transparent", boxShadow: colorIdx === i ? "0 0 10px rgba(255,255,255,0.4)" : "none" }}
                      onClick={() => setColorIdx(i)}
                      title={c.name}
                    />
                  ))}
                </div>

                <p style={m.ctrlLabel}>PATTERN</p>
                <div style={m.optRow}>
                  {AVATAR_PATTERNS.map((p) => (
                    <button key={p.id}
                      style={{ ...m.optBtn, ...(patternId === p.id ? m.optBtnActive : {}) }}
                      onClick={() => setPatternId(p.id)}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <p style={m.ctrlLabel}>SHAPE</p>
                <div style={m.optRow}>
                  {AVATAR_SHAPES.map((sh) => (
                    <button key={sh.id}
                      style={{ ...m.optBtn, ...(shapeId === sh.id ? m.optBtnActive : {}) }}
                      onClick={() => setShapeId(sh.id)}>
                      {sh.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── UPLOAD TAB ── */}
            {tab === "upload" && (
              <>
                <p style={m.ctrlLabel}>UPLOAD YOUR PHOTO</p>
                <div
                  style={{ ...m.dropzone, borderColor: dragging ? "#20d9b8" : "rgba(32,217,184,0.25)", background: dragging ? "rgba(32,217,184,0.08)" : "rgba(255,255,255,0.03)" }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  {uploadPrev
                    ? <img src={uploadPrev} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
                    : <>
                        <div style={m.dropIcon}>📁</div>
                        <p style={m.dropText}>Click or drag & drop</p>
                        <p style={m.dropSub}>PNG, JPG, WEBP · Max 5MB</p>
                      </>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files[0])} />

                {uploadPrev && (
                  <button style={m.clearBtn} onClick={() => { setUploadPrev(null); setUploadFile(null); }}>
                    ✕ Remove photo
                  </button>
                )}

                <div style={m.uploadTips}>
                  <p style={m.tipTitle}>Tips for best results:</p>
                  <p style={m.tip}>• Square photos work best</p>
                  <p style={m.tip}>• Clear face or icon image</p>
                  <p style={m.tip}>• Bright, high-contrast images</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal styles ─── */
const m = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal:        { width: "min(760px,100%)", background: "#0a1e2e", borderRadius: 20, border: "1px solid rgba(32,217,184,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", maxHeight: "90vh" },
  mHeader:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  mHeaderTitle: { fontSize: 15, fontWeight: 700, color: "#fff" },
  closeBtn:     { background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14, fontWeight: 700 },
  tabs:         { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  tab:          { flex: 1, background: "transparent", border: "none", padding: "12px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, cursor: "pointer", borderBottom: "2px solid transparent", transition: "all 0.2s" },
  tabActive:    { color: "#20d9b8", borderBottomColor: "#20d9b8", background: "rgba(32,217,184,0.06)" },
  body:         { display: "flex", gap: 0, overflow: "auto", flex: 1 },
  previewCol:   { width: 180, flexShrink: 0, padding: "24px 20px", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  previewLabel: { margin: 0, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", fontWeight: 700 },
  previewRing:  { width: 100, height: 100, borderRadius: "50%", border: "3px solid rgba(32,217,184,0.4)", overflow: "hidden", boxShadow: "0 0 20px rgba(32,217,184,0.2)" },
  previewHint:  { margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" },
  saveBtn:      { width: "100%", marginTop: 8, background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 0.5, transition: "opacity 0.2s" },
  controlsCol:  { flex: 1, padding: "24px 20px", overflowY: "auto" },
  ctrlLabel:    { margin: "0 0 12px", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", fontWeight: 700 },
  colorGrid:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 },
  colorSwatch:  { height: 38, borderRadius: 10, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" },
  optRow:       { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  optBtn:       { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  optBtnActive: { background: "rgba(32,217,184,0.15)", borderColor: "#20d9b8", color: "#20d9b8" },
  dropzone:     { border: "2px dashed", borderRadius: 14, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 14 },
  dropIcon:     { fontSize: 32 },
  dropText:     { margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" },
  dropSub:      { margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" },
  clearBtn:     { background: "rgba(217,32,112,0.1)", border: "1px solid rgba(217,32,112,0.3)", color: "#d92070", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 14 },
  uploadTips:   { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" },
  tipTitle:     { margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  tip:          { margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.35)" },
  /* bitmoji grid */
  bitmojiGrid:  { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  bitmojiCard:  { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 6px 8px", border: "2px solid", borderRadius: 14, cursor: "pointer", transition: "all 0.2s" },
};

/* ─── Shared Avatar rendering ─── */
function AvatarImg({ src, initials, size = 40, lvlColor, lvlLevel, onClick, style = {} }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, cursor: onClick ? "pointer" : "default", ...style }} onClick={onClick}>
      {src && !err
        ? <img src={src} alt="avatar" onError={() => setErr(true)}
            style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: `2px solid ${lvlColor ?? "rgba(32,217,184,0.4)"}`, boxShadow: lvlColor ? `0 0 12px ${lvlColor}40` : "none" }} />
        : <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${lvlColor ?? "rgba(32,217,184,0.4)"}`, fontSize: Math.round(size * 0.3), fontWeight: 700, color: "#fff" }}>
            {initials}
          </div>
      }
      {lvlLevel && (
        <div style={{ position: "absolute", bottom: -4, right: -4, background: "#0a1e2e", border: `2px solid ${lvlColor}`, borderRadius: 20, padding: "1px 5px", fontSize: 8, fontWeight: 700, color: lvlColor, whiteSpace: "nowrap" }}>
          LV{lvlLevel}
        </div>
      )}
    </div>
  );
}

/* ─── Main Profile ─── */
export default function Profile() {
  const navigate = useNavigate();
  const userId   = localStorage.getItem("userId");

  const [user,        setUser]        = useState({ name: "", points: 0, email: "—", role: "user", avatarUrl: "" });
  const [checkins,    setCheckins]    = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [editing,     setEditing]     = useState(false);
  const [editName,    setEditName]    = useState("");
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [checking,    setChecking]    = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const username = user.name || localStorage.getItem("username") || "User";
  const initials = getInitials(username);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    Promise.all([
      fetch(`${BASE}/user/${userId}`).then((r) => r.json()),
      fetch(`${BASE}/checkins/${userId}`).then((r) => r.json()),
      fetch(`${BASE}/subjects/${userId}`).then((r) => r.json()),
      fetch(`${BASE}/projects/${userId}`).then((r) => r.json()),
    ]).then(([u, ci, subs, projs]) => {
      setUser(u);
      setEditName(u.name);
      setCheckins(Array.isArray(ci) ? ci : []);
      setSubjects(Array.isArray(subs) ? subs : []);
      setProjects(Array.isArray(projs) ? projs : []);
      localStorage.setItem("username", u.name);
    }).catch(() => showToast("Failed to load profile", true))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAvatarSave = async (avatarUrl) => {
    setShowModal(false);
    setUser((u) => ({ ...u, avatarUrl }));
    try {
      await fetch(`${BASE}/user/${userId}/avatar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      showToast("✓ Avatar saved!");
    } catch {
      showToast("Avatar saved locally (network error)", false);
    }
  };

  const saveName = async () => {
    if (!editName.trim()) return;
    try {
      const res  = await fetch(`${BASE}/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((u) => ({ ...u, name: data.name }));
        localStorage.setItem("username", data.name);
        setEditing(false);
        showToast("✓ Name updated!");
      } else showToast(data.error || "Failed", true);
    } catch { showToast("Network error", true); }
  };

  const doCheckin = async () => {
    setChecking(true);
    try {
      const res  = await fetch(`${BASE}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      showToast(data.message || "✓ Checked in!");
      const [u, ci] = await Promise.all([
        fetch(`${BASE}/user/${userId}`).then((r) => r.json()),
        fetch(`${BASE}/checkins/${userId}`).then((r) => r.json()),
      ]);
      setUser((prev) => ({ ...prev, points: u.points }));
      setCheckins(Array.isArray(ci) ? ci : []);
    } catch { showToast("Check-in failed", true); }
    finally   { setChecking(false); }
  };

  const lvl      = getLevelInfo(user.points);
  const streak   = calcStreak(checkins);
  const heatmap  = buildHeatmap(checkins);
  const badges   = getBadges(user.points, streak, checkins);
  const todayStr = new Date().toISOString().split("T")[0];
  const checkedIn = checkins.some((c) => c.date === todayStr);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d2137", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#20d9b8", fontWeight: 600, letterSpacing: 2 }}>Loading profile...</p>
    </div>
  );

  return (
    <div style={s.root}>
      {showModal && <AvatarModal initials={initials} onSave={handleAvatarSave} onClose={() => setShowModal(false)} />}

      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? 240 : 72 }}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}><span style={{ fontSize: 18 }}>🎓</span></div>
          {sidebarOpen && <span style={s.logoText}>Smart Learning</span>}
        </div>
        <div style={s.divider} />
        <nav style={s.nav}>
          {[
            { icon: "⊞", label: "Dashboard",   path: "/dashboard"   },
            { icon: "📚", label: "Subjects",    path: "/subjects"    },
            { icon: "🗂",  label: "Projects",   path: "/projects"    },
            { icon: "🏆", label: "Leaderboard", path: "/leaderboard" },
            { icon: "👤", label: "Profile",     path: "/profile", active: true },
          ].map(({ icon, label, path, active }) => (
            <button key={label} onClick={() => navigate(path)} style={{ ...s.navItem, background: active ? "rgba(32,217,184,0.13)" : "transparent", color: active ? "#20d9b8" : "rgba(255,255,255,0.6)", borderLeft: active ? "3px solid #20d9b8" : "3px solid transparent" }}>
              <span style={s.navIcon}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ ...s.profileCard, cursor: "pointer" }} onClick={() => navigate("/profile")}>
          <AvatarImg src={user.avatarUrl} initials={initials} size={40} />
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <p style={s.profileName}>{username}</p>
              <p style={s.profileRole}>Student · View Profile →</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={s.main}>
        <header style={s.header}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen((o) => !o)}>☰</button>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div style={s.headerSearch}>
            <span>🔍</span>
            <input style={s.searchInput} placeholder="Search subjects, notes..." />
          </div>
          <div style={s.headerRight}>
            <button style={s.notifBtn}>🔔</button>
            <AvatarImg src={user.avatarUrl} initials={initials} size={38} onClick={() => navigate("/profile")} />
          </div>
        </header>

        <div style={s.body}>
          <p style={s.pageLabel}>MY PROFILE</p>
          <h1 style={s.pageTitle}>Player <span style={{ color: "#20d9b8" }}>Stats</span></h1>

          <div style={s.layout}>
            {/* ── LEFT ── */}
            <div style={s.leftCol}>
              <div style={s.card}>
                <div style={s.avatarHeader}>
                  <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 14px" }}>
                    <AvatarImg src={user.avatarUrl} initials={initials} size={90} lvlColor={lvl.color} lvlLevel={lvl.level} />
                    <div
                      onClick={() => setShowModal(true)}
                      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s", fontSize: 20 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                      title="Change avatar"
                    >
                      <span style={{ opacity: 0, transition: "opacity 0.2s" }}
                        ref={(el) => { if (el) { el.parentElement.addEventListener("mouseenter", () => el.style.opacity = 1); el.parentElement.addEventListener("mouseleave", () => el.style.opacity = 0); } }}>
                        ✏️
                      </span>
                    </div>
                  </div>

                  <button style={s.rpmBtn} onClick={() => setShowModal(true)}>
                    {user.avatarUrl ? "🔄 Change Avatar" : "🎨 Set Avatar"}
                  </button>

                  {editing ? (
                    <div style={s.editRow}>
                      <input style={s.editInput} value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false); }} autoFocus />
                      <button style={{ ...s.iconBtn, color: "#20d960" }} onClick={saveName}>✓</button>
                      <button style={{ ...s.iconBtn, color: "#d92070" }} onClick={() => { setEditing(false); setEditName(user.name); }}>✕</button>
                    </div>
                  ) : (
                    <div style={s.nameRow}>
                      <span style={s.bigName}>{username}</span>
                      <button style={s.editPencil} onClick={() => setEditing(true)} title="Edit name">✏️</button>
                    </div>
                  )}
                  <span style={s.roleTag}>STUDENT</span>
                </div>

                <div style={s.xpSection}>
                  <div style={s.xpRow}>
                    <span style={{ ...s.xpTitle, color: lvl.color }}>{lvl.title}</span>
                    <span style={s.xpPts}>{user.points} XP</span>
                  </div>
                  <div style={s.xpBg}>
                    <div style={{ ...s.xpFill, width: `${lvl.pct}%`, background: `linear-gradient(90deg,${lvl.color},#20d9b8)` }} />
                  </div>
                  <p style={s.xpSub}>{lvl.pct}% → Level {lvl.level + 1}</p>
                </div>

                <div style={s.infoSection}>
                  {[
                    { icon: "✉️", label: "Email",           value: user.email || "—" },
                    { icon: "🛡️", label: "Role",            value: user.role  || "user" },
                    { icon: "⏱️", label: "Total Check-ins", value: `${checkins.length} days` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={s.infoRow}>
                      <span style={s.infoIcon}>{icon}</span>
                      <div>
                        <p style={s.infoLabel}>{label}</p>
                        <p style={s.infoValue}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "0 20px 20px" }}>
                  <button
                    style={{ ...s.checkinBtn, opacity: checkedIn ? 0.5 : 1, cursor: checkedIn ? "not-allowed" : "pointer" }}
                    onClick={!checkedIn && !checking ? doCheckin : undefined}
                    disabled={checkedIn || checking}
                  >
                    🔥 {checkedIn ? "CHECKED IN TODAY" : checking ? "CHECKING IN..." : "DAILY CHECK-IN  +2 XP"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div style={s.rightCol}>
              <div style={s.card}>
                <p style={s.cardTitle}>📊 STATS</p>
                <div style={s.statsGrid}>
                  {[
                    { label: "Total XP",  value: user.points,    sub: "points earned", color: "#20d9b8", icon: "⚡" },
                    { label: "Streak",    value: streak,          sub: "days in a row", color: "#d92070", icon: "🔥" },
                    { label: "Subjects",  value: subjects.length, sub: "galleries",     color: "#20b8d9", icon: "📚" },
                    { label: "Projects",  value: projects.length, sub: "created",       color: "#b820d9", icon: "🗂"  },
                  ].map(({ label, value, sub, color, icon }) => (
                    <div key={label} style={s.statTile}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      <div style={s.statTileTop}><span style={{ fontSize: 20 }}>{icon}</span><span style={s.statLabel}>{label}</span></div>
                      <div style={{ ...s.statVal, color }}>{value}</div>
                      <div style={s.statSub}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.card}>
                <p style={s.cardTitle}>📅 CHECK-IN HISTORY (90 DAYS)</p>
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={s.heatmapGrid}>
                    {heatmap.map((d, i) => (
                      <div key={i} title={d.date} style={{ ...s.hmCell, background: d.active ? "#20d9b8" : "rgba(255,255,255,0.06)", boxShadow: d.active ? "0 0 6px rgba(32,217,184,0.4)" : "none" }} />
                    ))}
                  </div>
                  <div style={s.heatmapLegend}>
                    <span style={s.legendText}>Less</span>
                    <div style={{ ...s.legendCell, background: "rgba(255,255,255,0.06)" }} />
                    <div style={{ ...s.legendCell, background: "#20d9b8", opacity: 0.4 }} />
                    <div style={{ ...s.legendCell, background: "#20d9b8" }} />
                    <span style={s.legendText}>More</span>
                  </div>
                </div>
              </div>

              <div style={s.card}>
                <p style={s.cardTitle}>🏅 ACHIEVEMENTS</p>
                <div style={s.badgesWrap}>
                  {badges.map(({ label, icon, cond, color, desc }) => (
                    <div key={label} title={desc} style={{ ...s.badge, borderColor: cond ? color : "rgba(255,255,255,0.1)", background: cond ? color + "18" : "rgba(255,255,255,0.03)", color: cond ? color : "#334155", opacity: cond ? 1 : 0.5 }}>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <span style={{ fontWeight: 700 }}>{label}</span>
                      {!cond && <span style={{ fontSize: 11 }}>🔒</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ ...s.toast, borderColor: toast.err ? "#d92070" : "#20d9b8", boxShadow: toast.err ? "0 0 24px rgba(217,32,112,0.3)" : "0 0 24px rgba(32,217,184,0.3)" }}>
          <span style={{ fontSize: 16 }}>{toast.err ? "⚠️" : "✓"}</span>
          <span style={s.toastMsg}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Page styles ─── */
const s = {
  root:        { display: "flex", minHeight: "100vh", background: "#0d2137", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff" },
  sidebar:     { background: "#0a1e2e", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  logoRow:     { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 16px" },
  logoIcon:    { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText:    { fontWeight: 700, fontSize: 15, color: "#20d9b8", whiteSpace: "nowrap" },
  divider:     { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "0 16px 16px" },
  nav:         { display: "flex", flexDirection: "column", gap: 4, padding: "0 8px" },
  navItem:     { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap" },
  navIcon:     { fontSize: 16, flexShrink: 0 },
  profileCard: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", margin: "0 8px", borderRadius: 12, background: "rgba(255,255,255,0.05)", overflow: "hidden" },
  profileName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  profileRole: { margin: 0, fontSize: 11, color: "#20d9b8" },
  main:        { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header:      { display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", background: "rgba(10,30,46,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 10 },
  menuBtn:     { background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer" },
  backBtn:     { background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  headerSearch:{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", maxWidth: 420 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, width: "100%" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" },
  notifBtn:    { background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 16 },
  body:        { padding: "28px 32px", flex: 1 },
  pageLabel:   { margin: "0 0 6px", fontSize: 11, letterSpacing: 2, color: "#20d9b8", fontWeight: 600 },
  pageTitle:   { margin: "0 0 28px", fontSize: 28, fontWeight: 700 },
  layout:      { display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" },
  leftCol:     { display: "flex", flexDirection: "column" },
  rightCol:    { display: "flex", flexDirection: "column", gap: 20 },
  card:        { background: "#0a1e2e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" },
  cardTitle:   { margin: 0, padding: "18px 20px 0", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#20d9b8" },
  avatarHeader:{ background: "linear-gradient(135deg,#0d3d30,#0d2137)", padding: "32px 20px 20px", textAlign: "center" },
  rpmBtn:      { display: "inline-block", marginBottom: 14, background: "rgba(32,217,184,0.12)", border: "1px solid rgba(32,217,184,0.3)", borderRadius: 20, padding: "6px 16px", color: "#20d9b8", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 },
  nameRow:     { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 },
  bigName:     { fontSize: 20, fontWeight: 700, color: "#fff" },
  editPencil:  { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4, borderRadius: 6, opacity: 0.6 },
  roleTag:     { display: "inline-block", fontSize: 10, letterSpacing: 2, color: "#20d9b8", fontWeight: 600, background: "rgba(32,217,184,0.1)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 20, padding: "3px 12px" },
  editRow:     { display: "flex", alignItems: "center", gap: 6, background: "rgba(32,217,184,0.08)", border: "1px solid rgba(32,217,184,0.2)", borderRadius: 10, padding: "8px 12px", margin: "0 0 6px" },
  editInput:   { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 15, fontWeight: 700, flex: 1, fontFamily: "inherit" },
  iconBtn:     { background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, padding: "2px 6px", borderRadius: 6 },
  xpSection:   { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  xpRow:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  xpTitle:     { fontSize: 13, fontWeight: 700 },
  xpPts:       { fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 },
  xpBg:        { height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  xpFill:      { height: "100%", borderRadius: 4, transition: "width 1s ease" },
  xpSub:       { margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "right" },
  infoSection: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  infoRow:     { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  infoIcon:    { fontSize: 18, flexShrink: 0 },
  infoLabel:   { margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },
  infoValue:   { margin: 0, fontSize: 14, color: "#cbd5e1", fontWeight: 600 },
  checkinBtn:  { width: "100%", background: "linear-gradient(135deg,#20d9b8,#1a7a9a)", border: "none", borderRadius: 12, padding: 13, color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: "pointer", transition: "all 0.15s" },
  statsGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "16px 20px 20px" },
  statTile:    { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, transition: "all 0.2s", cursor: "default" },
  statTileTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  statLabel:   { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  statVal:     { fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 4 },
  statSub:     { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 },
  heatmapGrid: { display: "grid", gridTemplateColumns: "repeat(30, 1fr)", gap: 3, marginTop: 16 },
  hmCell:      { aspectRatio: 1, borderRadius: 3, transition: "transform 0.15s", cursor: "default" },
  heatmapLegend:{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" },
  legendCell:  { width: 10, height: 10, borderRadius: 2 },
  legendText:  { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 },
  badgesWrap:  { display: "flex", flexWrap: "wrap", gap: 10, padding: "16px 20px 20px" },
  badge:       { display: "flex", alignItems: "center", gap: 6, border: "1px solid", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, transition: "all 0.2s" },
  toast:       { position: "fixed", bottom: 28, right: 28, background: "#0a1e2e", border: "2px solid", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, zIndex: 999, minWidth: 220 },
  toastMsg:    { fontSize: 14, fontWeight: 700, color: "#fff" },
};