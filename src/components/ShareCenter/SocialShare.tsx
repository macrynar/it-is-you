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
  format: 'story' | 'feed';
};

const SLIDES: Slide[] = [
  { id: 'archetype', label: 'Archetyp',    format: 'story' },
  { id: 'radar',     label: 'Statystyki',  format: 'story' },
  { id: 'super',     label: 'Supermoc',    format: 'story' },
  { id: 'energy',    label: 'Energia',     format: 'feed'  },
];

interface SocialShareProps {
  archetypeName: string;
  archetypeSubtitle: string;
  tags: string[];
  hexacoScores: Record<string, number>;
  superpower: string;
  energyBoosters: string[];
  energyDrainers: string[];
  userName: string;
}

export default function SocialShare({
  archetypeName,
  archetypeSubtitle,
  tags,
  hexacoScores,
  superpower,
  energyBoosters,
  energyDrainers,
  userName,
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

  const isFeed = SLIDES[current].format === 'feed';
  const slideStyle: React.CSSProperties = {
    width: SLIDE_W,
    height: isFeed ? SLIDE_W : SLIDE_H,
    background: 'linear-gradient(140deg,#060818 0%,#0d0830 40%,#05101a 100%)',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    fontFamily: "'Space Grotesk',sans-serif",
  };

  // shared decorative elements rendered inside each slide
  const Decor = () => (
    <>
      {/* top neon bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        background:'linear-gradient(90deg,transparent,#7c3aed,#00f0ff,#7c3aed,transparent)' }} />
      {/* radial glow blobs */}
      <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, right:-60, width:280, height:280, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(0,240,255,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
      {/* watermark */}
      <div style={{ position:'absolute', bottom:14, right:18, fontSize:11, fontWeight:700,
        color:'rgba(255,255,255,0.18)', letterSpacing:'0.1em', fontFamily:'inherit' }}>
        ALCHEME.IO
      </div>
    </>
  );

  const renderSlide = (id: string) => {
    if (id === 'archetype') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        {/* subtle grid lines */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, padding:'48px 32px 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.22em', fontWeight:700, color:'rgba(0,240,255,0.7)', textTransform:'uppercase', marginBottom:8 }}>
              PROFIL PSYCHOMETRYCZNY
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:32, letterSpacing:'0.04em' }}>
              {userName}
            </div>
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:12 }}>
              Jestem
            </div>
            {/* big archetype name */}
            <div style={{
              fontSize: archetypeName.length > 10 ? 52 : 64,
              fontWeight:800, lineHeight:1.0, letterSpacing:'-0.02em',
              background:'linear-gradient(130deg,#fff 30%,#a78bfa 70%,#00f0ff 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              marginBottom:16,
            }}>
              {archetypeName.toUpperCase()}
            </div>
            <div style={{ fontSize:16, color:'rgba(255,255,255,0.52)', fontWeight:500, marginBottom:40, lineHeight:1.5 }}>
              {archetypeSubtitle}
            </div>

            {/* 3 trait pills */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {tags.slice(0, 3).map((t, i) => (
                <div key={i} style={{
                  display:'inline-flex', alignItems:'center', gap:10,
                  padding:'10px 18px', borderRadius:40,
                  background: i===0 ? 'rgba(124,58,237,0.22)' : i===1 ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.06)',
                  border: i===0 ? '1px solid rgba(124,58,237,0.45)' : i===1 ? '1px solid rgba(0,240,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
                  width:'fit-content',
                }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: i===0?'#a78bfa':i===1?'#00f0ff':'rgba(255,255,255,0.5)', flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:600, color: i===0?'#c4b5fd':i===1?'#67e8f9':'rgba(255,255,255,0.7)' }}>
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em' }}>
            alcheme.io/character
          </div>
        </div>
      </div>
    );

    if (id === 'radar') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        <div style={{ position:'relative', zIndex:1, padding:'40px 28px 40px', height:'100%', display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize:10, letterSpacing:'0.22em', fontWeight:700, color:'rgba(0,240,255,0.7)', textTransform:'uppercase', marginBottom:4 }}>
            STATYSTYKI POSTACI
          </div>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'#fff', marginBottom:4 }}>
            HEXACO
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:20 }}>Model 6 cech osobowości</div>

          {/* radar chart area */}
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:0, position:'relative' }}>
            <div style={{ width:300, height:300 }}>
              <HexacoSpider scores={hexacoScores} />
            </div>
          </div>

          {/* archetype badge at bottom */}
          <div style={{ marginTop:16, padding:'12px 18px', borderRadius:14, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', textAlign:'center' }}>
            <span style={{ fontSize:13, color:'#c4b5fd', fontWeight:700 }}>{archetypeName}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginLeft:8 }}>· {userName}</span>
          </div>
        </div>
      </div>
    );

    if (id === 'super') return (
      <div style={{ ...slideStyle }}>
        <Decor />
        <div style={{ position:'absolute', top:'35%', left:'-10%', width:'120%', height:'2px',
          background:'linear-gradient(90deg,transparent,rgba(0,240,255,0.15),transparent)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, padding:'52px 32px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ fontSize:10, letterSpacing:'0.22em', fontWeight:700, color:'rgba(0,240,255,0.7)', textTransform:'uppercase', marginBottom:32 }}>
            SUPERMOC
          </div>

          {/* lightning icon */}
          <div style={{ fontSize:56, marginBottom:24, filter:'drop-shadow(0 0 12px rgba(0,240,255,0.5))' }}>⚡</div>

          <div style={{
            fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.5)',
            textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:20
          }}>
            Moja Supermoc
          </div>

          {/* superpower text */}
          <div style={{
            fontSize:25, fontWeight:800, lineHeight:1.35, letterSpacing:'-0.01em',
            background:'linear-gradient(130deg,#fff 0%,#e9d5ff 50%,#67e8f9 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            marginBottom:32,
          }}>
            "{superpower.length > 160 ? superpower.slice(0, 157) + '…' : superpower}"
          </div>

          <div style={{ padding:'12px 18px', borderRadius:14,
            background:'rgba(0,240,255,0.06)', border:'1px solid rgba(0,240,255,0.2)',
            width:'fit-content' }}>
            <span style={{ fontSize:13, color:'rgba(0,240,255,0.7)', fontWeight:600 }}>
              {archetypeName} · {userName}
            </span>
          </div>
        </div>
      </div>
    );

    if (id === 'energy') {
      const feedH = SLIDE_W;
      return (
        <div style={{ ...slideStyle, height: feedH }}>
          <Decor />
          <div style={{ position:'relative', zIndex:1, padding:'32px 28px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:'0.22em', fontWeight:700, color:'rgba(0,240,255,0.7)', textTransform:'uppercase', marginBottom:6 }}>
                PROFIL ENERGII
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:20 }}>Co mnie ładuje?</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, flex:1, alignItems:'center' }}>
              {/* boosters */}
              <div style={{ background:'rgba(0,229,160,0.07)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:14, padding:'16px 14px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.1em', marginBottom:12, textTransform:'uppercase' }}>⚡ Energie</div>
                {energyBoosters.slice(0,3).map((b, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:8 }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:'#6ee7b7', marginTop:5, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.72)', lineHeight:1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
              {/* drainers */}
              <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'16px 14px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#fca5a5', letterSpacing:'0.1em', marginBottom:12, textTransform:'uppercase' }}>💧 Dreny</div>
                {energyDrainers.slice(0,3).map((d, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:8 }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:'#fca5a5', marginTop:5, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.72)', lineHeight:1.4 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:'10px 16px', borderRadius:12,
              background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', marginTop:12 }}>
              <span style={{ fontSize:12, color:'#c4b5fd', fontWeight:600 }}>{archetypeName} · alcheme.io</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ fontFamily:"'Space Grotesk',sans-serif" }}>

      {/* slide tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setCurrent(i)}
            style={{
              padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
              background: current===i ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.05)',
              border: current===i ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
              color: current===i ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              transition:'all .2s',
            }}>
            {s.label}
            <span style={{ marginLeft:6, fontSize:10, opacity:0.6 }}>
              {s.format === 'story' ? '9:16' : '1:1'}
            </span>
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
