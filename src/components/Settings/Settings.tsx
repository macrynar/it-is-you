import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { resetPasswordForEmail } from '../../lib/supabaseClient.js';
import { handleUpgradeToPremium, getUserPremiumStatus } from '../../lib/stripeService';

// ─── Types ─────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'security' | 'subscription' | 'privacy';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// ─── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

.st-root { font-family: 'Space Grotesk', sans-serif; background: #0d0f2b; color: #fff; min-height: 100vh; overflow-x: hidden; }
.st-root::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 40% at 20% 15%, rgba(14,165,233,.07) 0%, transparent 65%),
    radial-gradient(ellipse 50% 45% at 80% 80%, rgba(139,92,246,.08) 0%, transparent 65%),
    radial-gradient(ellipse 35% 30% at 55% 45%, rgba(80,40,160,.05) 0%, transparent 70%); }

/* Glass card */
.st-glass {
  background: rgba(16,20,56,.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  position: relative;
  isolation: isolate;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(255,255,255,.07), 0 8px 32px -4px rgba(0,0,0,.5);
}
.st-glass::before {
  content: ''; position: absolute; inset: 0; border-radius: 20px; padding: 1px;
  background: linear-gradient(145deg, rgba(255,255,255,.18) 0%, rgba(99,102,241,.15) 35%, rgba(139,92,246,.1) 70%, rgba(255,255,255,.04) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}

/* Sidebar nav item */
.st-nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 16px; border-radius: 12px; cursor: pointer;
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,.5);
  transition: all .22s ease; border: 1px solid transparent;
  background: transparent;
}
.st-nav-item:hover { color: rgba(255,255,255,.85); background: rgba(255,255,255,.05); }
.st-nav-item.active {
  color: #fff; background: rgba(99,102,241,.15);
  border-color: rgba(99,102,241,.3);
  box-shadow: 0 0 16px -4px rgba(99,102,241,.3);
}
.st-nav-item .nav-icon { font-size: 18px; flex-shrink:0; width:22px; text-align:center; }

/* Mobile tab bar */
.st-tab-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.st-tab-scroll::-webkit-scrollbar { display: none; }
.st-tab-pill {
  flex-shrink: 0; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.5);
  background: rgba(255,255,255,.04); transition: all .2s;
  white-space: nowrap;
}
.st-tab-pill.active { background: rgba(99,102,241,.2); border-color: rgba(99,102,241,.4); color: #fff; }

/* Input */
.st-input {
  width: 100%; padding: 11px 16px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px; color: #fff; font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; outline: none; transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
.st-input::placeholder { color: rgba(255,255,255,.25); }
.st-input:focus { border-color: rgba(99,102,241,.6); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
.st-input:disabled { opacity: .45; cursor: not-allowed; }

/* Label */
.st-label { font-size: 12px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: 8px; display: block; }

/* Section heading */
.st-section-title { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.25); margin: 0 0 20px; display: flex; align-items: center; gap: 12px; }
.st-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(99,102,241,.2), transparent); }

/* Buttons */
.st-btn-primary {
  padding: 11px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff; transition: opacity .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 0 0 1px rgba(99,102,241,.4), 0 4px 20px -4px rgba(99,102,241,.4);
}
.st-btn-primary:hover { opacity: .88; transform: translateY(-1px); box-shadow: 0 0 0 1px rgba(99,102,241,.5), 0 6px 24px -4px rgba(99,102,241,.5); }
.st-btn-primary:disabled { opacity: .35; cursor: not-allowed; transform: none; }

