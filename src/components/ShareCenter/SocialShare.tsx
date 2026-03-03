import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';

/** Simple SVG spider chart for HEXACO — inline, no recharts */
function HexacoSpider({ scores }: { scores: Record<string, number> }) {
  const dims = [
    { key: 'honesty_humility', label: 'Uczciwość' },
    { key: 'emotionality',     label: 'Emocje' },
    { key: 'extraversion',     label: 'Ekstra.' },
    { key: 'agreeableness',    label: 'Ugodow.' },
    { key: 'conscientiousness',label: 'Sumien.' },
    { key: 'openness',         label: 'Otwart.' },
  ];
  const cx = 160, cy = 160, maxR = 110;
  const angle = (i: number) => ((i * 60 - 90) * Math.PI) / 180;
  const pt = (i: number, pct: number) => {
    const r = (pct / 100) * maxR;
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };
  const dataPath = dims.map((d, i) => {
    const v = Math.max(0, Math.min(100, scores[d.key] ?? 50));
    const p = pt(i, v);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="spiderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.5" />
        </linearGradient>
        <filter id="spiderGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* grid rings */}
      {[20,40,60,80,100].map(r => (
        <polygon key={r}
          points={dims.map((_, i) => { const p = pt(i, r); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {dims.map((_, i) => {
        const p = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      {/* data fill */}
      <path d={dataPath} fill="url(#spiderGrad)" opacity="0.55" />
      <path d={dataPath} fill="none" stroke="#00f0ff" strokeWidth="2.5" filter="url(#spiderGlow)" />
      {/* data points */}
      {dims.map((d, i) => {
        const v = Math.max(0, Math.min(100, scores[d.key] ?? 50));
        const p = pt(i, v);
        return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#00f0ff" filter="url(#spiderGlow)" />;
      })}
      {/* labels */}
      {dims.map((d, i) => {
        const p = pt(i, 118);
        const v = Math.max(0, Math.min(100, scores[d.key] ?? 50));
        return (
          <g key={i}>
            <text x={p.x.toFixed(1)} y={p.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.65)" fontSize="11" fontFamily="Space Grotesk,sans-serif" fontWeight="600">
              {d.label}
            </text>
            <text x={(p.x + (p.x - cx) * 0.08).toFixed(1)} y={(p.y + 13).toFixed(1)} textAnchor="middle"
              fill="#00f0ff" fontSize="10" fontFamily="Space Grotesk,sans-serif" fontWeight="700">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SLIDE_W = 390;
const SLIDE_H = 693; // ~9:16 at 390px wide

type Slide = {
  id: string;
  label: string;
  emoji: string;
};

const SLIDES: Slide[] = [
  { id: 'roast',  label: 'Archetyp',    emoji: '🔥' },
  { id: 'powers', label: 'Moce',        emoji: '⚡' },
  { id: 'likely', label: 'Most Likely', emoji: '😅' },
  { id: 'radar',  label: 'Statystyki',  emoji: '📊' },
];

interface SocialShareProps {
  archetypeName: string;
  archetypeSubtitle: string;
  tags: string[];
  hexacoScores: Record<string, number>;
  energyBoosters: string[];
  userName: string;
  roastLine: string;
  superpowerLine: string;
  kryptoniteLine: string;
  mostLikelyTo: string;
  leastLikelyTo: string;
}

export default function SocialShare({
  archetypeName,
  archetypeSubtitle,
  tags,
  hexacoScores,
  energyBoosters,
  userName,
  roastLine,
  superpowerLine,
  kryptoniteLine,
  mostLikelyTo,
  leastLikelyTo,
}: SocialShareProps) {
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const slideRef = useRef<HTMLDivElement | null>(null);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  const handleExport = async () => {
    if (!slideRef.current || exporting) return;
    setExporting(true);
    try {
      const png = await toPng(slideRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: { borderRadius: '0' },
      });
      const a = document.createElement('a');
      a.href = png;
      a.download = `alcheme-${SLIDES[current].id}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const isFeed = false; // all slides now use 9:16 story format
  const slideStyle: React.CSSProperties = {
    width: SLIDE_W,
    height: SLIDE_H,
    background: 'linear-gradient(140deg,#060818 0%,#0d0830 40%,#05101a 100%)',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    fontFamily: "'Space Grotesk',sans-serif",
  };
  void isFeed;

  // shared decorative elements rendered inside each slide
  const Decor = () => (
    <>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#7c3aed,#00f0ff,#7c3aed,transparent)' }} />
      <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,240,255,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:14, right:18, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.15)', letterSpacing:'0.1em', fontFamily:'inherit' }}>ALCHEME.IO</div>
    </>
  );

  const renderSlide = (id: string) => {
    /* ── SLIDE A: Archetyp + Roast ── */
    if (id === 'roast') {
      const tagMatch = archetypeSubtitle.match(/^([^.·,–-]+)/);
      const chaosTag = tagMatch ? tagMatch[1].trim() : archetypeSubtitle.slice(0, 28);
      return (
      <div style={{ ...slideStyle }}>
          <Decor />
          <div style={{ position:'relative', zIndex:1, padding:'44px 32px 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:9, letterSpacing:'0.24em', fontWeight:700, color:'rgba(0,240,255,0.65)', textTransform:'uppercase', marginBottom:6 }}>PROFIL PSYCHOMETRYCZNY</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.04em' }}>{userName}</div>
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:10 }}>Jestem</div>
              <div style={{ marginBottom:4 }}>
                <span style={{ fontSize:archetypeName.length>10?50:62, fontWeight:900, lineHeight:1.0, letterSpacing:'-0.02em', background:'linear-gradient(130deg,#fff 30%,#a78bfa 65%,#00f0ff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {archetypeName.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.32)', fontStyle:'italic', marginBottom:28, fontWeight:500 }}>({chaosTag})</div>
              <div style={{ background:'rgba(124,58,237,0.10)', border:'1px solid rgba(124,58,237,0.28)', borderLeft:'3px solid #7c3aed', borderRadius:'0 12px 12px 0', padding:'16px 18px', marginBottom:28 }}>
                <div style={{ fontSize:11, color:'rgba(0,240,255,0.6)', fontWeight:700, letterSpacing:'0.1em', marginBottom:8, textTransform:'uppercase' }}>🔥 Szczera prawda</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.82)', lineHeight:1.55, fontWeight:500, fontStyle:'italic' }}>"{roastLine}"</div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {tags.slice(0,3).map((t, i) => (
                  <div key={i} style={{ padding:'7px 14px', borderRadius:40, background:i===0?'rgba(124,58,237,0.2)':i===1?'rgba(0,240,255,0.09)':'rgba(255,255,255,0.06)', border:i===0?'1px solid rgba(124,58,237,0.4)':i===1?'1px solid rgba(0,240,255,0.28)':'1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:i===0?'#c4b5fd':i===1?'#67e8f9':'rgba(255,255,255,0.65)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.06em' }}>alcheme.io/character</div>
          </div>
        </div>
      );
    }

    /* ── SLIDE B: Supermoc & Kryptonit ── */
    if (id === 'powers') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        <div style={{ position:'absolute', top:'42%', left:'-15%', width:'130%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.2),rgba(0,240,255,0.15),transparent)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, padding:'44px 32px 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:'0.24em', fontWeight:700, color:'rgba(0,240,255,0.65)', textTransform:'uppercase', marginBottom:6 }}>MAPA OSOBOWOŚCI</div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.01em', color:'#fff' }}>{archetypeName}</div>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:18 }}>
            <div style={{ background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.22)', borderRadius:16, padding:'22px 20px' }}>
              <div style={{ fontSize:28, marginBottom:12, filter:'drop-shadow(0 0 10px rgba(0,229,160,0.45))' }}>⚡</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Moja Supermoc</div>
              <div style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.85)', lineHeight:1.45 }}>{superpowerLine}</div>
            </div>
            <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.22)', borderRadius:16, padding:'22px 20px' }}>
              <div style={{ fontSize:28, marginBottom:12, filter:'drop-shadow(0 0 10px rgba(239,68,68,0.35))' }}>🧊</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#fca5a5', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Mój Kryptonit</div>
              <div style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.85)', lineHeight:1.45 }}>{kryptoniteLine}</div>
            </div>
            {energyBoosters[0] && (
              <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>🔋</span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.4 }}><strong style={{ color:'#c4b5fd' }}>Ładują mnie: </strong>{energyBoosters[0]}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.06em' }}>alcheme.io/character</div>
        </div>
      </div>
    );

    /* ── SLIDE C: Most Likely To ── */
    if (id === 'likely') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        <div style={{ position:'relative', zIndex:1, padding:'44px 32px 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:'0.24em', fontWeight:700, color:'rgba(0,240,255,0.65)', textTransform:'uppercase', marginBottom:6 }}>YEARBOOK 2025</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{archetypeName}</div>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:18 }}>
            <div style={{ background:'rgba(124,58,237,0.10)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:16, padding:'22px 20px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, padding:'4px 12px', background:'rgba(124,58,237,0.3)', borderBottomLeftRadius:10, fontSize:10, fontWeight:800, color:'#c4b5fd', letterSpacing:'0.1em', textTransform:'uppercase' }}>✦ MOST LIKELY TO</div>
              <div style={{ marginTop:18, fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.88)', lineHeight:1.5 }}>{mostLikelyTo}</div>
            </div>
            <div style={{ background:'rgba(0,240,255,0.05)', border:'1px solid rgba(0,240,255,0.2)', borderRadius:16, padding:'22px 20px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, padding:'4px 12px', background:'rgba(0,240,255,0.12)', borderBottomLeftRadius:10, fontSize:10, fontWeight:800, color:'#67e8f9', letterSpacing:'0.1em', textTransform:'uppercase' }}>✦ LEAST LIKELY TO</div>
              <div style={{ marginTop:18, fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.88)', lineHeight:1.5 }}>{leastLikelyTo}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>
              <span style={{ fontSize:18 }}>🧬</span>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Dominująca cecha</div>
                <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.75)' }}>{tags[0] ?? archetypeSubtitle}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', letterSpacing:'0.06em' }}>alcheme.io/character</div>
        </div>
      </div>
    );

    /* ── SLIDE D: HEXACO Radar ── */
    if (id === 'radar') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        <div style={{ position:'relative', zIndex:1, padding:'40px 28px 40px', height:'100%', display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize:9, letterSpacing:'0.24em', fontWeight:700, color:'rgba(0,240,255,0.65)', textTransform:'uppercase', marginBottom:4 }}>STATYSTYKI POSTACI</div>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'#fff', marginBottom:2 }}>HEXACO</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:16 }}>Model 6 cech osobowości</div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:0 }}>
            <div style={{ width:300, height:300 }}><HexacoSpider scores={hexacoScores} /></div>
          </div>
          <div style={{ marginTop:16, padding:'12px 18px', borderRadius:14, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', textAlign:'center' }}>
            <span style={{ fontSize:13, color:'#c4b5fd', fontWeight:700 }}>{archetypeName}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginLeft:8 }}>· {userName}</span>
          </div>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={{ fontFamily:"'Space Grotesk',sans-serif" }}>

      {/* slide tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setCurrent(i)}
            style={{
              padding:'7px 15px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
              background: current===i ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.05)',
              border: current===i ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
              color: current===i ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              transition:'all .2s',
              display:'flex', alignItems:'center', gap:6,
            }}>
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* slide preview */}
      <div className="flex items-center gap-4 justify-center mb-6" style={{ userSelect:'none' }}>
        <button onClick={prev} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>

        {/* framer motion slide container */}
        <div style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)', flexShrink:0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              ref={slideRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}
            >
              {renderSlide(SLIDES[current].id)}
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={next} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
      </div>

      {/* dot indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{
            width: current===i ? 20 : 8, height:8, borderRadius:4, cursor:'pointer', border:'none',
            background: current===i ? '#7c3aed' : 'rgba(255,255,255,0.18)',
            transition:'all .25s',
          }} />
        ))}
      </div>

      {/* export button */}
      <div className="flex justify-center">
        <button onClick={handleExport} disabled={exporting}
          style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'13px 28px', borderRadius:14,
            background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'1px solid rgba(124,58,237,0.5)',
            color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14,
            cursor: exporting ? 'default' : 'pointer',
            boxShadow:'0 4px 20px rgba(124,58,237,0.4)',
            opacity: exporting ? 0.7 : 1,
            position:'relative', overflow:'hidden',
          }}>
          {exporting ? (
            <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} /> Eksportuje…</>
          ) : (
            <><span style={{ fontSize:16 }}>⬇</span> Pobierz jako PNG (2×)</>
          )}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
