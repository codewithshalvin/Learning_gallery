// reminderService.js  –  place this in your backend root (same folder as server.js)
// Run:  npm install nodemailer node-cron

const cron        = require("node-cron");
const nodemailer  = require("nodemailer");
const mongoose    = require("mongoose");

const User            = require("./models/User");
const ScheduleSession = require("./models/ScheduleSession");
const Checklist       = require("./models/Checklist");
const ChecklistItem   = require("./models/ChecklistItem");

// ── Mailer setup ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,           // false = port 587 (TLS), true = port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail App Password (NOT your login password)
  },
  tls: {
    rejectUnauthorized: false,      // allows connection on Render free tier
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for today + offsetDays */
function dateOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

/** Nicely formatted date string e.g. "Wednesday, 2 April 2025" */
function prettyDate(isoString) {
  return new Date(isoString + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/** Priority badge colour for HTML email */
function priorityColor(p) {
  return p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#20d9b8";
}

// ── HTML email builder ───────────────────────────────────────────────────────
function buildEmail({ userName, daysAway, sessions, checklistItems }) {
  const label  = daysAway === 1 ? "tomorrow" : `in ${daysAway} days`;
  const target = dateOffset(daysAway);

  const sessionRows = sessions.length
    ? sessions.map(s => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;">
            <strong style="color:#e8f4f0;">${s.title}</strong>
            ${s.subject ? `<span style="color:#7a9aaa;font-size:13px;"> · ${s.subject}</span>` : ""}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;color:#20d9b8;font-family:monospace;white-space:nowrap;">
            ${s.time || "—"}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;">
            <span style="
              background:${priorityColor(s.priority)}22;
              color:${priorityColor(s.priority)};
              border:1px solid ${priorityColor(s.priority)};
              border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;
              text-transform:uppercase;letter-spacing:.06em;">
              ${s.priority || "medium"}
            </span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;color:#7a9aaa;font-size:13px;">
            ${s.duration ? s.duration + " min" : ""}
          </td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:14px;color:#4a7080;text-align:center;">No study sessions due ${label}.</td></tr>`;

  const checklistRows = checklistItems.length
    ? checklistItems.map(i => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;">
            <strong style="color:#e8f4f0;">${i.text}</strong>
            ${i.listName ? `<span style="color:#7a9aaa;font-size:13px;"> · ${i.listName}</span>` : ""}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a3a50;">
            <span style="
              background:${priorityColor(i.priority)}22;
              color:${priorityColor(i.priority)};
              border:1px solid ${priorityColor(i.priority)};
              border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;
              text-transform:uppercase;letter-spacing:.06em;">
              ${i.priority || "medium"}
            </span>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="2" style="padding:14px;color:#4a7080;text-align:center;">No checklist tasks due ${label}.</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1f2d;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:600px;margin:32px auto;padding:0 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f2535,#142d3f);border:1px solid #1a3a50;border-radius:16px 16px 0 0;padding:28px 32px;border-bottom:2px solid #20d9b8;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#20d9b8,#1a9a84);display:inline-flex;align-items:center;justify-content:center;font-size:22px;">📚</div>
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;color:#20d9b8;text-transform:uppercase;">Smart Learning</div>
          <div style="font-size:20px;font-weight:800;color:#e8f4f0;margin:0;">Study Reminder</div>
        </div>
      </div>
      <p style="margin:16px 0 0;color:#7a9aaa;font-size:14px;">
        Hi <strong style="color:#e8f4f0;">${userName}</strong> 👋 — You have upcoming tasks due
        <strong style="color:#20d9b8;">${label}</strong>
        <span style="color:#4a7080;font-size:13px;"> (${prettyDate(target)})</span>.
      </p>
    </div>

    <!-- Study Sessions -->
    <div style="background:#0f2535;border:1px solid #1a3a50;border-top:none;padding:24px 32px;">
      <h2 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#20d9b8;letter-spacing:.1em;text-transform:uppercase;">
        🗓️ Study Sessions
      </h2>
      <table style="width:100%;border-collapse:collapse;background:#142d3f;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#0f2535;">
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Title</th>
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Time</th>
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Priority</th>
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Duration</th>
          </tr>
        </thead>
        <tbody>${sessionRows}</tbody>
      </table>
    </div>

    <!-- Checklist Items -->
    <div style="background:#0f2535;border:1px solid #1a3a50;border-top:none;padding:24px 32px;">
      <h2 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#20d9b8;letter-spacing:.1em;text-transform:uppercase;">
        ✅ Checklist Tasks
      </h2>
      <table style="width:100%;border-collapse:collapse;background:#142d3f;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#0f2535;">
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Task</th>
            <th style="padding:9px 14px;text-align:left;font-size:11px;color:#7a9aaa;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1a3a50;">Priority</th>
          </tr>
        </thead>
        <tbody>${checklistRows}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#142d3f;border:1px solid #1a3a50;border-top:none;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#4a7080;">
        Smart Learning Platform · Sent automatically by your Study Planner
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Core reminder logic ──────────────────────────────────────────────────────
async function sendRemindersForOffset(daysAway) {
  const targetDate = dateOffset(daysAway);
  console.log(`[Reminder] Checking reminders for ${targetDate} (${daysAway}d away)…`);

  // 1. Fetch all sessions on that date
  const sessions = await ScheduleSession.find({ date: targetDate });

  // 2. Fetch all incomplete checklist items due on that date
  const checklistItems = await ChecklistItem.find({
    dueDate:   targetDate,
    completed: false,
  });

  // 3. Collect all affected userIds
  const userIds = new Set([
    ...sessions.map(s => s.userId?.toString()),
    ...checklistItems.map(i => i.listId?.toString()),
  ].filter(Boolean));

  if (userIds.size === 0) {
    console.log(`[Reminder] No upcoming items for ${targetDate}.`);
    return;
  }

  // 4. Resolve checklist listId → userId via Checklist model
  //    (ChecklistItem only stores listId, not userId directly)
  const listIds = [...new Set(checklistItems.map(i => i.listId?.toString()))];
  const lists   = await Checklist.find({ _id: { $in: listIds } });
  const listMap = {};                           // listId → { userId, name }
  lists.forEach(l => {
    listMap[l._id.toString()] = { userId: l.userId?.toString(), name: l.name };
  });

  // Rebuild a proper per-user map
  const userSessionMap      = {};   // userId → [session, …]
  const userChecklistMap    = {};   // userId → [item, …]

  sessions.forEach(s => {
    const uid = s.userId?.toString();
    if (!uid) return;
    if (!userSessionMap[uid]) userSessionMap[uid] = [];
    userSessionMap[uid].push(s);
  });

  checklistItems.forEach(item => {
    const info = listMap[item.listId?.toString()];
    if (!info) return;
    const uid = info.userId;
    if (!uid) return;
    if (!userChecklistMap[uid]) userChecklistMap[uid] = [];
    userChecklistMap[uid].push({ ...item.toObject(), listName: info.name });
  });

  const allUserIds = new Set([
    ...Object.keys(userSessionMap),
    ...Object.keys(userChecklistMap),
  ]);

  // 5. Send one email per user
  for (const uid of allUserIds) {
    try {
      const user = await User.findById(uid).select("name email");
      if (!user || !user.email) continue;

      const html = buildEmail({
        userName:       user.name || "Student",
        daysAway,
        sessions:       userSessionMap[uid]   || [],
        checklistItems: userChecklistMap[uid] || [],
      });

      await transporter.sendMail({
        from:    `"Smart Learning" <${process.env.EMAIL_USER}>`,
        to:      user.email,
        subject: `⏰ Reminder: Tasks due ${daysAway === 1 ? "tomorrow" : `in ${daysAway} days`} — ${prettyDate(targetDate)}`,
        html,
      });

      console.log(`[Reminder] ✅ Sent to ${user.email} (${daysAway}d notice)`);
    } catch (err) {
      console.error(`[Reminder] ❌ Failed for userId ${uid}:`, err.message);
    }
  }
}

// ── Cron jobs ────────────────────────────────────────────────────────────────
//   Runs every day at 08:00 AM IST
//   Change timezone if your users are in a different region

function initReminders() {
  // 1-day-before reminder  →  fires daily at 08:00 IST
  cron.schedule("0 8 * * *", () => sendRemindersForOffset(1), {
    timezone: "Asia/Kolkata",
  });

  // 3-day-before reminder  →  fires daily at 08:00 IST
  cron.schedule("0 8 * * *", () => sendRemindersForOffset(3), {
    timezone: "Asia/Kolkata",
  });

  console.log("[Reminder] Cron jobs initialised (08:00 IST daily for 1-day & 3-day notices)");
}

module.exports = { initReminders, sendRemindersForOffset };