.st-btn-ghost {
  padding: 11px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.6);
  transition: background .2s, color .2s;
}
.st-btn-ghost:hover { background: rgba(255,255,255,.1); color: #fff; }

.st-btn-danger {
  padding: 11px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.35);
  color: #f87171; transition: background .2s, border-color .2s;
}
.st-btn-danger:hover { background: rgba(239,68,68,.22); border-color: rgba(239,68,68,.55); color: #fca5a5; }

/* Toggle */
.st-toggle-track {
  width: 44px; height: 24px; border-radius: 100px; background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.12); position: relative; cursor: pointer;
  transition: background .22s, border-color .22s; flex-shrink: 0;
}
.st-toggle-track.on { background: rgba(99,102,241,.5); border-color: rgba(99,102,241,.6); }
.st-toggle-thumb {
  position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
  border-radius: 50%; background: rgba(255,255,255,.6);
  transition: transform .22s cubic-bezier(.22,.68,0,1.2), background .22s;
  box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
.st-toggle-track.on .st-toggle-thumb { transform: translateX(20px); background: #fff; box-shadow: 0 0 8px rgba(99,102,241,.5); }

/* Avatar upload area */
.st-avatar-ring {
  width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(79,70,229,.4), rgba(124,58,237,.4));
  border: 2px solid rgba(99,102,241,.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 800; color: #fff; position: relative; cursor: pointer;
  transition: border-color .2s; overflow: hidden;
}
.st-avatar-ring:hover { border-color: rgba(99,102,241,.7); }
.st-avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
.st-avatar-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,.55); display: flex;
  align-items: center; justify-content: center; opacity: 0; transition: opacity .2s;
  font-size: 20px;
}
.st-avatar-ring:hover .st-avatar-overlay { opacity: 1; }

