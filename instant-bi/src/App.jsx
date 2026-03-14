import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  Send, Database, LayoutDashboard, MessageSquare,
  Upload, Loader2, AlertCircle, TrendingUp, Info, ChevronRight, Download,
  Zap, BarChart2, ArrowRight, Github, Twitter, Linkedin, Sun, Moon
} from 'lucide-react';

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODELS = [
  "openrouter/auto",                          // auto-picks best available free model
  "meta-llama/llama-3.3-70b-instruct:free",  // confirmed working March 2026
  "meta-llama/llama-3.1-8b-instruct:free",   // confirmed working March 2026
  "mistralai/mistral-small-3.1-24b-instruct:free", // confirmed working
  "deepseek/deepseek-r1-distill-llama-8b:free",    // confirmed working
];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ─── Theme tokens ────────────────────────────
const T = {
  light: {
    bg: '#fafafa', bg2: '#ffffff', bg3: '#f5f5ff', bg4: '#f0f0f8',
    border: '#e8e8f0', border2: '#c7d2fe',
    text: '#0d0b1a', text2: '#555', text3: '#999', text4: '#bbb',
    navBg: 'rgba(250,250,250,0.92)',
    heroBg: 'linear-gradient(160deg,#fafafa 55%,#f0f0ff 100%)',
    sectionBg: '#ffffff', sectionBg2: '#fafafa',
    footerBg: '#0d0b1a', footerText: '#555', footerLink: '#666',
    cardBg: '#ffffff', cardHoverShadow: '0 20px 60px rgba(99,102,241,0.1)',
    inputBg: '#f7f7fb', inputBorder: '#e8e8f0',
    msgUser: '#0d0b1a', msgAi: '#ffffff', msgAiText: '#333',
    msgSys: '#f0f0ff', msgSysText: '#6366f1', msgSysBorder: '#e0e7ff',
    emptyIcon: '#ffffff', sidebarBg: '#ffffff',
    orb1: 'rgba(99,102,241,0.12)', orb2: 'rgba(139,92,246,0.08)', orb3: 'rgba(16,185,129,0.06)',
    gridLine: 'rgba(99,102,241,0.04)',
    toggleBg: '#f0f0f8', toggleColor: '#555',
    errorBg: '#fff1f2', errorBorder: '#fecdd3', errorText: '#e11d48', errorBody: '#be123c',
    chartGrid: '#f1f1f8', chartTick: '#bbb', chartCard: '#ffffff', chartCardBorder: '#e8e8f0',
    infoIconBg: '#f5f5ff',
    exportBtn: '#ffffff', exportBtnBorder: '#e8e8f0', exportBtnText: '#555',
    insightBg: '#ffffff', insightIcon: '#f5f5ff',
    suggBg: '#f5f5ff', suggText: '#555',
  },
  dark: {
    bg: '#0d0b1a', bg2: '#12102a', bg3: '#1a1740', bg4: '#1e1b3a',
    border: '#2a2750', border2: '#4f46e5',
    text: '#f0efff', text2: '#b0aed0', text3: '#6b69a0', text4: '#4a4870',
    navBg: 'rgba(13,11,26,0.92)',
    heroBg: 'linear-gradient(160deg,#0d0b1a 55%,#1a1740 100%)',
    sectionBg: '#12102a', sectionBg2: '#0d0b1a',
    footerBg: '#080714', footerText: '#3a3860', footerLink: '#4a4870',
    cardBg: '#1a1740', cardHoverShadow: '0 20px 60px rgba(99,102,241,0.2)',
    inputBg: '#1a1740', inputBorder: '#2a2750',
    msgUser: '#6366f1', msgAi: '#1a1740', msgAiText: '#d0cef5',
    msgSys: '#1e1b3a', msgSysText: '#818cf8', msgSysBorder: '#2a2750',
    emptyIcon: '#1a1740', sidebarBg: '#12102a',
    orb1: 'rgba(99,102,241,0.18)', orb2: 'rgba(139,92,246,0.14)', orb3: 'rgba(16,185,129,0.08)',
    gridLine: 'rgba(99,102,241,0.07)',
    toggleBg: '#1a1740', toggleColor: '#b0aed0',
    errorBg: '#2d0a14', errorBorder: '#7f1d1d', errorText: '#f87171', errorBody: '#fca5a5',
    chartGrid: '#1e1b3a', chartTick: '#4a4870', chartCard: '#1a1740', chartCardBorder: '#2a2750',
    infoIconBg: '#1e1b3a',
    exportBtn: '#1a1740', exportBtnBorder: '#2a2750', exportBtnText: '#b0aed0',
    insightBg: '#1a1740', insightIcon: '#1e1b3a',
    suggBg: '#1e1b3a', suggText: '#9090c0',
  }
};

