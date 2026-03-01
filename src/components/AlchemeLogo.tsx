import React, { useEffect, useRef } from 'react';

const N = [
  { x: 50.0, y:  8.0 },
  { x: 79.7, y: 20.3 },
  { x: 92.0, y: 50.0 },
  { x: 79.7, y: 79.7 },
  { x: 50.0, y: 92.0 },
  { x: 20.3, y: 79.7 },
  { x:  8.0, y: 50.0 },
  { x: 20.3, y: 20.3 },
];

const EDGES = [
  [0, 3], [3, 6], [6, 1], [1, 4], [4, 7], [7, 2], [2, 5], [5, 0],
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface AlcheConfig {
  edgeIdx: number; color: string; r: number; filter: string;
  travelMs: number; pauseMs: number; delay: number;
}

const SIGNAL_CFG: AlcheConfig[] = [
  { edgeIdx: 0, color: '#00f0ff', r: 3.2, filter: 'url(#alch-gm)', travelMs: 1800, pauseMs: 4800, delay:  200 },
  { edgeIdx: 2, color: '#00f0ff', r: 3.2, filter: 'url(#alch-gm)', travelMs: 1900, pauseMs: 5200, delay: 2600 },
  { edgeIdx: 4, color: '#00f0ff', r: 3.2, filter: 'url(#alch-gm)', travelMs: 1700, pauseMs: 5000, delay: 4800 },
  { edgeIdx: 6, color: '#00f0ff', r: 3.2, filter: 'url(#alch-gm)', travelMs: 2000, pauseMs: 5400, delay: 7200 },
  { edgeIdx: 1, color: '#c4b5fd', r: 2.8, filter: 'url(#alch-gs)', travelMs: 2100, pauseMs: 6200, delay: 1400 },
  { edgeIdx: 3, color: '#c4b5fd', r: 2.8, filter: 'url(#alch-gs)', travelMs: 2200, pauseMs: 6000, delay: 3800 },
  { edgeIdx: 5, color: '#c4b5fd', r: 2.8, filter: 'url(#alch-gs)', travelMs: 2000, pauseMs: 6400, delay: 6000 },
  { edgeIdx: 7, color: '#c4b5fd', r: 2.8, filter: 'url(#alch-gs)', travelMs: 2300, pauseMs: 5800, delay: 8800 },
];

interface Props {
  size?: number;
  href?: string;
  className?: string;
}

export default function AlchemeLogo({ size = 46, href = '/', className = '' }: Props) {
  const signalsRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const group = signalsRef.current;
    if (!group) return;
    const ns = 'http://www.w3.org/2000/svg';

    interface SignalState {
      cfg: AlcheConfig;
      edge: number[];
      phase: 'pausing' | 'traveling';
      pauseEnd: number;
      startTime: number;
      el: SVGCircleElement;
    }

    const signals: SignalState[] = SIGNAL_CFG.map((cfg) => {
      const edge = EDGES[cfg.edgeIdx];
      const el = document.createElementNS(ns, 'circle') as SVGCircleElement;
      el.setAttribute('r', String(cfg.r));
      el.setAttribute('fill', cfg.color);
      el.setAttribute('filter', cfg.filter);
      el.setAttribute('opacity', '0');
      el.setAttribute('cx', String(N[edge[0]].x));
      el.setAttribute('cy', String(N[edge[0]].y));
      group.appendChild(el);
      return { cfg, edge, phase: 'pausing', pauseEnd: performance.now() + cfg.delay, startTime: 0, el };
    });

    function tick(s: SignalState, now: number) {
      if (s.phase === 'pausing') {
        if (now >= s.pauseEnd) { s.phase = 'traveling'; s.startTime = now; }
        return;
      }
      const tLinear = Math.min((now - s.startTime) / s.cfg.travelMs, 1);
      const tEased = easeInOutCubic(tLinear);
      const from = N[s.edge[0]], to = N[s.edge[1]];
      const x = from.x + (to.x - from.x) * tEased;
      const y = from.y + (to.y - from.y) * tEased;
      const opacity = tLinear < 0.15 ? (tLinear / 0.15) * 0.72
        : tLinear > 0.80 ? ((1 - tLinear) / 0.20) * 0.72 : 0.72;
      s.el.setAttribute('cx', x.toFixed(3));
      s.el.setAttribute('cy', y.toFixed(3));
      s.el.setAttribute('opacity', opacity.toFixed(3));
      if (tLinear >= 1) {
        s.el.setAttribute('opacity', '0');
        s.el.setAttribute('cx', String(N[s.edge[0]].x));
        s.el.setAttribute('cy', String(N[s.edge[0]].y));
        s.phase = 'pausing';
        s.pauseEnd = now + s.cfg.pauseMs + Math.random() * 800;
      }
    }

    function loop(now: number) {
      signals.forEach((s) => tick(s, now));
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      signals.forEach((s) => s.el.remove());
    };
  }, []);

  return (
    <a
      href={href}
      className={className}
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', userSelect: 'none', textDecoration: 'none', cursor: 'pointer' }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <defs>
          <filter id="alch-gs">
            <feGaussianBlur stdDeviation=".9" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="alch-gm">
            <feGaussianBlur stdDeviation="2.2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="alch-gl">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Outer rings */}
        <circle cx="50" cy="50" r="47" fill="rgba(10,4,40,.55)" stroke="rgba(255,255,255,.18)" strokeWidth="1.2"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".4"/>

        {/* Square 1: diamond */}
        <polygon points="50.0,8.0 92.0,50.0 50.0,92.0 8.0,50.0"
          fill="rgba(112,0,255,.08)" stroke="rgba(167,139,250,.55)" strokeWidth="1.2" strokeLinejoin="round"/>

        {/* Square 2: axis-aligned */}
        <polygon points="79.7,20.3 79.7,79.7 20.3,79.7 20.3,20.3"
          fill="rgba(112,0,255,.08)" stroke="rgba(167,139,250,.55)" strokeWidth="1.2" strokeLinejoin="round"/>

        {/* Star {8/3} */}
        <polygon points="50.0,8.0 79.7,79.7 8.0,50.0 79.7,20.3 50.0,92.0 20.3,20.3 92.0,50.0 20.3,79.7"
          fill="rgba(0,240,255,.07)" stroke="#00f0ff" strokeWidth="1.4" strokeLinejoin="round" filter="url(#alch-gs)"/>

        {/* 8 nodes */}
        <circle cx="50.0" cy="8.0"  r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/>
        <circle cx="79.7" cy="20.3" r="3.0" fill="#c4b5fd" filter="url(#alch-gs)"/>
        <circle cx="92.0" cy="50.0" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/>
        <circle cx="79.7" cy="79.7" r="3.0" fill="#c4b5fd" filter="url(#alch-gs)"/>
        <circle cx="50.0" cy="92.0" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/>
        <circle cx="20.3" cy="79.7" r="3.0" fill="#c4b5fd" filter="url(#alch-gs)"/>
        <circle cx="8.0"  cy="50.0" r="3.5" fill="#00f0ff" filter="url(#alch-gm)"/>
        <circle cx="20.3" cy="20.3" r="3.0" fill="#c4b5fd" filter="url(#alch-gs)"/>

        {/* Animated signal particles — populated by useEffect */}
        <g ref={signalsRef}/>

        {/* Center glow ring */}
        <circle cx="50" cy="50" r="14" fill="rgba(0,240,255,.09)" filter="url(#alch-gl)">
          <animate attributeName="opacity" values=".3;.75;.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" r="11" fill="#040115"/>
        <circle cx="50" cy="50" r="11" fill="none" stroke="#00f0ff" strokeWidth="2" filter="url(#alch-gs)">
          <animate attributeName="stroke-opacity" values=".5;1;.5" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" r="3.5" fill="#00f0ff" filter="url(#alch-gm)">
          <animate attributeName="r" values="2.8;4.2;2.8" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".75;1;.75" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '.16em',
          lineHeight: 1,
          background: 'linear-gradient(120deg, #fff 0%, rgba(0,240,255,.95) 55%, rgba(167,139,250,.9) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          whiteSpace: 'nowrap',
        }}>Alcheme</div>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          fontWeight: 300,
          letterSpacing: '.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.6)',
          whiteSpace: 'nowrap',
        }}>Know yourself · Transform</div>
      </div>
    </a>
  );
}
