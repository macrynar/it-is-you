import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport } from '../../utils/scoring.js';

/* ═══════════ LORE ═══════════ */
const ENN_LORE: Record<number, {
  rpg: string; epithet: string; desc: string; symbol: string;
  pop: string[]; charges: string[]; drains: string[];
}> = {
  1:{ rpg:'Praworządny Paladin',     epithet:'Architekt Porządku',    desc:'Wysokie standardy i etyka. Twój rdzeń to wewnętrzny krytyk dążący do doskonałości.',              symbol:'⚔',  pop:['Hermiona Granger','Ned Stark','Chidi Anagonye','Captain America','Jiminy Cricket'], charges:['Precyzja i systemy','Realizacja planów','Etyczne decyzje'],       drains:['Chaos i improwizacja','Niedbałość innych','Brak kontroli'] },
  2:{ rpg:'Kapłan Wsparcia',         epithet:'Strażnik Serc',         desc:'Naturalna empatia i orientacja na potrzeby innych. Budujesz mosty i dbasz o relacje.',            symbol:'💜', pop:['Leslie Knope','Ted Lasso','Samwise Gamgee','Beth March','Joyce Byers'],             charges:['Pomaganie i troskliwość','Głębokie relacje','Wpływ na innych'],   drains:['Praca w izolacji','Bycie ignorowanym','Brak uznania'] },
  3:{ rpg:'Bard Ambicji',            epithet:'Architekt Sukcesu',     desc:'Motywacja przez osiągnięcia i prestiż. Adaptujesz się błyskawicznie i wygrywasz.',               symbol:'🏆', pop:['Tony Stark','Harvey Specter','Jay Gatsby','Miranda Priestly','Jordan Belfort'],    charges:['Sukcesy i wyniki','Uznanie i prestiż','Wysoka stawka'],           drains:['Anonimowość','Porażka','Stagnacja'] },
  4:{ rpg:'Mroczny Artysta',         epithet:'Dziecko Cienia',        desc:'Głęboka potrzeba autentyczności i wyrażenia wewnętrznego świata. Czujesz więcej niż inni.',      symbol:'🎭', pop:['Joker (2019)','Severus Snape','Don Draper','Virginia Woolf','Hamlet'],               charges:['Twórcza ekspresja','Autentyczność','Estetyka i piękno'],          drains:['Banalność','Bycie niezrozumianym','Szablony'] },
  5:{ rpg:'Mistrz Wiedzy Zakazanej', epithet:'Wartownik Umysłu',      desc:'Izolacja jako ochrona. Zbierasz wiedzę jako tarczę i broń. Obserwujesz nie uczestnicząc.',      symbol:'🔮', pop:['Sherlock Holmes','Dr House','Walter White','Spock','Alan Turing'],                  charges:['Głęboka analiza','Praca w skupieniu','Odkrywanie tajemnic'],      drains:['Natłok ludzi','Wymuszona małomówność','Brak czasu na myślenie'] },
  6:{ rpg:'Strażnik Bractwa',        epithet:'Bastion Lojalności',    desc:'Bezpieczeństwo przez przynależność. Lojalność jest Twoją walutą, a sceptycyzm tarczą.',         symbol:'🛡', pop:['Captain America','Ron Weasley','Frodo Baggins','Eddard Stark','Leslie Knope'],      charges:['Zaufane środowisko','Jasne zasady','Wierność wartościom'],        drains:['Niepewność i ryzyko','Zdrada','Brak wsparcia'] },
  7:{ rpg:'Chaotyczny Awanturnik',   epithet:'Wirtuoz Możliwości',    desc:'Ucieczka przez doświadczanie. Świat to plac zabaw, a ograniczenia to wrogowie.',               symbol:'🎲', pop:['Jack Sparrow','Tyrion Lannister','Fleabag','Deadpool','Gonzo'],                      charges:['Nowe przygody','Wolność i spontaniczność','Wielość możliwości'], drains:['Rutyna','Ograniczenia','Zobowiązania długoterminowe'] },
  8:{ rpg:'Warlord Wojenny',         epithet:'Inkwizytor Woli',       desc:'Kontrola jako przeżycie. Dominujesz bo słabość jest zagrożeniem. Chronisz intensywnie.',        symbol:'👁', pop:['Walter White','Tony Soprano','Daenerys Targaryen','Gordon Ramsay','Cersei'],        charges:['Kontrola i decyzyjność','Wyzwania i konfrontacja','Ochrona bliskich'], drains:['Zależność od innych','Okazywanie słabości','Utrata kontroli'] },
  9:{ rpg:'Mnich Harmonii',          epithet:'Spokój w Oku Cyklonu',  desc:'Pokój jako cel. Unikanie konfliktu przez fuzję z otoczeniem. Twój superpower to cierpliwość.', symbol:'☯',  pop:['Frodo Baggins','Ted Lasso','The Dude','Keanu Reeves','Samwise Gamgee'],              charges:['Spokój i harmonia','Mediacja','Połączenie z naturą'],              drains:['Konflikt i spory','Presja czasu','Przymus'] },
};

