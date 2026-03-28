import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
      if (data.message === "User registered successfully") navigate("/login");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float-blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.05); }
          66%      { transform: translate(-20px,15px) scale(0.97); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fade-in {
          from { opacity:0; } to { opacity:1; }
        }
        .field-wrap { animation: slide-up 0.5s ease both; }
        .field-wrap:nth-child(1) { animation-delay: 0.1s; }
        .field-wrap:nth-child(2) { animation-delay: 0.18s; }
        .field-wrap:nth-child(3) { animation-delay: 0.26s; }
        .field-wrap:nth-child(4) { animation-delay: 0.34s; }

        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0e2235 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        select option { background: #0e2235; color: #fff; }

        .signup-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .signup-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(32,217,184,0.35) !important;
        }
        .signup-btn:active:not(:disabled) { transform: translateY(0); }
        .signup-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }

        .role-card {
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .role-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Animated background blobs */}
      <div style={{ ...S.blob, width: 520, height: 520, top: -120, left: -160,
        background: "radial-gradient(circle, rgba(32,217,184,0.12) 0%, transparent 70%)",
        animationDuration: "9s" }} />
      <div style={{ ...S.blob, width: 400, height: 400, bottom: -80, right: -100,
        background: "radial-gradient(circle, rgba(26,92,122,0.18) 0%, transparent 70%)",
        animationDuration: "12s", animationDelay: "-4s" }} />
      <div style={{ ...S.blob, width: 280, height: 280, top: "40%", right: "15%",
        background: "radial-gradient(circle, rgba(32,217,184,0.07) 0%, transparent 70%)",
        animationDuration: "15s", animationDelay: "-7s" }} />

      {/* Card */}
      <div style={S.card}>

        {/* Left accent bar */}
        <div style={S.accentBar} />

        {/* Logo + heading */}
        <div style={{ animation: "slide-up 0.45s ease both", marginBottom: 32 }}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🎓</div>
            <span style={S.logoText}>Smart Learning</span>
          </div>
          <h1 style={S.heading}>Create account</h1>
          <p style={S.subheading}>Join thousands of students levelling up daily</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name */}
          <div className="field-wrap">
            <label style={S.label}>Full Name</label>
            <div style={{ ...S.inputWrap, borderColor: focused === "name" ? "#20d9b8" : "rgba(255,255,255,0.1)" }}>
              <span style={S.inputIcon}>👤</span>
              <input
                style={S.input}
                type="text"
                name="name"
                placeholder="Alex Morgan"
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field-wrap">
            <label style={S.label}>Email</label>
            <div style={{ ...S.inputWrap, borderColor: focused === "email" ? "#20d9b8" : "rgba(255,255,255,0.1)" }}>
              <span style={S.inputIcon}>✉️</span>
              <input
                style={S.input}
                type="email"
                name="email"
                placeholder="alex@example.com"
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-wrap">
            <label style={S.label}>Password</label>
            <div style={{ ...S.inputWrap, borderColor: focused === "password" ? "#20d9b8" : "rgba(255,255,255,0.1)" }}>
              <span style={S.inputIcon}>🔒</span>
              <input
                style={S.input}
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Min. 8 characters"
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={S.eyeBtn}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="field-wrap">
            <label style={S.label}>I am a</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "user", label: "Student", icon: "🎒" },
                { value: "admin", label: "Admin", icon: "🛠" },
              ].map(({ value, label, icon }) => (
                <div
                  key={value}
                  className="role-card"
                  onClick={() => setForm(f => ({ ...f, role: value }))}
                  style={{
                    ...S.roleCard,
                    borderColor: form.role === value ? "#20d9b8" : "rgba(255,255,255,0.1)",
                    background: form.role === value ? "rgba(32,217,184,0.1)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: form.role === value ? "#20d9b8" : "rgba(255,255,255,0.6)",
                    marginTop: 4,
                  }}>{label}</span>
                  {form.role === value && (
                    <div style={S.roleCheck}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="signup-btn"
            style={{
              ...S.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={S.spinner} /> Creating account...
              </span>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        {/* Login link */}
        <p style={{ ...S.loginLink, animation: "fade-in 0.6s ease 0.5s both" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={S.loginAnchor}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#0d2137",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    animation: "float-blob 9s ease-in-out infinite",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    background: "rgba(10,22,38,0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "40px 40px 32px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    background: "linear-gradient(90deg, #20d9b8, #1a7a9a, transparent)",
    borderRadius: "24px 24px 0 0",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    color: "#20d9b8",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 30,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.15,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 300,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid",
    borderRadius: 12,
    padding: "0 14px",
    transition: "border-color 0.2s",
    height: 50,
  },
  inputIcon: {
    fontSize: 15,
    marginRight: 10,
    flexShrink: 0,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    padding: "0 2px",
    opacity: 0.5,
    transition: "opacity 0.15s",
  },
  roleCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 10px",
    borderRadius: 12,
    border: "1px solid",
    position: "relative",
    userSelect: "none",
    gap: 2,
  },
  roleCheck: {
    position: "absolute",
    top: 8, right: 8,
    width: 18, height: 18,
    borderRadius: "50%",
    background: "#20d9b8",
    color: "#0d2137",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    width: "100%",
    height: 52,
    background: "linear-gradient(135deg,#20d9b8,#1a7a9a)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 0.3,
    boxShadow: "0 4px 20px rgba(32,217,184,0.25)",
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
  loginAnchor: {
    color: "#20d9b8",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};

export default Signup;