/* Toast notification */
.st-toast-wrap { position: fixed; top: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
.st-toast {
  padding: 14px 20px 14px 16px; border-radius: 14px; font-size: 14px; font-weight: 600;
  background: rgba(16,20,56,.95); backdrop-filter: blur(20px); pointer-events: auto;
  display: flex; align-items: center; gap: 10px;
  animation: toastIn .35s cubic-bezier(.22,.68,0,1.1) both;
  max-width: 340px;
}
.st-toast.success { border: 1px solid rgba(52,211,153,.4); color: #6ee7b7; }
.st-toast.error   { border: 1px solid rgba(248,113,113,.4); color: #fca5a5; }
@keyframes toastIn { from { opacity: 0; transform: translateX(20px) scale(.96); } to { opacity: 1; transform: none; } }

/* Modal */
.st-modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(7,9,28,.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: fadeIn .18s ease both;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.st-modal { width: 100%; max-width: 440px; padding: 36px; border-radius: 24px;
  background: rgba(16,10,32,.92); border: 1px solid rgba(239,68,68,.3);
  box-shadow: 0 0 0 1px rgba(239,68,68,.1), 0 24px 64px -12px rgba(0,0,0,.8);
  animation: modalIn .28s cubic-bezier(.22,.68,0,1.1) both;
}
@keyframes modalIn { from { opacity: 0; transform: scale(.94) translateY(16px); } to { opacity: 1; transform: none; } }

/* Login history row */
.st-login-row { display: flex; gap: 12px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.st-login-row:last-child { border-bottom: none; }

/* Plan card */
.st-plan-free { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 24px; }
.st-plan-premium {
  background: linear-gradient(135deg, rgba(79,70,229,.12), rgba(124,58,237,.1));
  border: 1px solid rgba(99,102,241,.3); border-radius: 16px; padding: 24px;
  box-shadow: 0 0 40px -8px rgba(99,102,241,.2);
}
.st-plan-active-premium {
  background: linear-gradient(135deg, rgba(245,158,11,.10), rgba(217,119,6,.07));
  border: 1px solid rgba(245,158,11,.4); border-radius: 16px; padding: 24px;
  box-shadow: 0 0 40px -8px rgba(245,158,11,.25);
}
/* Account status badge */
.st-badge-free {
  display:inline-flex;align-items:center;gap:5px;padding:3px 12px;
  border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
  background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.25);color:#94a3b8;
}
.st-badge-premium {
  display:inline-flex;align-items:center;gap:5px;padding:3px 12px;
  border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
  background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);color:#fcd34d;
  box-shadow:0 0 14px -4px rgba(245,158,11,.35);
}
.st-perk { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,.7); padding: 6px 0; }
.st-perk-dot { width: 7px; height: 7px; border-radius: 50%; background: #818cf8; flex-shrink: 0; box-shadow: 0 0 6px rgba(99,102,241,.6); }

/* Divider */
.st-divider { height: 1px; background: rgba(255,255,255,.07); margin: 24px 0; }

/* Responsive */
@media (max-width: 768px) {
  .st-sidebar { display: none !important; }
  .st-mobile-tabs { display: block !important; }
}
@media (min-width: 769px) {
  .st-mobile-tabs { display: none !important; }
}
`;

// ─── Mock login history data ────────────────────────────────────────────────
const LOGIN_HISTORY = [
  { id: 1, date: '19 lut 2026, 14:32', device: 'Chrome / macOS', location: 'Warszawa, PL', current: true },
  { id: 2, date: '18 lut 2026, 09:11', device: 'Safari / iOS 17', location: 'Kraków, PL', current: false },
  { id: 3, date: '15 lut 2026, 22:48', device: 'Chrome / Windows 11', location: 'Gdańsk, PL', current: false },
];

// ─── Toggle component ───────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`st-toggle-track ${value ? 'on' : ''}`} onClick={() => onChange(!value)} role="switch" aria-checked={value}>
      <div className="st-toggle-thumb" />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const toastIdRef = useRef(0);

  // ── Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Security state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdResetSending, setPwdResetSending] = useState(false);
  const [pwdResetSent, setPwdResetSent]       = useState(false);

  // ── Privacy state
  const [emailNotifs, setEmailNotifs]   = useState(true);
  const [analyticsAgree, setAnalytics]  = useState(false);

  // ── Premium state
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [userProvider, setUserProvider] = useState<string>('email');

  // ── Load user
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setDisplayName(user.user_metadata?.full_name || user.user_metadata?.name || '');
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        // Detect primary login provider
        const emailIdentity = user.identities?.find((i: any) => i.provider === 'email');
        const primaryProvider = emailIdentity ? 'email' : (user.identities?.[0]?.provider || user.app_metadata?.provider || 'email');
        setUserProvider(primaryProvider);
      }
      // Load premium status
      const status = await getUserPremiumStatus();
      setIsPremium(status?.isPremium ?? false);
      setPremiumLoading(false);
    })();
  }, []);

  // ── Toast helper
  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUpdateProfile = async () => {
    setProfileSaving(true);
    try {
      const updates: any = { data: { full_name: displayName } };
      if (email !== user?.email) updates.email = email;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast('Profil został zaktualizowany ✓');
    } catch (err: any) {
      toast(err.message || 'Nie udało się zapisać zmian', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      toast('Plik jest za duży (max 5 MB)', 'error');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}.${ext}`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      // Add cache-bust so browsers don't serve stale image
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);

      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      toast('Zdjęcie profilowe zaktualizowane ✓');
    } catch (err: any) {
      toast(err.message || 'Błąd przy wgrywaniu zdjęcia', 'error');
    } finally {
      // Reset input so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPwd || !confirmPwd) { toast('Wypełnij wszystkie pola', 'error'); return; }
    if (newPwd !== confirmPwd)  { toast('Hasła nie są identyczne', 'error'); return; }
    if (newPwd.length < 8)     { toast('Hasło musi mieć min. 8 znaków', 'error'); return; }
    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      toast('Hasło zostało zmienione ✓');
    } catch (err: any) {
      toast(err.message || 'Nie udało się zmienić hasła', 'error');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!email) { toast('Brak adresu e-mail na koncie', 'error'); return; }
    setPwdResetSending(true);
    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) throw error;
      setPwdResetSent(true);
      toast(`Link do resetu hasła wysłany na ${email} ✓`);
    } catch (err: any) {
      toast(err.message || 'Nie udało się wysłać e-maila', 'error');
    } finally {
      setPwdResetSending(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: psychometrics } = await supabase
        .from('user_psychometrics')
        .select('*')
        .eq('user_id', user?.id);

      const payload = {
        user: { id: user?.id, email: user?.email, name: displayName, exported_at: new Date().toISOString() },
        psychometric_results: psychometrics || [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `psycher-dane-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Dane zostały wyeksportowane ✓');
    } catch (err: any) {
      toast('Błąd eksportu danych', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'USUŃ KONTO') return;
    try {
      // Sign out — actual deletion requires server-side function
      await supabase.auth.signOut();
      toast('Konto zostało usunięte. Do widzenia.');
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (err: any) {
      toast('Błąd podczas usuwania konta', 'error');
    }
  };

  // ── User initials
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  // ── Nav items
  const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
    { id: 'profile',      icon: '👤', label: 'Profil'              },
    { id: 'security',     icon: '🔒', label: 'Bezpieczeństwo'      },
    { id: 'subscription', icon: '⭐', label: 'Subskrypcja'         },
    { id: 'privacy',      icon: '🛡️', label: 'Prywatność i Dane'   },
  ];

  // ─── Render tabs ───────────────────────────────────────────────────────────

  const renderProfile = () => (
    <div>
      <p className="st-section-title">Dane profilu</p>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        <div className="st-avatar-ring" onClick={() => avatarInputRef.current?.click()}>
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" />
            : <span>{initials}</span>
          }
          <div className="st-avatar-overlay">📷</div>
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{displayName || 'Brak nazwy'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>{email}</div>
          {!premiumLoading && (
            <div style={{ marginBottom: 10 }}>
              {isPremium
                ? <span className="st-badge-premium">✨ Premium Account</span>
                : <span className="st-badge-free">Free Account</span>
              }
            </div>
          )}
          <button className="st-btn-ghost" style={{ fontSize: 13, padding: '7px 16px' }} onClick={() => avatarInputRef.current?.click()}>
            Zmień zdjęcie
          </button>
        </div>
      </div>

      <div className="st-divider" />

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <label className="st-label">Imię i nazwisko / Nazwa</label>
        <input
          className="st-input"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Twoje imię i nazwisko"
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 8 }}>
        <label className="st-label">Adres e-mail</label>
        <input
          className="st-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
        />
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', margin: '6px 0 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>ℹ️</span> Po zmianie adresu e-mail otrzymasz link weryfikacyjny na nowy adres.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="st-btn-primary" onClick={handleUpdateProfile} disabled={profileSaving}>
          {profileSaving ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
        <button className="st-btn-ghost" onClick={() => { setDisplayName(user?.user_metadata?.full_name || ''); setEmail(user?.email || ''); }}>
          Anuluj
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <p className="st-section-title">Zmiana hasła</p>

      {userProvider !== 'email' ? (
        /* OAuth user — explain they have no Alcheme password */
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', marginBottom: 40 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>
            {userProvider === 'google' ? '🔵' : userProvider === 'facebook' ? '📘' : userProvider === 'apple' ? '🍎' : '🔗'}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: 5 }}>
              Twoje konto nie ma hasła Alcheme
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65 }}>
              Logujesz się przez <strong style={{ color: 'rgba(255,255,255,.6)' }}>{userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}</strong>. 
              Hasłem zarządza ten serwis — zmień je w ustawieniach swojego konta {userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}.
            </div>
          </div>
        </div>
      ) : (
        /* Email user — show password change form */
        <>
          <div style={{ marginBottom: 20 }}>
            <label className="st-label">Obecne hasło</label>
            <input className="st-input" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="st-label">Nowe hasło</label>
            <input className="st-input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 znaków" autoComplete="new-password" />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label className="st-label">Powtórz nowe hasło</label>
            <input className="st-input" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
            {newPwd && confirmPwd && newPwd !== confirmPwd && (
              <p style={{ color: '#f87171', fontSize: 12, margin: '6px 0 0' }}>Hasła nie są identyczne.</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
            <button className="st-btn-primary" onClick={handleUpdatePassword} disabled={pwdSaving}>
              {pwdSaving ? 'Zmienianie…' : 'Zmień hasło'}
            </button>
            <button className="st-btn-ghost" onClick={() => { setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }}>
              Anuluj
            </button>
          </div>
        </>
      )}

      {/* ── Reset via email ── */}
      <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 40 }}>
        {userProvider !== 'email' ? (
          /* OAuth user — no password to reset */
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>
              {userProvider === 'google' ? '🔵' : userProvider === 'facebook' ? '📘' : userProvider === 'apple' ? '🍎' : '🔗'}
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 4 }}>
                Konto połączone z {userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
                Twoje konto jest logowane przez <strong style={{ color: 'rgba(255,255,255,.65)' }}>{userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}</strong>.
                Hasło jest zarządzane przez ten serwis — nie można go zresetować z poziomu Alcheme.
                Jeśli chcesz zmienić hasło, zrób to w ustawieniach konta {userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}.
              </div>
            </div>
          </div>
        ) : (
          /* Email user — show reset button */
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 4 }}>
                Wyślij link resetujący hasło
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.55 }}>
                {pwdResetSent
                  ? `✅ Link wysłany na ${email}. Sprawdź skrzynkę pocztową.`
                  : `Wyślemy link do ustawienia nowego hasła na adres: ${email || '—'}`
                }
              </div>
            </div>
            {!pwdResetSent && (
              <button
                className="st-btn-ghost"
                style={{ flexShrink: 0, fontSize: 13, padding: '9px 18px' }}
                onClick={handleSendPasswordReset}
                disabled={pwdResetSending}
              >
                {pwdResetSending ? 'Wysyłanie…' : '📧 Wyślij link'}
              </button>
            )}
            {pwdResetSent && (
              <button
                className="st-btn-ghost"
                style={{ flexShrink: 0, fontSize: 12, padding: '7px 14px' }}
                onClick={() => setPwdResetSent(false)}
              >
                Wyślij ponownie
              </button>
            )}
          </div>
        )}
      </div>

      <div className="st-divider" />
      <p className="st-section-title" style={{ marginTop: 24 }}>Historia logowań</p>

      <div>
        {LOGIN_HISTORY.map(entry => (
          <div className="st-login-row" key={entry.id}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>
              {entry.device.includes('iOS') || entry.device.includes('Android') ? '📱' : '💻'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: entry.current ? '#a5b4fc' : 'rgba(255,255,255,.8)' }}>
                  {entry.device}
                </span>
                {entry.current && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.35)', color: '#a5b4fc', letterSpacing: '.5px' }}>
                    AKTYWNA SESJA
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                {entry.date} · {entry.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div>
      <p className="st-section-title">Twój plan</p>

      {isPremium ? (
        /* ── PREMIUM ACTIVE ── */
        <div className="st-plan-active-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 36 }}>✨</div>
            <div>
              <div style={{
                fontSize: 22, fontWeight: 800,
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Psycher Premium
              </div>
              <div style={{ fontSize: 13, color: 'rgba(245,158,11,.7)', marginTop: 2 }}>Aktywna Subskrypcja Premium</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.65, margin: 0 }}>
              🎉 Dziękujemy za wsparcie Psycher! Masz pełny dostęp do testu <strong style={{ color: '#fcd34d' }}>Dark Triad SD3</strong> oraz wszystkich przyszłych funkcji Premium.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
            {[
              '✅ Test Dark Triad SD3 odblokowany',
              '✅ Szczegółowe interpretacje AI',
              '✅ Pełna Karta Postaci',
              '✅ Historia i śledzenie zmian',
              '✅ Eksport PDF z raportem',
              '✅ Priorytetowe wsparcie',
            ].map(perk => (
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,.7)', padding:'5px 0' }} key={perk}>
                {perk}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── FREE USER ── */
        <>
          {/* Current plan: Free */}
          <div className="st-plan-free" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>🆓</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Plan Darmowy</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Aktywny</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
              Masz dostęp do 6 podstawowych testów psychometrycznych i prostego podsumowania wyników.
            </div>
          </div>

          {/* Dark Triad Premium upsell */}
          <div className="st-plan-premium">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28 }}>⭐</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Psycher Premium
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Odblokuj Dark Triad SD3 · 29 zł</div>
                </div>
              </div>
              <button
                onClick={() => handleUpgradeToPremium()}
                style={{
                  padding: '11px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', border: 'none',
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#c026d3)',
                  color: '#fff', boxShadow: '0 0 32px -4px rgba(99,102,241,.6)',
                  transition: 'opacity .2s, transform .15s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '.85'; (e.target as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; (e.target as HTMLElement).style.transform = ''; }}
              >
                🔒 Odblokuj Premium
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
              {[
                'Test Dark Triad SD3 (Analiza Cienia)',
                'Szczegółowe interpretacje AI każdego testu',
                'Odblokowana Karta Postaci',
                'Historia i śledzenie zmian wyników',
                'Eksport PDF z pełnym raportem',
                'Priorytetowe wsparcie',
              ].map(perk => (
                <div className="st-perk" key={perk}>
                  <div className="st-perk-dot" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPrivacy = () => (
    <div>
      <p className="st-section-title">Powiadomienia i zgody</p>

      {[
        {
          label: 'Powiadomienia e-mail',
          desc: 'Otrzymuj informacje o nowościach, aktualizacjach i nowych testach.',
          value: emailNotifs,
          onChange: setEmailNotifs,
        },
        {
          label: 'Anonimowa analiza statystyczna',
          desc: 'Pozwól nam używać zanonimizowanych wyników do poprawy jakości testów.',
          value: analyticsAgree,
          onChange: setAnalytics,
        },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', lineHeight: 1.55 }}>{item.desc}</div>
          </div>
          <Toggle value={item.value} onChange={item.onChange} />
        </div>
      ))}

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <p className="st-section-title">Twoje dane</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, marginBottom: 20 }}>
          Możesz w każdej chwili pobrać kopię wszystkich swoich danych przechowywanych w Psycher.
          Dane zostaną zapisane jako plik JSON.
        </p>
        <button className="st-btn-ghost" onClick={handleExportData}>
          📥 Eksportuj moje dane (JSON)
        </button>
      </div>

      {/* ── Danger Zone ── */}
      <div style={{ borderRadius: 16, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.04)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#f87171' }}>Strefa Niebezpieczna</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, marginBottom: 20 }}>
          Usunięcie konta jest <strong style={{ color: 'rgba(255,255,255,.65)' }}>nieodwracalne</strong>.
          Wszystkie Twoje dane, wyniki testów i historia zostaną trwale usunięte.
        </p>
        <button className="st-btn-danger" onClick={() => setShowDeleteModal(true)}>
          🗑️  Usuń konto
        </button>
      </div>
    </div>
  );

  const CONTENT: Record<Tab, React.ReactNode> = {
    profile:      renderProfile(),
    security:     renderSecurity(),
    subscription: renderSubscription(),
    privacy:      renderPrivacy(),
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="st-root">
      <style>{CSS}</style>

      {/* ── Toast container ── */}
      <div className="st-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`st-toast ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div className="st-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="st-modal">
            <div style={{ fontSize: 40, marginBottom: 16, textAlign: 'center' }}>⚠️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800, textAlign: 'center', color: '#fca5a5' }}>Usuń konto</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textAlign: 'center', lineHeight: 1.65, marginBottom: 24 }}>
              Ta operacja jest <strong style={{ color:'#f87171' }}>nieodwracalna</strong>. Wszystkie Twoje dane zostaną
              trwale usunięte. Aby potwierdzić, wpisz <strong style={{ color:'#fff' }}>USUŃ KONTO</strong> poniżej.
            </p>
            <input
              className="st-input"
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="USUŃ KONTO"
              style={{ marginBottom: 20, textAlign: 'center', letterSpacing: '1px' }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                style={{
                  padding: '11px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', border: 'none',
                  background: deleteConfirmText === 'USUŃ KONTO' ? '#dc2626' : 'rgba(239,68,68,.2)',
                  color: deleteConfirmText === 'USUŃ KONTO' ? '#fff' : 'rgba(255,255,255,.3)',
                  transition: 'all .2s',
                }}
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'USUŃ KONTO'}
              >
                Potwierdzam usunięcie
              </button>
              <button className="st-btn-ghost" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation bar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,15,43,.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => window.location.href = '/user-profile-tests.html'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, padding: '6px 10px', borderRadius: 8, transition: 'color .2s' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,.5)'}
          >
            ← Wróć
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.5px' }}>Ustawienia konta</span>
          <div style={{ width: 80 }} />
        </div>
      </nav>

      {/* ── Mobile tab pills ── */}
      <div className="st-mobile-tabs" style={{ padding: '16px 20px 0', position: 'relative', zIndex: 1 }}>
        <div className="st-tab-scroll">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`st-tab-pill ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Page layout ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px', position: 'relative', zIndex: 1, display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <div className="st-sidebar" style={{ width: 220, flexShrink: 0, position: 'sticky', top: 88 }}>
          <div className="st-glass" style={{ padding: 12 }}>
            {/* User mini-card */}
            <div style={{ padding: '12px 8px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(79,70,229,.5), rgba(124,58,237,.5))',
                  border: '2px solid rgba(99,102,241,.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, overflow: 'hidden',
                }}>
                  {avatarUrl ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName || 'Użytkownik'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                    {email}
                  </div>
                  {!premiumLoading && (
                    isPremium
                      ? <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#fcd34d', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 999, padding: '2px 8px' }}>✨ Premium</span>
                      : <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#94a3b8', background: 'rgba(148,163,184,.08)', border: '1px solid rgba(148,163,184,.2)', borderRadius: 999, padding: '2px 8px' }}>Free</span>
                  )}
                </div>
              </div>
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`st-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ width: '100%', textAlign: 'left', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '10px 8px' }} />

            <button
              className="st-nav-item"
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              style={{ width: '100%', textAlign: 'left', fontFamily: 'Space Grotesk, sans-serif', color: 'rgba(248,113,113,.6)' }}
            >
              <span className="nav-icon">🚪</span>
              Wyloguj się
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="st-glass" style={{ padding: '36px 32px' }}>
            {/* Tab title */}
            <h1 style={{ margin: '0 0 32px', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{NAV_ITEMS.find(n => n.id === activeTab)?.icon}</span>
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>

            {CONTENT[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
