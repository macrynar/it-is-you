import re

# ─── 1. CharacterSheet.tsx: MainNav → Navbar ──────────────────────────────
with open('src/components/CharacterSheet/CharacterSheet.tsx', 'r') as f:
    cs = f.read()

cs = cs.replace(
    "import MainNav from '../shared/MainNav';",
    "import Navbar from '../shared/Navbar';"
)
cs = cs.replace(
    "<MainNav activeLink=\"character\" theme={theme} onThemeToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />",
    "<Navbar isAuthenticated={true} activeLink=\"character\" theme={theme} onThemeToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />"
)

with open('src/components/CharacterSheet/CharacterSheet.tsx', 'w') as f:
    f.write(cs)
print("CharacterSheet.tsx: MainNav → Navbar")

# ─── 2. NewUserDashboard.tsx: MainNav → Navbar ────────────────────────────
with open('src/components/Dashboard/NewUserDashboard.tsx', 'r') as f:
    nd = f.read()

nd = nd.replace(
    "import MainNav from '../shared/MainNav';",
    "import Navbar from '../shared/Navbar';"
)
nd = nd.replace(
    "<MainNav activeLink=\"tests\" />",
    "<Navbar isAuthenticated={true} activeLink=\"tests\" />"
)
nd = nd.replace(
    "<MainNav activeLink='tests' />",
    "<Navbar isAuthenticated={true} activeLink='tests' />"
)

with open('src/components/Dashboard/NewUserDashboard.tsx', 'w') as f:
    f.write(nd)
print("NewUserDashboard.tsx: MainNav → Navbar")

# ─── 3. Settings.tsx: Replace internal <nav> with simple page header ──────
with open('src/components/Settings/Settings.tsx', 'r') as f:
    st = f.read()

# Find and replace the internal nav block
# The nav starts at "      {/* ── Navigation bar ── */"
# and ends with "      </nav>"
OLD_NAV = """      {/* ── Navigation bar ── */}
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
      </nav>"""

NEW_NAV = """      {/* ── Page sub-header ── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,.07)',
        padding: '0 24px',
        background: 'rgba(13,15,43,.4)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => window.location.href = '/user-profile-tests'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, padding: '6px 10px', borderRadius: 8, transition: 'color .2s' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,.4)'}
          >
            ← Wróć
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.5px', color: 'rgba(255,255,255,.7)' }}>Ustawienia konta</span>
          <div style={{ width: 80 }} />
        </div>
      </div>"""

if OLD_NAV in st:
    st = st.replace(OLD_NAV, NEW_NAV)
    print("Settings.tsx: internal nav → sub-header")
else:
    # Try regex approach for minor whitespace differences
    pattern = r'\s*\{/\* ── Navigation bar ── \*/\}\s*<nav style=\{.*?\}\s*</nav>'
    match = re.search(pattern, st, re.DOTALL)
    if match:
        st = st[:match.start()] + '\n' + NEW_NAV + st[match.end():]
        print("Settings.tsx: internal nav → sub-header (regex)")
    else:
        print("Settings.tsx: NAV BLOCK NOT FOUND - manual update needed")

with open('src/components/Settings/Settings.tsx', 'w') as f:
    f.write(st)

print("All updates done.")