const HEX_FULL: Record<string,string> = {
  honesty_humility:'Uczciwość', emotionality:'Emocjonalność',
  extraversion:'Ekstrawersja', agreeableness:'Ugodowość',
  conscientiousness:'Sumienność', openness:'Otwartość'
};
const HEX_SHORT: Record<string,string> = {
  honesty_humility:'H', emotionality:'E', extraversion:'X',
  agreeableness:'A', conscientiousness:'C', openness:'O'
};
const HEX_COLOR: Record<string,string> = {
  honesty_humility:'#a78bfa', emotionality:'#f472b6', extraversion:'#fb923c',
  agreeableness:'#34d399', conscientiousness:'#60a5fa', openness:'#fbbf24'
};
const HEX_DIMS = ['honesty_humility','emotionality','extraversion','agreeableness','conscientiousness','openness'] as const;
const DT_LABEL: Record<string,string> = {
  machiavellianism:'Makiawelizm', narcissism:'Narcyzm', psychopathy:'Psychopatia'
};
const DT_COLOR: Record<string,string> = {
  machiavellianism:'#f97316', narcissism:'#fbbf24', psychopathy:'#ef4444'
};

interface RawRow { test_type:string; raw_scores:any; percentile_scores:any; report:any; }

function HexRadar({ data }: { data: {k:string; pct:number}[] }) {
  const cx = 150;
  const cy = 110;
  const r = 72;
  const angles = data.map((_, i) => (i * 2 * Math.PI / data.length) - Math.PI / 2);

  const toXY = (a: number, rad: number) => ({
    x: cx + rad * Math.cos(a),
    y: cy + rad * Math.sin(a),
  });

  const pts = data.map((d, i) => toXY(angles[i], (Math.max(0, Math.min(100, d.pct)) / 100) * r));
  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const rings = [20, 40, 60, 80, 100].map(p => (p / 100) * r);

  return (
    <svg viewBox="0 0 300 240" style={{width:'100%',maxHeight:260,display:'block'}}>
      <circle cx={cx} cy={cy} r={r+22} fill="rgba(56,182,255,.02)" />
      {rings.map((rr, i) => (
        <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke="rgba(56,182,255,.08)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => {
        const lp = toXY(a, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={lp.x.toFixed(1)}
            y2={lp.y.toFixed(1)}
            stroke="rgba(56,182,255,.08)"
            strokeWidth="1"
          />
        );
      })}

      <polygon points={polyPts} fill="rgba(56,182,255,.10)" stroke="#38b6ff" strokeWidth="1.8" strokeLinejoin="round"/>
      {pts.map((p,i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#38b6ff" style={{filter:'drop-shadow(0 0 4px #38b6ff)'}}/>
      ))}
      {data.map((d,i) => {
        const lp = toXY(angles[i], r + 26);
        return (
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(203,213,225,.55)" fontSize="11" fontFamily="Space Grotesk,sans-serif" fontWeight="600">
            {HEX_FULL[d.k]}
          </text>
        );
      })}
    </svg>
  );
}

