import { useNavigate } from "react-router-dom";
import BASE from "../api";  // goes up one folder to src/
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --teal: #00C9A7;
    --orange: #FF6B35;
    --purple: #7B5EA7;
    --blue: #4FACFE;
    --green: #43E97B;
    --yellow: #FFD166;
    --pink: #FF6B9D;
    --bg: #F0FDF8;
    --card-bg: #ffffff;
    --text: #1a2e2a;
    --muted: #6b8f85;
  }

  body { background: var(--bg); }

  .slg-root {
    min-height: 100vh;
    font-family: 'Nunito', sans-serif;
    background: var(--bg);
    overflow-x: hidden;
  }

  /* ─── NAV ─── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 48px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(16px);
    border-bottom: 2px solid #e0f7f0;
    animation: slideDown 0.5s ease both;
  }
  @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }

  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Baloo 2', cursive;
    font-size: 22px; font-weight: 800; color: var(--teal);
    text-decoration: none;
  }
  .nav-logo-box {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, var(--teal), var(--blue));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 14px rgba(0,201,167,0.35);
  }

  .nav-links { display: flex; gap: 4px; align-items: center; }
  .nav-link {
    font-size: 14px; font-weight: 700; color: var(--muted);
    text-decoration: none; padding: 8px 16px; border-radius: 30px;
    border: none; background: none; font-family: 'Nunito', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }
  .nav-link:hover { background: #e8faf5; color: var(--teal); }
  .nav-link.active { color: var(--teal); border-bottom: 2px solid var(--teal); border-radius: 0; }

  .nav-right { display: flex; align-items: center; gap: 10px; }
  .nav-signin {
    font-size: 14px; font-weight: 700; color: var(--teal);
    background: none; border: 2px solid var(--teal);
    border-radius: 30px; padding: 8px 20px;
    cursor: pointer; font-family: 'Nunito', sans-serif;
    transition: all 0.2s;
  }
  .nav-signin:hover { background: var(--teal); color: #fff; }
  .nav-getstarted {
    font-size: 14px; font-weight: 800;
    background: linear-gradient(135deg, var(--teal), var(--blue));
    color: #fff; border: none; border-radius: 30px;
    padding: 10px 24px; cursor: pointer;
    font-family: 'Nunito', sans-serif;
    box-shadow: 0 4px 16px rgba(0,201,167,0.4);
    transition: all 0.2s;
  }
  .nav-getstarted:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,201,167,0.5); }

  /* ─── HERO ─── */
  .hero {
    min-height: 100vh;
    position: relative;
    display: flex; flex-direction: column;
    align-items: center;
    padding-top: 80px;
    overflow: hidden;
  }

  /* curved teal wave background */
  .hero-wave {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 70%;
    background: linear-gradient(160deg, #00C9A7 0%, #4FACFE 100%);
    clip-path: ellipse(110% 75% at 50% 0%);
    z-index: 0;
  }

  .hero-content {
    position: relative; z-index: 2;
    text-align: center;
    padding: 60px 24px 0;
    max-width: 780px;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.5);
    padding: 6px 18px; border-radius: 100px;
    color: #fff; font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 20px;
    animation: popIn 0.6s 0.2s ease both;
  }
  .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--yellow); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.8)} }

  .hero-title {
    font-family: 'Baloo 2', cursive;
    font-size: clamp(38px, 6vw, 70px);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 18px;
    animation: popIn 0.6s 0.3s ease both;
    text-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .hero-title span { color: var(--yellow); }

  .hero-sub {
    font-size: 17px; color: rgba(255,255,255,0.88);
    font-weight: 600; line-height: 1.7;
    max-width: 540px; margin: 0 auto 36px;
    animation: popIn 0.6s 0.4s ease both;
  }

  .hero-btns {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    animation: popIn 0.6s 0.5s ease both;
    margin-bottom: 50px;
  }
  .btn-hero-primary {
    background: var(--yellow); color: #1a2e2a;
    font-size: 16px; font-weight: 800;
    font-family: 'Nunito', sans-serif;
    border: none; border-radius: 30px;
    padding: 14px 34px; cursor: pointer;
    box-shadow: 0 6px 20px rgba(255,209,102,0.5);
    transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .btn-hero-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(255,209,102,0.6); }
  .btn-hero-ghost {
    background: rgba(255,255,255,0.2);
    border: 2px solid rgba(255,255,255,0.6);
    color: #fff;
    font-size: 16px; font-weight: 700;
    font-family: 'Nunito', sans-serif;
    border-radius: 30px; padding: 14px 34px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-hero-ghost:hover { background: rgba(255,255,255,0.3); transform: translateY(-3px); }

  @keyframes popIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── FEATURE CAROUSEL (subject cards) ─── */
  .explore-band {
    position: relative; z-index: 2;
    width: 100%;
    padding: 0 0 20px;
    animation: popIn 0.7s 0.6s ease both;
  }
  .explore-label {
    text-align: center; font-size: 12px; font-weight: 800;
    color: rgba(255,255,255,0.7); letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .explore-label::before, .explore-label::after {
    content: ''; flex: 1; max-width: 80px;
    height: 1px; background: rgba(255,255,255,0.3);
  }

  .cards-scroll {
    display: flex; gap: 16px;
    padding: 8px 48px 20px;
    overflow-x: auto;
    scrollbar-width: none;
    justify-content: center;
    flex-wrap: wrap;
  }
  .cards-scroll::-webkit-scrollbar { display: none; }

  .feature-chip {
    background: #fff;
    border-radius: 22px;
    padding: 20px 22px;
    min-width: 170px;
    text-align: center;
    box-shadow: 0 8px 28px rgba(0,0,0,0.1);
    transition: all 0.25s;
    cursor: pointer;
    position: relative; overflow: hidden;
    flex-shrink: 0;
  }
  .feature-chip:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }
  .feature-chip .chip-emoji { font-size: 38px; margin-bottom: 10px; display: block; }
  .feature-chip .chip-name {
    font-family: 'Baloo 2', cursive;
    font-size: 14px; font-weight: 700; color: #1a2e2a;
    line-height: 1.2;
  }
  .feature-chip.c1 { border-top: 4px solid var(--orange); }
  .feature-chip.c2 { border-top: 4px solid var(--blue); }
  .feature-chip.c3 { border-top: 4px solid var(--green); }
  .feature-chip.c4 { border-top: 4px solid var(--purple); }
  .feature-chip.c5 { border-top: 4px solid var(--pink); }

  /* ─── FEATURES SECTION ─── */
  .features-section {
    position: relative; z-index: 1;
    padding: 90px 48px;
    background: var(--bg);
    max-width: 1200px; margin: 0 auto;
  }

  .section-eyebrow {
    font-size: 12px; font-weight: 800; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--teal);
    text-align: center; margin-bottom: 12px;
  }
  .section-heading {
    font-family: 'Baloo 2', cursive;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 800; color: var(--text);
    text-align: center; line-height: 1.15;
    margin-bottom: 56px;
  }
  .section-heading span { color: var(--teal); }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 24px;
  }

  .feat-card {
    background: #fff;
    border-radius: 24px;
    padding: 36px 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 2px solid transparent;
    transition: all 0.28s;
    position: relative; overflow: hidden;
  }
  .feat-card:hover { transform: translateY(-8px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }
  .feat-card.fc-teal:hover { border-color: var(--teal); }
  .feat-card.fc-orange:hover { border-color: var(--orange); }
  .feat-card.fc-purple:hover { border-color: var(--purple); }
  .feat-card.fc-blue:hover { border-color: var(--blue); }
  .feat-card.fc-green:hover { border-color: var(--green); }
  .feat-card.fc-pink:hover { border-color: var(--pink); }

  .feat-icon-wrap {
    width: 60px; height: 60px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin-bottom: 20px;
  }
  .fi-teal   { background: #e0faf4; }
  .fi-orange { background: #fff0e8; }
  .fi-purple { background: #f0ebff; }
  .fi-blue   { background: #e8f4ff; }
  .fi-green  { background: #e8fff0; }
  .fi-pink   { background: #fff0f6; }

  .feat-tag {
    display: inline-block; font-size: 10px; font-weight: 800;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px; margin-bottom: 12px;
  }
  .ft-teal   { background: #e0faf4; color: var(--teal); }
  .ft-orange { background: #fff0e8; color: var(--orange); }
  .ft-purple { background: #f0ebff; color: var(--purple); }
  .ft-blue   { background: #e8f4ff; color: var(--blue); }
  .ft-green  { background: #e8fff0; color: var(--green); }
  .ft-pink   { background: #fff0f6; color: var(--pink); }

  .feat-title {
    font-family: 'Baloo 2', cursive;
    font-size: 20px; font-weight: 800; color: var(--text);
    margin-bottom: 8px;
  }
  .feat-desc {
    font-size: 14px; color: var(--muted);
    line-height: 1.7; font-weight: 600;
  }

  /* ─── UPLOAD SECTION ─── */
  .upload-section {
    background: linear-gradient(160deg, #1a2e2a 0%, #1e3d4a 100%);
    padding: 90px 48px;
    position: relative; overflow: hidden;
  }
  .upload-section::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(0,201,167,0.08);
  }
  .upload-section::after {
    content: '';
    position: absolute; bottom: -60px; left: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(79,172,254,0.08);
  }

  .upload-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
    position: relative; z-index: 1;
  }

  .upload-text .section-eyebrow { text-align: left; }
  .upload-text .section-heading { text-align: left; color: #fff; }
  .upload-text .section-heading span { color: var(--teal); }
  .upload-text p {
    font-size: 15px; color: rgba(255,255,255,0.6);
    font-weight: 600; line-height: 1.7; margin-bottom: 28px;
  }

  .upload-types {
    display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px;
  }
  .upload-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.8);
    font-size: 13px; font-weight: 700;
    padding: 8px 16px; border-radius: 30px;
    transition: all 0.2s;
  }
  .upload-pill:hover { background: rgba(0,201,167,0.15); border-color: var(--teal); color: var(--teal); }

  .upload-visual {
    background: rgba(255,255,255,0.04);
    border: 2px dashed rgba(0,201,167,0.3);
    border-radius: 28px;
    padding: 48px 36px;
    text-align: center;
    position: relative;
    transition: all 0.3s;
  }
  .upload-visual:hover { border-color: var(--teal); background: rgba(0,201,167,0.05); }
  .upload-visual-icon { font-size: 56px; margin-bottom: 16px; display: block; }
  .upload-visual-text {
    font-family: 'Baloo 2', cursive;
    font-size: 20px; font-weight: 800; color: #fff;
    margin-bottom: 8px;
  }
  .upload-visual-sub {
    font-size: 13px; color: rgba(255,255,255,0.4);
    font-weight: 600; margin-bottom: 24px;
  }
  .upload-formats {
    display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
  }
  .format-badge {
    background: rgba(255,255,255,0.08);
    color: var(--teal); font-size: 11px; font-weight: 800;
    padding: 4px 12px; border-radius: 20px;
    letter-spacing: 0.5px;
  }

  /* ─── AVATAR SECTION ─── */
  .avatar-section {
    padding: 90px 48px;
    max-width: 1200px; margin: 0 auto;
  }
  .avatar-inner {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .avatar-visual {
    display: flex; justify-content: center;
    position: relative;
  }
  .avatar-stage {
    width: 280px; height: 280px;
    background: linear-gradient(135deg, #e0faf4, #e8f4ff);
    border-radius: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 120px;
    box-shadow: 0 20px 60px rgba(0,201,167,0.15);
    position: relative;
  }
  .avatar-bubbles {
    position: absolute; inset: 0; pointer-events: none;
  }
  .avatar-bubble {
    position: absolute;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 800; color: var(--text);
    padding: 8px 14px;
    white-space: nowrap;
  }
  .ab-1 { top: -20px; left: -40px; }
  .ab-2 { bottom: -16px; left: -30px; }
  .ab-3 { top: 60px; right: -50px; }
  .ab-4 { bottom: 30px; right: -44px; }

  .color-swatches {
    display: flex; gap: 8px; margin-top: 20px; justify-content: center;
  }
  .swatch {
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  }
  .swatch:hover { transform: scale(1.25); }

  /* ─── AI ANALYSER SECTION ─── */
  .ai-section {
    background: linear-gradient(135deg, #f8f0ff, #fff0f6, #e8f4ff);
    padding: 90px 48px;
    position: relative;
  }
  .ai-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .ai-chat-mock {
    background: #fff;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(123,94,167,0.15);
    border: 2px solid rgba(123,94,167,0.1);
  }
  .ai-chat-header {
    background: linear-gradient(135deg, var(--purple), var(--pink));
    padding: 16px 22px;
    display: flex; align-items: center; gap: 12px;
  }
  .ai-chat-header .ai-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.5); }
  .ai-chat-title { font-weight: 800; color: #fff; font-size: 14px; }
  .ai-chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }

  .ai-msg {
    padding: 12px 16px; border-radius: 16px;
    font-size: 13px; line-height: 1.6; font-weight: 600; max-width: 85%;
  }
  .ai-msg.bot {
    background: #f0ebff; color: var(--purple);
    border-bottom-left-radius: 4px; align-self: flex-start;
  }
  .ai-msg.user {
    background: linear-gradient(135deg, var(--teal), var(--blue));
    color: #fff;
    border-bottom-right-radius: 4px; align-self: flex-end;
  }
  .ai-chat-input {
    margin: 0 20px 20px;
    background: #f8f8f8; border: 2px solid #eee;
    border-radius: 16px; padding: 12px 16px;
    font-size: 13px; color: #aaa; font-family: 'Nunito', sans-serif;
    font-weight: 600; display: flex; align-items: center; justify-content: space-between;
  }
  .ai-send-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, var(--purple), var(--pink));
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: #fff;
  }

  /* ─── STATS STRIP ─── */
  .stats-strip {
    background: #fff;
    padding: 50px 48px;
    display: flex; justify-content: center;
    gap: 0;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.04);
  }
  .stat-item {
    flex: 1; max-width: 220px;
    text-align: center;
    padding: 0 28px;
    position: relative;
  }
  .stat-item + .stat-item::before {
    content: ''; position: absolute; left: 0; top: 10%; bottom: 10%;
    width: 1px; background: #eee;
  }
  .stat-number {
    font-family: 'Baloo 2', cursive;
    font-size: 44px; font-weight: 800; color: var(--text);
    line-height: 1; margin-bottom: 6px;
  }
  .stat-number span { color: var(--teal); }
  .stat-label { font-size: 13px; font-weight: 700; color: var(--muted); }

  /* ─── CTA ─── */
  .cta-section {
    padding: 90px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-wave-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #00C9A7 0%, #4FACFE 100%);
    clip-path: ellipse(80% 90% at 50% 50%);
    opacity: 0.08;
  }
  .cta-content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
  .cta-emoji { font-size: 60px; margin-bottom: 16px; display: block; }
  .cta-title {
    font-family: 'Baloo 2', cursive;
    font-size: clamp(30px, 5vw, 52px); font-weight: 800;
    color: var(--text); margin-bottom: 14px;
  }
  .cta-title span { color: var(--teal); }
  .cta-sub { font-size: 16px; color: var(--muted); font-weight: 600; margin-bottom: 36px; line-height: 1.7; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  .btn-cta-primary {
    background: linear-gradient(135deg, var(--teal), var(--blue));
    color: #fff; font-size: 16px; font-weight: 800;
    font-family: 'Nunito', sans-serif;
    border: none; border-radius: 30px;
    padding: 16px 38px; cursor: pointer;
    box-shadow: 0 8px 28px rgba(0,201,167,0.4);
    transition: all 0.2s;
  }
  .btn-cta-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,201,167,0.55); }
  .btn-cta-outline {
    background: transparent;
    border: 2px solid var(--teal);
    color: var(--teal); font-size: 16px; font-weight: 800;
    font-family: 'Nunito', sans-serif;
    border-radius: 30px; padding: 16px 38px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-cta-outline:hover { background: var(--teal); color: #fff; transform: translateY(-3px); }

  /* ─── FOOTER ─── */
  .footer {
    background: #1a2e2a;
    padding: 36px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo-wrap {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Baloo 2', cursive; font-size: 18px; font-weight: 800; color: var(--teal);
  }
  .footer-links { display: flex; gap: 20px; }
  .footer-link {
    font-size: 13px; font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-decoration: none; cursor: pointer;
    transition: color 0.2s; background: none; border: none;
    font-family: 'Nunito', sans-serif;
  }
  .footer-link:hover { color: var(--teal); }
  .footer-socials { display: flex; gap: 12px; }
  .social-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; transition: all 0.2s;
  }
  .social-btn:hover { background: var(--teal); transform: translateY(-2px); }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); font-weight: 600; width: 100%; text-align: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 900px) {
    .nav { padding: 14px 24px; }
    .nav-links { display: none; }
    .upload-inner, .avatar-inner, .ai-inner { grid-template-columns: 1fr; }
    .upload-section, .features-section, .avatar-section, .ai-section, .cta-section { padding: 60px 24px; }
    .stats-strip { flex-wrap: wrap; gap: 28px; padding: 40px 24px; }
    .stat-item::before { display: none; }
    .footer { padding: 28px 24px; flex-direction: column; align-items: center; text-align: center; }
    .footer-links { flex-wrap: wrap; justify-content: center; }
  }
`;

const featureChips = [
  { emoji: "🧠", name: "AI Note Analyser", cls: "c1" },
  { emoji: "🎨", name: "Avatar Creator", cls: "c2" },
  { emoji: "📊", name: "Progress Tracker", cls: "c3" },
  { emoji: "🗂️", name: "Smart Gallery", cls: "c4" },
  { emoji: "🔗", name: "Link Importer", cls: "c5" },
];

const features = [
  { icon: "🎭", fi: "fi-teal", fc: "fc-teal", ft: "ft-teal", tag: "Avatar", title: "Create Your Avatar", desc: "Design a unique character that represents you across your learning journey. Customize looks, outfits, and accessories." },
  { icon: "🧠", fi: "fi-purple", fc: "fc-purple", ft: "ft-purple", tag: "AI Powered", title: "AI Note Analyser", desc: "Drop in your notes and let AI summarize key points, generate questions, and highlight what matters most." },
  { icon: "📈", fi: "fi-blue", fc: "fc-blue", ft: "ft-blue", tag: "Progress", title: "Student Dashboard", desc: "Track subjects, view streaks, see your XP grow, and get personalized insights on your learning progress." },
  { icon: "🔗", fi: "fi-orange", fc: "fc-orange", ft: "ft-orange", tag: "Import", title: "Link Importer", desc: "Paste any URL — YouTube, articles, web pages — and we'll extract & save the key knowledge automatically." },
  { icon: "📄", fi: "fi-green", fc: "fc-green", ft: "ft-green", tag: "Upload", title: "PDF & Image Upload", desc: "Upload PDFs, images, and handwritten notes. AI reads and organizes everything into your personal gallery." },
  { icon: "🏆", fi: "fi-pink", fc: "fc-pink", ft: "ft-pink", tag: "Social", title: "Leaderboard", desc: "Compete with peers, earn badges, and climb the leaderboard as you hit learning milestones every week." },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div className="slg-root">

        {/* ── NAV ── */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-box">📚</div>
            Smart Learning Gallery
          </div>
          <div className="nav-links">
            {["Dashboard","Subjects","Projects","Leaderboard","Profile"].map(l => (
              <button key={l} className="nav-link">{l}</button>
            ))}
          </div>
          <div className="nav-right">
            <button className="nav-signin" onClick={() => navigate("/login")}>Sign In</button>
            <button className="nav-getstarted" onClick={() => navigate("/signup")}>Get Started 🚀</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-wave" />
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              Your personal learning universe
            </div>
            <h1 className="hero-title">
              Learn Smarter,<br />
              <span>Not Harder</span> ✨
            </h1>
            <p className="hero-sub">
              Upload notes, PDFs & links — let AI analyse them. Build your avatar, track your progress, and make learning an adventure.
            </p>
            <div className="hero-btns">
              <button className="btn-hero-primary" onClick={() => navigate("/signup")}>
                🚀 Start for Free
              </button>
              <button className="btn-hero-ghost" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
          </div>

          {/* Feature chips */}
          <div className="explore-band">
            <div className="explore-label">Explore Features</div>
            <div className="cards-scroll">
              {featureChips.map((c, i) => (
                <div className={`feature-chip ${c.cls}`} key={i}>
                  <span className="chip-emoji">{c.emoji}</span>
                  <span className="chip-name">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <div className="features-section">
          <p className="section-eyebrow">Why students love it</p>
          <h2 className="section-heading">Everything you need to <span>learn better</span></h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className={`feat-card ${f.fc}`} key={i}>
                <div className={`feat-icon-wrap ${f.fi}`}>{f.icon}</div>
                <span className={`feat-tag ${f.ft}`}>{f.tag}</span>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── UPLOAD SECTION ── */}
        <div className="upload-section">
          <div className="upload-inner">
            <div className="upload-text">
              <p className="section-eyebrow">Smart Import</p>
              <h2 className="section-heading">Upload <span>anything</span>,<br/>learn everything</h2>
              <p>Drop your study materials and let our AI do the heavy lifting — it reads, summarises, and organises everything into your gallery automatically.</p>
              <div className="upload-types">
                {[["📄","PDF Files"],["🔗","Web Links"],["🖼️","Images"],["📝","Handwritten Notes"],["🎬","YouTube Links"],["📋","Text Files"]].map(([e,l]) => (
                  <span className="upload-pill" key={l}>{e} {l}</span>
                ))}
              </div>
              <button className="btn-cta-primary" style={{fontSize:'15px',padding:'13px 30px'}} onClick={() => navigate("/signup")}>
                Try it free →
              </button>
            </div>
            <div className="upload-visual">
              <span className="upload-visual-icon">📥</span>
              <div className="upload-visual-text">Drop your files here</div>
              <div className="upload-visual-sub">or paste a link to import</div>
              <div className="upload-formats">
                {["PDF","PNG","JPG","TXT","URL","MP4"].map(f => (
                  <span className="format-badge" key={f}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── AVATAR SECTION ── */}
        <div className="avatar-section">
          <div className="avatar-inner">
            <div className="avatar-visual">
              <div className="avatar-stage">
                🧑‍🎓
                <div className="avatar-bubbles">
                  <div className="avatar-bubble ab-1">🎨 Customize</div>
                  <div className="avatar-bubble ab-2">🏆 Level 12</div>
                  <div className="avatar-bubble ab-3">⭐ 1240 XP</div>
                  <div className="avatar-bubble ab-4">🔥 14 day streak</div>
                </div>
              </div>
              <div className="color-swatches">
                {["#FF6B35","#00C9A7","#7B5EA7","#4FACFE","#FF6B9D","#FFD166"].map(c => (
                  <div className="swatch" key={c} style={{background:c}} />
                ))}
              </div>
            </div>
            <div>
              <p className="section-eyebrow">Avatar Creator</p>
              <h2 className="section-heading">Your <span>unique</span><br/>learning identity</h2>
              <p style={{fontSize:'15px',color:'var(--muted)',fontWeight:600,lineHeight:1.7,marginBottom:24}}>
                Create a personalized avatar that grows with you. Unlock outfits, accessories, and badges as you hit learning milestones. Make studying feel like a game.
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:28}}>
                {["🎩 Outfits","🌈 Colors","🐾 Pets","🎖️ Badges","✨ Effects","🏅 Ranks"].map(t => (
                  <span key={t} style={{background:'#e0faf4',color:'var(--teal)',fontSize:13,fontWeight:800,padding:'7px 16px',borderRadius:30}}>{t}</span>
                ))}
              </div>
              <button className="btn-cta-primary" style={{fontSize:'15px',padding:'13px 30px'}} onClick={() => navigate("/signup")}>
                Create my avatar →
              </button>
            </div>
          </div>
        </div>

        {/* ── AI ANALYSER SECTION ── */}
        <div className="ai-section">
          <div className="ai-inner">
            <div>
              <p className="section-eyebrow">AI Powered</p>
              <h2 className="section-heading">Meet your<br/><span>AI Study Buddy</span></h2>
              <p style={{fontSize:'15px',color:'var(--muted)',fontWeight:600,lineHeight:1.7,marginBottom:24}}>
                Upload any note, PDF, or paste a link. Our AI instantly summarises key concepts, creates flashcards, generates quiz questions, and explains hard topics in simple terms.
              </p>
              {[["📝","Instant summaries from any content"],["❓","Auto-generated quiz questions"],["🔍","Key term highlighting & definitions"],["🗂️","Smart topic categorisation"]].map(([e,t]) => (
                <div key={t} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <span style={{fontSize:20}}>{e}</span>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{t}</span>
                </div>
              ))}
              <button className="btn-cta-primary" style={{marginTop:24,fontSize:'15px',padding:'13px 30px'}} onClick={() => navigate("/signup")}>
                Try AI Analyser →
              </button>
            </div>
            <div className="ai-chat-mock">
              <div className="ai-chat-header">
                <div className="ai-dot" />
                <div className="ai-dot" />
                <span className="ai-chat-title">🧠 AI Note Analyser</span>
              </div>
              <div className="ai-chat-body">
                <div className="ai-msg bot">📄 I've analysed your Biology notes! Here's a quick summary of Chapter 3: Cell Division...</div>
                <div className="ai-msg user">Can you make flashcards from my PDF?</div>
                <div className="ai-msg bot">✅ Done! I created 12 flashcards covering Mitosis, Meiosis and key vocabulary. Want to start a quiz? 🎯</div>
                <div className="ai-msg user">Yes! Also explain Mitosis simply</div>
                <div className="ai-msg bot">🔬 Mitosis is how your body makes copies of cells — like a photocopier for DNA! It happens in 4 steps...</div>
              </div>
              <div className="ai-chat-input">
                <span>Ask about your notes...</span>
                <button className="ai-send-btn">→</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-strip">
          {[["10K+","Active Students"],["50K+","Notes Analysed"],["98%","Love It"],["4.9★","App Rating"]].map(([n,l]) => (
            <div className="stat-item" key={l}>
              <div className="stat-number"><span>{n}</span></div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="cta-section">
          <div className="cta-wave-bg" />
          <div className="cta-content">
            <span className="cta-emoji">🚀</span>
            <h2 className="cta-title">Ready to transform<br/>how you <span>learn?</span></h2>
            <p className="cta-sub">Join thousands of students already building their personal knowledge gallery. It's free to start.</p>
            <div className="cta-btns">
              <button className="btn-cta-primary" onClick={() => navigate("/signup")}>Create your account →</button>
              <button className="btn-cta-outline" onClick={() => navigate("/login")}>I have an account</button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-logo-wrap">
            <div className="nav-logo-box" style={{width:34,height:34,fontSize:16}}>📚</div>
            SLG
          </div>
          <div className="footer-links">
            {["About","Community","Help","Privacy","Terms"].map(l => (
              <button key={l} className="footer-link">{l}</button>
            ))}
          </div>
          <div className="footer-socials">
            {["📘","📸","💬","🎵"].map((s,i) => (
              <button key={i} className="social-btn">{s}</button>
            ))}
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} Smart Learning Gallery · Made with ❤️ for curious minds</div>
        </footer>

      </div>
    </>
  );
}