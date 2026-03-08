import { useEffect, useState } from 'react';
import { supabase, getAccessToken, SUPABASE_ANON_KEY } from '../../lib/supabaseClient.js';
import SocialShare from './SocialShare';
import ProfessionalBadge from './ProfessionalBadge';
import AlchemeLogo from '../AlchemeLogo';
import { getInsight } from '../../data/characterInsights';

type Tab = 'social' | 'badge';

/* ── types ── */
type CharacterCardContent = {
  archetype_name: string;
  archetype_subtitle: string;
  tags_fundamental: string[];
  portrait_superpowers: string;
  energy_boosters: string[];
  energy_drainers: string[];
};

type RawRow = { test_type: string; raw_scores: any; percentile_scores: any; report: any };

export default function ShareCenter() {
  const [tab, setTab] = useState<Tab>('social');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState('Użytkownik');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [llmContent, setLlmContent] = useState<CharacterCardContent | null>(null);
  const [hexacoScores, setHexacoScores] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/auth'; return; }

        const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Użytkownik';
        setUserName(name);

        // fetch psychometrics
        const { data: rows } = await supabase
          .from('user_psychometrics')
          .select('test_type,raw_scores,percentile_scores,report')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const byType: Record<string, RawRow> = {};
        for (const r of rows ?? []) {
          if (!byType[r.test_type]) byType[r.test_type] = r;
        }

        const hex = byType['HEXACO'];
        if (hex?.percentile_scores) setHexacoScores(hex.percentile_scores);

        // fetch character card cache
        const accessToken = await getAccessToken();
        if (accessToken) {
          const { data: ccData } = await supabase.functions.invoke('character-card-generate', {
            body: { action: 'fetch', user_id: user.id },
            headers: { Authorization: `Bearer ${accessToken}`, apikey: SUPABASE_ANON_KEY },
          });
          if (ccData?.content) setLlmContent(ccData.content as CharacterCardContent);
        }

        // fetch share token from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('share_token')
          .eq('id', user.id)
          .single();
        if (profile?.share_token) setShareToken(profile.share_token);

      } catch (e: any) {
        setError('Nie udało się załadować danych. Wróć do Karty Postaci i spróbuj ponownie.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#060818', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(124,58,237,0.2)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 16px' }} />
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Ładowanie Centrum Udostępniania…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#060818', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Space Grotesk',sans-serif" }}>
      <div style={{ background:'rgba(14,17,52,0.97)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'40px 32px', maxWidth:380, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:16 }}>⚠️</div>
        <p style={{ color:'rgba(255,255,255,0.7)', marginBottom:24, lineHeight:1.6 }}>{error}</p>
        <button onClick={() => window.location.href='/character'} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>
          ← Wróć do Karty Postaci
        </button>
      </div>
    </div>
  );

  if (!llmContent) return (
    <div style={{ minHeight:'100vh', background:'#060818', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Space Grotesk',sans-serif" }}>
      <div style={{ background:'rgba(14,17,52,0.97)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'40px 32px', maxWidth:420, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔮</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:12 }}>Najpierw wygeneruj Kartę Postaci</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:24, lineHeight:1.6, fontSize:14 }}>
          Centrum Udostępniania wymaga gotowej Karty Postaci. Przejdź do Karty Postaci, wygeneruj profil i wróć tutaj.
        </p>
        <button onClick={() => window.location.href='/character'} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>
          Przejdź do Karty Postaci →
        </button>
      </div>
    </div>
  );

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : window.location.origin;
  const insight = getInsight(llmContent.archetype_name);

  const TABS: { id: Tab; emoji: string; label: string; desc: string }[] = [
    { id:'social', emoji:'📱', label:'Social Media Wrapped', desc:'Instagram Stories · Feed' },
    { id:'badge', emoji:'💼', label:'Professional Badge', desc:'Email · Slack · LinkedIn' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#060818', fontFamily:"'Space Grotesk',sans-serif", color:'#fff' }}>
      {/* bg decoration */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'45%', height:'45%', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'40%', height:'40%', borderRadius:'50%', background:'radial-gradient(circle,rgba(0,240,255,0.05) 0%,transparent 70%)' }} />
      </div>

      {/* nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(6,8,24,0.9)', backdropFilter:'blur(20px)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <AlchemeLogo size={28} />
            <div style={{ width:1, height:20, background:'rgba(255,255,255,0.12)' }} />
            <div>
              <div style={{ fontSize:11, letterSpacing:'0.16em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>Centrum</div>
              <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.85)', lineHeight:1 }}>Udostępniania</div>
            </div>
          </div>
          <button onClick={() => window.location.href='/character'}
            style={{ padding:'8px 16px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            ← Karta Postaci
          </button>
        </div>
      </nav>

      {/* content */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px 80px', position:'relative', zIndex:1 }}>

        {/* hero */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:40, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', marginBottom:16 }}>
            <span style={{ fontSize:16 }}>✨</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#c4b5fd', letterSpacing:'0.08em', textTransform:'uppercase' }}>Twoja Tożsamość</span>
          </div>
          <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 12px', background:'linear-gradient(130deg,#fff 40%,#c4b5fd 70%,#67e8f9 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Podziel się swoim profilem
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:480, margin:'0 auto', lineHeight:1.65 }}>
            Twój archetyp psychometryczny jako grafika na Stories albo profesjonalna odznaka w stopce maila.
          </p>
        </div>

        {/* tabs */}
        <div style={{ display:'flex', gap:12, marginBottom:40, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex:1, minWidth:200, padding:'18px 22px', borderRadius:16, cursor:'pointer', textAlign:'left',
                background: tab===t.id ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
                border: tab===t.id ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                fontFamily:'inherit', transition:'all .2s',
                boxShadow: tab===t.id ? '0 4px 20px rgba(124,58,237,0.2)' : 'none',
              }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{t.emoji}</div>
              <div style={{ fontSize:14, fontWeight:700, color: tab===t.id ? '#c4b5fd' : 'rgba(255,255,255,0.75)', marginBottom:3 }}>{t.label}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{t.desc}</div>
              {tab===t.id && <div style={{ marginTop:10, width:32, height:2, borderRadius:2, background:'#7c3aed' }} />}
            </button>
          ))}
        </div>

        {/* panel */}
        <div style={{ background:'rgba(14,17,52,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'32px 28px' }}>
          {tab === 'social' && (
            <SocialShare
              archetypeName={llmContent.archetype_name}
              archetypeSubtitle={llmContent.archetype_subtitle}
              tags={llmContent.tags_fundamental ?? []}
              hexacoScores={hexacoScores}
              energyBoosters={llmContent.energy_boosters ?? []}
              userName={userName}
              shareUrl={shareUrl}
              roastLine={insight.roastLine}
              superpowerLine={insight.superpowerLine}
              kryptoniteLine={insight.kryptoniteLine}
              mostLikelyTo={insight.mostLikelyTo}
              leastLikelyTo={insight.leastLikelyTo}
            />
          )}
          {tab === 'badge' && (
            <ProfessionalBadge
              archetypeName={llmContent.archetype_name}
              archetypeSubtitle={llmContent.archetype_subtitle}
              userName={userName}
              workPreference={insight.workPreference}
              workConstraint={insight.workConstraint}
              commsStyle={insight.commsStyle}
              deepWorkHours={insight.deepWorkHours}
              shareUrl={shareUrl}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