function EnnStar({ active, pct }: { active: number|null; pct: number }) {
  const N=9, cx=100, cy=100, R=80, ri=28;
  const angle = (i: number) => ((i * 360 / N) - 90) * (Math.PI / 180);
  const outer = Array.from({length:N}, (_,i) => ({ x: cx+R*Math.cos(angle(i)), y: cy+R*Math.sin(angle(i)), n: i+1 }));
  const inner = Array.from({length:N}, (_,i) => ({ x: cx+ri*Math.cos(angle(i)+(Math.PI/N)), y: cy+ri*Math.sin(angle(i)+(Math.PI/N)) }));
  const starPts = outer.flatMap((o,i) => [`${o.x.toFixed(1)},${o.y.toFixed(1)}`, `${inner[i].x.toFixed(1)},${inner[i].y.toFixed(1)}`]).join(' ');
  return (
    <svg viewBox="0 0 200 200" style={{width:'100%',maxHeight:200,display:'block'}}>
      <circle cx={cx} cy={cy} r={R+6} fill="none" stroke="rgba(176,143,255,.07)" strokeWidth="1.5"/>
      <polygon points={starPts} fill="rgba(176,143,255,.06)" stroke="rgba(176,143,255,.18)" strokeWidth="1.2" strokeLinejoin="round"/>
      {outer.map(o => <line key={o.n} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke="rgba(176,143,255,.07)" strokeWidth="1"/>)}
      {outer.map(o => (
        <circle key={o.n} cx={o.x.toFixed(1)} cy={o.y.toFixed(1)} r={o.n===active ? 8 : 4}
          fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.25)'}
          stroke={o.n===active ? 'rgba(176,143,255,.6)' : 'none'} strokeWidth="2"
          style={o.n===active ? {filter:'drop-shadow(0 0 8px #b08fff)'} : {}}/>
      ))}
      {outer.map(o => {
        const lp = { x: cx+(R+18)*Math.cos(angle(o.n-1)), y: cy+(R+18)*Math.sin(angle(o.n-1)) };
        return (
          <text key={o.n} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.28)'}
            fontSize={o.n===active ? 11 : 8.5} fontFamily="Orbitron,monospace" fontWeight="700">
            {o.n}
          </text>
        );
      })}
      {active && pct > 0 && (
        <circle cx={cx} cy={cy} r={(pct/100)*(R-10)+10} fill="none" stroke="rgba(176,143,255,.10)" strokeWidth="18" strokeDasharray="3 5"/>
      )}
    </svg>
  );
}

