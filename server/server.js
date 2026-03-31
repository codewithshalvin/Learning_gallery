require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const Subject = require("./models/Subject");
const Material = require("./models/Material");
const multer = require("multer");
const path = require("path");
const Project = require("./models/Project");
const ProjectItem = require("./models/ProjectItem");
const TimetableSlot   = require("./models/TimetableSlot");
const ScheduleSession = require("./models/ScheduleSession");
const Checklist       = require("./models/Checklist");
const ChecklistItem   = require("./models/ChecklistItem");
const { initReminders } = require("./reminderService");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://learning-gallery-1.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    const result = await User.updateMany(
      { $or: [{ points: { $exists: false } }, { checkins: { $exists: false } }] },
      { $set: { points: 0, checkins: [] } }
    );
    if (result.modifiedCount > 0) {
      console.log("Migration: " + result.modifiedCount + " users patched");
    }
    initReminders(); // ← Email reminder cron jobs started after DB connects
  })
  .catch(err => console.log(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/"); },
  filename:    (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

app.get("/", (req, res) => res.send("API is running..."));

app.get("/test-key", (req, res) => {
  res.json({ mongo: process.env.MONGO_URI ? "MONGO_URI loaded" : "MONGO_URI missing" });
});

app.post("/upload-folder", upload.array("files"), async (req, res) => {
  try {
    const { projectId } = req.body;
    const paths = req.body.paths;
    const files = req.files;
    const items = files.map((file, index) => ({
      projectId,
      name: file.originalname,
      type: file.mimetype.startsWith("image") ? "image" : file.mimetype.includes("pdf") ? "pdf" : "doc",
      file: file.path,
      parentFolder: null,
      folderPath: Array.isArray(paths) ? paths[index] : paths
    }));
    await ProjectItem.insertMany(items);
    res.json({ message: "Folder uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || "user" });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user._id, role: user.role }, "secretkey", { expiresIn: "1d" });
    res.json({ message: "Login successful", token, role: user.role, id: user._id, name: user.name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name points email role avatarUrl avatarGlbUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ name: user.name, points: user.points, email: user.email, role: user.role, avatarUrl: user.avatarUrl || "", avatarGlbUrl: user.avatarGlbUrl || "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/user/:userId", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name cannot be empty" });
    const user = await User.findByIdAndUpdate(req.params.userId, { name: name.trim() }, { new: true })
      .select("name points email role avatarUrl avatarGlbUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ name: user.name, points: user.points, email: user.email, role: user.role, avatarUrl: user.avatarUrl || "", avatarGlbUrl: user.avatarGlbUrl || "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/user/:userId/avatar", async (req, res) => {
  try {
    const { avatarUrl, avatarGlbUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ error: "avatarUrl is required" });
    const user = await User.findByIdAndUpdate(req.params.userId, { avatarUrl, avatarGlbUrl: avatarGlbUrl || "" }, { new: true })
      .select("name points email role avatarUrl avatarGlbUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Avatar saved successfully", avatarUrl: user.avatarUrl, avatarGlbUrl: user.avatarGlbUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/user/:userId/avatar-upload", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const avatarUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.userId, { avatarUrl }, { new: true }).select("name avatarUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/subjects", async (req, res) => {
  try {
    const { userId, subjectName } = req.body;
    const newSubject = new Subject({ userId, subjectName });
    await newSubject.save();
    res.json({ message: "Subject added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/subjects/:userId", async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.params.userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/materials", upload.single("file"), async (req, res) => {
  try {
    const { subjectId, type, title } = req.body;
    let content = "";
    if (type === "note" || type === "link") { content = req.body.content; }
    else { content = req.file.path; }
    const newMaterial = new Material({ subjectId, type, title, content });
    await newMaterial.save();
    res.json({ message: "Material added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/materials/:subjectId", async (req, res) => {
  try {
    const materials = await Material.find({ subjectId: req.params.subjectId });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/projects", async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    const newProject = new Project({ userId, title, description });
    await newProject.save();
    res.json({ message: "Project created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/projects/:userId", async (req, res) => {
  const projects = await Project.find({ userId: req.params.userId });
  res.json(projects);
});

app.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/project-items", upload.single("file"), async (req, res) => {
  try {
    const { projectId, name, type, content } = req.body;
    const newItem = new ProjectItem({
      projectId, name, type,
      content: type === "link" || type === "note" ? content : "",
      file: req.file ? req.file.path : ""
    });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/project-items/:projectId", async (req, res) => {
  try {
    const items = await ProjectItem.find({ projectId: req.params.projectId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/project-items/:id", async (req, res) => {
  try {
    await ProjectItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/checkin", async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const alreadyChecked = user.checkins.find(c => c.date === today);
    if (alreadyChecked) return res.json({ message: "Already checked today" });
    user.checkins.push({ date: today });
    user.points += 2;
    await user.save();
    res.json({ message: "Check-in successful! +2 points", points: user.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(10).select("name points checkins");
    const today = new Date();
    const result = users.map(u => {
      const recentDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const ds = d.toISOString().split("T")[0];
        return u.checkins.some(c => c.date === ds);
      });
      return { _id: u._id, name: u.name, points: u.points, recentDays };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/checkins/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("checkins");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.checkins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role points avatarUrl checkins").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/users/:id", async (req, res) => {
  try {
    const { name, role, points } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role, points: Number(points) }, { new: true })
      .select("name email role points avatarUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/subjects/:id", async (req, res) => {
  try {
    const { subjectName } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { subjectName }, { new: true });
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/subjects/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    await Material.deleteMany({ subjectId: req.params.id });
    res.json({ message: "Subject and materials deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/projects/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await ProjectItem.deleteMany({ projectId: req.params.id });
    res.json({ message: "Project and items deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Manual Notes Analyser (no external API needed) ─────────
app.post("/api/analyse", (req, res) => {
  try {
    const { prompt, system } = req.body;

    // Extract raw notes from prompt
    const notesMatch = prompt.match(/Here are the notes to analyse:\n\n([\s\S]*)/);
    const notes = notesMatch ? notesMatch[1].trim() : prompt.trim();

    if (!notes || notes.length < 10) {
      return res.status(400).json({ error: "Notes content is too short" });
    }

    // ── Helpers ────────────────────────────────────────────
    const sentences = notes
      .replace(/([.?!])\s+/g, "$1|")
      .split("|")
      .map(s => s.trim())
      .filter(s => s.length > 15);

    const words = notes.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const wordCount = words.length;

    const STOP_WORDS = new Set([
      "the","a","an","and","or","but","in","on","at","to","for","of","with",
      "is","are","was","were","be","been","being","have","has","had","do","does",
      "did","will","would","could","should","may","might","shall","that","this",
      "these","those","it","its","i","we","you","he","she","they","their","our",
      "your","his","her","which","who","what","when","where","how","if","then",
      "than","so","as","by","from","up","about","into","through","also","just",
      "not","no","can","more","some","any","all","each","both","most","other",
      "such","use","used","using","one","two","three","first","second","well"
    ]);

    const freq = {};
    words.forEach(w => {
      if (w.length > 3 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => w);

    // ── Subject detection ──────────────────────────────────
    const subjectMap = {
      "Mathematics":      ["equation","formula","theorem","proof","algebra","calculus","matrix","vector","derivative","integral","polynomial","trigonometry","geometry","function","variable"],
      "Physics":          ["force","energy","velocity","acceleration","momentum","gravity","electric","magnetic","wave","quantum","mass","newton","circuit","current","voltage"],
      "Chemistry":        ["atom","molecule","reaction","element","compound","bond","acid","base","electron","proton","neutron","periodic","solution","concentration","mole"],
      "Biology":          ["cell","organism","dna","protein","gene","evolution","species","photosynthesis","metabolism","enzyme","bacteria","virus","tissue","organ","mitosis"],
      "Computer Science": ["algorithm","code","function","class","object","array","loop","variable","database","network","software","hardware","program","compiler","recursion","binary"],
      "History":          ["war","century","empire","revolution","civilization","period","dynasty","battle","treaty","independence","colonial","ancient","medieval","government","king"],
      "Economics":        ["market","supply","demand","price","gdp","inflation","trade","capital","investment","currency","bank","economy","profit","cost","production"],
      "Literature":       ["novel","poem","author","character","theme","plot","narrative","metaphor","symbolism","genre","prose","stanza","protagonist","antagonist","imagery"],
    };

    let subject = "General Studies";
    let maxHits = 0;
    const notesLower = notes.toLowerCase();
    for (const [subj, keywords] of Object.entries(subjectMap)) {
      const hits = keywords.filter(k => notesLower.includes(k)).length;
      if (hits > maxHits) { maxHits = hits; subject = subj; }
    }

    // ── Difficulty ─────────────────────────────────────────
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);
    const uniqueRatio = Object.keys(freq).length / (words.length || 1);
    const difficulty =
      avgWordLen > 6.5 || uniqueRatio > 0.55 ? "Advanced" :
      avgWordLen > 5.0 || uniqueRatio > 0.40 ? "Intermediate" : "Beginner";

    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";

    // ── Title ──────────────────────────────────────────────
    const titleWords = topWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const title = titleWords.length > 0 ? "Notes on " + titleWords.join(", ") : "Study Notes Analysis";

    // ── Key Points ─────────────────────────────────────────
    const paragraphs = notes.split(/\n{2,}/).filter(p => p.trim().length > 20);
    const keyPoints = [];
    paragraphs.forEach(p => {
      const s = p.trim().split(/[.!?]/)[0].trim();
      if (s.length > 10 && s.length < 200) keyPoints.push(s);
    });
    if (keyPoints.length < 3) {
      sentences.slice(0, 6).forEach(s => { if (!keyPoints.includes(s)) keyPoints.push(s); });
    }

    // ── Summary ────────────────────────────────────────────
    const summary = sentences.slice(0, 3).join(" ");

    // ── Important Terms ────────────────────────────────────
    const termPatterns = [
      /([A-Z][a-zA-Z\s]{2,30})\s+(?:is|are|refers to|means|defined as)\s+([^.!?]{10,120})/g,
      /(?:definition of|meaning of|concept of)\s+([a-zA-Z\s]{3,30}):\s*([^.!?]{10,120})/gi,
    ];
    const importantTerms = [];
    const seenTerms = new Set();
    for (const pattern of termPatterns) {
      let match;
      while ((match = pattern.exec(notes)) !== null && importantTerms.length < 8) {
        const term = match[1].trim();
        const def  = match[2].trim();
        if (!seenTerms.has(term.toLowerCase()) && term.length < 40 && def.length > 10) {
          seenTerms.add(term.toLowerCase());
          importantTerms.push({ term, definition: def });
        }
      }
    }
    if (importantTerms.length < 3) {
      topWords.slice(0, 6).forEach(w => {
        if (!seenTerms.has(w)) {
          seenTerms.add(w);
          importantTerms.push({
            term: w.charAt(0).toUpperCase() + w.slice(1),
            definition: "Key concept appearing " + freq[w] + " time(s) in the notes."
          });
        }
      });
    }

    // ── Concepts ───────────────────────────────────────────
    const bulletLines = notes
      .split("\n")
      .map(l => l.replace(/^[-\u2022*>\d.]+\s*/, "").trim())
      .filter(l => l.length > 10 && l.length < 150 && !l.endsWith(":"));
    const concepts = bulletLines.length > 2
      ? bulletLines.slice(0, 8)
      : sentences.slice(3, 9).map(s => s.replace(/^[-\u2022*]\s*/, "").trim()).filter(Boolean);

    // ── Formulas ───────────────────────────────────────────
    const formulaLines = notes
      .split("\n")
      .map(l => l.trim())
      .filter(l =>
        (l.includes("=") && /\d/.test(l)) ||
        /[+\-*/^]/.test(l) ||
        /\b(formula|equation|theorem|law|rule):/i.test(l)
      )
      .slice(0, 6);

    // ── Dates & Events ─────────────────────────────────────
    const dateRegex = /\b(\d{4}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})\b/gi;
    const dateContexts = [];
    const seenDates = new Set();
    let dm;
    while ((dm = dateRegex.exec(notes)) !== null && dateContexts.length < 6) {
      const date = dm[0];
      if (!seenDates.has(date)) {
        seenDates.add(date);
        const start = Math.max(0, dm.index - 40);
        const end   = Math.min(notes.length, dm.index + 60);
        dateContexts.push(notes.slice(start, end).trim().replace(/\s+/g, " "));
      }
    }

    // ── Questions to Review ────────────────────────────────
    const existingQs = notes
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.endsWith("?") && l.length > 10)
      .slice(0, 4);
    const generatedQs = topWords.slice(0, 6).map(w =>
      "What is the significance of \"" + w + "\" in this context?"
    );
    const questionsToReview = [...existingQs, ...generatedQs].slice(0, 8);

    // ── Action Items ───────────────────────────────────────
    const actionItems = [
      "Review and summarise the key points on " + (topWords[0] || "the main topic") + ".",
      "Create flashcards for the " + importantTerms.length + " important terms identified.",
      "Re-read sections covering " + (topWords[1] || "core concepts") + " for deeper understanding.",
      "Answer all " + questionsToReview.length + " review questions without looking at notes.",
      "Discuss the concept of " + (topWords[2] || "the topic") + " with a study partner.",
    ];

    // ── Mode detection ─────────────────────────────────────
    const isQuiz    = system && system.toLowerCase().includes("quiz");
    const isSummary = system && system.toLowerCase().includes("summary only");

    const result = {
      title,
      subject,
      difficulty,
      readTime,
      wordCount,
      keyPoints:         isQuiz ? [] : keyPoints.slice(0, 7),
      summary:           isQuiz ? "These questions test your understanding of the material." : summary,
      importantTerms:    isQuiz ? [] : (isSummary ? importantTerms.slice(0, 5) : importantTerms),
      concepts:          (isQuiz || isSummary) ? [] : concepts.slice(0, 8),
      formulas:          (isQuiz || isSummary) ? [] : formulaLines,
      datesEvents:       (isQuiz || isSummary) ? [] : dateContexts,
      questionsToReview: isQuiz ? questionsToReview : (isSummary ? [] : questionsToReview.slice(0, 5)),
      actionItems:       isQuiz
        ? ["Review the material", "Answer all questions", "Check your answers"]
        : actionItems,
    };

    console.log("Analysed " + wordCount + " words | subject: " + subject + " | difficulty: " + difficulty);
    res.json({ text: JSON.stringify(result) });

  } catch (err) {
    console.error("Error in /api/analyse:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/timetable/:userId", async (req, res) => {
  const slots = await TimetableSlot.find({ userId: req.params.userId });
  res.json(slots);
});

app.post("/timetable", async (req, res) => {
  const slot = new TimetableSlot(req.body);
  await slot.save();
  res.json(slot);
});

app.put("/timetable/:id", async (req, res) => {
  const slot = await TimetableSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(slot);
});

app.delete("/timetable/:id", async (req, res) => {
  await TimetableSlot.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.get("/schedule/:userId", async (req, res) => {
  const data = await ScheduleSession.find({ userId: req.params.userId });
  res.json(data);
});

app.post("/schedule", async (req, res) => {
  const session = new ScheduleSession(req.body);
  await session.save();
  res.json(session);
});

app.put("/schedule/:id", async (req, res) => {
  const session = await ScheduleSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(session);
});

app.delete("/schedule/:id", async (req, res) => {
  await ScheduleSession.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.get("/checklists/:userId", async (req, res) => {
  const lists = await Checklist.find({ userId: req.params.userId });
  const result = await Promise.all(
    lists.map(async (list) => {
      const items = await ChecklistItem.find({ listId: list._id });
      return { ...list.toObject(), items };
    })
  );
  res.json(result);
});

app.post("/checklists", async (req, res) => {
  const list = new Checklist(req.body);
  await list.save();
  res.json(list);
});

app.delete("/checklists/:id", async (req, res) => {
  await Checklist.findByIdAndDelete(req.params.id);
  await ChecklistItem.deleteMany({ listId: req.params.id });
  res.json({ message: "Deleted" });
});

app.post("/checklist-items", async (req, res) => {
  const item = new ChecklistItem(req.body);
  await item.save();
  res.json(item);
});

app.put("/checklist-items/:id", async (req, res) => {
  const item = await ChecklistItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

app.delete("/checklist-items/:id", async (req, res) => {
  await ChecklistItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});