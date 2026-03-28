import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import SubjectPage from "./pages/SubjectPage";
import Subjects from "./pages/Subjects";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile"; // adjust path to wherever Profile.jsx lives
import AIanalyser from "./pages/AIanalyser"; // adjust path to wherever AIanalyser.jsx lives

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/subject/:id" element={<SubjectPage />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analyser" element={<AIanalyser />} />
    </Routes>
  );
}

export default App;