// ─── Animated background canvas ──────────────
function AnimatedBg({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, orbs, raf;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    orbs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 180 + Math.random() * 160,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      hue: [250, 270, 160, 30, 320][i],
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        const a = dark ? 0.13 : 0.07;
        g.addColorStop(0, `hsla(${o.hue},70%,60%,${a})`);
        g.addColorStop(1, `hsla(${o.hue},70%,60%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [dark]);
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0
    }} />
  );
}

// ─── Theme toggle button ──────────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 38, height: 38, borderRadius: 10,
        background: dark ? '#1a1740' : '#f0f0f8',
        border: `1.5px solid ${dark ? '#2a2750' : '#e8e8f0'}`,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        color: dark ? '#b0aed0' : '#555',
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// ─────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    const t1 = setTimeout(() => setFadeOut(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg,#0f0c29 0%,#1a1040 50%,#0f0c29 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.6s ease', opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'all', fontFamily: "'Syne', sans-serif",
    }}>
      <style>{`
        @keyframes sp-ping { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        @keyframes sp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes sp-load { from{width:0%} to{width:100%} }
      `}</style>
      <div style={{ position:'absolute', width:480, height:480, borderRadius:'50%', border:'1px solid rgba(99,102,241,0.15)', animation:'sp-ping 3s ease-out infinite' }} />
      <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', border:'1px solid rgba(99,102,241,0.25)', animation:'sp-ping 3s ease-out infinite 0.5s' }} />
      <div style={{ opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(28px)', transition:'all 0.9s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column', alignItems:'center', gap:22 }}>
        <div style={{ width:88, height:88, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:26, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 56px rgba(99,102,241,0.5)', animation:'sp-float 3s ease-in-out infinite' }}>
          <BarChart2 size={44} color="white" />
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:50, fontWeight:800, color:'#fff', fontFamily:"'Playfair Display',Georgia,serif", lineHeight:1, marginBottom:10 }}>
            Instant<span style={{ color:'#818cf8' }}>BI</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.38)', fontFamily:"'DM Sans',sans-serif", fontWeight:300, letterSpacing:4, textTransform:'uppercase' }}>
            AI — Powered Analytics
          </div>
        </div>
        <div style={{ width:160, height:2, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden', marginTop:6 }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#6366f1,#a78bfa)', borderRadius:99, animation:'sp-load 1.9s ease forwards' }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ onUseTool, dark, onToggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  const t = dark ? T.dark : T.light;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Syne', sans-serif", color: t.text, overflowX: 'hidden', position: 'relative', transition: 'background 0.4s, color 0.4s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .land-navlink { font-size: 14px; font-weight: 600; color: ${t.text2}; text-decoration: none; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: inherit; }
        .land-navlink:hover { color: #6366f1; }
        .land-cta { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; padding: 13px 28px; border-radius: 13px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 28px rgba(99,102,241,0.35); display: inline-flex; align-items: center; gap: 8px; }
        .land-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(99,102,241,0.45); }
        .land-ghost { background: transparent; color: ${t.text2}; border: 1.5px solid ${t.border}; padding: 13px 28px; border-radius: 13px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.3s; }
        .land-ghost:hover { border-color: #6366f1; color: #6366f1; background: ${t.bg3}; }
        .land-card { background: ${t.cardBg}; border: 1px solid ${t.border}; border-radius: 22px; padding: 30px; transition: all 0.3s; }
        .land-card:hover { transform: translateY(-5px); box-shadow: ${t.cardHoverShadow}; border-color: ${t.border2}; }
        @keyframes l-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes l-orbit { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
        @keyframes l-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-14px) scale(1.02)} }
        .l-logo { animation: l-float 4s ease-in-out infinite; }
        .l-ring { animation: l-spin 22s linear infinite; }
        .l-dot1 { position:absolute; width:12px; height:12px; border-radius:50%; background:#6366f1; top:50%; left:50%; margin:-6px; animation:l-orbit 4s linear infinite; }
        .l-dot2 { position:absolute; width:9px; height:9px; border-radius:50%; background:#10b981; top:50%; left:50%; margin:-4.5px; animation:l-orbit 4s linear infinite; animation-delay:-2s; }
        footer a { color:${t.footerLink}; text-decoration:none; font-size:13px; font-family:'DM Sans',sans-serif; transition:color 0.2s; }
        footer a:hover { color:#6366f1; }
      `}</style>

      <AnimatedBg dark={dark} />

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 56px', height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? t.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? `1px solid ${t.border}` : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px' }}>Instant<span style={{ color: '#6366f1' }}>BI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <button className="land-navlink" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</button>
          <button className="land-navlink" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}>How it works</button>
          <button className="land-navlink">Docs</button>
          <ThemeToggle dark={dark} onToggle={onToggleDark} />
          <button className="land-cta" style={{ padding: '9px 20px', fontSize: 13 }} onClick={onUseTool}>Use Tool</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 80px 60px', gap: 80, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300, maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: t.bg3, border: `1px solid ${t.border2}`, borderRadius: 99, padding: '5px 14px', marginBottom: 26 }}>
            <Zap size={12} color="#6366f1" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 1.5, textTransform: 'uppercase' }}>AI-Powered Analytics</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px,5vw,66px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.5px', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 26, color: t.text }}>
            Data insights,<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in plain English.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: t.text2, marginBottom: 40, fontFamily: "'DM Sans', sans-serif", maxWidth: 440 }}>
            Upload your CSV, ask any business question, and watch InstantBI generate beautiful interactive dashboards — no SQL, no setup.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="land-cta" onClick={onUseTool}>Get Started Free <ArrowRight size={16} /></button>
            <button className="land-ghost">Watch Demo</button>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 48, flexWrap: 'wrap' }}>
            {[['3s','Avg generation'],['100%','No-code'],['Gemini','Powered by']].map(([val,label]) => (
              <div key={label}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-1px' }}>{val}</div>
                <div style={{ fontSize: 12, color: t.text3, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <div className="l-ring" style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: `1px dashed ${t.border2}` }} />
            <div className="l-logo" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 28px 72px rgba(99,102,241,0.38)', cursor: 'pointer' }}>
              <BarChart2 size={100} color="white" />
            </div>
            <div className="l-dot1" />
            <div className="l-dot2" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id='features' style={{ position: 'relative', zIndex: 1, padding: '90px 80px', background: t.sectionBg, transition: 'background 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>What it does</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text, lineHeight: 1.12 }}>Everything you need,<br />nothing you don't.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 22, maxWidth: 1080, margin: '0 auto' }}>
          {[
            { icon: <LayoutDashboard size={22} color="#6366f1" />, title: 'AI Dashboards', desc: 'Generate complete BI dashboards automatically using natural language prompts.', bg: t.bg3 },
            { icon: <TrendingUp size={22} color="#10b981" />, title: 'Smart Insights', desc: 'Discover hidden trends and actionable business insights — instantly surfaced.', bg: dark?'#0f2a1e':'#ecfdf5' },
            { icon: <Database size={22} color="#f59e0b" />, title: 'CSV to BI', desc: 'Upload any CSV dataset and transform raw rows into stunning visual analytics.', bg: dark?'#2a1e0a':'#fffbeb' },
            { icon: <MessageSquare size={22} color="#8b5cf6" />, title: 'Chat Interface', desc: 'Have a conversation with your data. Follow-up questions refine the dashboard.', bg: dark?'#1a1040':'#f5f3ff' },
            { icon: <Zap size={22} color="#ef4444" />, title: 'Real-time Speed', desc: 'Dashboards generated in seconds using Gemini Flash — built for instant answers.', bg: dark?'#2a0a0f':'#fff1f2' },
            { icon: <BarChart2 size={22} color="#6366f1" />, title: 'Smart Chart Selection', desc: 'The AI picks the right chart type — bar, line, pie, area — based on your data context.', bg: t.bg3 },
          ].map((f,i) => (
            <div key={i} className="land-card">
              <div style={{ width: 48, height: 48, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: t.text }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id='how-it-works' style={{ position: 'relative', zIndex: 1, padding: '90px 80px', background: t.sectionBg2, transition: 'background 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>The process</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text }}>Three steps to insight.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40, maxWidth: 860, margin: '0 auto' }}>
          {[
            { num: '01', title: 'Upload your CSV', desc: 'Drop any spreadsheet — sales, marketing, ops, finance.' },
            { num: '02', title: 'Ask a question', desc: 'Type what you want to know in plain English. No SQL needed.' },
            { num: '03', title: 'Get your dashboard', desc: 'Receive interactive charts, insights, and analysis instantly.' },
          ].map(s => (
            <div key={s.num}>
              <div style={{ fontSize: 62, fontWeight: 800, color: dark?'#1e1b3a':'#f0f0f8', lineHeight: 1, marginBottom: -4 }}>{s.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px', color: t.text }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 80px 90px' }}>
        <div style={{ padding: '72px 60px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 32, textAlign: 'center', boxShadow: '0 28px 72px rgba(99,102,241,0.3)' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: 'white', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 14 }}>Ready to see your data differently?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>No credit card. No setup. Just upload and ask.</p>
          <button onClick={onUseTool} style={{ background: 'white', color: '#6366f1', border: 'none', padding: '13px 30px', borderRadius: 13, fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.14)', transition: 'all 0.2s' }}>
            Launch InstantBI <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, background: t.footerBg, color: 'white', padding: '56px 80px 36px', transition: 'background 0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 36 }}>
          <div style={{ maxWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={16} color="white" /></div>
              <span style={{ fontWeight: 800, fontSize: 17 }}>Instant<span style={{ color: '#818cf8' }}>BI</span></span>
            </div>
            <p style={{ fontSize: 12, color: t.footerText, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>Conversational AI for instant business intelligence dashboards.</p>
          </div>
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            {[{heading:'Product',links:['Features','Pricing','Changelog']},{heading:'Resources',links:['Docs','GitHub','Examples']},{heading:'Company',links:['About','Blog','Contact']}].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 10, fontWeight: 700, color: dark?'#2a2750':'#333', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{col.links.map(l => <a key={l} href="#">{l}</a>)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${dark?'#1a1740':'#1e1b2e'}`, paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: dark?'#2a2750':'#333', fontFamily: "'DM Sans', sans-serif" }}>© 2025 InstantBI. Built for GFG Hackathon.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {[Github, Twitter, Linkedin].map((Icon, i) => <a key={i} href="#" style={{ color: dark?'#2a2750':'#333' }}><Icon size={16} /></a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOOL PAGE
// ─────────────────────────────────────────────
function ToolPage({ onBack, dark, onToggleDark }) {
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [activeModel, setActiveModel] = useState(MODELS[0]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const t = dark ? T.dark : T.light;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) throw new Error('CSV is empty or lacks data.');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((h, i) => {
            const val = values[i]?.trim();
            obj[h] = isNaN(val) || val === '' ? val : parseFloat(val);
          });
          return obj;
        });
        setCsvData(data); setHeaders(headers);
        setMessages([{ role: 'system', content: `Successfully loaded data with ${data.length} records and ${headers.length} columns.` }]);
        setError(null); setDashboard(null);
      } catch { setError('Error parsing CSV. Please check formatting.'); }
    };
    reader.readAsText(file);
  };

  const callGemini = async (prompt, modelIndex = 0, retryCount = 0) => {
    const currentModel = MODELS[modelIndex];
    setActiveModel(currentModel);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'InstantBI',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2048,
        })
      });
      const result = await response.json();
      if (!response.ok) {
        // Try next model on any error
        if (modelIndex < MODELS.length - 1) return callGemini(prompt, modelIndex + 1, 0);
        throw new Error(result.error?.message || `API Error: ${response.status}`);
      }
      const raw = result.choices?.[0]?.message?.content;
      if (!raw) throw new Error('API returned an empty response.');
      // Strip markdown fences then extract JSON object
      const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in response.');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      if (modelIndex < MODELS.length - 1) return callGemini(prompt, modelIndex + 1, 0);
      throw err;
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !csvData) return;
    const userQuery = query; setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsProcessing(true); setError(null);
    const sampleData = JSON.stringify(csvData.slice(0, 1));
    const systemPrompt = `You are a Data Analyst. Generate a BI dashboard config as JSON.
Dataset columns: [${headers.join(', ')}]
Sample row: ${sampleData}
User query: "${userQuery}"

Reply ONLY with raw JSON (no markdown, no explanation):
{
  "title": "string",
  "summary": "string",
  "insights": ["string","string"],
  "charts": [{"type":"bar","title":"string","xAxisKey":"column_name","yAxisKey":"column_name","description":"string"}]
}
Rules: type = bar|line|pie|area. xAxisKey/yAxisKey must match exact column names. 1-4 charts. 2-4 insights.`;
    try {
      const dashboardConfig = await callGemini(systemPrompt);
      setDashboard(dashboardConfig);
      setMessages(prev => [...prev, { role: 'assistant', content: dashboardConfig.summary }]);
    } catch (err) { setError(err.message); }
    finally { setIsProcessing(false); }
  };

  const renderChart = (chart, index) => {
    const isPie = chart.type === 'pie';
    const ChartComponent = { bar: BarChart, line: LineChart, pie: PieChart, area: AreaChart }[chart.type] || BarChart;
    return (
      <div key={index} style={{ background: t.chartCard, borderRadius: 18, padding: 24, border: `1px solid ${t.chartCardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'background 0.4s, border-color 0.4s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.2px', marginBottom: 3, fontFamily: "'Syne', sans-serif" }}>{chart.title}</h3>
            <p style={{ fontSize: 10, color: t.text4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>{chart.description || 'Visualization'}</p>
          </div>
          <div style={{ background: t.infoIconBg, padding: '5px 7px', borderRadius: 7 }}><Info size={12} color="#6366f1" /></div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ChartComponent data={csvData} margin={{ top: 8, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
            {!isPie && (<><XAxis dataKey={chart.xAxisKey} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: t.chartTick }} dy={8} /><YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: t.chartTick }} dx={-8} /></>)}
            <Tooltip cursor={{ fill: dark ? 'rgba(99,102,241,0.06)' : '#f8f8ff' }} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: 12, background: t.bg2, color: t.text }} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            {chart.type === 'pie' && (<Pie data={csvData} dataKey={chart.yAxisKey} nameKey={chart.xAxisKey} outerRadius={95} innerRadius={55} paddingAngle={4} label>{csvData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie>)}
            {chart.type === 'area' && <Area type="monotone" dataKey={chart.yAxisKey} stroke="#6366f1" strokeWidth={2.5} fill="#6366f1" fillOpacity={0.1} />}
            {chart.type === 'line' && <Line type="monotone" dataKey={chart.yAxisKey} stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3.5, fill: '#6366f1', strokeWidth: 2, stroke: t.bg2 }} activeDot={{ r: 5 }} />}
            {chart.type === 'bar' && <Bar dataKey={chart.yAxisKey} fill="#6366f1" radius={[5,5,0,0]} barSize={28} />}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Syne', sans-serif", background: t.bg, overflow: 'hidden', position: 'relative', transition: 'background 0.4s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ts::-webkit-scrollbar { display: none; } .ts { -ms-overflow-style:none; scrollbar-width:none; }
        .t-send { background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; border-radius:11px; padding:9px 11px; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
        .t-send:hover { transform:scale(1.06); } .t-send:disabled { background:${t.border}; cursor:not-allowed; transform:none; }
        .t-sugg { width:100%; text-align:left; background:${t.suggBg}; border:1px solid transparent; border-radius:11px; padding:9px 13px; font-size:13px; color:${t.suggText}; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .t-sugg:hover { background:${t.bg2}; border-color:${t.border2}; color:#6366f1; }
        .t-back { background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; color:${t.text3}; font-family:inherit; font-weight:600; transition:color 0.2s; padding:0; }
        .t-back:hover { color:#6366f1; }
        @keyframes t-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes t-pulse { 0%,100%{opacity:0.08} 50%{opacity:0.18} }
      `}</style>

      <AnimatedBg dark={dark} />

      {/* SIDEBAR */}
      <aside style={{ position: 'relative', zIndex: 2, width: 350, background: t.sidebarBg, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'background 0.4s, border-color 0.4s' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button className="t-back" onClick={onBack}>
              <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} /> Back to Home
            </button>
            <ThemeToggle dark={dark} onToggle={onToggleDark} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={17} color="white" /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.4px', color: t.text }}>Instant<span style={{ color: '#6366f1' }}>BI</span></div>
              <div style={{ fontSize: 9, color: t.text4, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>AI Analytics Engine</div>
            </div>
          </div>

          {/* Upload */}
          <div
            onClick={() => fileInputRef.current.click()}
            style={{ cursor: 'pointer', border: `2px dashed ${csvData ? t.border2 : t.border}`, borderRadius: 16, padding: '20px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, background: csvData ? t.bg3 : t.bg4, transition: 'all 0.3s' }}
            onMouseEnter={e => !csvData && (e.currentTarget.style.borderColor = '#a5b4fc')}
            onMouseLeave={e => !csvData && (e.currentTarget.style.borderColor = t.border)}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: csvData ? (dark?'#1e1b3a':'#ede9fe') : t.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={17} color={csvData ? '#6366f1' : t.text4} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>{csvData ? 'Dataset Ready ✓' : 'Import CSV File'}</div>
              <div style={{ fontSize: 11, color: t.text4, fontFamily: "'DM Sans', sans-serif" }}>{csvData ? `${csvData.length} records · ${headers.length} columns` : 'Click or drag and drop your file'}</div>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
        </div>

        {/* Chat */}
        <div className="ts" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          {messages.length === 0 && !isProcessing && (
            <div style={{ paddingTop: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.text4, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Quick Suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['Show sales trends', 'Top products by revenue', 'Distribution of customers'].map((s,i) => (
                  <button key={i} className="t-sugg" onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg,i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{
                maxWidth: '88%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : msg.role === 'system' ? '12px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? t.msgUser : msg.role === 'system' ? t.msgSys : t.msgAi,
                color: msg.role === 'user' ? 'white' : msg.role === 'system' ? t.msgSysText : t.msgAiText,
                border: msg.role === 'system' ? `1px solid ${t.msgSysBorder}` : msg.role === 'assistant' ? `1px solid ${t.border}` : 'none',
              }}>{msg.content}</div>
              <span style={{ fontSize: 9, color: t.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{msg.role}</span>
            </div>
          ))}
          {isProcessing && (
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 size={13} color="#6366f1" style={{ animation: 't-spin 1s linear infinite' }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.text2, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif" }}>Analyzing…</div>
                  <div style={{ fontSize: 9, color: t.text4, fontFamily: 'monospace' }}>{activeModel}</div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${t.border}`, background: t.sidebarBg, transition: 'background 0.4s' }}>
          <form onSubmit={handleQuery} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder={csvData ? 'Ask about your data…' : 'Upload a CSV first'}
              disabled={!csvData || isProcessing}
              style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s, background 0.4s', color: t.text, opacity: (!csvData||isProcessing)?0.5:1 }}
              onFocus={e => e.target.style.borderColor = '#a5b4fc'}
              onBlur={e => e.target.style.borderColor = t.inputBorder}
            />
            <button type="submit" className="t-send" disabled={!query.trim()||isProcessing}><Send size={14} color="white" /></button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 10, color: t.text4, marginTop: 9, fontFamily: "'DM Sans', sans-serif" }}>Gemini Flash · Low Latency Mode</p>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto' }}>
        {error && (
          <div style={{ margin: '24px 24px 0', background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700, color: t.errorText, marginBottom: 7, fontSize: 13 }}><AlertCircle size={15} /> Analytics Engine Error</div>
            <p style={{ fontSize: 13, color: t.errorBody, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            <button onClick={() => setError(null)} style={{ marginTop: 9, fontSize: 11, fontWeight: 700, color: t.errorText, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
          </div>
        )}

        {!dashboard ? (
          <div style={{ height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{ position: 'absolute', inset: -20, background: '#6366f1', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.1, animation: 't-pulse 3s ease-in-out infinite' }} />
              <div style={{ position: 'relative', width: 88, height: 88, background: t.emptyIcon, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 32px rgba(0,0,0,0.1)', border: `1px solid ${t.border}` }}>
                <Database size={38} color="#6366f1" />
              </div>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text, marginBottom: 10 }}>Intelligence on Demand</h2>
            <p style={{ color: t.text3, lineHeight: 1.75, maxWidth: 360, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Upload a CSV dataset, then ask any business question to generate a beautiful interactive dashboard.</p>
            <button onClick={() => fileInputRef.current.click()} style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: 'pointer', boxShadow: '0 6px 24px rgba(99,102,241,0.3)' }}>
              <Upload size={14} /> Upload your dataset
            </button>
          </div>
        ) : (
          <div style={{ padding: '32px 40px 72px', maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                  <div style={{ height: 3, width: 20, background: '#6366f1', borderRadius: 99 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.text4, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Generated Report</span>
                </div>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.08, marginBottom: 9 }}>{dashboard.title}</h2>
                <p style={{ color: t.text2, fontSize: 14, maxWidth: 560, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{dashboard.summary}</p>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: t.exportBtn, border: `1.5px solid ${t.exportBtnBorder}`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: t.exportBtnText, cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
                <Download size={13} /> Export
              </button>
            </div>

            {dashboard.insights?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 13, marginBottom: 30 }}>
                {dashboard.insights.map((insight,idx) => (
                  <div key={idx} style={{ background: t.insightBg, borderRadius: 16, padding: 18, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 9, transition: 'background 0.4s' }}>
                    <div style={{ width: 38, height: 38, background: t.insightIcon, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={16} color="#6366f1" /></div>
                    <p style={{ fontSize: 12, color: t.text2, fontWeight: 500, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{insight}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: dashboard.charts.length > 1 ? 'repeat(2,1fr)' : '1fr', gap: 20 }}>
              {dashboard.charts.map((chart,index) => renderChart(chart,index))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('splash');
  const [dark, setDark] = useState(false);
  const toggleDark = () => setDark(d => !d);

  return (
    <>
      {screen === 'splash' && <SplashScreen onDone={() => setScreen('landing')} />}
      {screen === 'landing' && <LandingPage onUseTool={() => setScreen('tool')} dark={dark} onToggleDark={toggleDark} />}
      {screen === 'tool' && <ToolPage onBack={() => setScreen('landing')} dark={dark} onToggleDark={toggleDark} />}
    </>
  );
}
