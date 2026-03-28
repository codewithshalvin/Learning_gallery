import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .login-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* Ambient orbs */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    pointer-events: none;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .orb-1 { width: 500px; height: 500px; background: #6c63ff; top: -120px; left: -100px; animation-duration: 14s; }
  .orb-2 { width: 400px; height: 400px; background: #ff6b9d; bottom: -80px; right: -80px; animation-duration: 10s; animation-delay: -4s; }
  .orb-3 { width: 300px; height: 300px; background: #00d4aa; top: 40%; left: 30%; animation-duration: 16s; animation-delay: -7s; }

  @keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.06); }
  }

  /* Left panel */
  .left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 70px;
    position: relative;
    z-index: 1;
  }

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(108,99,255,0.15);
    border: 1px solid rgba(108,99,255,0.3);
    padding: 6px 14px;
    border-radius: 100px;
    color: #a89dff;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 36px;
  }

  .brand-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6c63ff;
    box-shadow: 0 0 8px #6c63ff;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 4vw, 58px);
    color: #f0eeff;
    line-height: 1.12;
    margin-bottom: 20px;
    max-width: 480px;
  }

  .headline em {
    font-style: italic;
    background: linear-gradient(135deg, #6c63ff, #ff6b9d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sub-text {
    color: #7c7c9a;
    font-size: 15px;
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 56px;
    font-weight: 300;
  }

  /* Right panel — form */
  .right-panel {
    width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 48px;
    position: relative;
    z-index: 1;
  }

  .glass-card {
    width: 100%;
    background: rgba(16,16,28,0.7);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 28px;
    padding: 48px 40px;
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
    animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .form-eyebrow {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6c63ff;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #f0eeff;
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .form-sub {
    font-size: 14px;
    color: #5a5a7a;
    margin-bottom: 36px;
    font-weight: 300;
  }

  .form-sub a { color: #a89dff; text-decoration: none; font-weight: 400; }
  .form-sub a:hover { color: #6c63ff; }

  /* Field */
  .field-group {
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    color: #7c7c9a;
    font-weight: 500;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .field-wrap {
    position: relative;
  }

  .field-icon {
    position: absolute;
    left: 16px; top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    pointer-events: none;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 14px 16px 14px 46px;
    color: #f0eeff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    outline: none;
  }

  .field-input::placeholder { color: #3a3a5a; }

  .field-input:focus {
    border-color: rgba(108,99,255,0.5);
    background: rgba(108,99,255,0.06);
    box-shadow: 0 0 0 4px rgba(108,99,255,0.1);
  }

  .field-input:focus + .field-icon-overlay,
  .field-wrap:focus-within .field-icon {
    opacity: 0.9;
  }

  /* Password toggle */
  .eye-btn {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #5a5a7a;
    font-size: 16px;
    padding: 4px;
    transition: color 0.2s;
  }
  .eye-btn:hover { color: #a89dff; }

  /* Row */
  .row-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .check-wrap {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer;
  }

  .custom-check {
    width: 16px; height: 16px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px;
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .custom-check.checked {
    background: #6c63ff;
    border-color: #6c63ff;
  }

  .check-label { font-size: 13px; color: #7c7c9a; }

  .forgot-link {
    font-size: 13px; color: #6c63ff;
    text-decoration: none; font-weight: 500;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: #a89dff; }

  /* Submit btn */
  .submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #6c63ff 0%, #9b59ff 100%);
    border: none;
    border-radius: 14px;
    padding: 15px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 8px 24px rgba(108,99,255,0.35);
    letter-spacing: 0.3px;
  }

  .submit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(108,99,255,0.5);
  }
  .submit-btn:hover::after { opacity: 1; }
  .submit-btn:active { transform: translateY(0); }

  .submit-btn:disabled {
    opacity: 0.6; cursor: not-allowed; transform: none;
  }

  .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Error toast */
  .error-toast {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #ff8080;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
    animation: slideUp 0.3s ease both;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .left-panel { display: none; }
    .right-panel { width: 100%; }
    .login-root { justify-content: center; }
  }
`;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("${BASE}/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.name);
        localStorage.setItem("email", form.email); // ← added for Profile page
        navigate(data.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Left panel */}
        <div className="left-panel">
          <div className="brand-badge">Smart Learning Gallery</div>

          <h1 className="headline">
            Unlock your <em>academic</em> universe today
          </h1>

          <p className="sub-text">
            Join thousands of students exploring curated knowledge, interactive
            lessons, and immersive learning experiences — all in one place.
          </p>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="glass-card">
            <p className="form-eyebrow">Welcome back</p>
            <h2 className="form-title">Sign in to learn</h2>
            <p className="form-sub">
              New here?{" "}
              <a href="/register">Create your free account →</a>
            </p>

            {error && (
              <div className="error-toast">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="field-group">
                <label className="field-label">Email address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉️</span>
                  <input
                    className="field-input"
                    type="email"
                    name="email"
                    placeholder="you@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">🔒</span>
                  <input
                    className="field-input"
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="row-between">
                <label
                  className="check-wrap"
                  onClick={() => setRemember(!remember)}
                >
                  <div className={`custom-check ${remember ? "checked" : ""}`}>
                    {remember && "✓"}
                  </div>
                  <span className="check-label">Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                <span className="btn-inner">
                  {loading ? (
                    <>
                      <span className="spinner" /> Signing in…
                    </>
                  ) : (
                    <>Enter the Gallery &nbsp;→</>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}