/* ══ HELPERS ══ */
function pad2(n: number) { return String(n).padStart(2,'0'); }
function hashCode(s: string) {
  let h = 0;
  for (const c of s) h = (Math.imul(31,h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/* ══ MAIN ══ */
export default function CharacterSheet() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [lightMode, setLightMode] = useState(() => document.body.classList.contains('light-mode'));
  const [raw, setRaw] = useState<Record<string,RawRow|null>>({
    HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setAuthUser(u);
      const { data: rows } = await supabase
        .from('user_psychometrics')
        .select('test_type,raw_scores,percentile_scores,report')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      if (rows?.length) {
        const m: Record<string,RawRow|null> = {
          HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
        };
        for (const r of rows) if (m[r.test_type] === null) m[r.test_type] = r;
        setRaw(m);
      }
      setLoading(false);
    })();
  }, []);

  /* DERIVED */
  const userName  = (authUser?.user_metadata?.full_name ?? authUser?.email?.split('@')[0] ?? 'Użytkownik') as string;
  const avatarUrl = (authUser?.user_metadata?.avatar_url ?? '') as string;
  const initials  = userName.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2);
  const done      = Object.values(raw).filter(Boolean).length;
  const xpPct     = Math.round((done / 6) * 100);
  const charId    = authUser ? `PSY-${hashCode(authUser.id).toString(16).toUpperCase().slice(0,6)}` : 'PSY-??????';
  const now       = new Date();
  const buildDate = `${now.getFullYear()}.${pad2(now.getMonth()+1)}.${pad2(now.getDate())}`;

  /* HEXACO */
  const hexPct: Record<string,number> = raw.HEXACO?.percentile_scores ?? {};
  const hexBars = HEX_DIMS.map(k => ({
    k, label:HEX_FULL[k], short:HEX_SHORT[k],
    pct:Math.round(hexPct[k] ?? 0),
    color:HEX_COLOR[k]
  }));
  const hexTop3 = [...hexBars].sort((a,b) => b.pct - a.pct).slice(0,3);

  /* ENNEAGRAM */
  const ennR = raw.ENNEAGRAM?.report;
  const ennP = ennR?.primary_type;
  const ennN: number|null = ennP?.id ?? null;
  const ennL = ennN ? ENN_LORE[ennN] : null;
  const ennWing: string = ennR?.wing ? `w${ennR.wing}` : '';

  /* STRENGTHS */
  const top5: any[] = raw.STRENGTHS?.raw_scores?.top_5 ?? [];

  /* CAREER */
  const careerRep = raw.CAREER ? (raw.CAREER.report ?? generateCareerReport(raw.CAREER.raw_scores)) : null;
  const holland: string = careerRep?.holland_code ?? '';
  const topJobs: any[] = (careerRep?.top_careers ?? careerRep?.career_clusters ?? []).slice(0,6);

  /* VALUES */
  const topVals: any[] = (raw.VALUES?.raw_scores?.top_values ?? raw.VALUES?.report?.top_values ?? []).slice(0,5);

  /* DARK TRIAD */
  const dtDims = raw.DARK_TRIAD?.raw_scores?.dimensions ?? {};
  const dtTraits = ['machiavellianism','narcissism','psychopathy'].map(k => {
    const v = dtDims[k]?.raw_score ?? 0;
    const pct = v <= 5 ? Math.round(((v-1)/4)*100) : Math.round(v);
    return { k, label:DT_LABEL[k], pct:Math.max(0,Math.min(100,pct)), color:DT_COLOR[k] };
  }).sort((a,b) => b.pct - a.pct);

  /* RPG meta */
  const lvlLabel = ['NOVICE','AWAKENED','SEEKER','ADEPT','INITIATE','OPERATOR'][Math.min(done,5)];
  const rareLabel = done>=6 ? '◈ LEGENDARY' : done>=4 ? '◆ RARE' : done>=2 ? '◇ UNCOMMON' : '○ COMMON';
  const codeStr = [hexTop3[0]?.short, hexTop3[1]?.short, ennN ? `E${ennN}` : null, holland||null].filter(Boolean).join(' · ');

  /* AI SYNTHESIS */
  const synthLines: string[] = [];
  if (ennN && ennL) synthLines.push(`<strong>Archetyp ${ennL.rpg}:</strong> ${ennL.epithet}. ${ennL.desc.slice(0,120)}.`);
  if (hexTop3.length >= 3) synthLines.push(`<strong>Rdzeń HEXACO:</strong> Dominują ${hexTop3.map(h => h.label + ' (' + h.pct + '%)').join(', ')}. To Twój psychologiczny hardware.`);
  if (top5.length >= 3) synthLines.push(`<strong>Talenty:</strong> ${top5.slice(0,3).map((t:any) => t.name ?? t.name_en).join(', ')} — naturalne przewagi wymagające narzędzi, nie pracy.`);
  if (dtTraits.length && raw.DARK_TRIAD) synthLines.push(`<strong>Strefa cienia:</strong> ${dtTraits[0].label} (${dtTraits[0].pct}%) to najsilniejszy obszar Twojego cienia. Świadomość to pierwsza linia obrony.`);
  if (topVals.length) synthLines.push(`<strong>Wartości dominujące:</strong> ${topVals.slice(0,3).map((v:any) => v.name ?? v.value_name ?? String(v)).join(', ')}. To Twój wewnętrzny kompas.`);
  if (careerRep && holland) synthLines.push(`<strong>Profil kariery:</strong> Kod Holland ${holland} wskazuje na środowiska: ${topJobs.slice(0,2).map((j:any) => j.title ?? j.name ?? '').filter(Boolean).join(' i ')}. Twój flow jest właśnie tam.`);

  /* LOADING */
  if (loading) return (
    <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-secondary/20 border-t-brand-secondary mx-auto mb-4 animate-spin"/>
        <div className="font-mono text-brand-secondary/40 text-[11px] tracking-[3px]">LOADING PROFILE…</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main text-text-main bg-neural-gradient bg-fixed">
      <nav className="border-b border-white/5 bg-bg-surface/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="/" className="font-brand font-bold tracking-[6px] text-white no-underline">PSYCHER</a>

          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white/55 hover:text-white hover:bg-white/5 transition"
              onClick={() => { window.location.href = '/user-profile-tests.html'; }}
            >
              🧪 Testy
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/10">
              🃏 Karta Postaci
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative w-14 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
              title="Przełącz motyw"
              onClick={() => { const n = !lightMode; setLightMode(n); document.body.classList.toggle('light-mode', n); }}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform ${lightMode ? 'translate-x-6 bg-amber-400' : 'translate-x-0 bg-brand-primary'}`}/>
            </button>
            <a
              href="/settings"
              className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm no-underline"
              title="Ustawienia konta"
            >
              ⚙️ Ustawienia
            </a>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }}
              className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <main className="px-6 py-10 pb-16 font-brand">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto auto-rows-min">
          {(() => {
            const TILE_BASE = 'bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-brand-primary/30';
            const archetype = ennL?.rpg ?? 'Archetyp nieznany';
            const epithet = ennL?.epithet ?? 'Brak danych';
            const pop = (ennL?.pop ?? []).slice(0, 6).map((name, i) => ({ name, pct: Math.max(60, 95 - i * 7) }));

            return (
              <>
                {/* TILE 1: HERO & AI CORE */}
                <section className={`col-span-1 lg:col-span-1 lg:row-span-2 ${TILE_BASE}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-semibold text-white/70">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">{userName}</div>
                        <div className="text-xs text-white/40 font-mono">LVL {done} · {lvlLabel} · {codeStr || '—'}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-white/35 border border-white/10 bg-white/5 px-2 py-1 rounded-md shrink-0">
                      {rareLabel}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35">ARCHETYP RPG</div>
                    <div className="mt-2 text-xl font-extrabold text-brand-secondary leading-tight">{archetype}</div>
                    <div className="mt-1 text-sm text-white/55 italic">{epithet}</div>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] tracking-[2px] font-mono text-white/35">PODOBNE POSTACIE</div>
                    <div className="mt-3 flex flex-col gap-2">
                      {pop.length > 0 ? (
                        pop.map((p) => (
                          <div key={p.name} className="bg-white/5 rounded-md p-2 flex justify-between gap-3">
                            <span className="text-sm text-white/70 truncate">{p.name}</span>
                            <span className="text-xs font-mono text-white/45 shrink-0">{p.pct}%</span>
                          </div>
                        ))
                      ) : (
                        <a
                          href="/user-profile-tests.html"
                          className="bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                        >
                          Ukończ Enneagram, aby odblokować archetyp i podobieństwa →
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {/* TILE 2: MATRYCA HEXACO */}
                <section className={`col-span-1 lg:col-span-2 lg:row-span-2 min-h-[500px] ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">MATRYCA HEXACO</div>
                  {raw.HEXACO ? (
                    <>
                      <div className="flex items-center justify-center flex-1 mt-3">
                        <HexRadar data={hexBars.map(h => ({k:h.k, pct:h.pct}))}/>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                        {hexBars.map(h => (
                          <div key={h.k} className="min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="text-xs font-semibold text-white/60 truncate">{h.label}</div>
                              <div className="text-xs font-mono text-white/45 shrink-0">{h.pct}%</div>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${h.pct}%`, background: h.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test HEXACO, aby zobaczyć radar i paski →
                    </a>
                  )}
                </section>

                {/* TILE 3: ENNEAGRAM & ENGINE */}
                <section className={`col-span-1 lg:col-span-1 lg:row-span-2 min-h-[500px] ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">ENNEAGRAM & ENGINE</div>

                  <div className="flex items-center justify-center mt-3">
                    <div className="w-full max-w-[220px]">
                      <EnnStar active={ennN} pct={ennN ? (done/6)*100 : 0}/>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-5xl font-extrabold text-white">{ennN ?? '—'}</div>
                    <div className="mt-1 text-sm text-white/70 font-semibold">{ennP?.name ?? 'Wykonaj test Enneagram'}</div>
                    <div className="mt-1 text-xs font-mono text-white/35">{ennWing ? `skrzydło ${ennWing}` : ''}</div>
                  </div>

                  <div className="mt-6 space-y-4 min-w-0">
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35">RIASEC</div>
                      <div className="mt-2 flex flex-wrap gap-2 max-w-full overflow-hidden">
                        {(holland ? holland.split('') : []).slice(0, 3).map((c, i) => (
                          <span key={`${c}-${i}`} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                            {c}
                          </span>
                        ))}
                        {!holland && (
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/40">
                            Wykonaj test kariery
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] tracking-[2px] font-mono text-white/35">WARTOŚCI</div>
                      <div className="mt-2 flex flex-wrap gap-2 max-w-full overflow-hidden">
                        {topVals.slice(0, 6).map((v:any, i:number) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/65 truncate max-w-full">
                            {v.name ?? v.value_name ?? String(v)}
                          </span>
                        ))}
                        {topVals.length === 0 && (
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                            Wykonaj test wartości
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* TILE 4: ARSENAŁ */}
                <section className={`col-span-1 lg:col-span-2 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">ARSENAŁ</div>
                  <div className="mt-3 text-lg font-semibold text-amber-400">Top talenty</div>

                  {top5.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {top5.slice(0, 5).map((t:any, i:number) => {
                        const label = t.name ?? t.name_en ?? `Talent ${i+1}`;
                        const pct = Math.max(35, 100 - i * 12);
                        return (
                          <div key={label} className="flex items-center gap-3 min-w-0">
                            <div className="w-7 text-xs font-mono text-amber-400/80 shrink-0">{String(i+1).padStart(2,'0')}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white/75 truncate">{label}</div>
                              <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-brand-primary/30 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test Strengths, aby zobaczyć top 5 talentów →
                    </a>
                  )}
                </section>

                {/* TILE 5: STREFA CIENIA */}
                <section className={`col-span-1 lg:col-span-2 !bg-rose-950/20 !border-rose-500/20 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-rose-200/60">STREFA CIENIA</div>
                  <div className="mt-3 text-lg font-semibold text-rose-300">Ciemna Triada (SD3)</div>

                  {raw.DARK_TRIAD ? (
                    <div className="mt-5 space-y-4">
                      {dtTraits.map(t => (
                        <div key={t.k}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-sm font-semibold text-white/75">{t.label}</div>
                            <div className="text-xs font-mono text-white/50">{t.pct}%</div>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <a
                      href="/user-profile-tests.html"
                      className="mt-4 bg-white/5 rounded-md p-3 text-sm text-white/45 border border-white/10 hover:border-rose-400/40 hover:text-white/70 transition no-underline"
                    >
                      Wykonaj test Dark Triad, aby zobaczyć profil cienia →
                    </a>
                  )}
                </section>

                {/* TILE 6: SYNTEZA AI */}
                <section className={`col-span-1 lg:col-span-4 ${TILE_BASE}`}>
                  <div className="text-[10px] tracking-[2px] font-mono text-white/35">SYNTEZA AI</div>
                  <div className="mt-3 text-lg font-semibold text-white/80">Najważniejsze wnioski</div>

                  {synthLines.length > 0 ? (
                    <div className="mt-4 space-y-3 text-sm text-white/65 leading-relaxed">
                      {synthLines.map((line, i) => (
                        <div
                          key={i}
                          className="bg-white/5 border border-white/10 rounded-lg p-4"
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-white/45">
                      Ukończ więcej testów, aby AI mogło wygenerować spójną syntezę.
                    </div>
                  )}
                </section>
              </>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
